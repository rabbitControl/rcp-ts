import { Writeable } from "./Writeable";
import { pushIn16ToArrayBe } from './Utils';
import KaitaiStream from "./KaitaiStream";

export class IdData implements Writeable {

    id: number;

    constructor(id: number) {
        this.id = id;
    }

    write(output: number[], all: boolean): void {
        
        // write mandatory
        pushIn16ToArrayBe(this.id, output);

    }
}


export function parseIdData(io: KaitaiStream): IdData {
    
    const id = io.readS2be();

    return new IdData(id);
}