import { InfoData } from "./InfoData";
import KaitaiStream from "./KaitaiStream";
import { ParameterManager } from "./ParameterManager";
import { RcpInt } from "./RcpInt";
import { parseParameter, parseUpdateValue } from "./RCPParameterParser";
import {RcpTypes} from "./RcpTypes";
import { Writeable } from "./Writeable";

export class Packet implements Writeable
{
    type: number;
    timestamp?: number;
    data?: Writeable;

    constructor(type: number)
    {
        this.type = type;
    }

    // Writeable
    write(output: number[], all: boolean): void {

        output.push(this.type);

        if (this.timestamp)
        {
            // TODO
        }

        this.data?.write(output, all);
    }

    serialize(all: boolean): number[] {
        let data = new Array<number>();
        this.write(data, all);
        return data;
    }

    static parse(io: KaitaiStream, manager: ParameterManager): Packet
    {
        const ts = io.readBitsInt(1) > 0;
        const rsv1 = io.readBitsInt(1);
        const rsv2 = io.readBitsInt(1);

        const type = io.readBitsInt(5);

        // needed?
        io.alignToByte();
        
        // create packet
        const packet = new Packet(type);

        if (ts)
        {
            // NOTE: read two io.readU4be() and create a big-int instead?
            const timestamp = io.readU8be();
            packet.timestamp = timestamp;
        }

        switch(type)
        {
            case RcpTypes.PacketType.INFO:
                packet.data = InfoData.parse(io);
                break;

            case RcpTypes.PacketType.INITIALIZE:
                packet.data = RcpInt.parse(io);
                break;

            case RcpTypes.PacketType.REMOVE:
                // TODO: parse all rcp-int (until io.end)
                packet.data = RcpInt.parse(io);
                break;

            case RcpTypes.PacketType.UPDATE:
                // TODO: parse more than one parameter
                packet.data = parseParameter(io, manager);
                break;
            case RcpTypes.PacketType.UPDATEVALUE:
                // TODO: parse more than one parameter
                packet.data = parseUpdateValue(io, manager);
                break;
        }

        return packet;
    }

}