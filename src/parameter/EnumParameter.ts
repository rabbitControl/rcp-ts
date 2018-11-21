import { ValueParameter } from './ValueParameter';
import EnumDefinition from '../typedefinition/EnumDefinition';

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
}