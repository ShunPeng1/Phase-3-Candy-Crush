class NormalTileEffect implements ITileEffect{
    public readonly color: string;
    public readonly texture: string;
    constructor(color: string, texture: string) {
        this.color = color;
        this.texture = texture;
    }

    public onTilePop(): void {
        
    }
    public onTileSwap(): void {
        
    }

}