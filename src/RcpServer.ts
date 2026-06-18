import { BangParameter, BooleanParameter, Float32Parameter, Parameter, RcpTypes, ServerTransporter, WebSocketServerTransporter } from ".";
import { InfoData } from "./InfoData";
import KaitaiStream from "./KaitaiStream";
import { Packet } from "./Packet";
import { StringParameter } from "./parameter/StringParameter";
import { ParameterManager } from "./ParameterManager";
import { RcpInt } from "./RcpInt";
import { RcpVersion } from "./RcpVersion";

export class RcpServer extends ParameterManager
{
    private returnedIds: number[] = [];
    private removedParameters: Parameter[] = [];
    private transporter: ServerTransporter[] = [];

    private readonly server_rcp_version = new RcpVersion(1, 0);
    private readonly server_handshake_version = new RcpVersion(1, 0);
    private readonly server_is_strict = true;

    private applicationId?: string;
    private version?: string;

    constructor(applicationId: string = "", version: string = "")
    {
        super(true);

        if (applicationId !== "")
        {
            this.applicationId = applicationId;
        }

        if (version !== "")
        {
            this.version = version;
        }
    }

    addTransporter(transporter: ServerTransporter)
    {
        if (this.transporter.indexOf(transporter) === -1)
        {
            this.transporter.push(transporter);
            transporter.received = (data: ArrayBuffer, id: object) => this.transporterReceived(data, id);
        }
    }

    transporterReceived(data: ArrayBuffer, id: object)
    {
        const io = new KaitaiStream(data, 0);

        const packet = Packet.parse(io, this);

        switch (packet.type) {

            case RcpTypes.PacketType.INFO:

                // send version info to client
                const versionPacket = new Packet(RcpTypes.PacketType.INFO);
                versionPacket.data = new InfoData(
                    this.server_rcp_version,
                    this.server_handshake_version,
                    this.applicationId,
                    this.version
                );

                // send to one
                this.transporter.forEach(t => t.sendToOne(new Uint8Array(versionPacket.serialize(false)).buffer, id));

                // analyze infodata from client
                const infoData = packet.data as InfoData;

                const client_version_str = infoData.version.toString() + " - " + infoData.handshakeVersion.toString();

                console.log("client app id:", infoData.applicationid);
                console.log("client app ver:", infoData.applicationversion);
                console.log("client:", client_version_str);

                // check version
                /*
                Compatibility between the server and a client is ensured
                if the server handshake-version is between the clients rcp-version
                and clients handshake-version (inclusive). See Protocol Flow for the
                version handshake and more details.
                */
                if (this.server_handshake_version.compare(infoData.version) <= 0 &&
                    this.server_handshake_version.compare(infoData.handshakeVersion) >= 0) {

                    console.log("VERSION OK - waiting for init");

                    // waiting for init
                }
                else if (this.server_is_strict) {
                    // version not ok and strict
                    console.log("VERSION NOT OK - disconnect");
                    this.transporter.forEach(t => t.closeClient(id));
                }
                else {
                    // version is not ok, but server knows that it will be all right
                    // waiting for init
                }

                break;


            case RcpTypes.PacketType.INITIALIZE:
                {
                    // send init
                    const versionPacket = new Packet(RcpTypes.PacketType.INITIALIZE);
                    versionPacket.data = new RcpInt(this.valueCache.values.length);

                    this.transporter.forEach(t => t.sendToOne(new Uint8Array(versionPacket.serialize(false)).buffer, id))

                    this.valueCache.forEach((parameter) => {
                        console.log("sending parameter:", parameter.id, ":", parameter.label);

                        const parameterPacket = new Packet(RcpTypes.PacketType.UPDATE);
                        parameterPacket.data = parameter;

                        const data = new Uint8Array(parameterPacket.serialize(true)).buffer;
                        
                        this.transporter.forEach(t => t.sendToOne(data, id));
                    });

                    break;
                }

            case RcpTypes.PacketType.UPDATE:
            case RcpTypes.PacketType.UPDATEVALUE:
                this._update(packet.data as Parameter);
                break;

            case RcpTypes.PacketType.REMOVE:
                this._remove((packet.data as RcpInt).value);            
                break;

            default:
                console.log("invalid packet type", packet.type);
                break;
        }
    }

    private nextId(): number
    {
        if (this.returnedIds.length > 0)
        {
            return this.returnedIds.shift()!;
        }
        
        // avoid id 0
        return this.valueCache.size + 1;
    }

    update()
    {
        // send removed parameters
        this.removedParameters.forEach((parameter) =>
        { 
            const packet = new Packet(RcpTypes.PacketType.REMOVE);
            packet.data = new RcpInt(parameter.id);
            this.sendPacket(packet);

            // now we can reuse id
            this.returnedIds.push(parameter.id);
        })

        this.removedParameters = [];

        // send dirty parameters
        super.update();
    }

    protected sendPacket(packet: Packet): void {
        throw new Error("Method not implemented.");
    }

    removeParameter(parameter: Parameter)
    {
        // TODO: when to actuall remove parameter?
        if (this.valueCache.delete(parameter.id))
        {
            // removed            
            this.removedParameters.push(parameter);
        }
        else
        {
            // error
            console.log(`SERVER: parameter not in cache: ${parameter.label} [${parameter.id}]`);            
        }
    }

    private _addParameter(parameter: Parameter, label: string)
    {
        parameter.label = label;
        parameter.setManager(this);
        this.valueCache.set(parameter.id, parameter);
    }

    exposeBang(label: string): BangParameter
    {
        const parameter = new BangParameter(this.nextId());
        this._addParameter(parameter, label);
        return parameter;
    }

    exposeBoolean(label: string, value: boolean | undefined): BooleanParameter
    {
        const parameter = new BooleanParameter(this.nextId());

        if (value)
        {
            parameter.value = value;
        }

        this._addParameter(parameter, label);

        return parameter;
    }

    exposeString(label: string, value: string | undefined): StringParameter
    {
        const parameter = new StringParameter(this.nextId());

        if (value)
        {
            parameter.value = value;
        }

        this._addParameter(parameter, label);

        return parameter;
    }

    exposeFloat(label: string, value: number | undefined): Float32Parameter
    {
        const parameter = new Float32Parameter(this.nextId());

        if (value)
        {
            parameter.value = value;
        }

        this._addParameter(parameter, label);

        return parameter;
    }
}