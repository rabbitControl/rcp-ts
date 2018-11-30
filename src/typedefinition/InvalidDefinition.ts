import { TypeDefinition } from "./TypeDefinition";
import KaitaiStream from "../KaitaiStream";

export class InvalidDefinition extends TypeDefinition {

    constructor() {
        super(0);
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