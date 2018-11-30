import KaitaiStream from '../KaitaiStream';
import { TypeDefinition } from './TypeDefinition';
import { RcpTypes } from '../RcpTypes';

/**
 * GroupDefinition for GroupParameter
 * has no value
 */
export class GroupDefinition extends TypeDefinition {
    constructor() {
        super(RcpTypes.Datatype.GROUP);
    }

    // implement
    didChange() : boolean {
        return false;
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    writeOptions(output: number[], all: boolean): void {}
    update(typedefinition: TypeDefinition): boolean { return false; }
}