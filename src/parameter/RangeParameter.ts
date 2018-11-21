import { ValueParameter } from './ValueParameter';
import { RangeDefinition, Range } from '../typedefinition/RangeDefinition';
import { RcpTypes } from '../RcpTypes';

export class RangeParameter extends ValueParameter<Range> {

    constructor(id: number) {
        super(id, new RangeDefinition());
    }

    setStringValue(value: string): boolean {        
        // TODO
        return false;
    }

    set value1(value: number | undefined) {

        if (!value) {
            return;
        }

        if (!this._value) {
            this._value = new Range(0, 0);
        }

        if (this._value.value1 === value) {
            return;
        }

        this._value.value1 = value;
        this.changed.set(RcpTypes.ParameterOptions.VALUE, true);
        this.setDirty();
    }

    get value1(): number | undefined {
        if (this._value) {
            return this._value.value1;
        }
        return undefined;
    }

    set value2(value: number | undefined) {

        if (!value) {
            return;
        }

        if (!this._value) {
            this._value = new Range(0, 0);
        }

        if (this._value.value2 === value) {
            return;
        }

        this._value.value2 = value;
        this.changed.set(RcpTypes.ParameterOptions.VALUE, true);
        this.setDirty();
    }

    get value2(): number | undefined {
        if (this._value) {
            return this._value.value2;
        }
        return undefined;
    }
}