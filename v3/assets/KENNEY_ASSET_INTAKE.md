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
2. Convert vehicle GLB models to consistent camera-view sprite renders (ambulance, police car, delivery van, sedan, SUV, firetruck) before replacing current drawn vehicles.
3. Building GLB walls and tiles only after verifying collision, tile edges, transparency and visibility around the rotating camera.

Preserve the existing map, NPC paths, object IDs, interactions, and four camera rotation/view assumptions; adapt image anchor coordinates and scale independently. Keep CC0 licenses alongside the assets.

A curated review ZIP was created in the original conversation for the user to download and upload as an archive before bulk integration.
