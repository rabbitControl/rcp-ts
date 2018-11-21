import KaitaiStream from '../KaitaiStream';
import {TypeDefinition} from './TypeDefinition';
import RcpTypes from '../RcpTypes';

/**
 * GroupDefinition for GroupParameter
 * has no value
 */
export default class GroupDefinition extends TypeDefinition {
    constructor() {
        super(RcpTypes.Datatype.GROUP);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    writeOptions(output: number[], all: boolean): void {}
}