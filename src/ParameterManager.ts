import { BangParameter, Client, RcpTypes } from '.';
import { Packet } from './Packet';
import { GroupParameter } from './parameter/GroupParameter';
import { Parameter } from './parameter/Parameter';

export abstract class ParameterManager
{
    parameterAdded?: (parameter: Parameter) => void;
    parameterRemoved?: (parameter: Parameter) => void;

    private rootGroup: GroupParameter = new GroupParameter(0);

    protected valueCache: Map<number, Parameter> = new Map();
    protected dirtyParams: Parameter[] = [];

    private parentIdCache: Map<number, number> = new Map();
    private readonly isServer: boolean;

    constructor(isServer: boolean) {
        this.isServer = isServer;
    }

    protected abstract sendPacket(packet: Packet): void;

    public getParameter(id: number): Parameter | undefined
    {
        return this.rootGroup.children.find((child) => child.id === id);
    }

    protected update()
    {
        this.dirtyParams.forEach((parameter) =>
        { 
            let packetCommand: number = RcpTypes.PacketType.UPDATE;
          
            // check if we can write updatevalue
            if (parameter instanceof BangParameter || 
                parameter.onlyValueChanged())
            {
                console.log("UPDATE VALUE");
                packetCommand = RcpTypes.PacketType.UPDATEVALUE;
            }

            const packet = new Packet(packetCommand);
            packet.data = parameter;

            this.sendPacket(packet);
        })

        this.dirtyParams = [];

    }    

    setParameterDirty(parameter: Parameter): void
    {
        if (!this.dirtyParams.includes(parameter))
        {
            this.dirtyParams.push(parameter);
        }
    }

    public getRootGroup(): GroupParameter
    {
        return this.rootGroup;
    }

    waitForParent(parameterid: number, parentid: number): void
    {
        this.parentIdCache.set(parameterid, parentid);
    }

    resolveParent(group: GroupParameter): void
    {
        if (this.parentIdCache.size > 0)
        {
            var toRemove: number[] = [];
            this.parentIdCache.forEach((parentid, parameterid) =>
            {
                if (parentid === group.id)
                {
                    const parameter = this.valueCache.get(parameterid);
                    if (parameter)
                    {
                        parameter.setParentDirect(group);
                        toRemove.push(parameterid);
                    }
                }
            });

            toRemove.forEach(e => this.parentIdCache.delete(e));
        }
    }


    /**
     * add or update a parameter in our valueCache
     * parameterAdded listener are informed if parameter gets added to the valueCache
     * 
     * @param parameter parsed parameter to add or update
     */
    protected _update(parameter: Parameter): void
    {
        if (!this.valueCache.has(parameter.id))
        {
            if (this.isServer)
            {
                // NOTE: adding parameters it not allowed on server
                return;
            }

            if (parameter.parent) {
                // add parameter to parent
                // NOTE: we only want to do this for new parameters 
                parameter.parent.addChild(parameter);
            }
            else
            {
                // this adds the parameter as child to the parent
                parameter.setParentDirect(this.rootGroup);
            }

            // add it to the cache
            this.valueCache.set(parameter.id, parameter);

            // initially this parameter is unchanged
            // clear changed flags
            parameter.clearChanged();

            if (this.parameterAdded) {
                this.parameterAdded(parameter);
            }

            if (parameter instanceof GroupParameter) {
                this.resolveParent(parameter);
            }

            if (Client.VERBOSE) {
                console.log(`PARAMETER MANAGER: parameter added to cache: ${parameter.label} [${parameter.id}]`);
            }
        }
        else
        {
            const chachedParameter = this.valueCache.get(parameter.id);

            if (chachedParameter)
            {                
                if (parameter.changedCount() > 0)
                {
                    // something changed
                    chachedParameter.update(parameter);
    
                    // parameter was used to updated cached parameter - dispose
                    // NOTE: is this necessary?
                    parameter.dispose();
    
                    if (Client.VERBOSE) {
                        console.log(`PARAMETER MANAGER: updated parameter: ${chachedParameter.label} [${chachedParameter.id}]`);
                    }
                }
                else if (this.isServer
                         && parameter.typeDefinition.datatype === RcpTypes.Datatype.BANG
                         && chachedParameter.typeDefinition.datatype === RcpTypes.Datatype.BANG)
                {
                    // NOTE: do this on server only
    
                    if (Client.VERBOSE) {
                        console.log(`PARAMETER MANAGER: bang parameter: ${chachedParameter.label} [${chachedParameter.id}]`);
                    }
    
                    // no change in bang parameter: bang
                    (chachedParameter as BangParameter).bang();
                }
            }
            else
            {
                // ??
            }
        }
    }

    /**
     * remove a parameter from valueCache
     * informs listeners before removing parameter
     * 
     * @param id id of parameter to remove.
     */
    protected _remove(id: number): void {

        const cached = this.valueCache.get(id);

        if (cached !== undefined) {

            if (Client.VERBOSE) {
                console.log("CLIENT: remove: " + id);
            }

            // remove parameter from parent
            // TODO: dispose??
            cached.removeFromParent();

            // remove parameter
            this.valueCache.delete(id);

            // tell listeners
            if (this.parameterRemoved) {
                this.parameterRemoved(cached);
            }

            cached.dispose();

        } else {
            if (Client.VERBOSE) {
                console.log("CLIENT: no parameter to remove with id: " + id);
            }
        }
    }

}