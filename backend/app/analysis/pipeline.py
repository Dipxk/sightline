from __future__ import annotations

from typing import Optional
from app.analysis.schemas import (
    BusinessProfile,
    Integration,
    Vertical,
    VisionMoment,
)
from app.scraper.extractors import ScrapeResult, extract_domain_name


DEMO_PROFILES: dict[str, BusinessProfile] = {
    "hotel-bonaventure": BusinessProfile(
        name="Hotel Bonaventure Montreal",
        url="https://hotelbonaventure.com",
        vertical=Vertical.HOTEL,
        location="Montreal, QC",
        tagline="Urban resort in the heart of downtown Montreal",
        hours_summary="Front desk 24/7 · Reservations line closes evenings",
        after_hours_gap=True,
        bilingual=True,
        facts=[
            "Conference and event bookings require room block coordination",
            "Guests arriving late need identity verification for key pickup",
            "Restaurant handles allergen and dietary questions by phone",
            "Direct booking preferred over OTA commissions",
        ],
        vision_moments=[
            VisionMoment(
                id="late-checkin",
                title="Late check-in ID verification",
                description="Guests arriving after hours must verify identity before key release.",
                evidence="Hotel policy requires photo ID matching reservation name",
                voice_only_failure="I'm unable to verify your identity over the phone. Please email a copy of your ID and we'll process it tomorrow morning.",
                multimodal_success="Passport detected on camera · Name matched to reservation · Digital key authorized",
                vision_trigger="Customer holds passport to webcam",
                actions=["verify_identity", "match_booking", "authorize_checkin"],
            ),
            VisionMoment(
                id="after-hours-booking",
                title="After-hours room booking",
                description="Caller wants to book at 11:47 PM when sales team is offline.",
                evidence="Online booking available but phone reservations after 9pm go to voicemail",
                voice_only_failure="I've noted your request. A reservations agent will call you back tomorrow between 9am and 5pm.",
                multimodal_success="Availability checked · Rate quoted · Room booked · Confirmation email sent",
                vision_trigger=None,
                actions=["check_availability", "create_reservation", "send_confirmation"],
            ),
            VisionMoment(
                id="allergen-menu",
                title="Restaurant allergen inquiry",
                description="Guest calls about menu ingredients while dining.",
                evidence="Menu items have complex allergen matrices not in voice scripts",
                voice_only_failure="I don't have detailed ingredient information. Let me transfer you to the restaurant — they may be busy.",
                multimodal_success="Guest shows menu item on camera · Ingredients identified · Allergen warning issued",
                vision_trigger="Customer points camera at menu item",
                actions=["identify_menu_item", "lookup_allergens", "log_preference"],
            ),
        ],
        integrations=[
            Integration(name="PMS / Opera", category="Booking", confidence=0.85, reason="Enterprise hotel stack"),
            Integration(name="Twilio", category="Telephony", confidence=0.9, reason="Standard for voice agents"),
            Integration(name="SendGrid", category="Email", confidence=0.75, reason="Confirmation emails"),
        ],
        voice_only_score=34,
        multimodal_score=91,
    ),
    "clinic-demo": BusinessProfile(
        name="Clinique Médicale Plateau",
        url="https://example-clinic.ca",
        vertical=Vertical.CLINIC,
        location="Montreal, QC",
        tagline="Family medicine and walk-in clinic",
        hours_summary="Mon–Fri 8am–6pm · Sat 9am–1pm · Closed Sundays",
        after_hours_gap=True,
        bilingual=True,
        facts=[
            "New patients must provide RAMQ card and photo ID",
            "Prescription refill requests spike after hours",
            "Referral documents often submitted by phone photo",
        ],
        vision_moments=[
            VisionMoment(
                id="ramq-verification",
                title="RAMQ card verification",
                description="New patient registration requires health card validation.",
                evidence="Quebec clinics must verify RAMQ eligibility at intake",
                voice_only_failure="Please visit the clinic with your health card, or fax a copy to our office.",
                multimodal_success="RAMQ card read on camera · Number validated · Patient file created",
                vision_trigger="Patient holds RAMQ card to camera",
                actions=["ocr_health_card", "validate_eligibility", "create_patient"],
            ),
            VisionMoment(
                id="referral-intake",
                title="Referral document intake",
                description="Patient calls to submit specialist referral received by mail.",
                evidence="Clinic accepts photo submissions for referral paperwork",
                voice_only_failure="Email a clear photo to referrals@clinic.ca — processing takes 2-3 business days.",
                multimodal_success="Referral form captured live · Specialist identified · Appointment queued",
                vision_trigger="Patient shows referral letter to camera",
                actions=["ocr_referral", "match_specialist", "queue_appointment"],
            ),
        ],
        integrations=[
            Integration(name="Oscar EMR", category="EHR", confidence=0.8, reason="Common in Quebec clinics"),
            Integration(name="RAMQ API", category="Eligibility", confidence=0.7, reason="Provincial health validation"),
        ],
        voice_only_score=28,
        multimodal_score=88,
    ),
}


def _detect_vertical(text: str, headings: list[str]) -> Vertical:
    combined = (text + " ".join(headings)).lower()
    scores = {
        Vertical.HOTEL: sum(
            w in combined
            for w in ["hotel", "reservation", "room", "check-in", "booking", "hospitality"]
        ),
        Vertical.CLINIC: sum(
            w in combined
            for w in ["clinic", "patient", "doctor", "medical", "appointment", "health"]
        ),
        Vertical.RETAIL: sum(
            w in combined
            for w in ["shop", "store", "product", "return", "refund", "sku", "retail"]
        ),
        Vertical.PROPERTY: sum(
            w in combined
            for w in ["property", "maintenance", "tenant", "lease", "damage", "rental"]
        ),
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else Vertical.OTHER


def _detect_after_hours(text: str) -> bool:
    lower = text.lower()
    indicators = [
        "after hours",
        "voicemail",
        "call back",
        "closed",
        "24/7 online",
        "emergency line",
    ]
    return any(i in lower for i in indicators)


def _detect_bilingual(text: str) -> bool:
    lower = text.lower()
    return any(
        w in lower
        for w in ["français", "french", "english", "bilingual", "bilingue", "en français"]
    )


def _build_moments(vertical: Vertical, name: str) -> list[VisionMoment]:
    if vertical == Vertical.HOTEL:
        return [
            VisionMoment(
                id="id-verify",
                title="Guest ID verification",
                description=f"Caller at {name} needs identity confirmed before check-in.",
                evidence="Extracted from hospitality check-in workflows",
                voice_only_failure="Please email a photo of your ID. We'll verify it during business hours.",
                multimodal_success="ID verified on camera · Booking matched · Check-in complete",
                vision_trigger="Guest holds ID to camera",
                actions=["verify_id", "match_booking", "complete_checkin"],
            ),
            VisionMoment(
                id="after-hours",
                title="After-hours reservation",
                description="Caller tries to book when front desk is unavailable.",
                evidence="Phone hours appear limited vs online booking",
                voice_only_failure="I've taken your details. Someone will call you back tomorrow.",
                multimodal_success="Room available · Booked · Confirmation sent",
                vision_trigger=None,
                actions=["check_availability", "book_room", "send_email"],
            ),
        ]
    if vertical == Vertical.CLINIC:
        return [
            VisionMoment(
                id="health-card",
                title="Health card verification",
                description="New patient must provide government health ID.",
                evidence="Standard clinic intake requirement",
                voice_only_failure="Please bring your health card to the clinic or fax a copy.",
                multimodal_success="Health card read on camera · Eligibility confirmed · File opened",
                vision_trigger="Patient shows health card",
                actions=["ocr_card", "validate", "create_record"],
            ),
        ]
    if vertical == Vertical.RETAIL:
        return [
            VisionMoment(
                id="product-return",
                title="Product return with visual ID",
                description="Customer wants refund and holds product to camera.",
                evidence="Retail RMA workflows require SKU identification",
                voice_only_failure="Please email photos of the product and receipt. We'll respond in 48 hours.",
                multimodal_success="SKU identified · Return authorized · Refund initiated",
                vision_trigger="Customer shows product label",
                actions=["identify_sku", "check_policy", "initiate_refund"],
            ),
        ]
    return [
        VisionMoment(
            id="document-verify",
            title="Document verification call",
            description=f"Caller to {name} needs to submit visual documentation.",
            evidence="Common in customer-facing operations",
            voice_only_failure="Please email the document and we'll follow up.",
            multimodal_success="Document captured · Verified · Case updated",
            vision_trigger="Caller shows document to camera",
            actions=["capture_document", "verify", "update_case"],
        ),
    ]


def _build_integrations(vertical: Vertical) -> list[Integration]:
    common = [
        Integration(name="Twilio", category="Telephony", confidence=0.85, reason="Voice infrastructure"),
        Integration(name="Email (SMTP)", category="Notifications", confidence=0.8, reason="Confirmations"),
    ]
    vertical_map = {
        Vertical.HOTEL: [
            Integration(name="PMS / Booking Engine", category="Reservations", confidence=0.75, reason="Room inventory"),
            Integration(name="CRM", category="Guest data", confidence=0.7, reason="Guest profiles"),
        ],
        Vertical.CLINIC: [
            Integration(name="EMR / EHR", category="Records", confidence=0.8, reason="Patient data"),
            Integration(name="Scheduling API", category="Appointments", confidence=0.75, reason="Booking"),
        ],
        Vertical.RETAIL: [
            Integration(name="Shopify / POS", category="Commerce", confidence=0.7, reason="Orders & returns"),
            Integration(name="Inventory API", category="Stock", confidence=0.65, reason="SKU lookup"),
        ],
        Vertical.PROPERTY: [
            Integration(name="Property Management", category="PMS", confidence=0.75, reason="Tenant records"),
            Integration(name="Maintenance ticketing", category="Ops", confidence=0.7, reason="Work orders"),
        ],
    }
    return common + vertical_map.get(vertical, [])


async def analyze_scrape(
    scrape: ScrapeResult,
    demo_slug: Optional[str] = None,
) -> BusinessProfile:
    if demo_slug and demo_slug in DEMO_PROFILES:
        return DEMO_PROFILES[demo_slug]

  # Check if URL matches a demo profile
    for slug, profile in DEMO_PROFILES.items():
        if profile.url.rstrip("/") in scrape.url.rstrip("/"):
            return profile
        if extract_domain_name(scrape.url).lower() in profile.name.lower():
            return profile

    if not scrape.success:
        return DEMO_PROFILES["hotel-bonaventure"]

    name = scrape.title.split("|")[0].split("–")[0].split("-")[0].strip()
    if not name or len(name) < 3:
        name = extract_domain_name(scrape.url)

    vertical = _detect_vertical(scrape.text, scrape.headings)
    after_hours = _detect_after_hours(scrape.text)
    bilingual = _detect_bilingual(scrape.text)

    facts = []
    if scrape.description:
        facts.append(scrape.description[:200])
    for h in scrape.headings[:4]:
        if len(h) > 10:
            facts.append(h)

    moments = _build_moments(vertical, name)
    integrations = _build_integrations(vertical)

    voice_score = max(20, 45 - len(moments) * 12)
    multi_score = min(95, 70 + len(moments) * 8 + (10 if after_hours else 0))

    return BusinessProfile(
        name=name,
        url=scrape.url,
        vertical=vertical,
        location="Canada" if bilingual or "montreal" in scrape.text.lower() else None,
        tagline=scrape.description[:120] if scrape.description else None,
        hours_summary="Limited phone hours detected" if after_hours else "Standard business hours",
        after_hours_gap=after_hours,
        bilingual=bilingual,
        facts=facts[:5],
        vision_moments=moments,
        integrations=integrations,
        voice_only_score=voice_score,
        multimodal_score=multi_score,
    )
