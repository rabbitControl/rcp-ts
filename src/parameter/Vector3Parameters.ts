import { ValueParameter } from "./ValueParameter";
import { Vector3F32Definition, Vector3I32Definition, Vector3DefinitionBase } from "../typedefinition/Vector3Definitions";
import { Vector3 } from "../typedefinition/VectorDefinition";


export abstract class Vector3ParameterBase extends ValueParameter<Vector3> {

    vectorDefinition: Vector3DefinitionBase;

    constructor(id: number, typedfinition: Vector3DefinitionBase) {
        super(id, typedfinition);

        this.vectorDefinition = typedfinition;
    }

    valueConstrained(): Vector3 {
        return this.vectorDefinition.constrainValue(this.value);
    }
}

export class Vector3F32Parameter extends Vector3ParameterBase {

    constructor(id: number) {
        super(id, new Vector3F32Definition());
    }

    setStringValue(value: string): boolean {
        // "x, y, z"
        
        const values = value.split(",");
        if (values.length < 3) {
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

        const z = parseFloat(values[2]);
        if (isNaN(z)) {
            return false;
        }

        this.value = new Vector3(x, y, z);
        return true;
    }
}

export class Vector3I32Parameter extends Vector3ParameterBase {

    constructor(id: number) {
        super(id, new Vector3I32Definition());
    }

    setStringValue(value: string): boolean {
        // "x, y, z"
        
        const values = value.split(",");
        if (values.length < 3) {
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

        const z = parseInt(values[2]);
        if (isNaN(z)) {
            return false;
        }

        this.value = new Vector3(x, y, z);
        return true;
    }
}