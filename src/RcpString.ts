import KaitaiStream from "./KaitaiStream";
import { RcpInt } from "./RcpInt";
import { Writeable } from "./Writeable";

export class RcpString implements Writeable
{
    value: string = ""

    constructor(value: string)
    {
        this.value = value;
    }

    w(): number[]
    {
        const out: number[] = [];
        this.write(out);
        return out;
    }

    write(output: number[]): void
    {
        // console.log("str length: ", this.value.length);
        
        const rcp_len = new RcpInt(this.value.length);
        rcp_len.write(output);

        const enc = new TextEncoder();
        const stringarray = enc.encode(this.value);
  
        // add array
        stringarray.forEach((element) => {
            output.push(element as number);
        });
    }    

    static parse(io: KaitaiStream): RcpString {

        const string_len = RcpInt.parse(io);

        return new RcpString(KaitaiStream.bytesToStr(io.readBytes(string_len.value), 'utf8'));
    }
}