import { Writeable } from "./Writeable";

export class VersionData implements Writeable {

    version: string;

    constructor(version: string) {
        this.version = version;
    }

    write(output: number[], all: boolean): void {
        throw new Error("Method not implemented.");
    }

}