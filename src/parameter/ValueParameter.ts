import { Parameter } from './Parameter';
import { DefaultDefinition } from '../typedefinition/DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';
import { ChangedListener } from '../ChangeListener';

export abstract class ValueParameter<T> extends Parameter {

    //
    defaultTypeDefintion: DefaultDefinition<T>;
    
    // optional
    protected _value?: T;

    //
    private valueChangedListeners: ChangedListener[] = [];

    constructor(id: number, typedefinition: DefaultDefinition<T>) {
        super(id, typedefinition);

        this.defaultTypeDefintion = typedefinition;
    }

    valueConstrained(): T {
        return this._value;
    }

    // override
    dispose() {
        super.dispose();
        this.valueChangedListeners = [];
    }

    abstract setStringValue(value: string): boolean;    

    //------------------------------------
    // change listener
    addValueChangeListener(listener: ChangedListener) {

        if (this.valueChangedListeners.indexOf(listener) >= 0) {
            return;
        }

        this.valueChangedListeners.push(listener);
    }

    removeValueChangedListener(listener: ChangedListener) {

        const idx = this.valueChangedListeners.indexOf(listener);
        if (idx < 0) {
            return;
        }

        this.valueChangedListeners.splice(idx, 1);
    }

    //------------------------------------
    // update
    update(parameter: ValueParameter<T>) {

        // check
        if (this.id !== parameter.id) {
            throw new Error("can not update with parameter with wrong id");
        }

        // check type
        if (this.typeDefinition.datatype !== parameter.typeDefinition.datatype) {
            throw new Error("can not update with parameter of wrong type");
        }

        // update typedefinition and other properties first
        // e.g.: min/max for number parameter
        super.update(parameter);

        if (parameter._value != undefined)
        {
            this._value = parameter._value;        
            this.valueChangedListeners.forEach( (listener) => listener(this) );
        }
    }

    
    //------------------------------------
    // override
    writeOptions(output: Array<number>, all: boolean): void {

        // write value
        if (all || this.changed.has(RcpTypes.ParameterOptions.VALUE)) {
            
            output.push(RcpTypes.ParameterOptions.VALUE);            
            this.defaultTypeDefintion.writeValue(output, this._value);
        }

        // write all other options
        super.writeOptions(output, all);
    }

    writeValueUpdate(output: Array<number>) {
        
        super.writeValueUpdate(output);

        // write value
        this.defaultTypeDefintion.writeValue(output, this._value);
    }

    //------------------------------------
    // override
    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.ParameterOptions.VALUE) {
            this._value = this.defaultTypeDefintion.readValue(io);
            return true;
        }

        return false;
    }

    //------------------------------------
    // setter /getter
    set value(value: T) {
        if (this._value === value) {
            return;
        }

        this._value = value
        this.changed.set(RcpTypes.ParameterOptions.VALUE, true);
        this.setDirty();

        this.valueChangedListeners.forEach( (listener) => {
            listener(this);
        });
    }

    get value(): T {
        return this._value ? this._value : this.defaultTypeDefintion.getTypeDefault();
    }
}