import { ClientTransporter } from './Transport';
import { Parameter } from './parameter/Parameter';
import KaitaiStream from './KaitaiStream';
import { Packet } from './Packet';
import { RcpTypes } from './RcpTypes';
import { ParameterManager } from './ParameterManager';
import { InfoData } from './InfoData';
import { parsePacket } from './RCPPacketParser';
import { BangParameter } from './parameter/BangParameter';
import { IdData } from './IdData';
import { SemVer } from 'semver';

export class Client implements ParameterManager {

  // static
  static VERBOSE: boolean = false;

  private static rcpVersion: string = "0.1.0";
  private static serverVersion?: SemVer;
  private static serverApplicationId?: string;

  static getRcpVersion() : string {
    return Client.rcpVersion;
  }

  static getServerVersion() : string {
    return Client.serverVersion ? Client.serverVersion.raw : "";
  }

  static getServerApplicationId() : string {
    return Client.serverApplicationId ? Client.serverApplicationId : "";
  }

  static serverVersionGt(version: string) : boolean {
    if (!Client.serverVersion) {
      return false;
    }

    return Client.serverVersion.compare(version) == 1;
  }

  // events
  connected?: () => void;
  disconnected?: (event: CloseEvent) => void;
  onServerInfo?: (version: string, applicationId: string) => void;
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
        console.log("client received: ", new Int8Array(data));
      }

      const io = new KaitaiStream(data, 0);
      const packet = parsePacket(io, this);
  
      switch (packet.command) {
        case RcpTypes.Command.INVALID:
        case RcpTypes.Command.INITIALIZE:
        case RcpTypes.Command.DISCOVER:
          console.error(`invalid command: ${packet.command}`);
          break;

        case RcpTypes.Command.INFO:

          if (packet.data === undefined) {

            // no data, answer with infopacket
            const versionPacket = new Packet(RcpTypes.Command.INFO);
            versionPacket.data = new InfoData(Client.rcpVersion, "webclient");
            this.transporter.send(new Int8Array(versionPacket.serialize(false)));

          } else if (packet.data instanceof InfoData) {
          
            const infoData = packet.data as InfoData;

            Client.serverVersion = new SemVer(infoData.version);
            Client.serverApplicationId = infoData.applicationid;

            if (this.onServerInfo) {
              this.onServerInfo(infoData.version, infoData.applicationid);
            }
            
            console.log(`rcp version: ${infoData.version} from server${(infoData.applicationid !== "" ? `: ${infoData.applicationid}` : "")}`);
            this.handleVersion(infoData.version);

          } else {
            console.error("wrong data in info packet");
          }

          break; 

        case RcpTypes.Command.REMOVE:
          if (Client.serverVersionGt("0.0.0")) {
            // for versions > 0.0.0 we expect IdData
            if (packet.data instanceof IdData) {
              this._remove((packet.data as IdData).id);
            } else {
              console.error("no data in remove package");
            }
          } else {
            // old version expects a parameter
            if (packet.data instanceof Parameter) {
              this._remove((packet.data as Parameter).id);
            } else {
              console.error("no data in remove package");
            }
          }
          break; 

        case RcpTypes.Command.UPDATE:
        case RcpTypes.Command.UPDATEVALUE:
          // expect a parameter as data
          if (packet.data instanceof Parameter) {
            this._update(packet.data as Parameter);
          } else {
            console.error("no data in update package");
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
    const versionPacket = new Packet(RcpTypes.Command.INFO);
    this.transporter.send(new Int8Array(versionPacket.serialize(false)));

    // if you know server does not support InfoData, handleVersion directly
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
          
          if (Client.serverVersionGt("0.0.1")) {
            // since rcp-version 0.1.0 updateValue needs to be implemented
            
            // check if we can write updatevalue
            if (parameter instanceof BangParameter || 
                parameter.onlyValueChanged())
            {
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
   * @param id id of parameter to remove.
   */
  private _remove(id: number): void {

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
