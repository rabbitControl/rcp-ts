import { BangParameter, BooleanParameter, Float32Parameter, Float64Parameter, GroupParameter, Int16Parameter, Int32Parameter, Int8Parameter, NumberParameter, Parameter, RcpTypes, RGBAParameter, RGBParameter, ServerTransporter } from ".";
import { InfoData } from "./InfoData";
import KaitaiStream from "./KaitaiStream";
import { Packet } from "./Packet";
import { StringParameter } from "./parameter/StringParameter";
import { ParameterManager } from "./ParameterManager";
import { ClientState } from "./RcpClientState";
import { RcpInt } from "./RcpInt";
import { RcpVersion } from "./RcpVersion";
import { ServerTransporterClient } from "./ServerTransporter";

export class RcpServer extends ParameterManager
{
    // static
    static VERBOSE: boolean = true;
    static VERBOSE_RECV: boolean = true;
    static VERBOSE_SEND: boolean = true;

    //
    private returnedIds: number[] = [];
    private removedParameters: Parameter[] = [];
    private transporter: ServerTransporter[] = [];

    private readonly server_rcp_version = new RcpVersion(1, 0);
    private readonly server_handshake_version = new RcpVersion(1, 0);
    private readonly server_is_strict = true;

    private applicationId?: string;
    private version?: string;

    private clientStates: Map<object, ClientState> = new Map();

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
            transporter.received = (data: ArrayBuffer, id: ServerTransporterClient, transporter: ServerTransporter) => this.transporterReceived(data, id, transporter);

            transporter.connected = (client: ServerTransporterClient, transporter: ServerTransporter) =>
            {
                this.clientStates.set(client, ClientState.Connected);
            };
            transporter.disconnected = (client: ServerTransporterClient, transporter: ServerTransporter) =>
            {
                this.clientStates.delete(client);
            };
        }
    }

    removeTransporter(transporter: ServerTransporter)
    {
        const index = this.transporter.indexOf(transporter);
        if (index > -1)
        {
            this.transporter.splice(index, 1);            
        }

        // in any case
        transporter.received = undefined;
        transporter.connected = undefined;
        transporter.disconnected = undefined;
    }

    transporterReceived(data: ArrayBuffer, id: ServerTransporterClient, transporter: ServerTransporter)
    {
        const io = new KaitaiStream(data, 0);
        const packet = Packet.parse(io, this);

        switch (packet.type) {

            case RcpTypes.PacketType.INFO:

                // send version info to client
                const init_packet = new Packet(RcpTypes.PacketType.INFO);
                init_packet.data = new InfoData(
                    this.server_rcp_version,
                    this.server_handshake_version,
                    this.applicationId,
                    this.version
                );

                // send to one
                transporter.sendToOne(new Uint8Array(init_packet.serialize(false)).buffer, id);

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

                    this.clientStates.set(id, ClientState.Handshake);

                    // waiting for init
                }
                else if (this.server_is_strict) {
                    // version not ok and strict
                    console.log("VERSION NOT OK - disconnect");
                    transporter.closeClient(id);
                }
                else {
                    // version is not ok, but server knows that it will be all right
                    // waiting for init

                    this.clientStates.set(id, ClientState.Handshake);
                }

                break;


            case RcpTypes.PacketType.INITIALIZE:
                {
                    this.clientStates.set(id, ClientState.Initialize);

                    // send init
                    const init_packet = new Packet(RcpTypes.PacketType.INITIALIZE);
                    init_packet.data = new RcpInt(this.valueCache.size);            

                    transporter.sendToOne(new Uint8Array(init_packet.serialize(false)).buffer, id);

                    this.valueCache.forEach((parameter) => {

                        if (RcpServer.VERBOSE)
                        {
                            console.log("sending parameter:", parameter.id, ":", parameter.label);
                        }

                        const parameterPacket = new Packet(RcpTypes.PacketType.UPDATE);
                        parameterPacket.data = parameter;
                        
                        transporter.sendToOne(new Uint8Array(parameterPacket.serialize(true)).buffer, id);
                    });

                    // fully initialized
                    this.clientStates.set(id, ClientState.FullyInitialized);
                    id.sendToAll = true;

                    break;
                }

            case RcpTypes.PacketType.UPDATE:
            case RcpTypes.PacketType.UPDATEVALUE:                                
                if (id.sendToAll)
                {
                    this._update(packet.data as Parameter);
                }
                else
                {
                    console.warn("update from not fully initialized client!");                        
                }
                break;

            case RcpTypes.PacketType.REMOVE:
                console.warn("removing parameter not allowed on server:", (packet.data as RcpInt).value);
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

    override update()
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

    // NOTE: sent from ParameterManager::update()
    protected sendPacket(packet: Packet): void {

        const data = new Uint8Array(packet.serialize(false)).buffer;

        if (RcpServer.VERBOSE ||
            RcpServer.VERBOSE_SEND)
        {
            console.log("server writing: ", data);
        }

        // TODO: avoid sending to clients not yet fully initialized!!
        this.transporter.forEach(t => t.sendToAll(data))
    }

    removeParameter(parameter: Parameter)
    {
        // TODO: when to actually remove parameter?
        if (RcpServer.VERBOSE)
        {
            console.log("remove parameter: ", parameter.id);            
        }

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

    private _addParameter(parameter: Parameter, label: string, group?: GroupParameter)
    {
        parameter.parent = group;
        parameter.label = label;
        parameter.setManager(this);
        this.valueCache.set(parameter.id, parameter);
    }


    // expose parameters

    exposeGroup(label: string, group?: GroupParameter): GroupParameter
    {
        const parameter = new GroupParameter(this.nextId());
        this._addParameter(parameter, label, group);
        return parameter;
    }

    exposeBang(label: string, group?: GroupParameter): BangParameter
    {
        const parameter = new BangParameter(this.nextId());
        this._addParameter(parameter, label, group);
        return parameter;
    }

    exposeBoolean(label: string, value?: boolean, group?: GroupParameter): BooleanParameter
    {
        const parameter = new BooleanParameter(this.nextId());

        if (value !== undefined)
        {
            parameter.value = value;
        }

        this._addParameter(parameter, label, group);

        return parameter;
    }

    private _exposeNumberParameter<T extends number>(parameter: NumberParameter, label: string, value?: T, group?: GroupParameter) 
    {
        if (value !== undefined)
        {
            parameter.value = value;
        }

        this._addParameter(parameter, label, group);
    }

    exposeInt8(label: string, value?: number, group?: GroupParameter): Int8Parameter
    {
        const parameter = new Int8Parameter(this.nextId());
        this._exposeNumberParameter(parameter, label, value, group);
        return parameter;
    }

    exposeInt16(label: string, value?: number, group?: GroupParameter): Int16Parameter
    {
        const parameter = new Int16Parameter(this.nextId());
        this._exposeNumberParameter(parameter, label, value, group);
        return parameter;
    }
    
    exposeInt32(label: string, value?: number, group?: GroupParameter): Int32Parameter
    {
        const parameter = new Int32Parameter(this.nextId());
        this._exposeNumberParameter(parameter, label, value, group);
        return parameter;
    }

    exposeFloat(label: string, value?: number, group?: GroupParameter): Float32Parameter
    {
        const parameter = new Float32Parameter(this.nextId());
        this._exposeNumberParameter(parameter, label, value, group);
        return parameter;
    }

    exposeDouble(label: string, value?: number, group?: GroupParameter): Float64Parameter
    {
        const parameter = new Float64Parameter(this.nextId());
        this._exposeNumberParameter(parameter, label, value, group);
        return parameter;
    }

    exposeRGB(label: string, value?: string, group?: GroupParameter): RGBParameter
    {
        const parameter = new RGBParameter(this.nextId());

        if (value !== undefined)
        {
            parameter.setStringValue(value);
        }

        this._addParameter(parameter, label, group);

        return parameter;
    }

    exposeRGBA(label: string, value?: string, group?: GroupParameter): RGBAParameter
    {
        const parameter = new RGBParameter(this.nextId());

        if (value !== undefined)
        {
            parameter.setStringValue(value);
        }

        this._addParameter(parameter, label, group);

        return parameter;
    }

    exposeString(label: string, value?: string, group?: GroupParameter): StringParameter
    {
        const parameter = new StringParameter(this.nextId());

        if (value !== undefined)
        {
            parameter.value = value;
        }

        this._addParameter(parameter, label, group);

        return parameter;
    }
}