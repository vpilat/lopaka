import {AbstractLayer} from '../../core/layers/abstract.layer';
import {CircleLayer} from '../../core/layers/circle.layer';
import {AbstractTool} from './abstract.tool';

export class CircleTool extends AbstractTool {
    name = 'circle';

    createLayer(): AbstractLayer {
        return new CircleLayer();
    }
}