import { ValueParameter } from "./ValueParameter";
import { RGBADefinition, RGBDefinition } from "../typedefinition/ColorDefinition";

export class RGBAParameter extends ValueParameter<string> {

    constructor(id: number) {
        super(id, new RGBADefinition());
    }
    
    setStringValue(value: string): boolean {
        if (!value.startsWith("#")) {
            // reject
            return false;
        }

        // todo: checks?
        // check string somehow?
        this.value = value;
        return true;
    }
}

export class RGBParameter extends ValueParameter<string> {

    constructor(id: number) {
        super(id, new RGBDefinition());
    }
    
    setStringValue(value: string): boolean {

        if (!value.startsWith("#")) {
            // reject
            return false;
        }

        // todo: checks?
        this.value = value;
        return true;
    }
}