import KaitaiStream from '../KaitaiStream'
import { pushFloat32ToArrayBe, pushIn32ToArrayBe } from '../Utils'
import { RcpTypes } from '../RcpTypes'
import VectorDefinition, { Vector2 } from './VectorDefinition';


export abstract class Vector2DefinitionBase extends VectorDefinition<Vector2> {

    constrainValue(value: Vector2): Vector2 {

        if (this.maximum !== undefined)
        {
            if (value.x > this.maximum.x) value.x = this.maximum.x;
            if (value.y > this.maximum.y) value.y = this.maximum.y;
        }

        if (this.minimum !== undefined)
        {
            if (value.x < this.minimum.x) value.x = this.minimum.x;
            if (value.y < this.minimum.y) value.y = this.minimum.y;
        }

        return value;
    }
}

export class Vector2F32Definition extends Vector2DefinitionBase {

    constructor() {
        super(RcpTypes.Datatype.VECTOR2F32);
    }

    readValue(io: KaitaiStream): Vector2 {
        return new Vector2(io.readF4be(), io.readF4be());
    }

    writeValue(buffer: Array<number>, value?: Vector2) {
        if (value != undefined) {
            pushFloat32ToArrayBe(value.x, buffer);
            pushFloat32ToArrayBe(value.y, buffer);
        } else if (this._defaultValue) {
            pushFloat32ToArrayBe(this._defaultValue.x, buffer);
            pushFloat32ToArrayBe(this._defaultValue.y, buffer);
        } else {
            pushFloat32ToArrayBe(0, buffer);
            pushFloat32ToArrayBe(0, buffer);
        }
    }

    // override
    getTypeDefault(): Vector2 {
        return new Vector2(0, 0);
    }
}


export class Vector2I32Definition extends Vector2DefinitionBase {

    constructor() {
        super(RcpTypes.Datatype.VECTOR2I32);
    }

    readValue(io: KaitaiStream): Vector2 {
        return new Vector2(io.readS4be(), io.readS4be());
    }

    writeValue(buffer: Array<number>, value?: Vector2) {
        if (value != undefined) {
            pushIn32ToArrayBe(value.x, buffer);
            pushIn32ToArrayBe(value.y, buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(this._defaultValue.x, buffer);
            pushIn32ToArrayBe(this._defaultValue.y, buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
            pushIn32ToArrayBe(0, buffer);
        }
    }

    // override
    getTypeDefault(): Vector2 {
        return new Vector2(0, 0);
    }
}