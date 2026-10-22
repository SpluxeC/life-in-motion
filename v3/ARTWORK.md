# Hardware-store built-in artwork (v3)

This implementation deliberately uses **no downloaded sprites**. Canvas code in `src/artwork.js` draws store fixtures, stock, cars, walls, floors, doors and loose inventory items. Main-menu, map-selection and new-game setup remain unchanged.

## Rendering contracts

- One integer tile is one logical unit for navigation, world collision and world placement.
- Object bounding boxes are anchored to tile-centered coordinates (x-.5 to x+w-.5, y-.5 to y+h-.5). All room walls and doors share that reference.
- Store shelves extend along +Y, with evenly spaced floor stands, four shelf tiers, and department-specific product silhouettes.
- All solid fixtures declare their collision footprint in `src/world.js`. The new content respects receiving and employee-room access routes.
- Walls and doors have explicit `axis: 'x' | 'y'` directions; saved legacy worlds without it render with an inferred fallback.
- Procedural floor surfaces include asphalt, store tile, staff-floor textures, garden surfaces, crosswalk markings and parking bays.
- Art is pure rendering. It must not change NPC coordinates, inventory, collision or game state.
- Loose items and one item carried by each NPC are visually represented using code-drawn symbols.
- Store assets sort into the existing isometric depth order with NPCs, props and hazards.

## Doors

`src/simulation.js` opens a door in advance when an NPC is within reach or has the threshold in the first four path steps. The animation interpolates opening/closing. The threshold blocks the next step until the opening exceeds 0.65, then stays open briefly while the character passes. When everybody clears the threshold, it closes. This works at adjustable simulation speeds because animation uses fixed simulated delta time. The double-storefront and loading-bay holes cannot be bypassed at adjacent tiles.

## Testing

From `v3/`, run `npm test`. The regression suite checks collision-safe layout, pathfinding, all artwork functions with a mock canvas, entrance/receiving gap closures, NPC crossing and door automatic closing, and regular game systems.

Final mobile/desktop appearance, performance and artistic quality still benefit from testing directly on GitHub Pages.
