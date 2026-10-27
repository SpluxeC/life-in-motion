# Kenney Car Kit four-direction sprites

Generated from the user-supplied Kenney Car Kit 3.1 GLB models, licensed Creative Commons Zero (CC0). PNG files are 192×160 transparent RGBA.

The conversion contains **14 vehicle models × four camera-facing views** (up, right, down, left) = **56 PNGs**.

Vehicles: sedan, sedan-sports, hatchback-sports, suv, suv-luxury, van, truck, delivery, delivery-flat, police, ambulance, firetruck, taxi, garbage-truck.

To install the binary assets, extract the provided `life-in-motion-kenney-vehicle-sprites-ready.zip` at the **repository root** so that images reside at `v3/assets/kenney-vehicles/<model>-<direction>.png`. Preserve `LICENSE.txt` (CC0).

The 2D renderer (`src/vehicle-directional-sprites.js`) looks for matching image files and uses them when loaded. Without those files, it falls back to the old Canvas vehicle visuals. At present the built-in mapping covers sedan/suv/truck/van and firetruck/police/ambulance. The other exported models are ready for future visual variations.

Important: **The ZIP/PNG binaries are downloadable in the ChatGPT conversation, but have NOT been pushed into GitHub.** This documentation and loader code are in the repository. Do not claim the Kenney artwork is live until images are committed and Pages redeployed.

Rendering note: angle-preserving fixed sprites are an approximation to the camera's continuous 25–65° rotation; for smoother appearance additional angles would be needed.
