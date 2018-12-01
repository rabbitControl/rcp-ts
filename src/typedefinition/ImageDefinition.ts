import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';
import { pushIn32ToArrayBe } from '../Utils';

export class ImageDefinition extends DefaultDefinition<Uint8Array> {

    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.BooleanOptions.DEFAULT, true);

    constructor() {
        super(RcpTypes.Datatype.IMAGE);
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof ImageDefinition) {
            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }
        }

        return changed;
    }

    // override
    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.BooleanOptions.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
        }

        return false;
    }

    // override
    readValue(io: KaitaiStream): Uint8Array {

        // read size prefix
        const dataSize = io.readS4be();
        const data = io.readBytes(dataSize);
        return data;
    }

    // override
    writeValue(buffer: Array<number>, value?: Uint8Array) {
        if (value != undefined) {
            pushIn32ToArrayBe(value.length, buffer);
            buffer.push([].slice.call(value));
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue.length, buffer);
            buffer.push([].slice.call(this._defaultValue));
        } else {
            pushIn32ToArrayBe(0, buffer);
        }
        
    }

    // override
    getDefaultId(): number {
        return RcpTypes.BooleanOptions.DEFAULT;
    }

    // override
    getTypeDefault(): Uint8Array {
        return new Uint8Array(0);
    }

    // override
    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.BooleanOptions.DEFAULT)) {

            output.push(RcpTypes.BooleanOptions.DEFAULT);
            this.writeValue(output, this._defaultValue);            
        }

        if (!all) {
            this.changed.clear();
        }
    }
}
