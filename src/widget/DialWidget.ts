import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';

export class DialWidget extends Widget {

    private _cyclic?: boolean;

    constructor() {
        super(RcpTypes.Widgettype.DIAL);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.DialOptions.CYCLIC) {
            this._cyclic = io.readU1() > 0;
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.DialOptions.CYCLIC)) {
            output.push(RcpTypes.DialOptions.CYCLIC);
            if (this._cyclic) {
                output.push(this._cyclic ? 1 : 0);
            } else {
                output.push(0);
            }
        }
    }

    // setter / getter

    //--------------------------------
    // cyclic
    set cyclic(cyclic: boolean | undefined) {

        if (this._cyclic === cyclic) {
            return;
        }

        this._cyclic = cyclic;
        this.changed.set(RcpTypes.DialOptions.CYCLIC, true);
        this.setDirty();
    }

    get cyclic(): boolean | undefined {
        return this._cyclic;
    }
}