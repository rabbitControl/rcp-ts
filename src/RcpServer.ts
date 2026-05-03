import { BangParameter, BooleanParameter, Float32Parameter, Parameter, RcpTypes } from ".";
import { Packet } from "./Packet";
import { StringParameter } from "./parameter/StringParameter";
import { ParameterManager } from "./ParameterManager";
import { RcpInt } from "./RcpInt";

export class RcpServer extends ParameterManager
{    
    private returnedIds: number[] = [];
    private removedParameters: Parameter[] = [];

    constructor()
    {
        super(true);
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
            this.returnedIds.push(parameter.id);
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