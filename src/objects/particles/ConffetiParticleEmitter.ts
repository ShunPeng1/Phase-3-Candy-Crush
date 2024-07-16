class ConffetiParticleEmitter extends Phaser.GameObjects.Graphics {
    private duration = 1000;
    private deltaTime: number = 0;
    private direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
    private speed: number = 100;
    private spreadAngleDegree: number = 10;
    private frequency: number = 10;


    constructor(scene: Phaser.Scene, x: number, y: number, duration: number = 1000, direction : Phaser.Math.Vector2 = new Phaser.Math.Vector2(0,-1), speed: number = 1000, spreadAngleDegree: number = 10, frequency: number = 10) {  
        super(scene);
        
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.duration = duration;

        this.direction = direction.normalize();
        this.speed = speed;
        this.spreadAngleDegree = spreadAngleDegree;
        this.frequency = frequency;


        this.scene.add.existing(this);

        this.scene.events.on('update', this.update, this);

        this.createConffeti();
    }

    update(time: number, delta: number): void {
        this.deltaTime = delta/1000; // Save the delta time
    }

    private createConffeti() {
        
        let particleEmitter = this.scene.add.particles(this.x, this.y, 'sunset-raster', {
            speed: {
                onEmit: (particle) => {
                    return Phaser.Math.Between(this.speed, this.speed*1.3) * this.direction.y ;
                },
            },
            angle: {
                onEmit: (particle) => {
                    return Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(0, 0, this.direction.x, this.direction.y)) + Phaser.Math.Between(-this.spreadAngleDegree, this.spreadAngleDegree);
                }
            },
            lifespan: this.duration*2,
            frequency: this.frequency,
            duration: this.duration/2,
            frame: [0, 4, 8, 12, 16],
            x: { 
                onEmit : (particle) => {
                    return Phaser.Math.Between(0, 0);
                },
                onUpdate : (particle, key, t) => {
                    if (particle.velocityY < 0){
                        particle.velocityY += 500 * this.deltaTime;
                    }
                    else{
                        particle.velocityY += 150 * this.deltaTime;
                        particle.velocityX *= 0.995 ;
                    }

                    

                    return particle.x;
                }
            },
            scaleX: {
                onEmit: (particle) => {
                    return -1.0
                },
                onUpdate: (particle) => {
                    return (particle.scaleX > 1.0 ? -1.0 : particle.scaleX + 0.05)
                }
            },
            rotate: {
                onEmit: (particle) => {
                    return 0
                },
                onUpdate: (particle) => {
                    return particle.angle + 1
                }
            },

        });


        this.scene.time.delayedCall(this.duration, () => {
            this.scene.events.off('update', this.update, this);
            this.destroy();
            
        });
    }
}



export default ConffetiParticleEmitter;