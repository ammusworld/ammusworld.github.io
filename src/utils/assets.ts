// Asset paths for the Valentine's Day game
// Using SVG assets for pixel art style

import duduSprite from '../assets/sprites/dudu.svg'
import chunguSprite from '../assets/sprites/chungu.svg'

import grassTile from '../assets/tiles/grass.svg'
import grassFlowersTile from '../assets/tiles/grass-flowers.svg'
import dirtPathTile from '../assets/tiles/dirt-path.svg'
import pavedPathTile from '../assets/tiles/paved-path.svg'
import treeTile from '../assets/tiles/tree.svg'
import bushTile from '../assets/tiles/bush.svg'
import waterTile from '../assets/tiles/water.svg'
import houseTile from '../assets/tiles/house.svg'

import heartIcon from '../assets/ui/heart.svg'
import floatingHeartIcon from '../assets/ui/floating-heart.svg'
import heartSmallIcon from '../assets/ui/heart-small.svg'
import sparkleIcon from '../assets/ui/sparkle.svg'

export const ASSETS = {
  sprites: {
    dudu: duduSprite,
    chungu: chunguSprite,
  },
  tiles: {
    grass: grassTile,
    grassFlowers: grassFlowersTile,
    dirtPath: dirtPathTile,
    pavedPath: pavedPathTile,
    tree: treeTile,
    bush: bushTile,
    water: waterTile,
    house: houseTile,
  },
  ui: {
    heart: heartIcon,
    floatingHeart: floatingHeartIcon,
    heartSmall: heartSmallIcon,
    sparkle: sparkleIcon,
  },
  photos: Array.from({ length: 10 }, (_, i) => 
    `${import.meta.env.BASE_URL}photos/photo-${String(i + 1).padStart(2, '0')}.svg`
  ),
  audio: {
    bgm: `${import.meta.env.BASE_URL}music/game-music.mp3`,
    finale: `${import.meta.env.BASE_URL}music/finale1.mp3`,
    heartCollected: `${import.meta.env.BASE_URL}music/heart-collected.mp3`,
  },
  cutscene: {
    bubuRun: `${import.meta.env.BASE_URL}gifs/bubu-run.gif`,
    bubuHug: `${import.meta.env.BASE_URL}gifs/bubu-hug.gif`,
    bubuSpin: `${import.meta.env.BASE_URL}gifs/bubu-spin.gif`,
    houseInside: `${import.meta.env.BASE_URL}photos/house-inside.jpg`,
  },
} as const

export type SpriteKey = keyof typeof ASSETS.sprites
export type TileKey = keyof typeof ASSETS.tiles
export type UIAssetKey = keyof typeof ASSETS.ui
