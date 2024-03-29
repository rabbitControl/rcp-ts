import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { writeTinyString } from '../Utils';
import { RcpTypes } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';


export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString() : string {
        return `${this.x}, ${this.y}`;
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    add(v: Vector2): Vector2 {
        this.x += v.x;
        this.y += v.y;

        return this;
    }

    sub(v: Vector2): Vector2 {
        this.x -= v.x;
        this.y -= v.y;

        return this;
    }
}

export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toString() : string {
        return `${this.x}, ${this.y}, ${this.z}`;
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    add(v: Vector3): Vector3 {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }

    sub(v: Vector3): Vector3 {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;
    }
}

export class Vector4 {
    x: number;
    y: number;
    z: number;
    t: number;

    constructor(x: number, y: number, z: number, t: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.t = t;
    }

    toString() : string {
        return `${this.x}, ${this.y}, ${this.z}, ${this.t}`;
    }

    clone(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.t);
    }

    add(v: Vector4): Vector4 {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.t += v.t;

        return this;
    }

    sub(v: Vector4): Vector4 {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        this.t -= v.t;

        return this;
    }
}




export default abstract class VectorDefinition<T> extends DefaultDefinition<T> {
    
    static readonly  allOptions: Map<number, boolean> = new Map().
                    set(RcpTypes.VectorOptions.DEFAULT, true).
                    set(RcpTypes.VectorOptions.MINIMUM, true).
                    set(RcpTypes.VectorOptions.MAXIMUM, true).
                    set(RcpTypes.VectorOptions.MULTIPLEOF, true).
                    set(RcpTypes.VectorOptions.SCALE, true).
                    set(RcpTypes.VectorOptions.UNIT, true);

    private _minimum?: T;
    private _maximum?: T;
    private _multipleof?: T;
    private _scale?: number;
    private _unit?: string;

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof VectorDefinition) {

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

            if (typedefinition._multipleof !== undefined) {
                this._multipleof = typedefinition._multipleof;
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
            case RcpTypes.NumberOptions.MULTIPLEOF:
                this._multipleof = this.readValue(io);
                return true;
            case RcpTypes.NumberOptions.SCALE:
                let scale_num = io.readU1();
                if (scale_num < RcpTypes.NumberScale.LINEAR || scale_num > RcpTypes.NumberScale.EXP2) {
                    this._scale = RcpTypes.NumberScale.LINEAR
                } else {
                    this._scale = scale_num;
                }
                return true;
            case RcpTypes.NumberOptions.UNIT:
                // read tiny string
                let len = io.readU1();
                this._unit = KaitaiStream.bytesToStr(io.readBytes(len), 'utf8');
                return true;
        }

        return false;
    }

    getDefaultId(): number {
        return RcpTypes.VectorOptions.DEFAULT;
    }

    writeOptions(output: number[], all: boolean): void {

        let ch = this.changed;
        if (all) {
            ch = VectorDefinition.allOptions;
        }

        ch.forEach((v, key) => {

            switch (key) {
                case RcpTypes.NumberOptions.DEFAULT: {
                    output.push(RcpTypes.NumberOptions.DEFAULT);
                    this.writeValue(output, this._defaultValue);                    
                    break;
                }

                case RcpTypes.NumberOptions.MINIMUM: {
                    output.push(RcpTypes.NumberOptions.MINIMUM);
                    this.writeValue(output, this._minimum);                    
                    break;
                }

                case RcpTypes.NumberOptions.MAXIMUM: {
                    output.push(RcpTypes.NumberOptions.MAXIMUM);
                    this.writeValue(output, this._maximum);                    
                    break;
                }

                case RcpTypes.NumberOptions.MULTIPLEOF: {
                    output.push(RcpTypes.NumberOptions.MULTIPLEOF);
                    this.writeValue(output, this._multipleof);                    
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

    abstract constrainValue(value: T): T;

    // getter / setter

    //--------------------------------
    // minimum
    set minimum(minimum: T | undefined) {
        if (this._minimum === minimum) {
            return;
        }

        this._minimum = minimum;
        this.changed.set(RcpTypes.VectorOptions.MINIMUM, true);
        this.setDirty();
    }

    get minimum(): T | undefined {
        return this._minimum;
    }

    //--------------------------------
    // maximum
    set maximum(maximum: T | undefined) {
        if (this._maximum === maximum) {
            return;
        }

        this._maximum = maximum;
        this.changed.set(RcpTypes.VectorOptions.MAXIMUM, true);
        this.setDirty();
    }

    get maximum(): T | undefined {
        return this._maximum;
    }

    //--------------------------------
    // minimum
    set multipleof(multipleof: T | undefined) {
        if (this._multipleof === multipleof) {
            return;
        }

        this._multipleof = multipleof;
        this.changed.set(RcpTypes.VectorOptions.MULTIPLEOF, true);
        this.setDirty();
    }

    get multipleof(): T | undefined {
        return this._multipleof;
    }

    //--------------------------------
    // scale
    set scale(scale: number | undefined) {
        if (this._scale === scale) {
            return;
        }

        this._scale = scale;
        this.changed.set(RcpTypes.VectorOptions.SCALE, true);
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
        this.changed.set(RcpTypes.VectorOptions.UNIT, true);
        this.setDirty();
    }

    get unit(): string | undefined {
        return this._unit;
    }
}