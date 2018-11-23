import { DefaultDefinition } from './DefaultDefinition';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { pushFloat32ToArrayBe, pushIn32ToArrayBe } from '../Utils';
import { IPv4 } from 'ip-num';
import * as bigInt from 'big-integer';

export class IPv4Definition extends DefaultDefinition<IPv4> {

    static readonly allOptions: Map<number, boolean> = new Map().
        set(RcpTypes.Ipv4Options.DEFAULT, true);

    constructor() {
        super(RcpTypes.Datatype.IPV4);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.Ipv4Options.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
        }

        return false;
    }

    readValue(io: KaitaiStream): IPv4 {
        return new IPv4(bigInt(io.readU4be()));
    }

    writeValue(buffer: number[], value?: IPv4): void {
        if (value != undefined) {
            pushIn32ToArrayBe(value.value.toJSNumber(), buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue.value.toJSNumber(), buffer);
        } else {
            pushFloat32ToArrayBe(0, buffer);
        }
    }

    getDefaultId(): number {
        return RcpTypes.Ipv4Options.DEFAULT;
    }

    // override
    getTypeDefault(): IPv4 {
        return new IPv4(bigInt(0));
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.Ipv4Options.DEFAULT)) {
            output.push(RcpTypes.Ipv4Options.DEFAULT);
            this.writeValue(output, this._defaultValue);
        }

        if (!all) {
            this.changed.clear();
        }
    }
}


