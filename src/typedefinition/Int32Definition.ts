import NumberDefinition from './NumberDefinition';
import RcpTypes from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { pushIn32ToArrayBe } from '../Utils';

export default class Int32Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.INT32);
    }

    readValue(io: KaitaiStream): number {
        return io.readS4be();
    }

    writeValue(value: number | null, buffer: Array<number>) {
        if (value != null) {
            pushIn32ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue, buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
        }
    }
}