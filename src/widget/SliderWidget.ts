import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';

export class SliderWidget extends Widget {

    private _horizontal?: boolean;

    constructor() {
        super(RcpTypes.Widgettype.SLIDER);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.SliderOptions.HORIZONTAL) {
            this._horizontal = io.readU1() > 0;
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.SliderOptions.HORIZONTAL)) {
            output.push(RcpTypes.SliderOptions.HORIZONTAL);
            if (this._horizontal) {
                output.push(this._horizontal ? 1 : 0);
            } else {
                output.push(0);
            }
        }
    }

    //--------------------------------
    // cyclic
    set horizontal(horizontal: boolean | undefined) {

        if (this._horizontal === horizontal) {
            return;
        }

        this._horizontal = horizontal;
        this.changed.set(RcpTypes.SliderOptions.HORIZONTAL, true);
        this.setDirty();
    }

    get horizontal(): boolean | undefined {
        return this._horizontal;
    }
}