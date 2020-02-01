import { ValueParameter } from "./ValueParameter";
import { Vector2 } from "../typedefinition/VectorDefinition";
import { Vector2F32Definition, Vector2I32Definition, Vector2DefinitionBase } from "../typedefinition/Vector2Definitions";

export abstract class Vector2ParameterBase extends ValueParameter<Vector2> {

    vectorDefinition: Vector2DefinitionBase;

    constructor(id: number, typedfinition: Vector2DefinitionBase) {
        super(id, typedfinition);

        this.vectorDefinition = typedfinition;
    }

    valueConstrained(): Vector2 {
        return this.vectorDefinition.constrainValue(this.value);
    }
}

export class Vector2F32Parameter extends Vector2ParameterBase {

    constructor(id: number) {
        super(id, new Vector2F32Definition());
    }

    setStringValue(value: string): boolean {
        // "x, y"
        
        const values = value.split(",");
        if (values.length < 2) {
            return false;
        }

        const x = parseFloat(values[0]);
        if (isNaN(x)) {
            return false;
        }

        const y = parseFloat(values[1]);
        if (isNaN(y)) {
            return false;
        }

        this.value = new Vector2(x, y);
        return true;
    }
}

export class Vector2I32Parameter extends Vector2ParameterBase {

    constructor(id: number) {
        super(id, new Vector2I32Definition());
    }

    setStringValue(value: string): boolean {
        // "x, y"
        
        const values = value.split(",");
        if (values.length < 2) {
            return false;
        }

        const x = parseInt(values[0]);
        if (isNaN(x)) {
            return false;
        }

        const y = parseInt(values[1]);
        if (isNaN(y)) {
            return false;
        }

        this.value = new Vector2(x, y);
        return true;
    }
}