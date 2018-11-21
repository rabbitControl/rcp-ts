import {
    Int8Definition,
    Float64Definition,
    Float32Definition,
    Int16Definition,
    Int64Definition
} from '../typedefinition/NumberDefinition';
import Int32Definition from '../typedefinition/Int32Definition';
import { ValueParameter } from './ValueParameter';

export abstract class NumberParameter extends ValueParameter<number> {}

export class Int8Parameter extends NumberParameter {

    constructor(id: number) {
        super(id, new Int8Definition());
    }

    setStringValue(value: string): boolean {
        
        const num = parseInt(value);
        if (isNaN(num)) {
            return false;
        }

        this.value = num;
        return true;
    }
}

export class Int16Parameter extends NumberParameter {

    constructor(id: number) {
        super(id, new Int16Definition());
    }

    setStringValue(value: string): boolean {
        
        const num = parseInt(value);
        if (isNaN(num)) {
            return false;
        }

        this.value = num;
        return true;
    }
}

export class Int32Parameter extends NumberParameter {

    constructor(id: number) {
        super(id, new Int32Definition());
    }

    setStringValue(value: string): boolean {
        
        const num = parseInt(value);
        if (isNaN(num)) {
            return false;
        }

        this.value = num;
        return true;
    }
}

export class Int64Parameter extends NumberParameter {

    constructor(id: number) {
        super(id, new Int64Definition());
    }

    setStringValue(value: string): boolean {
        
        const num = parseInt(value);
        if (isNaN(num)) {
            return false;
        }

        this.value = num;
        return true;
    }
}

export class Float32Parameter extends NumberParameter {

    constructor(id: number) {
        super(id, new Float32Definition());
    }

    setStringValue(value: string): boolean {
        
        const num = parseFloat(value);
        if (isNaN(num)) {
            return false;
        }

        this.value = num;
        return true;
    }
}

export class Float64Parameter extends NumberParameter {

    constructor(id: number) {
        super(id, new Float64Definition());
    }
    
    setStringValue(value: string): boolean {
        
        const num = parseFloat(value);
        if (isNaN(num)) {
            return false;
        }

        this.value = num;
        return true;
    }
}