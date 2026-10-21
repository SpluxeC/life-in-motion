# Life in Motion — God Powers Design Specification

Status: **HYBRID DIRECTION LOCKED; GOD POWERS INITIAL RELEASE IMPLEMENTED** on 2026-10-21. `v2.html` now supports all eight planned God Powers, Challenge energy and cooldowns, custom traits and starting needs, and a causal timeline. Physical mobile visual QA and future balancing remain open.
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

## 3. God Powers in the initial implementation (rules-based simulation)

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
- **One-Day Challenge (implemented):** 70 starting energy, 100 maximum, recharge +12 per in-game hour. Costs: Create Life 35, Alter Trait 5, Confusion 14, Mass Confusion 42 (+3 per radius tile above 6, up to 54), Plant Rumor 18, Malfunction 22, Hazard 18, World Event 32. Per-power cooldowns: respectively 35, 8, 16, 55, 24, 28, 25, 43 in-game minutes. Every custom NPC spawned during Challenge counts toward the survivor victory population. Chaos Points remain a separate reward, not an unlimited God Energy source.
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

## 8. Future polish and non-blocking design choices

1. Challenge-mode God Energy is now implemented; future playtesting may adjust energy costs, recharging, and cooldowns.
2. Challenge population semantics are implemented: God-created NPCs enter the survivor victory denominator. Monitor balance during playtesting.
3. Alter Trait is implemented as a God Power, costing Challenge energy with cooldown; custom starting needs are supported on created characters.
4. Whether **God powers have separate achievement or chaos-scoring attribution** beyond current scoring.

Do not reopen Hybrid mode choice. Do not implement proposed rules as if approved unless instructed to choose sensible defaults at build time.

## Implementation record — October 21, 2026

This section supersedes any earlier "proposed only" wording for features listed below. All existing direct NPC action systems remain in place.

- **Implemented God Powers:** Create Life, Alter Trait, Cause Confusion, Mass Confusion, Plant Rumor, Cause Malfunction, Create Hazard, World Event.
- **UI:** Always-accessible God tab, categorized powers, custom name/role/gender/age/hair/hobby/ten-trait creator, all nine starting needs, map target/area preview, confirmation/cancel, and linked event timeline.
- **Challenge economy (implemented default):** Max energy 100; start 70; regain 12 energy per in-game hour when the simulation advances. Costs: Create Life 35, Alter Trait 22, Confusion 14, Mass Confusion 42 at radius 6 (+3 per tile above 6), Plant Rumor 18, Malfunction 22, Hazard 18, World Event 32. Each has its own cooldown measured in in-game minutes: 35, 30, 16, 55, 24, 28, 25 and 43, respectively. Powers cannot be used once the challenge ends.
- **Sandbox:** All eight powers are unlimited and have no cooldown, though world capacity/target validation still applies.
- **Custom population:** At most 72 ordinary NPCs; spawned characters are autonomous and use the normal NPC systems. In Challenge, every God-created NPC increases the survivor count and the victory denominator by one, preventing a spawn from making the objective easier. In Sandbox, there is no challenge denominator.
- **NPC resistance:** Confusion severity and response depend on courage, sanity, disposition and other traits. Rumors are probabilistically believed, doubted or passed along; some NPCs refuse to repeat them. Special dispositions: Troublemaker tends toward verbal provocation, Natural Leader encourages nearby characters, Unshakable resists confusion, Manipulator improves rumor spreading/persuasion.
- **World effects:** Malfunctions feed existing fixture tampering; hazard powers feed the existing active hazards and injury system; World Event uses existing store-wide events.
- **Causality:** New bounded, saved timeline tracks God-originated actions, reactions and identifiable resulting rumors, hazards and malfunctions. It deliberately does not claim every unrelated event is caused by God.
- **Save migration:** New save format version 10; older saves without a `godState` load with the default energy pool and empty God timeline. New worlds reset the pool and history.
- **Testing:** Automated game-script, mode, power, energy/cooldown, custom character, save/load and canvas smoke tests performed. Real-device visual and interaction testing remains outstanding.

The existing specification describes some *future polish and aspirations* beyond this shipped foundation; those remain candidates for future releases, not proof that every earlier aspiration has been fully implemented.

## Verification after reconnect — October 21, 2026

- Connected GitHub and inspected live `v2.html` after interruption; existing God UI, effects, energy hooks, timeline and saved state were present.
- Verified all eight God Powers in Endless Sandbox, and Challenge energy prevents use when insufficient. Checked mode-specific cooldowns, 21 preexisting direct-action buttons and conditional extreme-action locks.
- Verified Create Life including custom starting sanity/stress/energy and personality traits, direct-control coexistence, selected-NPC/map target interaction, and event timeline.
- Scripted regression on both game modes, including high-population runs (48 starting NPCs), save/restore version 10 and older version 9 saves. No JavaScript exceptions during these tests.
- In-game God Energy costs appear directly on buttons for mobile. Sandbox powers remain unlimited; effects are rules-based NPC simulation, not per-NPC language-model calls.
- Unverified: real iOS/Android device visuals, tap sizing with actual browser input, sustained device frame rates, and all possible emergent event chains.

## Interface and interaction refinement — October 21, 2026

- **Trait editing:** Character tab now shows read-only trait values. Only the God Power **Alter Trait** can change traits through the player interface. It costs **5 God Energy** in One-Day Challenge (down from 22), with an 8-minute in-game cooldown; Sandbox remains free. NPCs can still develop skills independently through approved gameplay.
- **Power popup:** Tapping any God Power opens a modal containing **only that power's options**. For targeted powers, choose *Pick a target on the map*, tap a person, fixture, or tile, and the modal reopens for confirmation. Cancel and success states close it. Power results remain visible in the God tab.
- **Vehicle inspection:** Tap civilian cars, police cruisers, ambulances, or fire engines to inspect status, owner, assigned crew and actual vehicle inventory. New emergency vehicles carry police/EMS/fire equipment; old saves with empty emergency vehicle inventories receive sensible defaults during migration. Cars continue using existing lane-routing mechanics.
- **First responder interaction:** Emergency responders can be tapped as characters and inspected through standard Character/Social/Actions interfaces, receive player actions and items, and be targeted by individual God Powers. Response jobs remain active and responders depart after completing calls; they do not enter the ordinary civilian population count.
- **Dark workplace comedy:** NPC conversations and naturally generated rumors now use dry, darkly comic hardware-store/workplace dialogue, with gentler variants for compassionate personalities and different dialogue under high stress. Mechanics for belief, truth, reputation and relationships are unchanged.
- **Regression checks:** Confirmed all 21 original actions still work on selected responders; selection and inventory inspection on civilian and emergency vehicles; two-mode Alter Trait energy behavior; selected-power popup and touch-map targeting; simulations, old save rules, corpses and version-10 save/restore. Real-device mobile UI verification remains pending.


## Visual world overhaul — October 21, 2026

**Design direction:** Original, performance-conscious, isometric/2.5D survival-simulation environment inspired by the broad visual qualities of grounded isometric games. No third-party proprietary artwork copied. **Stick-figure NPCs and their mechanics are deliberately preserved.**

Implementation completed in order:
1. **World art foundation** (commit `65bb690`): muted weathered asphalt/concrete/garden tile variations, deterministic cracks and grain, dark industrial shelf/machine finishes, deep prop shadows. Procedural geometry; no map/collision changes.
2. **Structure/exterior** (commit `f78af8c`): concrete-block wall courses, faded-cutaway building shell, roof support, entrance canopy, loading dock, garden fencing and curb details. Existing cutaway zoom behavior retained.
3. **Vehicles** (commit `b531be4`): recognizable layered silhouettes with wheels, bodywork, roof, windshield/windows, front and rear lights; civilian sedan/SUV/pickup/van variations; distinct police/ambulance/fire engine styling and emergency lighting. Uses existing vehicle route waypoint headings without changing routes or inventory hit testing.
4. **World dressing** (commit `55cff73`): visual-only boxes, pallets, loading equipment, barrels, utility boxes, bollards, caution signs, garden planters and store carts. No new collision or pathfinding obstacles.
5. **Interface styling** (commit `1ebebce`): dark industrial panels, muted foreground palette, amber focus/energy highlights, stronger section delineation, mobile-aware sizing; all original interface workflows remain.

**Verification:** Both Challenge and Sandbox ran 420 simulated ticks with repeated canvas draws, all three responder vehicle categories, save/restore and version-9 migration. Verified all 21 direct action buttons, God Alter Trait energy in both modes, vehicle inventory inspection, and existing stick-figure renderer availability. No JavaScript exceptions in those tests. **Outstanding:** actual graphical inspection across screen sizes and physical iOS/Android frame-rate QA; procedural visuals will benefit from visual design tuning after feedback.
