# Life in Motion — Animation Overhaul Milestone (Phases 1–7)

Development branch: `feature/animation-overhaul-phase-1`. Do not merge into `main` until review.

## Implemented

- **Phase 1:** layered stick-figure locomotion, activity poses, adaptive animation detail and pause-stable simulation time.
- **Phase 2:** emotion-based faces and reaction poses; attacks and injuries use genuine simulation event timestamps.
- **Phase 3:** the six God Power effects and fire, spill, and electrical visual cues; reduced-motion option for visual effects.
- **Phase 4:** fallen signs and fixture debris persist; injured NPC trapping, rescue progression, worker cleanup and animation; active debris blocks walking.
- **Phase 5:** first-responder navigation, emergency vehicle lights, fire suppression and response indicators.
- **Phase 6:** opt-in synthesized ambient soundtrack and positional cues for triggered God Powers, with immediate mute.
- **Phase 7:** reduced-motion preference, optional audio controls, deterministic regression coverage and desktop/mobile Chromium smoke QA.

## Compatibility and safety

The default gameplay remains 1x speed plus pause. Audio remains off unless opted in. Existing save schema remains 1; optional event fields are absent in older saves and are guarded. World incidents advance only through simulation ticks; no live version deployment is included.

## Review required

Automated tests are not a substitute for physical-device testing or a human playthrough. Review mobile portrait and landscape, prolonged sessions, every emergency-event animation, audio loudness and latency, performance on entry-level phones, reload/save compatibility and UI text accessibility. The QA fixture is restricted to localhost and not active on the published site. Inspect GitHub Actions artifacts from the latest passing browser workflow for screenshots and a locally served preview. Approve the draft PR before merging.
