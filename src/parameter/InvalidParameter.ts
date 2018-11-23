import { Parameter } from './Parameter'
import KaitaiStream from '../KaitaiStream';
import { InvalidDefinition } from '../typedefinition/InvalidDefinition';

export class InvalidParameter extends Parameter {

    constructor() {
        super(0, new InvalidDefinition());
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    // this parameter can not be set dirty
    setDirty() {}

    // override - dont write anything
    write(output: Array<number>, all: boolean): void {}
}