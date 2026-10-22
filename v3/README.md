# Life in Motion v3 — Fresh Foundation

Independent browser game available from `/v3/`. Life in Motion v2 files are preserved.

## Run

Open `v3/index.html` through a local static server (ES modules require HTTP), or use the GitHub Pages `/life-in-motion/v3/` route when deployed.

## Completed implementation slices

1. World foundation: grid geometry, correct employee room boundaries, aisle-aligned shelves, clear receiving access, isometric camera, door motion, collision and A-star routing.
2. Autonomous NPCs: randomized identities, trait-influenced choices, emotions, relationships, witness memory, smooth walking and fleeing.
3. Interaction: theme-specific items, inventory, pickups and theft, witness reactions, context actions, fighting and moderate injuries.
4. God systems: target-aware powers, earned energy, resistance, environmental hazards, chain reactions and a cooldown-limited no-cost recovery action.
5. Response: finite police/fire/medical pools, delayed arrivals, vehicle motion, firefighting, medical treatment, on-map detention.
6. Round completion: victory/results/freeplay, pause/1x/2x/4x, save/continue and state versioning.
7. Automated QA: `npm test` using Node.js 22; GitHub Actions syntax and regression suite.

## Testing

```sh
cd v3
npm test
```

Core tests cover collision, receiving access, staff navigation, NPCs, powers, dispatch pool bounds, save/load, random-state continuity, pause and victory.

## Important limits

The first playable scenario is Hardware Store. Other map choices remain locked until their maps are implemented. The current artwork is procedurally rendered, not final production asset artwork. This is a first integrated release; browser-specific visual review, mobile touch QA, balance tuning, and extended soak testing should be completed before calling it production-polished.

## Architectural files

- `src/world.js`: map, doors, fixtures, collision, routing
- `src/simulation.js`: NPCs, combat, hazards, God Powers, emergency dispatch
- `src/main.js`: browser canvas rendering, interface and integration
- `src/persistence.js`: full-round and progress saving
- `tests/qa.mjs`: core regression suite
