import { NumberDefinition } from './NumberDefinition';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { pushIn32ToArrayBe } from '../Utils';

export class Int32Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.INT32);
    }

    typeMax(): number {        
        return 2147483647;
    }

    typeMin(): number {
        return -2147483648;
    }

    readValue(io: KaitaiStream): number {
        return io.readS4be();
    }

    writeValue(buffer: Array<number>, value?: number) {
        if (value != undefined) {
            pushIn32ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue, buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
        }
    }
}