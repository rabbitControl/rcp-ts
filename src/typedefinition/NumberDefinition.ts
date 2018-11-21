import DefaultDefinition from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import {
    writeTinyString,
    pushFloat64ToArrayBe,
    pushFloat32ToArrayBe,
    pushIn16ToArrayBe,
    pushIn64ToArrayBe
} from '../Utils';
import RcpTypes from '../RcpTypes';

export default abstract class NumberDefinition extends DefaultDefinition<number> {
    
    static readonly  allOptions: Map<number, boolean> = new Map().
                    set(RcpTypes.NumberOptions.DEFAULT, true).
                    set(RcpTypes.NumberOptions.MINIMUM, true).
                    set(RcpTypes.NumberOptions.MAXIMUM, true).
                    set(RcpTypes.NumberOptions.MULTIPLEOF, true).
                    set(RcpTypes.NumberOptions.SCALE, true).
                    set(RcpTypes.NumberOptions.UNIT, true);

    private _minimum?: number;
    private _maximum?: number;
    private _multipleof?: number;
    private _scale?: number;
    private _unit?: string;

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
            case RcpTypes.NumberOptions.MULTIPLEOF:
                this._multipleof = this.readValue(io);
                return true;
            case RcpTypes.NumberOptions.SCALE:
                let scale_num = io.readU1();
                if (scale_num < RcpTypes.NumberScale.LINEAR || scale_num > RcpTypes.NumberScale.EXP2) {
                    this._scale = RcpTypes.NumberScale.LINEAR;
                } else {
                    this._scale = scale_num;
                }
                return true;
            case RcpTypes.NumberOptions.UNIT:
                // read tiny string
                let len = io.readU1();
                this._unit = KaitaiStream.bytesToStr(io.readBytes(len), 'UTF-8');
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

        ch.forEach((v, key) => {

            switch (key) {
                case RcpTypes.NumberOptions.DEFAULT: {
                    output.push(RcpTypes.NumberOptions.DEFAULT);
                    if (this._defaultValue) {            
                        this.writeValue(this._defaultValue, output);
                    } else {
                        this.writeValue(null, output);
                    }
                    break;
                }

                case RcpTypes.NumberOptions.MINIMUM: {
                    output.push(RcpTypes.NumberOptions.MINIMUM);
                    if (this._minimum) {
                        this.writeValue(this._minimum, output);
                    } else {
                        this.writeValue(null, output);
                    }
                    break;
                }

                case RcpTypes.NumberOptions.MAXIMUM: {
                    output.push(RcpTypes.NumberOptions.MAXIMUM);
                    if (this._maximum) {
                        this.writeValue(this._maximum, output);
                    } else {
                        this.writeValue(null, output);
                    }       
                    break;
                }

                case RcpTypes.NumberOptions.MULTIPLEOF: {
                    output.push(RcpTypes.NumberOptions.MULTIPLEOF);
                    if (this._multipleof) {
                        this.writeValue(this._multipleof, output);
                    } else {
                        this.writeValue(null, output);
                    }                
                    break;
                }

                case RcpTypes.NumberOptions.SCALE: {
                    output.push(RcpTypes.NumberOptions.SCALE);
                    if (this._scale) {
                        output.push(this._scale);
                    } else {
                        output.push(RcpTypes.NumberScale.LINEAR);
                    }
                    break;
                }

                case RcpTypes.NumberOptions.UNIT: {
                    output.push(RcpTypes.NumberOptions.UNIT);
                    if (this._unit) {
                        writeTinyString(this._unit, output);
                    } else {
                        writeTinyString("", output);
                    } 
                    break;
                }
            }

        });

        if (!all) {
            this.changed.clear();
        }
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
    // minimum
    set multipleof(multipleof: number | undefined) {
        if (this._multipleof === multipleof) {
            return;
        }

        this._multipleof = multipleof;
        this.changed.set(RcpTypes.NumberOptions.MULTIPLEOF, true);
        this.setDirty();
    }

    get multipleof(): number | undefined {
        return this._multipleof;
    }

    //--------------------------------
    // scale
    set scale(scale: number | undefined) {
        if (this._scale === scale) {
            return;
        }

        this._scale = scale;
        this.changed.set(RcpTypes.NumberOptions.SCALE, true);
        this.setDirty();
    }

    get scale(): number | undefined {
        return this._scale;
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

    readValue(io: KaitaiStream): number {
        return io.readU1();
    }
    
    writeValue(value: number, buffer: Array<number>) {
        if (value != null) {
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

    readValue(io: KaitaiStream): number {
        return io.readU2be();
    }
    
    writeValue(value: number, buffer: Array<number>) {
        if (value != null) {
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

    readValue(io: KaitaiStream): number {
        return io.readU8be();
    }
    
    writeValue(value: number, buffer: Array<number>) {
        if (value != null) {
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

    readValue(io: KaitaiStream): number {
        return io.readF4be();
    }
    
    writeValue(value: number, buffer: Array<number>) {
        if (value != null) {
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

    readValue(io: KaitaiStream): number {
        return io.readF8be();
    }
    
    writeValue(value: number, buffer: Array<number>) {
        if (value != null) {
            pushFloat64ToArrayBe(value, buffer);
        } else if (this._defaultValue) {
            pushFloat64ToArrayBe(this._defaultValue, buffer);
        } else {
            pushFloat64ToArrayBe(0, buffer);
        }
    }
}