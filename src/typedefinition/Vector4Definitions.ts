import KaitaiStream from '../KaitaiStream'
import { pushFloat32ToArrayBe, pushIn32ToArrayBe } from '../Utils'
import { RcpTypes } from '../RcpTypes'
import VectorDefinition, { Vector3, Vector4 } from './VectorDefinition';


export class Vector4F32Definition extends VectorDefinition<Vector4> {

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


export class Vector4I32Definition extends VectorDefinition<Vector4> {

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
