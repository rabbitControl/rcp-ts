import KaitaiStream from '../KaitaiStream'
import { pushFloat32ToArrayBe, pushIn32ToArrayBe } from '../Utils'
import { RcpTypes } from '../RcpTypes'
import VectorDefinition, { Vector4 } from './VectorDefinition';

export abstract class Vector4DefinitionBase extends VectorDefinition<Vector4> {

    constrainValue(value: Vector4): Vector4 {

        if (this.maximum !== undefined)
        {
            if (value.x > this.maximum.x) value.x = this.maximum.x;
            if (value.y > this.maximum.y) value.y = this.maximum.y;
            if (value.z > this.maximum.z) value.z = this.maximum.z;
            if (value.t > this.maximum.t) value.t = this.maximum.t;
        }

        if (this.minimum !== undefined)
        {
            if (value.x < this.minimum.x) value.x = this.minimum.x;
            if (value.y < this.minimum.y) value.y = this.minimum.y;
            if (value.z < this.minimum.z) value.z = this.minimum.z;
            if (value.t < this.minimum.t) value.t = this.minimum.t;
        }

        return value;
    }
}

export class Vector4F32Definition extends Vector4DefinitionBase {

    constructor() {
        super(RcpTypes.Datatype.VECTOR4F32);
    }

    readValue(io: KaitaiStream): Vector4 {
        return new Vector4(io.readF4be(), io.readF4be(), io.readF4be(), io.readF4be());
    }

    writeValue(buffer: Array<number>, value?: Vector4) {
        if (value != undefined) {
            pushFloat32ToArrayBe(value.x, buffer);
            pushFloat32ToArrayBe(value.y, buffer);
            pushFloat32ToArrayBe(value.z, buffer);
            pushFloat32ToArrayBe(value.t, buffer);
        } else if (this._defaultValue) {
            pushFloat32ToArrayBe(this._defaultValue.x, buffer);
            pushFloat32ToArrayBe(this._defaultValue.y, buffer);
            pushFloat32ToArrayBe(this._defaultValue.z, buffer);
            pushFloat32ToArrayBe(this._defaultValue.t, buffer);
        } else {
            pushFloat32ToArrayBe(0, buffer);
            pushFloat32ToArrayBe(0, buffer);
            pushFloat32ToArrayBe(0, buffer);
            pushFloat32ToArrayBe(0, buffer);
        }
    }

    // override
    getTypeDefault(): Vector4 {
        return new Vector4(0, 0, 0, 0);
    }
}


export class Vector4I32Definition extends Vector4DefinitionBase {

    constructor() {
        super(RcpTypes.Datatype.VECTOR4I32);
    }

    readValue(io: KaitaiStream): Vector4 {
        return new Vector4(io.readS4be(), io.readS4be(), io.readS4be(), io.readS4be());
    }

    writeValue(buffer: Array<number>, value?: Vector4) {
        if (value != undefined) {
            pushIn32ToArrayBe(value.x, buffer);
            pushIn32ToArrayBe(value.y, buffer);
            pushIn32ToArrayBe(value.z, buffer);
            pushIn32ToArrayBe(value.t, buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue.x, buffer);
            pushIn32ToArrayBe(this._defaultValue.y, buffer);
            pushIn32ToArrayBe(this._defaultValue.z, buffer);
            pushIn32ToArrayBe(this._defaultValue.t, buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
            pushIn32ToArrayBe(0, buffer);
            pushIn32ToArrayBe(0, buffer);
            pushIn32ToArrayBe(0, buffer);
        }
    }

    // override
    getTypeDefault(): Vector4 {
        return new Vector4(0, 0, 0, 0);
    }
}
