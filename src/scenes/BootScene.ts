class BootScene extends Phaser.Scene {
    private loadingBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;

    constructor() {
        super({
        key: 'BootScene'
        });
    }

    preload(): void {
        // set the background and create loading bar
        this.cameras.main.setBackgroundColor(0x98d687);
        this.createLoadingbar();

        // pass value to change the loading bar fill
        this.load.on('progress',
            (value: number) => {
                this.progressBar.clear();
                this.progressBar.fillStyle(0xfff6d3, 1);
                this.progressBar.fillRect(
                this.cameras.main.width / 4,
                this.cameras.main.height / 2 - 16,
                (this.cameras.main.width / 2) * value,
                16
                );
            },
            this
        );

        // delete bar graphics, when loading complete
        this.load.on('complete',
            () => {
                this.progressBar.destroy();
                this.loadingBar.destroy();
            },
            this
        );

        // load out package
        this.load.pack('preload', './assets/pack.json', 'preload');
        
        this.load.on('complete', () => {
            
            this.progressBar.destroy();
            this.loadingBar.destroy();

            this.scene.start('GameScene'); // Move scene transition here
        }, this);
        
    }

    create(): void {
        this.createAnimations();
    }

    private createLoadingbar(): void {
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x5dae47, 1);
        this.loadingBar.fillRect(
            this.cameras.main.width / 4 - 2,
            this.cameras.main.height / 2 - 18,
            this.cameras.main.width / 2 + 4,
            20
        );
        this.progressBar = this.add.graphics();
    }

    private createAnimations(): void {
        this.anims.create({
            key: 'indicator-animation',
            frames: [
                { key: 'indicator-0' },
                { key: 'indicator-1' },
                { key: 'indicator-2' },
                { key: 'indicator-3' }
                // Add more frames as needed
            ],
            frameRate: 10,
            repeat: -1 // Loop indefinitely
        });


        let frames = [];
        for (let i = 5; i <= 17; i++) {
            frames.push({ key: `boom-${i.toString().padStart(2, '0')}` });
        }

        this.anims.create({
            key: 'bomb-animation',
            frames: frames,
            frameRate: 15,
        });

        this.anims.create({
                key: 'lightning-blast',
                frames: this.anims.generateFrameNumbers('lightning-1-sheet', { start: 0, end: 8 }),
                frameRate: 100,
                repeat: -1
        });

        this.anims.create({
            key: 'lightning-strike-start',
            frames: this.anims.generateFrameNumbers('lightning-2-sheet', { start: 0, end: 1 }),
            frameRate: 10,
        });

        this.anims.create({
            key: 'lightning-strike-loop',
            frames: this.anims.generateFrameNumbers('lightning-2-sheet', { start: 2, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'lightning-strike-end',
            frames: this.anims.generateFrameNumbers('lightning-2-sheet', { start: 5, end: 8 }),
            frameRate: 10,
        });
    }
}


export default BootScene;