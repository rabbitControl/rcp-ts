import KaitaiStream from "./KaitaiStream";
import { RcpString } from "./RcpString";
import { RcpTypes } from "./RcpTypes";
import { RcpVersion } from "./RcpVersion";
import { Writeable } from "./Writeable";

export class InfoData implements Writeable
{
    // mandatory
    version: RcpVersion
    handshakeVersion: RcpVersion

    // optional
    applicationid?: string
    applicationversion?: string

    constructor(version: RcpVersion, handshakeVersion: RcpVersion, applicationid?: string, applicationversion?: string)
    {
        this.version = version;
        this.handshakeVersion = handshakeVersion;
        this.applicationid = applicationid;
        this.applicationversion = applicationversion;
    }

    // Writeable
    write(output: number[], all: boolean): void {
        
        this.version.write(output, all);
        this.handshakeVersion.write(output, all);

        // TODO: write optionals
        if (this.applicationid &&
            this.applicationid?.length > 0)
        {
            output.push(RcpTypes.InfodataOptions.APPLICATIONID | (this.applicationversion === undefined ? 0x80 : 0x00));
            new RcpString(this.applicationid).write(output);
        }

        if (this.applicationversion &&
            this.applicationversion?.length > 0)
        {
            output.push(RcpTypes.InfodataOptions.APPLICATIONVERSION | 0x80);
            new RcpString(this.applicationversion).write(output);
        }

        // In case no optional option is present, Info Data needs to be terminated with 0x80.x
        if (this.applicationid === undefined &&
            this.applicationversion === undefined)
        {
            output.push(0x80);
        }
    }

    static parse(io: KaitaiStream): InfoData
    {
        // read mandatory fields
        const version = RcpVersion.parse(io);
        const handshakeVersion = RcpVersion.parse(io);

        var applicationId;
        var applicationVersion;

        // TODO: parse options
        while (true) {
            const optionId = io.readU1();

            if (optionId === 0x80)
            {
                break;
            }

            switch(optionId & ~0x80)
            {
                case RcpTypes.InfodataOptions.APPLICATIONID:
                    applicationId = RcpString.parse(io).value;
                    break;

                case RcpTypes.InfodataOptions.APPLICATIONVERSION:
                    applicationVersion = RcpString.parse(io).value;
                    break;

                default:
                    throw new Error("Unknown option");
            }

            if (optionId & 0x80)
            {
                break;
            }
        }

        return new InfoData(version, handshakeVersion, applicationId, applicationVersion);
    }
}