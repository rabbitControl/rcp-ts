import KaitaiStream from "./KaitaiStream";
import { Writeable } from "./Writeable";

export class RcpVersion implements Writeable
{
    major: number;
    minor: number;

    constructor(major: number, minor: number)
    {
        this.major = major;
        this.minor = minor;
    }

    compare(other: RcpVersion):number {
        return parseFloat(`${this.major}.${this.minor}`) - parseFloat(`${other.major}.${other.minor}`);
    }

    // Writeable
    write(output: number[], all: boolean): void
    {
        output.push(this.major);
        output.push(this.minor);
    }

    toString(): string {
        return `${this.major}.${this.minor}`;
    }

    static parse(io: KaitaiStream): RcpVersion
    {
        return new RcpVersion(io.readU1(), io.readU1());
    }

}