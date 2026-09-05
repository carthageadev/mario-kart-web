# RaceOrder live racing HUD

This is a browser-first recreation of the supplied leaderboard reference. It is a real-time React + Three.js interface: the **Live UI** mode has no video timeline or playback control. Choose a driver by clicking a rank card or pressing `1`–`6`; the selected row expands and the procedural surface plus low-poly kart animate live.

The **Source video** mode is kept as a separate analysis tool. It plays the extracted reference frames and enables the comparison slider so the recreation can be checked against the original motion.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL. `npm run build` creates the production bundle in `dist/`.

## Rendering model

- `src/shaders.ts` draws the rank card/nameplate surface in GLSL: rounded signed-distance geometry, metallic gradient, bevel light, checker tiles, accent stripe, and moving gloss.
- Live sheen loops as a fast positional right-to-left woosh; Settings exposes strength, opacity, color, and bloom.
- `src/kart.ts` creates the kart from Three.js boxes, extruded geometry, cylinders, and lit physical materials. It is a mesh, not a sprite.
- `src/RacingLeaderboard.tsx` owns the WebGL scene and keeps DOM buttons above the canvas for crisp accessible labels and interaction.
- `public/reference/` contains only the opt-in source comparison frames. The Live UI mode never reads them.

The component is reusable: pass `players`, `selectedIndex`, `onSelect`, `showKarts`, `gloss`, and `reducedMotion` to connect it to a game’s own race state.
