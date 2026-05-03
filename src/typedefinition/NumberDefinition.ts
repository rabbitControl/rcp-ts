import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import {
    pushFloat64ToArrayBe,
    pushFloat32ToArrayBe,
    pushIn16ToArrayBe,
    pushIn64ToArrayBe
} from '../Utils';
import { RcpTypes } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';
import { RcpString } from '../RcpString';
import { RcpInt } from '../RcpInt';

export abstract class NumberDefinition extends DefaultDefinition<number> {
    
    static readonly  allOptions: Map<number, boolean> = new Map().
                    set(RcpTypes.NumberOptions.DEFAULT, true).
                    set(RcpTypes.NumberOptions.MINIMUM, true).
                    set(RcpTypes.NumberOptions.MAXIMUM, true).
                    set(RcpTypes.NumberOptions.STEPSIZE, true).
                    set(RcpTypes.NumberOptions.UNIT, true);

    private _minimum?: number;
    private _maximum?: number;
    private _stepsize?: number;
    private _scale?: number;
    private _unit?: string;


    abstract typeMax(): number;
    abstract typeMin(): number;


    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof NumberDefinition) {

            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }

            if (typedefinition._minimum !== undefined) {
                this._minimum = typedefinition._minimum;
                changed = true;
            }

            if (typedefinition._maximum !== undefined) {
                this._maximum = typedefinition._maximum;
                changed = true;
            }

            if (typedefinition._stepsize !== undefined) {
                this._stepsize = typedefinition._stepsize;
                changed = true;
            }

            if (typedefinition._scale !== undefined) {
                this._scale = typedefinition._scale;
                changed = true;
            }

            if (typedefinition._unit !== undefined) {
                this._unit = typedefinition._unit;
                changed = true;
            }
        }

        return changed;
    }


    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.NumberOptions.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
            case RcpTypes.NumberOptions.MINIMUM:
                this._minimum = this.readValue(io);
                return true;
            case RcpTypes.NumberOptions.MAXIMUM:
                this._maximum = this.readValue(io);
                return true;
            case RcpTypes.NumberOptions.STEPSIZE:
                this._stepsize = this.readValue(io);
                return true;            
            case RcpTypes.NumberOptions.UNIT:
                this._unit = RcpString.parse(io).value;                
                return true;
        }

        return false;
    }

    getDefaultId(): number {
        return RcpTypes.NumberOptions.DEFAULT;
    }

    // override
    getTypeDefault(): number {
        return 0;
    }
    

    writeOptions(output: number[], all: boolean): void {

        let ch = this.changed;
        if (all) {
            ch = NumberDefinition.allOptions;
        }

        const keys = Array.from(ch.keys());
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // write options id
            output.push(key | ((i === keys.length - 1) ? RcpInt.TERMINATOR : 0));        

            switch (key) {
                case RcpTypes.NumberOptions.DEFAULT: {
                    this.writeValue(output, this._defaultValue);
                    break;
                }

                case RcpTypes.NumberOptions.MINIMUM: {
                    this.writeValue(output, this._minimum);                    
                    break;
                }

                case RcpTypes.NumberOptions.MAXIMUM: {
                    this.writeValue(output, this._maximum);                    
                    break;
                }

                case RcpTypes.NumberOptions.STEPSIZE: {
                    this.writeValue(output, this._stepsize);                    
                    break;
                }

                case RcpTypes.NumberOptions.UNIT: {
                    new RcpString(this._unit || "").write(output);                     
                    break;
                }
            }
        };

        if (!all) {
            this.changed.clear();
        }
    }

    constrainValue(value: number): number {
        
        if (this.maximum !== undefined && 
            value > this.maximum)
        {
            return this.maximum;
        }

        if (this.minimum !== undefined && 
            value < this.minimum)
        {
            return this.minimum;
        }

        return value;
    }

    // getter / setter

    //--------------------------------
    // minimum
    set minimum(minimum: number | undefined) {
        if (this._minimum === minimum) {
            return;
        }

        this._minimum = minimum;
        this.changed.set(RcpTypes.NumberOptions.MINIMUM, true);
        this.setDirty();
    }

    get minimum(): number | undefined {
        return this._minimum;
    }

    //--------------------------------
    // maximum
    set maximum(maximum: number | undefined) {
        if (this._maximum === maximum) {
            return;
        }

        this._maximum = maximum;
        this.changed.set(RcpTypes.NumberOptions.MAXIMUM, true);
        this.setDirty();
    }

    get maximum(): number | undefined {
        return this._maximum;
    }

    //--------------------------------
    // stepsize
    set stepsize(stepsize: number | undefined) {
        if (this._stepsize === stepsize) {
            return;
        }

        this._stepsize = stepsize;
        this.changed.set(RcpTypes.NumberOptions.STEPSIZE, true);
        this.setDirty();
    }

    get stepsize(): number | undefined {
        return this._stepsize;
    }

    //--------------------------------
    // unit
    set unit(unit: string | undefined) {
        if (this._unit === unit) {
            return;
        }

        this._unit = unit;
        this.changed.set(RcpTypes.NumberOptions.UNIT, true);
        this.setDirty();
    }

    get unit(): string | undefined {
        return this._unit;
    }
}

export class Int8Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.INT8);
    }

    typeMax(): number {
        return 127;
    }

    typeMin(): number {
        return -128;
    }

    readValue(io: KaitaiStream): number {
        return io.readS1();
    }

    writeValue(buffer: Array<number>, value?: number) {
        if (value != undefined) {
            buffer.push(value);
        } else if (this._defaultValue) {
            buffer.push(this._defaultValue);
        } else {
            buffer.push(0);
        }
    }
}

export class Int16Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.INT16);
    }

    typeMax(): number {
        return 32767;
    }

    typeMin(): number {
        return -32768;
    }

    readValue(io: KaitaiStream): number {
        return io.readS2be();
    }

    writeValue(buffer: Array<number>, value?: number) {
        if (value != undefined) {
            pushIn16ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushIn16ToArrayBe(this._defaultValue, buffer);
        } else {
            pushIn16ToArrayBe(0, buffer);
        }
    }
}

export class Int64Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.INT64);
    }

    typeMax(): number {
        // return 9223372036854775807;
        return Number.MAX_SAFE_INTEGER;
    }

    typeMin(): number {
        // return -9223372036854775808;
        return Number.MIN_SAFE_INTEGER;
    }    

    readValue(io: KaitaiStream): number {
        return io.readS8be();
    }

    writeValue(buffer: Array<number>, value?: number) {
        if (value != undefined) {
            pushIn64ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushIn64ToArrayBe(this._defaultValue, buffer);
        } else {
            pushIn64ToArrayBe(0, buffer);
        }
    }
}

export class Float32Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.FLOAT32);
    }

    typeMax(): number {
        return Number.POSITIVE_INFINITY;
    }

    typeMin(): number {
        return Number.NEGATIVE_INFINITY;
    }

    readValue(io: KaitaiStream): number {
        return io.readF4be();
    }

    writeValue(buffer: Array<number>, value?: number) {
        if (value != undefined) {
            pushFloat32ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushFloat32ToArrayBe(this._defaultValue, buffer);
        } else {
            pushFloat32ToArrayBe(0, buffer);
        }
    }
}

export class Float64Definition extends NumberDefinition {

    constructor() {
        super(RcpTypes.Datatype.FLOAT64);
    }

    typeMax(): number {
        return Number.POSITIVE_INFINITY;
    }

    typeMin(): number {
        return Number.NEGATIVE_INFINITY;
    }

    readValue(io: KaitaiStream): number {
        return io.readF8be();
    }

    writeValue(buffer: Array<number>, value?: number) {
        if (value != undefined) {
            pushFloat64ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushFloat64ToArrayBe(this._defaultValue, buffer);
        } else {
            pushFloat64ToArrayBe(0, buffer);
        }
    }
}