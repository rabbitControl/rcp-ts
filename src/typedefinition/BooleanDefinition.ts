import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';

export class BooleanDefinition extends DefaultDefinition<boolean> {

    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.BooleanOptions.DEFAULT, true);

    constructor() {
        super(RcpTypes.Datatype.BOOLEAN);
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof BooleanDefinition) {
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
    readValue(io: KaitaiStream): boolean {
        return io.readU1() > 0;
    }

    // override
    writeValue(buffer: Array<number>, value?: boolean) {
        if (value != undefined) {
            buffer.push(value ? 1 : 0);
        } else if (this._defaultValue) {
            buffer.push(this._defaultValue ? 1 : 0);
        } else {
            buffer.push(0);
        }
    }

    // override
    getDefaultId(): number {
        return RcpTypes.BooleanOptions.DEFAULT;
    }

    // override
    getTypeDefault(): boolean {
        return false;
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
