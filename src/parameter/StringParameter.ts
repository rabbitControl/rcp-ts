import { ValueParameter } from './ValueParameter';
import { StringDefinition } from "../typedefinition/StringDefinition";

export class StringParameter extends ValueParameter<string> {

    constructor(id: number) {
        super(id, new StringDefinition());
    }

    setStringValue(value: string): boolean {
        this.value = value;
        return true;
    }
}