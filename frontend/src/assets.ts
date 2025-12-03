import type { AssetsManifest } from "pixi.js";

export const manifest: AssetsManifest = {
  bundles: [

    // -------------------------------------------------
    // Textures
    // -------------------------------------------------
    {
      name: "textures",
      assets: {

        // --- BACKGROUNDS ---
        bgMorning: {
          src: "/assets/backgrounds/Background1.png",
          frames: [{ x: 0, y: 0, w: 256, h: 256 }]
        },
        bgNoon: {
          src: "/assets/backgrounds/Background2.png",
          frames: [{ x: 0, y: 0, w: 256, h: 256 }]
        },
        bgAfternoon: {
          src: "/assets/backgrounds/Background3.png",
          frames: [{ x: 0, y: 0, w: 256, h: 256 }]
        },
        bgEvening: {
          src: "/assets/backgrounds/Background4.png",
          frames: [{ x: 0, y: 0, w: 256, h: 256 }]
        },
        bgNight: {
          src: "/assets/backgrounds/Background5.png",
          frames: [{ x: 0, y: 0, w: 256, h: 256 }]
        },

        // --- BIRDS ---
        bird1: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 0, w: 16, h: 16 },
            { x: 16, y: 0, w: 16, h: 16 },
            { x: 32, y: 0, w: 16, h: 16 },
            { x: 48, y: 0, w: 16, h: 16 }
          ]
        },
        bird2: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 16, w: 16, h: 16 },
            { x: 16, y: 16, w: 16, h: 16 },
            { x: 32, y: 16, w: 16, h: 16 },
            { x: 48, y: 16, w: 16, h: 16 }
          ]
        },
        bird3: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 32, w: 16, h: 16 },
            { x: 16, y: 32, w: 16, h: 16 },
            { x: 32, y: 32, w: 16, h: 16 },
            { x: 48, y: 32, w: 16, h: 16 }
          ]
        },
        bird4: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 48, w: 16, h: 16 },
            { x: 16, y: 48, w: 16, h: 16 },
            { x: 32, y: 48, w: 16, h: 16 },
            { x: 48, y: 48, w: 16, h: 16 }
          ]
        },
        bird5: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 64, w: 16, h: 16 },
            { x: 16, y: 64, w: 16, h: 16 },
            { x: 32, y: 64, w: 16, h: 16 },
            { x: 48, y: 64, w: 16, h: 16 }
          ]
        },
        bird6: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 80, w: 16, h: 16 },
            { x: 16, y: 80, w: 16, h: 16 },
            { x: 32, y: 80, w: 16, h: 16 },
            { x: 48, y: 80, w: 16, h: 16 }
          ]
        },
        bird7: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0, y: 96, w: 16, h: 16 },
            { x: 16, y: 96, w: 16, h: 16 },
            { x: 32, y: 96, w: 16, h: 16 },
            { x: 48, y: 96, w: 16, h: 16 }
          ]
        },

        // --- TILES ---
        greenPipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 0, y: 0, w: 32, h: 16 },
            { x: 0, y: 16, w: 32, h: 16 },
            { x: 0, y: 32, w: 32, h: 16 },
            { x: 0, y: 48, w: 32, h: 16 },
            { x: 0, y: 64, w: 32, h: 16 }
          ]
        },
        orangePipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 32, y: 0, w: 32, h: 16 },
            { x: 32, y: 16, w: 32, h: 16 },
            { x: 32, y: 32, w: 32, h: 16 },
            { x: 32, y: 48, w: 32, h: 16 },
            { x: 32, y: 64, w: 32, h: 16 }
          ]
        },
        redPipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 64, y: 0, w: 32, h: 16 },
            { x: 64, y: 16, w: 32, h: 16 },
            { x: 64, y: 32, w: 32, h: 16 },
            { x: 64, y: 48, w: 32, h: 16 },
            { x: 64, y: 64, w: 32, h: 16 }
          ]
        },
        bluePipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 96, y: 0, w: 32, h: 16 },
            { x: 96, y: 16, w: 32, h: 16 },
            { x: 96, y: 32, w: 32, h: 16 },
            { x: 96, y: 48, w: 32, h: 16 },
            { x: 96, y: 64, w: 32, h: 16 }
          ]
        },

        groundDay: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 0, y: 80, w: 16, h: 32 },
            { x: 16, y: 80, w: 16, h: 32 },
            { x: 32, y: 80, w: 16, h: 32 },
            { x: 48, y: 80, w: 16, h: 32 }
          ]
        },
        groundNight: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 64, y: 80, w: 16, h: 32 },
            { x: 80, y: 80, w: 16, h: 32 },
            { x: 96, y: 80, w: 16, h: 32 },
            { x: 112, y: 80, w: 16, h: 32 }
          ]
        },

        // --- UI ---
        logo: {
          src: "/assets/ui/logoFlappyBird.png",
          frames: [{ x: 0, y: 0, w: 1792, h: 864 }]
        },

        button: {
          src: "/assets/ui/Spritesheet_UI_Flat_Animated.png",
          frames: [
            { x: 96, y: 64, w: 32, h: 32 },
            { x: 64, y: 64, w: 32, h: 32 },
            { x: 32, y: 64, w: 32, h: 32 },
            { x: 0, y: 64, w: 32, h: 32 }
          ]
        },

        bigTick: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 352.5, y: 128, w: 32, h: 32 }]
        },        
        bigArrow: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 416, y: 128, w: 32, h: 32 }]
        },
        bigCross: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 383.5, y: 128, w: 32, h: 32 }]
        },
        
        smallTick: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 352, y: 160, w: 32, h: 32 }]
        },
        smallCross: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 384, y: 160, w: 32, h: 32 }]
        },
        smallArrow: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 416, y: 160, w: 32, h: 32 }]
        },

        ranking: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 136, y: 34, w: 34, h: 34 },
            { x: 170, y: 34, w: 34, h: 34 }
          ]
        },
        settings: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 136, y: 0, w: 34, h: 34 },
            { x: 170, y: 0, w: 34, h: 34 }
          ]
        },
        play: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 136, y: 102, w: 34, h: 34 },
            { x: 170, y: 102, w: 34, h: 34 }
          ]
        },

        arrowRight: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 136, y: 170, w: 34, h: 34 },
            { x: 170, y: 170, w: 34, h: 34 }
          ]
        },
        arrowLeft: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 34, y: 170, w: 34, h: 34 },
            { x: 68, y: 170, w: 34, h: 34 }
          ]
        },

        cross: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 204, y: 0, w: 34, h: 34 },
            { x: 272, y: 0, w: 34, h: 34 }
          ]
        },

        restart: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 136, y: 68, w: 34, h: 34 },
            { x: 170, y: 68, w: 34, h: 34 }
          ]
        },
        exit: {
          src: "/assets/ui/icon_pack_by_mewily_32px32_1_margin.png",
          frames: [
            { x: 34, y: 0, w: 34, h: 34 },
            { x: 68, y: 0, w: 34, h: 34 }
          ]
        },

        bigPanelGrey: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 32, y: 32, w: 96, h: 64 }]
        },
        midPanelGrey: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 32, y: 96, w: 64, h: 32 }]
        },
        smallPanelGrey: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 32, y: 128, w: 32, h: 32 }]
        },
        smallPanelGrey2: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 32, y: 160, w: 32, h: 32 }]
        },

        bigPanelBlue: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 128, y: 32, w: 96, h: 64 }]
        },
        midPanelBlue: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 128, y: 96, w: 64, h: 32 }]
        },
        smallPanelBlue: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 128, y: 128, w: 32, h: 32 }]
        },
        smallPanelBlue2: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 128, y: 160, w: 32, h: 32 }]
        },

        bigPanelOrange: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 224, y: 32, w: 96, h: 64 }]
        },
        midPanelOrange: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 224, y: 96, w: 64, h: 32 }]
        },
        smallPanelOrange: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 224, y: 128, w: 32, h: 32 }]
        },
        smallPanelOrange2: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 224, y: 160, w: 32, h: 32 }]
        },

        textPage: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 320, y: 64, w: 64, h: 32 }]
        },
        title1down: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 288, y: 96, w: 64, h: 32 }]
        },
        title1up: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 288, y: 128, w: 64, h: 32 }]
        },
        title2up: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 288, y: 160, w: 64, h: 32 }]
        },
        title2down: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [{ x: 288, y: 192, w: 64, h: 32 }]
        }
      }
    },

    // -------------------------------------------------
    // FONTS
    // -------------------------------------------------
    {
      name: "fonts",
      assets: {
        vcrBase: {
          src: "/assets/fonts/vcr_osd_mono_noStroke/vcr_osd_mono_noStroke.fnt"
        },
        vcrLight: {
          src: "/assets/fonts/vcr_osd_mono_lightStroke/vcr_osd_mono_lightStroke.fnt"
        },
        vcrHeavy: {
          src: "/assets/fonts/vcr_osd_mono_heavyStroke/vcr_osd_mono_heavyStroke.fnt"
        },
        vcrTTF: {
          src: "/assets/fonts/VCR_OSD_MONO_1.001.ttf"
        }
      }
    },

    // -------------------------------------------------
    // SFX
    // -------------------------------------------------
    {
      name: "sfx",
      assets: {

        // --- GAME ---

        flap: {
          src: "/assets/sfx/game/sfx_wing.wav"
        },
        hit: {
          src: "/assets/sfx/game/sfx_hit.wav"
        },
        die: {
          src: "/assets/sfx/game/sfx_die.wav"
        },
        point: {
          src: "/assets/sfx/game/sfx_point.wav"
        },
        swoosh: {
          src: "/assets/sfx/game/sfx_swooshing.wav"
        },


        // --- UI ---

        click: {
          src: "/assets/sfx/ui/click.wav"
        },
        appear: {
          src: "/assets/sfx/ui/appear.wav"
        },
        disappear: {
          src: "/assets/sfx/ui/disappear.wav"
        },
        ranking: {
          src: "/assets/sfx/ui/soft-treble-win-fade-out-ending-sound-effect-416829.wav"
        },
        finish: {
          src: "/assets/sfx/ui/soft-treble-fast-collect-fade-out-ending-sound-effect-416828.wav"
        },
        interact:{
          src: "/assets/sfx/ui/interact.wav"
        },
        sttgs:{
          src: "/assets/sfx/ui/metal-slam-5-189786.wav"
        },
        start:{
          src: "/assets/sfx/ui/start.wav"
        },
        woosh1:{
          src: "/assets/sfx/ui/woosh1.wav"
        },
        woosh2:{
          src: "/assets/sfx/ui/woosh2.wav"
        },
        enter:{
          src: "/assets/sfx/ui/entergame.wav"
        },
         exit1:{
          src: "/assets/sfx/ui/exit1.wav"
        },
         exit2:{
          src: "/assets/sfx/ui/exit2.wav"
        },
        

      }
    }
  ]
};
