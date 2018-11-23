import { TypeDefinition } from './TypeDefinition';
import KaitaiStream from '../KaitaiStream';
import { Parameter } from '../parameter/Parameter';

export abstract class DefaultDefinition<T> extends TypeDefinition {

    // optionals
    protected _defaultValue?: T;

    //
    protected changed: Map<number, boolean> = new Map();
    parameter: Parameter;

    abstract readValue(io: KaitaiStream): T;
    abstract writeValue(buffer: Array<number>, value?: T): void;
    abstract getDefaultId(): number;
    abstract getTypeDefault(): T;

    constructor(datatype: number) {
        super(datatype);
    }

    // implement
    didChange() : boolean {
        return this.changed.size > 0;
    }

    protected setDirty() {
        if (this.parameter) {
            this.parameter.setDirty();
        }
    }

    // setter / getter
    set defaultValue(defaultValue: T) {

        if (this._defaultValue === defaultValue) {
            return;
        }

        this._defaultValue = defaultValue;
        this.changed.set(this.getDefaultId(), true);
        this.setDirty();
    }

    get defaultValue(): T {
        return this._defaultValue ? this._defaultValue : this.getTypeDefault();
    }
}
