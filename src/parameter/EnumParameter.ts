import { ValueParameter } from './ValueParameter';
import { EnumDefinition } from '../typedefinition/EnumDefinition';
import { Parameter } from '..';

export class EnumParameter extends ValueParameter<string> {

    enumDefinition: EnumDefinition;

    constructor(id: number) {
        super(id, new EnumDefinition());

        this.enumDefinition = this.typeDefinition as EnumDefinition;
    }

    setStringValue(value: string): boolean {  
        if (this.enumDefinition.contains(value)) {
            this.value = value;
            return true;
        }

        return false;
    }

    //------------------------------------
    // update
    update(parameter: EnumParameter) {

        // check
        if (this.id !== parameter.id) {
            throw new Error("can not update with parameter with wrong id");
        }

        // update typedefinition and other properties first
        Parameter.prototype.update.call(this, parameter);

        if (parameter._value != undefined)
        {
            if (this.setStringValue(parameter._value))
            {
                // value changed - call change listener
                this.valueChangedListeners.forEach( (listener) => listener(this) );
            }
        }
    }
}