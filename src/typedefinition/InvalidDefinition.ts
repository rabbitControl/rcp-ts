import {TypeDefinition} from "./TypeDefinition";
import KaitaiStream from "../KaitaiStream";

export default class InvalidDefinition extends TypeDefinition {

    constructor() {
        super(0);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    writeOptions(output: number[], all: boolean): void { 
    }
}