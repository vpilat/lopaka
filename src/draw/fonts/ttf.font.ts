import {Point} from '../../core/point';
import {Rect} from '../../core/rect';
import {DrawContext} from '../draw-context';
import {Font, FontFormat} from './font';

export class TTFFont extends Font {
    constructor(
        protected url: string,
        public name: string,
        protected options: TFontSizes
    ) {
        super(url, name, options, FontFormat.FORMAT_TTF);
    }
    // TODO: variable font size
    async loadFont(): Promise<void> {
        const font = new FontFace(this.name, `url(${this.url})`);
        await font.load();
    }

    async drawText(dc: DrawContext, text: string, position: Point, scaleFactor: number = 1): Promise<Rect> {
        await this.fontReady;
        const {ctx} = dc;
        ctx.beginPath();
        ctx.font = `${this.options.size}px '${this.name}'`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(text, position.x, position.y);
        const measure = ctx.measureText(text);
        const actualPos = position
            .clone()
            .add(new Point(measure.actualBoundingBoxLeft, -measure.actualBoundingBoxAscent));
        const actualSize = new Point(
            measure.actualBoundingBoxRight - measure.actualBoundingBoxLeft,
            measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
        );
        return new Rect(actualPos, actualSize);
    }
}