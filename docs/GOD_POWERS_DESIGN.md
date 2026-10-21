# Life in Motion — God Powers Design Specification

Status: **HYBRID DIRECTION LOCKED** on 2026-10-21. Planning only; **no gameplay code changes authorized or made by this decision**.
Repository: `SpluxeC/life-in-motion`, game: `v2.html`.

## 1. Non-negotiable design contract (LOCKED)

**Hybrid = God Powers + Direct NPC Control.** The player can create world-level conditions and can still inspect, talk to, give items to, select, and control individual NPCs.

**Player creates circumstances; NPCs decide their responses.** Except for existing direct-control commands, God Powers influence inputs to decision-making instead of specifying final behavior. Different NPCs should respond differently based on courage, suspicion, honesty, patience, compassion, relationships, memories, sanity, and immediate needs.

**No regressions.** Preserve current challenge/sandbox modes; existing character/social/action tabs; all 21 categorized direct actions; Kill and Go Insane conditional locks and cooldowns; nine needs (including sanity); memory and grudges; crime scenes and witness evidence; first responders; active hazards; item interactions and artwork; walking/vehicle pathfinding; 12-hour clock; achievements, save/restore, and mobile controls.

**God Powers are not the same as individual commands.** They operate on the world or selected map targets. Direct control remains available. Both systems feed one simulation; no parallel fake NPC engine.

## 2. Player interface

Add a dedicated **God Powers** tab or button to existing navigation (ideally adjacent to Character, Social, Actions). This opens a mobile-friendly categorized panel:
- **Create & Transform:** Create Life (custom NPC), Alter Trait (targeted, explicit).
- **Minds & Society:** Cause Confusion (one target), Mass Confusion (area), Plant Rumor (initial believable or questionable claim).
- **World & Environment:** Cause Malfunction (interactive fixture), Spill / Hazard, World Event.
- **Observe:** Cause-and-Effect Timeline, event attribution, filters.

Interactions: select power -> select person/fixture/ground tile -> preview target, radius, expected risk, cost/cooldown (when applicable) -> confirm -> immediate visible and logged feedback. Allow cancel before applying. No dependence on hover; avoid covering the map on mobile. Show tooltips and locked reasons accessibly. Keep all existing actions and Quick controls.

## 3. Core power definitions (PROPOSED — not individually approved)

### Create Life
Create an NPC with custom name, hairstyle/color, age (adult, following existing age bounds), role (customer, employee, visitor/outsider), existing 10 personality traits each 0–100, hobby, starting needs, and optional special disposition. Generate valid ID, relationships, memories, acquaintances, inventory, stats, initial goals, schedule, and entry position. Validate safe spawn on navigable tile. Cap crowd count based on performance and mode. Employees integrate shifts/roles; emergency personnel continue through the emergency dispatch system, not an unmanaged pseudo-responder.

Special disposition examples **proposal only**: Troublemaker, Natural Leader, Unshakable, Manipulator. Implement as modifiers to existing behavior, not absolute guaranteed outcomes; avoid breaking trait interactions. New custom NPCs are autonomous after spawning and have the normal action/inspection interfaces. Challenge mode victory population semantics must be explicitly specified before allowing mid-challenge spawn.

### Cause Confusion
Temporarily increase uncertainty, fear/stress and reduce certainty of selected beliefs for **one** targeted NPC; memory an ambiguous event; trigger varied investigation, withdrawal, conversation, rumor, or recovery based on traits and context. **No guaranteed violence or forced death.**

### Mass Confusion
Apply a radial influence to NPCs in radius around a clicked tile, with severity falloff and resistance from courage, sanity, and individual traits. May create second-order panic/rumor chains using existing systems. Avoid frame spikes and repeated firehose logs with throttling.

### Plant Rumor
Introduce a belief about a person or incident to selected source NPC(s); store source and confidence; let each listener evaluate trust, honesty, suspicion, acquaintance, and evidence before passing it on. Some NPCs reject/correct rumors. Rumors should be retractable or disprovable by simulation events, with corresponding memory consequences.

### Cause Malfunction / Hazard
Target an existing machine or fixture and feed into existing tampering, activeHazards, incident, injury, and EMS/fire response logic. Make consequences probabilistic; ensure safety and route navigation remain valid; don't create an unremovable collision object.

### World Event
Trigger an existing appropriate event (power outage, inspection, delivery, fire alarm, checkout crowd, spill, fallen merchandise, blocked aisle), respecting current systems. Proposed later expansion: temporary store closure or weather; only after base powers stabilize.

### Observe Causality
Every God action gets a unique `originId` and an event `causeId`. Children (witness rumors, grudge, accident, dispatch, arrest) refer to their immediate parent and original God action where known. UI timeline explains **what happened and why**, distinguishes direct player intent from emergent NPC behavior, and avoids falsely attributing unrelated random events.

## 4. Rules for the two game modes

- **Endless Sandbox:** default unlimited use (optional toggles for cooldown/energy), experimentation first. Every power still validates legal targets and maintains simulation safety.
- **One-Day Challenge:** recommended limited God Energy with recharge/costs/cooldowns to protect pacing and prevent immediate win; **exact costs, recharge and spawn/victory semantics remain open for approval**. Chaos Points remain the reward for consequences, not an unlimited source of powers unless explicitly approved.
- **Targeted direct actions** (including Kill and Go Insane) retain existing sanity, emotion and cooldown requirements; God Powers must not silently bypass them.
- Difficulty balancing: afford meaningful player agency, protect reactive world model, avoid spam loops and runaway populations.

## 5. Integration design (based on current code)

Existing reuse targets:
- `makeNPC()`, `TRAITS`, `NEEDS`, `npcs`, `newGame()` for spawned character construction and defaults.
- `startPlayerAction()` unchanged for direct commands. Add separate `applyGodPower({type,targetId,point,options})` dispatcher.
- `updateMind()`, `autonomousSocialDecision()`, `social()`, `recordGrudge()`, `memory()`, `belief()`, `gossip()` for mental/social consequences.
- `makeHazard()`, `updateHazards()`, `triggerWorldEvent()`, `registerScene()`, `emergencyCall()`, `updateEmergency()` for environment and incident effects.
- `renderUI()`, current nav, `draw()` for God UI, target/radius overlays, on-map feedback; keep existing mobile panels.
- `saveData()` / `restore()` (currently version 9) for world God mode state, created NPC metadata, energy/cooldown if approved, and bounded cause timeline. New saves should migrate older versions safely; no forced world restart.

Technical shape: define power metadata centrally; use validated target resolver; apply effects to existing NPC state; emit event IDs; render from existing state; keep deterministic world RNG (`rng`) where practical; cap effect fan-out, per-tick work, stored events and memory.

## 6. Staged implementation plan

1. **Foundation and UI:** dedicated God tab and mobile-safe target picker; power registry; origin/cause IDs; save migration; basic UI smoke tests.
2. **Create Life:** full custom traits and appearance; normal NPC initialization and autonomy; inspect/actions; save/restore; crowd-cap checks.
3. **Targeted Powers:** confusion, rumor, malfunction/hazard tied to existing mental/social/environmental systems; personality resistance and visible feedback.
4. **Mass Powers:** mass confusion and world events with radial falloff, bounded propagation and balancing; explicit cleanup/recovery.
5. **Cause Timeline + polish:** causal event chain display, clear status and severity indicators, content controls, challenge costs after final approval.
6. **Full QA:** Challenge/Sandbox; desktop/mobile controls; selected NPC/direct control regression; nearby interactions; 21 action checks; alive/deceased states; police/EMS/fire; hazard chains; employee roles; route traffic; old/new saves; deterministic seeds; multi-day sandbox; populated worlds and performance.

## 7. Acceptance criteria

- Existing direct actions still work; no removed or renamed approved mechanic.
- God powers alter conditions without identical scripted NPC outcomes.
- Spawned NPC can work, use needs, remember, interact, and be saved normally.
- No emergency/vehicle/nav or save regressions.
- God actions have observable effects and a readable cause timeline.
- Challenge has a tested nontrivial balance policy before release; Sandbox remains freely experimental by default.
- Performance reasonable on mobile with high NPC count, without runaway autonomous cascades.

## 8. Genuinely unresolved design decisions

1. Challenge-mode **God Power economy**: proposed finite God Energy with cooldowns; decide costs, recharge and whether some powers are unavailable in Challenge.
2. **Challenge population semantics** for God-created NPCs: whether new NPCs enter the survivor victory denominator, and how to prevent exploiting victory.
3. Whether users can **alter existing NPC traits** freely or only use custom traits when creating them.
4. Whether **God powers have separate achievement or chaos-scoring attribution** beyond current scoring.

Do not reopen Hybrid mode choice. Do not implement proposed rules as if approved unless instructed to choose sensible defaults at build time.
