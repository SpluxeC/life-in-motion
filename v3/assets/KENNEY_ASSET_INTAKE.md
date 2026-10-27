# Kenney asset-pack intake — Life in Motion

User-supplied archives inspected on 2026-10-27:

| Pack | Content | License |
| --- | --- | --- |
| Car Kit 3.1 | 50 vehicle/prop GLB models, 50 OBJ and FBX variants, preview PNGs | CC0 |
| Building Kit 1.0 | 79 building GLB models, OBJ/FBX, preview PNGs | CC0 |
| Furniture Pack 1.0 Exclusive | 120 furniture model types and 4 angle-specific isometric PNGs each | CC0 |

Original ZIP files are **not yet present in this repository**. They were uploaded in the chat, and the GitHub connector does not accept chat-uploaded ZIP paths as binary inputs. Do not claim they were deployed.

## Recommended implementation order

1. Furniture, especially cardboard boxes, bookcases, desks, chairs, computers, coffee station and microwaves, using four directional PNGs.
2. Preserve and integrate full vehicle GLB models (ambulance, police car, delivery van, sedan, SUV, firetruck). Use a WebGL vehicle layer coordinated with the canvas camera, maintaining continuous heading and wheel rotation as vehicles move. Do not replace these with fixed-angle sprites.
3. Building GLB walls and tiles only after verifying collision, tile edges, transparency and visibility around the rotating camera.

Preserve the existing map, NPC paths, object IDs, interactions, and four camera rotation/view assumptions; adapt image anchor coordinates and scale independently. Keep CC0 licenses alongside the assets.

The source car archive includes separate wheel GLBs for wheel-spin/steering assemblies. These are models, not automatically drivable vehicles: driving/pathfinding, transforms, wheel pivots, synchronization with NPCs, collision and save migration still require implementation. Preserve originals and license. Upload binaries before activating GLB references in runtime.

## Updated vehicle rendering decision (approved)

The gameplay renderer now uses **four camera-aware 2D facings**, switching with vehicle travel direction and keeping the saved heading when stationary. This is implemented in `v3/src/vehicle-directional-sprites.js` with cached Canvas sprites and a fallback to the original artwork. A 3D runtime renderer is **not** required. The current built-in directional artwork is temporary: the uploaded Kenney GLB vehicles are **not yet converted** to the final four-angle sprite sheets or committed as game assets. Keep the original model archive available for offline sprite rendering. Vehicle movement logic remains separate from visual-facing selection.
