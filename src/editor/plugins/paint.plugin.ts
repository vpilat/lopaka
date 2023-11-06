import {EditMode} from '../../core/layers/abstract.layer';
import {PaintLayer} from '../../core/layers/paint.layer';
import {Point} from '../../core/point';
import {AbstractEditorPlugin} from './abstract-editor.plugin';

export class PaintPlugin extends AbstractEditorPlugin {
    firstPoint: Point;
    captured: boolean = false;

    onMouseDown(point: Point, event: MouseEvent): void {
        const {activeTool, activeLayer} = this.session.editor.state;
        if (activeTool && activeTool.getName() === 'paint') {
            this.captured = true;
            if (!activeLayer) {
                const selected = this.session.state.layers.filter((l) => l.selected && l instanceof PaintLayer);
                if (selected.length == 1) {
                    this.session.editor.state.activeLayer = selected[0];
                } else {
                    const layer = (this.session.editor.state.activeLayer = activeTool.createLayer());
                    layer.selected = true;
                    this.session.addLayer(layer);
                }
            }
            this.session.editor.state.activeLayer.startEdit(EditMode.CREATING, point);
        }
        this.session.virtualScreen.redraw();
    }

    onMouseMove(point: Point, event: MouseEvent): void {
        const {activeLayer} = this.session.editor.state;
        if (this.captured) {
            activeLayer.edit(point.clone());
            this.session.virtualScreen.redraw();
        }
    }

    onMouseUp(point: Point, event: MouseEvent): void {
        const {activeLayer} = this.session.editor.state;
        if (this.captured) {
            activeLayer.stopEdit();
            this.captured = false;
            this.session.virtualScreen.redraw();
        }
    }
}