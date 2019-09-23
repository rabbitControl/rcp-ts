import { ClientTransporter } from './Transport';
import { Parameter } from './parameter/Parameter';
import KaitaiStream from './KaitaiStream';
import { Packet } from './Packet';
import { RcpTypes } from './RcpTypes';
import { ParameterManager } from './ParameterManager';
import { VersionData } from './VersionData';
import { parsePacket } from './RCPPacketParser';
import { BangParameter } from './parameter/BangParameter';

export class Client implements ParameterManager {

  static VERBOSE = false;
  static DO_VALUE_UPDATE = false;

  // events
  connected?: () => void;
  disconnected?: (event: CloseEvent) => void;
  parameterAdded?: (parameter: Parameter) => void;
  parameterRemoved?: (parameter: Parameter) => void;
  onError?: (error: any) => void;

  private dirtyParams: Parameter[] = [];
  private transporter: ClientTransporter;
  private valueCache: Map<number, Parameter> = new Map();


  constructor(transporter: ClientTransporter) {

    this.transporter = transporter;

    // set transporter callbacks
    this.transporter.onError = (error:any) => {
      if (this.onError) {
        this.onError(error);
      }
    }
    
    this.transporter.connected = () => {

      this.requestVersion();
      
      if (this.connected) {
        this.connected();
      }
    }
    this.transporter.disconnected = (event) => {
      // call callback
      if (this.disconnected) {
        this.disconnected(event);
      }

      if (Client.VERBOSE) {
        console.log("transporter disconnected, clear value-cache");        
      }

      // cleanup
      this.valueCache.clear();
      this.dirtyParams = [];
    }

    this.transporter.received = (data: ArrayBuffer) => {
    
      if (Client.VERBOSE) {
        const view = new Int8Array(data);
        console.log("client received: ", view);
      }

      const io = new KaitaiStream(data, 0);
      const packet = parsePacket(io, this);
  
      switch (packet.command) {
        case RcpTypes.Command.INVALID:
        case RcpTypes.Command.INITIALIZE:
        case RcpTypes.Command.DISCOVER:
          console.error(`invalid command: ${packet.command}`);
          break;

        case RcpTypes.Command.VERSION:
          if (packet.data instanceof VersionData) {
            const versionData = packet.data as VersionData;
            this.handleVersion(versionData.version);            
          } else {
            console.error("could not parse version data");
          }
          break; 

        case RcpTypes.Command.REMOVE:
          this._remove(packet.data as Parameter);
          break; 

        case RcpTypes.Command.UPDATE:
        case RcpTypes.Command.UPDATEVALUE:
          if (packet.data instanceof Parameter) {
            this._update(packet.data as Parameter);
          } else {
            console.error("update package does not contain a parameter!!");            
          }
          break;
        }
    }
  }

  dispose() {
    this.disconnect();
  }

  connect(host: string, port: number): void {
    this.transporter.connect(host, port);
  }

  disconnect() {
    this.transporter.disconnect();
  }

  private requestVersion() {

    // send version packet
    const versionPacket = new Packet(RcpTypes.Command.VERSION);
    this.transporter.send(new Int8Array(versionPacket.serialize(false)));

    // if you know server does not support version data, handleVersion directly
    // this.handleVersion("0.0.0");
  }

  private handleVersion(version: string) {
    if (this.checkVersion(version)) {
      this.transporter.versionOk();     
      this.initialize();
    }
  }

  private checkVersion(version: string) : boolean {

    if (!version) return false;

    const parts = version.split(".");
    if (parts.length === 3) {
      const major = parseInt(parts[0]);
      const minor = parseInt(parts[1]);
      const patch = parseInt(parts[2]);

      if (major >= 0 && minor >= 0 && patch >= 0) {
        return true;
      }
    }   

    console.error("version missmatch!");

    return false;
  }

  /**
   * send initialize packet to server if transporter is connected
   */
  initialize() {
    // cleanup?
    if (this.transporter.isConnected()) {
      const packet = new Packet(RcpTypes.Command.INITIALIZE);
      this.sendPacket(packet);
    } else {
      console.log("initialize: transporter not connected");
    }
  }

  /**
   * iterate over dirty parameters and send update packets
   */
  update() {
    try {
      if (this.transporter.isConnected()) {

        this.dirtyParams.forEach((parameter) => {
          
          let packetCommand = RcpTypes.Command.UPDATE;
          
          // is feature enabled?
          if (Client.DO_VALUE_UPDATE) {
            
            // check if we can write updatevalue
            if (parameter instanceof BangParameter || 
                (!parameter.typeDefinition.didChange() &&               
                  parameter.onlyValueChanged()
                )
            ){
              packetCommand = RcpTypes.Command.UPDATEVALUE;
            }
          }

          const packet = new Packet(packetCommand);
          packet.data = parameter;
          this.sendPacket(packet);
        })

        this.dirtyParams = [];

      } else {
        console.log("transporter not connected");        
      }
    } catch (error) {
      throw error;
    }
  }

  //------------------------------
  // ParameterManager
  getParameter(id: number): Parameter | undefined {
    return this.valueCache.get(id);
  }

  setParameterDirty(parameter: Parameter) {
    if (this.dirtyParams.indexOf(parameter) > -1) {
      // already contained
      return;
    }

    this.dirtyParams.push(parameter);
  }

  //------------------------------
  //
  
  /**
   * send a packet using our transporter
   * 
   * @param packet the packet to sed
   */
  private sendPacket(packet: Packet) {

    const dataOut = new Int8Array(packet.serialize(false))

    if (Client.VERBOSE) {
      console.log("client writing: ", dataOut);
    }

    this.transporter.send(dataOut);
  } 

  /**
   * add or update a parameter in our valueCache
   * parameterAdded listener are informed if paramter gets added to the valueCache
   * 
   * @param parameter parsed parameter to add or update
   */
  private _update(parameter: Parameter): void {

    if (!this.valueCache.has(parameter.id)) {

      // add it
      this.valueCache.set(parameter.id, parameter);

      if (this.parameterAdded) {
        this.parameterAdded(parameter);
      }

      if (Client.VERBOSE) {
        console.log(`CLIENT: paramter added to cache: ${parameter.label} [${parameter.id}]: userid: ${parameter.userid}`);
      }

    } else {

      const chachedParameter = this.valueCache.get(parameter.id);

      if (chachedParameter) {
        chachedParameter.update(parameter);
      }

      if (Client.VERBOSE && chachedParameter) {
        console.log(`CLIENT: updated paramter: ${chachedParameter.label} [${chachedParameter.id}]: userid: ${chachedParameter.userid}`);
      }
    }
  }

  /**
   * remove a parameter from valueCache
   * informs listeners before removing parameter
   * 
   * @param parameter parsed parameter to remove. this is not the parameter in our calueCache
   */
  private _remove(parameter: Parameter): void {

    const cached = this.valueCache.get(parameter.id);

    if (cached !== undefined) {
      
      if (Client.VERBOSE) {
        console.log("CLIENT: remove: " + parameter.id);
      }

      // remove parameter from parent
      // TODO: dispose??
      cached.removeFromParent();

      // remove parameter
      this.valueCache.delete(parameter.id);

      // tell listeners
      if (this.parameterRemoved) {
        this.parameterRemoved(cached);
      }

      cached.dispose();
      parameter.dispose();

    } else {
      if (Client.VERBOSE) {
        console.log("CLIENT: no parameter to remove with id: " + parameter.id);
      }      
    }
  }

}
