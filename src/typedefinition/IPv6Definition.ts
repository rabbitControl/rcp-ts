import { DefaultDefinition } from './DefaultDefinition';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { IPv6 } from 'ip-num';
import * as bigInt from 'big-integer';
import { TypeDefinition } from './TypeDefinition';

export class IPv6Definition extends DefaultDefinition<IPv6> {

    static readonly allOptions: Map<number, boolean> = new Map().
        set(RcpTypes.Ipv6Options.DEFAULT, true);

    constructor() {
        super(RcpTypes.Datatype.IPV6);
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;
        
        if (typedefinition instanceof IPv6Definition) {
            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }
        }

        return changed;
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.Ipv6Options.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
        }

        return false;
    }

    readValue(io: KaitaiStream): IPv6 {
        io.readS4be();
        throw new Error('Method not implemented.');
    }

    writeValue(buffer: number[], value?: IPv6): void {
        throw new Error('Method not implemented.');
    }

    getDefaultId(): number {
        return RcpTypes.Ipv6Options.DEFAULT;
    }

    // override
    getTypeDefault(): IPv6 {
        return new IPv6(bigInt(0));
    }

    writeOptions(output: number[], all: boolean): void {
        throw new Error('Method not implemented.');
    }
}