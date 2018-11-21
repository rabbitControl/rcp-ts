import DefaultDefinition from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import RcpTypes from '../RcpTypes';

export default class BooleanDefinition extends DefaultDefinition<boolean> {

    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.BooleanOptions.DEFAULT, true);

    constructor() {
        super(RcpTypes.Datatype.BOOLEAN);
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
    writeValue(value: boolean | null, buffer: Array<number>) {
        if (value != null) {
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

            if (this._defaultValue) {
                this.writeValue(this._defaultValue, output);
            } else {
                this.writeValue(null, output);
            }
        }

        if (!all) {
            this.changed.clear();
        }
    }
}
