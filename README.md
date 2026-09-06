# RaceOrder live racing HUD

This is a browser-first recreation of the supplied leaderboard reference. It is a real-time React + Three.js interface: the **Live UI** mode has no video timeline or playback control. Choose a driver by clicking a rank card or pressing `1`–`6`; the selected row expands and the procedural surface plus low-poly kart animate live.

The **Source video** mode is kept as a separate analysis tool. It plays the reconstructed motion timeline. The comparison slider becomes available when local extracted frames are added to `public/reference/`.

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
- `public/reference/` is ignored by git and is only for optional local source comparison frames. The Live UI mode never reads it.

The component is reusable: pass `players`, `selectedIndex`, `onSelect`, `showKarts`, `gloss`, and `reducedMotion` to connect it to a game’s own race state.

## Game menu

Open `/game` for the menu mockup. Up and Down select modes. Left and Right choose 1P to 4P on Multiplayer. A or Enter confirms. B or Escape goes back.

The menu reuses the leaderboard shader and sampled opening curve. White checker wipes cover page changes. Cup selection, course selection, settings, and a race preview are interactive. Garage is a stub. Multiplayer stores a player count; it does not run a multiplayer game.

The temporary backdrop and course thumbnails reference a Mario Kart 8 Deluxe screenshot hosted by [Game UI Database](https://www.gameuidatabase.com/uploads/MarioKart8Deluxe04222020-114642.jpg). This third-party reference image is loaded remotely and is not bundled in the repository. Replace it with original game art for release. Screen layouts were studied at [Game UI Database](https://www.gameuidatabase.com/gameData.php?id=83&autoload=846). Models and menu materials are generated in code.
