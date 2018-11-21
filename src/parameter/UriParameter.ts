import { ValueParameter } from "./ValueParameter";
import { UriDefinition } from "../typedefinition/UriDefinition";

export class UriParameter extends ValueParameter<string> {

    constructor(id: number) {
        super(id, new UriDefinition());
    }

    setStringValue(value: string): boolean {
        // TODO validate url?
        this.value = value;
        return true;
    }
}