import { GameObjects } from "phaser";

class TweenUtilities {

    static applyImageScaleTweens(gameObject: GameObjects.Image, eventOnString : string | string[], eventOffString : string | string[], defaultScaleX : number = gameObject.scaleX, defaultScaleY : number = gameObject.scaleY, scaleDownFactor: number = 0.95, duration: number = 100): void {
        // Scale down on pointer down
        let isScaled = false;
        let scaleDownTween: Phaser.Tweens.Tween | null = null;
        let scaleUpTween: Phaser.Tweens.Tween | null = null;

        let defaultScale : Phaser.Math.Vector2;

        const setToNewScale = () => {
            if (scaleUpTween) {
                scaleUpTween.complete();
            }

            //const currentScaleX = button.container.scaleX;
            //const currentScaleY = button.container.scaleY;
            defaultScale = new Phaser.Math.Vector2(defaultScaleX, defaultScaleY)
            const endScaleX = defaultScale.x * scaleDownFactor;
            const endScaleY = defaultScale.y * scaleDownFactor;
            isScaled = true;

            scaleDownTween = gameObject.scene.tweens.add({
                targets: gameObject,
                scaleX: endScaleX ,
                scaleY: endScaleY ,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    gameObject.setScale(endScaleX, endScaleY);
                    scaleDownTween = null;
                }
            });
        };


        const returnToNormalScale = () => {
            if (!isScaled) return;

            if (scaleDownTween) {
                scaleDownTween.stop();
            }

            isScaled = false;

            scaleUpTween = gameObject.scene.tweens.add({
                targets: gameObject,
                scaleX: defaultScale.x,
                scaleY: defaultScale.y,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    gameObject.setScale(defaultScale.x, defaultScale.y);
                    scaleUpTween = null;
                }
            });
        };

        if (typeof eventOnString === 'string'){
            eventOnString = [eventOnString];
        }
        
        eventOnString.forEach((eventString) => {
            gameObject.on(eventString, setToNewScale);
        });
       
            
        if (typeof eventOffString === 'string'){
            eventOffString = [eventOffString];
        }
        
        eventOffString.forEach(eventString => {
            gameObject.on(eventString, returnToNormalScale);
        });
    }

    static applyImageDisplaySizeTweens(gameObject: GameObjects.Image, eventOnString : string | string[], eventOffString : string | string[], defaultWidth : number = gameObject.displayWidth, defaultHeight : number = gameObject.displayHeight, scaleDownFactor: number = 0.95, duration: number = 100): void {
        // Scale down on pointer down
        let isScaled = false;
        let scaleDownTween: Phaser.Tweens.Tween | null = null;
        let scaleUpTween: Phaser.Tweens.Tween | null = null;

        let defaultScale : Phaser.Math.Vector2;

        const setToNewScale = () => {
            if (scaleUpTween) {
                scaleUpTween.complete();
            }
            console.log("Set to new scale")
            //const currentScaleX = button.container.scaleX;
            //const currentScaleY = button.container.scaleY;
            defaultScale = new Phaser.Math.Vector2(defaultWidth, defaultHeight)
            const endScaleX = defaultScale.x * scaleDownFactor;
            const endScaleY = defaultScale.y * scaleDownFactor;
            isScaled = true;

            scaleDownTween = gameObject.scene.tweens.add({
                targets: gameObject,
                displayWidth: endScaleX ,
                displayHeight: endScaleY ,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    gameObject.setDisplaySize(endScaleX, endScaleY);
                    scaleDownTween = null;
                }
            });
        };

        const returnToNormalScale = () => {
            if (!isScaled) return;

            if (scaleDownTween) {
                scaleDownTween.stop();
            }

            isScaled = false;

            scaleUpTween = gameObject.scene.tweens.add({
                targets: gameObject,
                displayWidth: defaultScale.x,
                displayHeight: defaultScale.y,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    gameObject.setDisplaySize(defaultScale.x, defaultScale.y);
                    scaleUpTween = null;
                }
            });
        };

        if (typeof eventOnString === 'string'){
            eventOnString = [eventOnString];
        }
        
        eventOnString.forEach((eventString) => {
            gameObject.on(eventString, setToNewScale);
        });
       
            
        if (typeof eventOffString === 'string'){
            eventOffString = [eventOffString];
        }
        
        eventOffString.forEach(eventString => {
            gameObject.on(eventString, returnToNormalScale);
        });
    }
}


export default TweenUtilities;