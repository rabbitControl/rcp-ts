import KaitaiStream from '../KaitaiStream'
import { pushFloat32ToArrayBe, pushIn32ToArrayBe } from '../Utils'
import { RcpTypes } from '../RcpTypes'
import VectorDefinition, { Vector3 } from './VectorDefinition';


export class Vector3F32Definition extends VectorDefinition<Vector3> {

    constructor() {
        super(RcpTypes.Datatype.VECTOR3F32);
    }

    readValue(io: KaitaiStream): Vector3 {
        return new Vector3(io.readF4be(), io.readF4be(), io.readF4be());
    }

    writeValue(buffer: Array<number>, value?: Vector3) {
        if (value != undefined) {
            pushFloat32ToArrayBe(value.x, buffer);
            pushFloat32ToArrayBe(value.y, buffer);
            pushFloat32ToArrayBe(value.z, buffer);
        } else if (this._defaultValue) {
            pushFloat32ToArrayBe(this._defaultValue.x, buffer);
            pushFloat32ToArrayBe(this._defaultValue.y, buffer);
            pushFloat32ToArrayBe(this._defaultValue.z, buffer);
        } else {
            pushFloat32ToArrayBe(0, buffer);
            pushFloat32ToArrayBe(0, buffer);
            pushFloat32ToArrayBe(0, buffer);
        }
    }

    // override
    getTypeDefault(): Vector3 {
        return new Vector3(0, 0, 0);
    }
}


export class Vector3I32Definition extends VectorDefinition<Vector3> {

    constructor() {
        super(RcpTypes.Datatype.VECTOR3I32);
    }

    readValue(io: KaitaiStream): Vector3 {
        return new Vector3(io.readS4be(), io.readS4be(), io.readS4be());
    }

    writeValue(buffer: Array<number>, value?: Vector3) {
        if (value != undefined) {
            pushIn32ToArrayBe(value.x, buffer);
            pushIn32ToArrayBe(value.y, buffer);
            pushIn32ToArrayBe(value.z, buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue.x, buffer);
            pushIn32ToArrayBe(this._defaultValue.y, buffer);
            pushIn32ToArrayBe(this._defaultValue.z, buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
            pushIn32ToArrayBe(0, buffer);
            pushIn32ToArrayBe(0, buffer);
        }
    }

    // override
    getTypeDefault(): Vector3 {
        return new Vector3(0, 0, 0);
    }
}
