import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";

const aspectRatio = 16 / 9;
        
const gameWidth = 1400, gameHeight = gameWidth / aspectRatio;

const GameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Candy crush',
    url: 'https://github.com/digitsensitive/phaser3-typescript',
    version: '0.0.1',
    type: Phaser.AUTO,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    scale: {
        mode: Phaser.Scale.FIT,
        width: gameWidth,
        height: gameHeight
    },
    parent: 'game',
    scene: [BootScene, GameScene],
    backgroundColor: '#de3412',
    render: { pixelArt: false, antialias: true }
};


export default GameConfig;