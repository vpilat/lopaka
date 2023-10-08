import {Layer} from 'src/core/layer';
import {Tool, ToolParamType} from './tool';
import {Point} from '../../core/point';
import {Rect} from '../../core/rect';

export class CircleTool extends Tool {
    name = 'circle';

    params = [
        {
            name: 'x',
            type: ToolParamType.number,
            setValue(layer: Layer, value: number) {
                layer.position.x = value;
            },
            getValue(layer: Layer) {
                return layer.position.x;
            }
        },
        {
            name: 'y',
            type: ToolParamType.number,
            setValue(layer: Layer, value: number) {
                layer.position.y = value;
            },
            getValue(layer: Layer) {
                return layer.position.y;
            }
        },
        {
            name: 'radius',
            type: ToolParamType.number,
            setValue(layer: Layer, value: number) {
                layer.size.x = value;
            },
            getValue(layer: Layer) {
                return layer.size.x;
            }
        }
    ];

    private firstPoint: Point;

    draw(layer: Layer): void {
        const {dc, position, size} = layer;
        const radius = Math.round(size.x / 2);
        dc.clear().pixelateCircle(position.clone().add(radius), radius, false);
    }

    edit(layer: Layer, position: Point, originalEvent: MouseEvent): void {
        layer.position = position.clone().min(this.firstPoint);
        const radius = position.clone().subtract(this.firstPoint).abs().x;
        layer.size = new Point(radius);
        this.draw(layer);
    }

    startEdit(layer: Layer, position: Point, originalEvent: MouseEvent): void {
        this.firstPoint = position.clone();
        layer.position = position.clone();
    }

    stopEdit(layer: Layer, position: Point, originalEvent: MouseEvent): void {}

    protected getBounds(layer: Layer): Rect {
        return super.getBounds(layer).add(0, 0, 1, 1);
    }
}
