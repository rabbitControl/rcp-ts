import {Parameter } from './Parameter';
import DefaultDefinition from '../typedefinition/DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import RcpTypes from '../RcpTypes';
import { pushIn16ToArrayBe } from '../Utils';
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

        // should update the value?
        if (parameter._value != undefined) {
            this.value = parameter._value
        }

        // update other properties
        super.update(parameter);
    }
    //------------------------------------
    //
    write(output: Array<number>, all: boolean): void {

        // write id
        pushIn16ToArrayBe(this.id, output);

        // typedefinition
        this.typeDefinition.write(output, all);

        // write value
        if (all || this.changed.has(RcpTypes.ParameterOptions.VALUE)) {
            
            output.push(RcpTypes.ParameterOptions.VALUE);
            
            if (this._value != undefined && this._value != null) {    
                this.defaultTypeDefintion.writeValue(this._value, output)                
            } else {
                // value was erased
                this.defaultTypeDefintion.writeValue(null, output);
            }
        }

        // write options
        super.write(output, all);

        output.push(RcpTypes.TERMINATOR);
    }    

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.ParameterOptions.VALUE) {
            this._value = this.defaultTypeDefintion.readValue(io);
            return true
        }

        return false
    }

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