from __future__ import annotations

import asyncio
from app.analysis.schemas import BusinessProfile, SimulationTick, SimulationUtterance, SimulationAction
from app.core.config import settings


class SimulationOrchestrator:
    """Produces synchronized voice-only vs multimodal event streams."""

    def __init__(self, profile: BusinessProfile):
        self.profile = profile

    async def generate_ticks(self):
        for moment in self.profile.vision_moments:
            async for tick in self._generate_moment_scenario(moment):
                yield tick
                await asyncio.sleep(settings.analysis_delay_ms / 1000)

    async def _generate_moment_scenario(self, moment):
        company = self.profile.name

        # Voice-only path
        yield SimulationTick(
            path="voice_only",
            moment_id=moment.id,
            phase="utterance",
            utterance=SimulationUtterance(
                speaker="customer",
                text=self._customer_opener(moment),
            ),
        )

        yield SimulationTick(
            path="voice_only",
            moment_id=moment.id,
            phase="utterance",
            utterance=SimulationUtterance(
                speaker="agent",
                text=f"Thank you for calling {company}. How can I help you today?",
            ),
        )

        yield SimulationTick(
            path="voice_only",
            moment_id=moment.id,
            phase="utterance",
            utterance=SimulationUtterance(
                speaker="customer",
                text=self._customer_request(moment),
            ),
        )

        if moment.vision_trigger:
            yield SimulationTick(
                path="voice_only",
                moment_id=moment.id,
                phase="utterance",
                utterance=SimulationUtterance(
                    speaker="agent",
                    text=moment.voice_only_failure,
                ),
            )
            yield SimulationTick(
                path="voice_only",
                moment_id=moment.id,
                phase="failure",
                utterance=SimulationUtterance(
                    speaker="system",
                    text="Call unresolved · Customer must wait or call back",
                ),
            )
        else:
            yield SimulationTick(
                path="voice_only",
                moment_id=moment.id,
                phase="utterance",
                utterance=SimulationUtterance(
                    speaker="agent",
                    text=moment.voice_only_failure,
                ),
            )
            yield SimulationTick(
                path="voice_only",
                moment_id=moment.id,
                phase="failure",
            )

        # Multimodal path
        yield SimulationTick(
            path="multimodal",
            moment_id=moment.id,
            phase="utterance",
            utterance=SimulationUtterance(
                speaker="customer",
                text=self._customer_opener(moment),
            ),
        )

        yield SimulationTick(
            path="multimodal",
            moment_id=moment.id,
            phase="utterance",
            utterance=SimulationUtterance(
                speaker="agent",
                text=f"Hi, welcome to {company}. I can help with that right now.",
            ),
        )

        yield SimulationTick(
            path="multimodal",
            moment_id=moment.id,
            phase="utterance",
            utterance=SimulationUtterance(
                speaker="customer",
                text=self._customer_request(moment),
            ),
        )

        if moment.vision_trigger:
            yield SimulationTick(
                path="multimodal",
                moment_id=moment.id,
                phase="vision",
                vision_label="Vision active",
                vision_detail=moment.vision_trigger,
            )
            yield SimulationTick(
                path="multimodal",
                moment_id=moment.id,
                phase="vision",
                vision_label="Verified",
                vision_detail=moment.multimodal_success,
            )

        for i, action_name in enumerate(moment.actions):
            yield SimulationTick(
                path="multimodal",
                moment_id=moment.id,
                phase="action",
                action=SimulationAction(
                    label=action_name.replace("_", " ").title(),
                    status="running" if i == 0 else "done",
                    system=self._action_system(action_name),
                ),
            )

        yield SimulationTick(
            path="multimodal",
            moment_id=moment.id,
            phase="success",
            utterance=SimulationUtterance(
                speaker="agent",
                text="All set. Is there anything else I can help you with?",
            ),
            is_final=True,
        )

    def _customer_opener(self, moment) -> str:
        openers = {
            "late-checkin": "Hi, I just arrived for my reservation but the front desk seems closed.",
            "after-hours-booking": "I'd like to book a room for this Saturday, two nights.",
            "allergen-menu": "Quick question — does the salmon dish contain dairy?",
            "ramq-verification": "I'm a new patient and I'd like to register over the phone.",
            "referral-intake": "I have a referral from my doctor I need to submit.",
            "id-verify": "I'm checking in but I need to verify my identity.",
            "after-hours": "I need to make a reservation for tonight.",
            "health-card": "I'm registering as a new patient.",
            "product-return": "I'd like to return this item I purchased last week.",
            "document-verify": "I need to submit a document for my file.",
        }
        return openers.get(moment.id, "Hi, I need some help with something.")

    def _customer_request(self, moment) -> str:
        requests = {
            "late-checkin": "Can I check in? I have my passport right here.",
            "after-hours-booking": "Do you have availability? I'd like to confirm now.",
            "allergen-menu": "Can you check the ingredients? I'll show you the menu.",
            "ramq-verification": "I have my RAMQ card — can you register me?",
            "referral-intake": "I have the referral letter with me, can you take it now?",
            "id-verify": "I have my ID ready — can you verify me?",
            "after-hours": "I'd like to book for tonight if possible.",
            "health-card": "Here's my health card for registration.",
            "product-return": "Here's the product — can I get a refund?",
            "document-verify": "I have the document on camera.",
        }
        return requests.get(moment.id, moment.description)

    def _action_system(self, action: str) -> str:
        mapping = {
            "verify": "Identity",
            "verify_id": "Identity",
            "verify_identity": "Identity",
            "match_booking": "PMS",
            "check_availability": "Booking Engine",
            "create_reservation": "PMS",
            "book_room": "PMS",
            "send_confirmation": "Email",
            "send_email": "Email",
            "identify_menu_item": "Vision",
            "lookup_allergens": "Menu DB",
            "ocr_health_card": "Vision",
            "validate_eligibility": "RAMQ",
            "create_patient": "EMR",
            "identify_sku": "Vision",
            "initiate_refund": "POS",
        }
        for key, system in mapping.items():
            if key in action:
                return system
        return "API"
