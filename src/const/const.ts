let CONST = {
    score: 0,
    highscore: 0,
    gridWidth: 8,
    gridHeight: 8,
    tileWidth: 72,
    tileHeight: 72,
    
    candyColors: [
        'red',
        'yellow',
        'green',
        'purple',
        'blue',
        'orange',
    ],

    normalCandyTextureKey: {
        red : 'item-01',
        yellow : 'item-02',
        green : 'item-03',
        purple : 'item-04',
        blue : 'item-05',
        orange : 'item-06', 
    },

    verticalStripesCandyTextureKey: {
        red : 'item-01-stripes-vert',
        yellow : 'item-02-stripes-vert',
        green : 'item-03-stripes-vert',
        purple : 'item-04-stripes-vert',
        blue : 'item-05-stripes-vert',
        orange : 'item-06-stripes-vert', 
    },

    horizontalStripesCandyTextureKey: {
        red : 'item-01-stripes-horiz',
        yellow : 'item-02-stripes-horiz',
        green : 'item-03-stripes-horiz',
        purple : 'item-04-stripes-horiz',
        blue : 'item-05-stripes-horiz',
        orange : 'item-06-stripes-horiz', 
    },

    bombCandyTextureKey: {
        red : 'bomb-items-01',
        yellow : 'bomb-items-02',
        green : 'bomb-items-03',
        purple : 'bomb-items-04',
        blue : 'bomb-items-05',
        orange : 'bomb-items-06',
    },


    bearCandyTextureKey: {
        red : 'item-mar-01',
        yellow : 'item-mar-02',
        green : 'item-mar-03',
        purple : 'item-mar-04',
        blue : 'item-mar-05',
        orange : 'item-mar-06',
    },
    
    cholateCandyTextureKey: "game-item-h",
        
    itemSpot1TextureKey: "item-spot",
    itemSpot2TextureKey: "item-spot-2",
};

interface ConstType {
    score: number;
    highscore: number;
    gridWidth: number;
    gridHeight: number;
    tileWidth: number;
    tileHeight: number;
    candyTypes: string[];
}

export const candyColors: CandyColorKey[] = ["red", "yellow", "green", "purple", "blue"]//, "orange"];

export type CandyColorKey = keyof typeof CONST.normalCandyTextureKey;

export default CONST;