import { ValueParameter } from "./ValueParameter";
import { Vector3F32Definition } from "../typedefinition/Vector3Definitions";
import { Vector3 } from "../typedefinition/VectorDefinition";

export class Vector3F32Parameter extends ValueParameter<Vector3> {

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