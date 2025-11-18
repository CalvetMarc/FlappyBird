import type { AssetsManifest } from "pixi.js";

export const manifest: AssetsManifest = {
  bundles: [
    {
      name: "backgrounds",
      assets: {
        morning: {
          src: "/assets/backgrounds/Background1.png",
          frames: [
            { x: 0, y: 0, w: 256, h: 256 }
          ]
        },
        noon: {
          src: "/assets/backgrounds/Background2.png",
          frames: [
            { x: 0, y: 0, w: 256, h: 256 }
          ]
        },
        afternoon: {
          src: "/assets/backgrounds/Background3.png",
          frames: [
            { x: 0, y: 0, w: 256, h: 256 }
          ]
        },
        evening: {
          src: "/assets/backgrounds/Background4.png",
          frames: [
            { x: 0, y: 0, w: 256, h: 256 }
          ]
        },
        night: {
          src: "/assets/backgrounds/Background5.png",
          frames: [
            { x: 0, y: 0, w: 256, h: 256 }
          ]
        }
      }
    },
    {
      name: "characters",
      assets: {
        bird1: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 0,  w: 16, h: 16 },
            { x: 16, y: 0,  w: 16, h: 16 },
            { x: 32, y: 0,  w: 16, h: 16 },
            { x: 48, y: 0,  w: 16, h: 16 }
          ]
        },
        bird2: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 16, w: 16, h: 16 },
            { x: 16, y: 16, w: 16, h: 16 },
            { x: 32, y: 16, w: 16, h: 16 },
            { x: 48, y: 16, w: 16, h: 16 }
          ]
        },
        bird3: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 32,  w: 16, h: 16 },
            { x: 16, y: 32,  w: 16, h: 16 },
            { x: 32, y: 32,  w: 16, h: 16 },
            { x: 48, y: 32,  w: 16, h: 16 }
          ]
        },
        bird4: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 48,  w: 16, h: 16 },
            { x: 16, y: 48,  w: 16, h: 16 },
            { x: 32, y: 48,  w: 16, h: 16 },
            { x: 48, y: 48,  w: 16, h: 16 }
          ]
        },
        bird5: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 64,  w: 16, h: 16 },
            { x: 16, y: 64,  w: 16, h: 16 },
            { x: 32, y: 64,  w: 16, h: 16 },
            { x: 48, y: 64,  w: 16, h: 16 }
          ]
        },
        bird6: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 80,  w: 16, h: 16 },
            { x: 16, y: 80,  w: 16, h: 16 },
            { x: 32, y: 80,  w: 16, h: 16 },
            { x: 48, y: 80,  w: 16, h: 16 }
          ]
        },
        bird7: {
          src: "/assets/birds/AllBird1.png",
          frames: [
            { x: 0,  y: 96,  w: 16, h: 16 },
            { x: 16, y: 96, w: 16, h: 16 },
            { x: 32, y: 96, w: 16, h: 16 },
            { x: 48, y: 96, w: 16, h: 16 }
          ]
        }
      }
    },
    {
      name: "fonts",
      assets: {
        vcrBase: {
          src: "/assets/fonts/vcr_osd_mono/vcr_osd_mono.fnt"
        }
      }
    },
    {
      name: "tiles",
      assets: {
        greenPipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 0,  y: 0,  w: 32, h: 16 },
            { x: 0,  y: 16, w: 32, h: 16 },
            { x: 0,  y: 32, w: 32, h: 16 },
            { x: 0,  y: 48, w: 32, h: 16 },
            { x: 0,  y: 64, w: 32, h: 16 }
          ]
        },
        orangePipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 32, y: 0,  w: 32, h: 16 },
            { x: 32, y: 16, w: 32, h: 16 },
            { x: 32, y: 32, w: 32, h: 16 },
            { x: 32, y: 48, w: 32, h: 16 },
            { x: 32, y: 64, w: 32, h: 16 }
          ]
        },
        redPipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 64, y: 0,  w: 32, h: 16 },
            { x: 64, y: 16, w: 32, h: 16 },
            { x: 64, y: 32, w: 32, h: 16 },
            { x: 64, y: 48, w: 32, h: 16 },
            { x: 64, y: 64, w: 32, h: 16 }
          ]
        },
        bluePipe: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 96, y: 0,  w: 32, h: 16 },
            { x: 96, y: 16, w: 32, h: 16 },
            { x: 96, y: 32, w: 32, h: 16 },
            { x: 96, y: 48, w: 32, h: 16 },
            { x: 96, y: 64, w: 32, h: 16 }
          ]
        },
        groundDay: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 0,  y: 80, w: 16, h: 32 },  
            { x: 16, y: 80, w: 16, h: 32 },  
            { x: 32, y: 80, w: 16, h: 32 },   
            { x: 48, y: 80, w: 16, h: 32 }    
          ]
        },
        groundNight: {
          src: "/assets/tiles/SimpleStyle1.png",
          frames: [
            { x: 64,  y: 80, w: 16, h: 32 },  
            { x: 80,  y: 80, w: 16, h: 32 }, 
            { x: 96,  y: 80, w: 16, h: 32 },  
            { x: 112, y: 80, w: 16, h: 32 }  
          ]
        }
      }
    },
    {
      name: "ui",
      assets: {
        logo: {
          src: "/assets/ui/logoFlappyBird.png",
          frames: [
            { x: 0, y: 0, w: 1792, h: 864 }
          ]
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
          frames: [
            { x: 352, y: 128, w: 32, h: 32 }
          ]
        },
        bigCross: {
          src: "public/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 384, y: 128, w: 32, h: 32 }
          ]
        },
        bigArrow: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 416, y: 128, w: 32, h: 32 }
          ]
        },
        smallTick: {
          src: "public/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 352, y: 160, w: 32, h: 32 }
          ]
        },
        smallCross: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 384, y: 160, w: 32, h: 32 }
          ]
        },
        smallArrow: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 416, y: 160, w: 32, h: 32 }
          ]
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
        panelGrey: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 32, y: 32, w: 96, h: 64 },
          ]
        },
        panelBlue: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 128, y: 32, w: 96, h: 64 },
          ]
        },
        panelOrange: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 224, y: 32, w: 96, h: 64 },
          ]
        },
        textPage: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 320, y: 64, w: 64, h: 32 },
          ]
        },
        title1down: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 288, y: 96, w: 64, h: 32 },
          ]
        },
        title1up: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 288, y: 128, w: 64, h: 32 },
          ]
        },
        title2up: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 288, y: 160, w: 64, h: 32 },
          ]
        },
        title2down: {
          src: "/assets/ui/Spritesheet_UI_Flat.png",
          frames: [
            { x: 288, y: 192, w: 64, h: 32 },
          ]
        }        

      }
    }
  ]
};
