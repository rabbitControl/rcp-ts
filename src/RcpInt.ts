import KaitaiStream from "./KaitaiStream";
import { Writeable } from "./Writeable";

export class RcpInt implements Writeable
{
    public static readonly TERMINATOR: number = 0x80;
    public static readonly MAX_VALUE: number = 268435455; // 2^28 - 1 

    value: number;

    constructor(value: number)
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
        // size check value to be <= (2^28 - 1)!
        if (this.value > RcpInt.MAX_VALUE)
        {
            throw new Error("invalid rcp int value");
        }

        // big endian

        // NOTE: This implementation appears to be more efficient
        // than the implementation below.
        // NOTE: while this method can also be used to write little
        // endian RcpInt, using the big-endian version leads to this
        // implementation.
        if (this.value < 0x4000)
        {
            if (this.value < 0x80)
            {
                // 1 byte
                output.push((this.value & 0x7F) | 0x80);
            }
            else
            {
                // 2 bytes
                output.push((this.value >> 7) & 0x7F);
                output.push((this.value & 0x7F) | 0x80);
            }
        }
        else
        {
            if (this.value < 0x200000)
            {
                //3 bytes
                output.push((this.value >> 14) & 0x7F);
                output.push((this.value >> 7) & 0x7F);
                output.push((this.value & 0x7F) | 0x80);
            }
            else
            {
                // 4 bytes
                output.push((this.value >> 21) & 0x7F);
                output.push((this.value >> 14) & 0x7F);
                output.push((this.value >> 7) & 0x7F);
                output.push((this.value & 0x7F) | 0x80);
            }
        }


        // little endian - not used
        // var i = 0;
        // var v = this.value;
        // while (i < 4)
        // {
        //     const d = v & 0x7F; 

        //     v = v >> 7;

        //     if (v === 0)
        //     {
        //         output.push((d | 0x80));
        //         break;
        //     }
        //     else
        //     {
        //         output.push(d);
        //     }

        //     i++;
        // }
    }

    static parse(io: KaitaiStream): RcpInt
    {
        var v:number = 0;

        // NOTE: this implementation does not check if the final 4th byte is terminated
        // in case the 4th byte is not terminating the RcpInt it will lead to parsing errors later
        
        // TODO: consider to check 4th byte to be terminated

        var i=0;
        while (i < 4)
        {
            // if (io.isEof())
            // {
            //     throw new Error("EOF");
            // }
            const d = io.readU1();

            // "big endian"
            v = v << 7
            v |= ((d & ~0x80));

            // "little endian" - not used
            // v |= ((d & ~0x80) << (i*7));

            if (d & 0x80)
            {
                break;
            }

            i++;
        }

        return new RcpInt(v);
    }
}