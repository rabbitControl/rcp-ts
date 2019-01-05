import { ValueParameter } from "./ValueParameter";
import { Vector4 } from "../typedefinition/VectorDefinition";
import { Vector4F32Definition, Vector4I32Definition } from "../typedefinition/Vector4Definitions";

export class Vector4F32Parameter extends ValueParameter<Vector4> {

    constructor(id: number) {
        super(id, new Vector4F32Definition());
    }

    setStringValue(value: string): boolean {
        // "x, y, z, t"
        
        const values = value.split(",");
        if (values.length < 4) {
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

        const t = parseFloat(values[3]);
        if (isNaN(t)) {
            return false;
        }

        this.value = new Vector4(x, y, z, t);
        return true;
    }
}

export class Vector4I32Parameter extends ValueParameter<Vector4> {

    constructor(id: number) {
        super(id, new Vector4I32Definition());
    }

    setStringValue(value: string): boolean {
        // "x, y, z, t"
        
        const values = value.split(",");
        if (values.length < 4) {
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

        const t = parseInt(values[3]);
        if (isNaN(t)) {
            return false;
        }

        this.value = new Vector4(x, y, z, t);
        return true;
    }
}