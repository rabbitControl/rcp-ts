import { RCP_LIBRARY_VERSION } from './version';
import { ClientTransporter } from './ClientTransporter';
import KaitaiStream from './KaitaiStream';
import { RcpTypes } from './RcpTypes';
import { InfoData } from './InfoData';
import { RcpVersion } from './RcpVersion';
import { Packet } from './Packet';
import { RcpInt } from './RcpInt';
import { ParameterManager } from './ParameterManager';
import { Parameter } from './parameter/Parameter';
import { ClientState } from './RcpClientState';

export class Client extends ParameterManager
{
  // static
  static VERBOSE: boolean = true;
  static VERBOSE_RECV: boolean = true;
  static VERBOSE_SEND: boolean = true;

  //
  public static rcpVersion: RcpVersion = new RcpVersion(2, 2);
  public static clientHandshakeVersion: RcpVersion = new RcpVersion(1, 0); // aka: backward compatibility version

  static getRcpVersion() : string {
    return Client.rcpVersion.toString();
  }

  // events
  connected?: () => void;
  disconnected?: (event: CloseEvent) => void;
  onServerInfo?: (version: string, applicationId: string) => void;
  onError?: (error: any) => void;

  private transporter: ClientTransporter;

  private serverApplicationId?: string;
  private serverApplicationVersion?: string;

  private expectedParameterCount: number = 0;
  private state: ClientState = ClientState.Unknown;

  constructor(transporter: ClientTransporter)
  {
    super(false);

    this.transporter = transporter;

    // set transporter callbacks
    this.transporter.onError = this.transporterError;  
    this.transporter.connected = this.transporterConnected;
    this.transporter.disconnected = this.transporterDisconnected;
    this.transporter.received = this.transporterReceived;
  }

  private setState(newState: ClientState) {
    if (newState != this.state)
    {
      console.log(`client state from: ${this.state} -> ${newState}`);
      this.state = newState;
    }
  }

  /*
  * transporter callbacks
  */
  transporterConnected = () =>
  {
    this.setState(ClientState.Connected);

    if (this.connected) {
      this.connected();
    }

    /*

    Client sends a info-packet
    Server receives info-packet
    Server sends info-packet to client
    Server checks if its runtime-version is between client rcp-version and base-version (inclusive)
        Version ok -> wait for Initialization
        Version mismatch:
            Server is strict -> close connection
            Server not strict -> wait for Initialization
    */

    /*
    Client receives info:
        Version ok: Initialization
        Version missmatch:
            Decide to close connection
            Or client sends initialize and skip packages if a parsing error occurs due to unknown options. See: Initialization
    */

    const versionPacket = new Packet(RcpTypes.PacketType.INFO);
    versionPacket.data = new InfoData(
      Client.rcpVersion,
      Client.clientHandshakeVersion, `rcp-ts webclient (${RCP_LIBRARY_VERSION})`, "Version XXX");

    this.sendPacket(versionPacket);    
    this.setState(ClientState.Handshake);
  }

  transporterError = (error: any) =>
  {
    console.error(error);

    this.setState(ClientState.Error);

    if (this.onError) {
      this.onError(error);
    }
  }

  transporterDisconnected = (event: any) =>
  {
    this.setState(ClientState.Disconnected);

    if (Client.VERBOSE) {
      console.log("transporter disconnected, clear value-cache");        
    }

    // call callback
    if (this.disconnected) {
      this.disconnected(event);
    }

  }

  update()
  {
    super.update();
  }

  private errorAndClose(info: string)
  {
    console.error(info);
    this.disconnect();
  }

  transporterReceived = (data: ArrayBuffer) =>
  {
    if (Client.VERBOSE ||
        Client.VERBOSE_RECV)
    {
      console.log("client received: ", new Uint8Array(data));
    }

    const io = new KaitaiStream(data, 0);
    const packet = Packet.parse(io, this);

    switch (packet.type)
    {    
      // NOTE: maybe added later
      // case RcpTypes.PacketType.DISCOVER:
      
      //---------------------------------------
      case RcpTypes.PacketType.INFO:
      //---------------------------------------

        if (this.state == ClientState.Handshake)
        {
          if (packet.data instanceof InfoData)
          {
            const infoData = packet.data as InfoData;
            
            this.serverApplicationId = infoData.applicationid;
            this.serverApplicationVersion = infoData.applicationversion;
  
            const server_version_str = infoData.version.toString() + " - " + infoData.handshakeVersion.toString();
  
            if (this.onServerInfo)
            {
              this.onServerInfo(server_version_str, infoData.applicationid || "<no application id>");
            }
  
            console.log(`rcp version: ${server_version_str} from server: ${infoData.applicationid} - ${infoData.applicationversion}`);
  
            /*
            Compatibility between the server and a client is ensured
            if the server handshake-version is between the clients rcp-version
            and clients handshake-version (inclusive). See Protocol Flow for the
            version handshake and more details.
            */
            if (infoData.handshakeVersion.compare(Client.clientHandshakeVersion) >= 0 &&
                infoData.handshakeVersion.compare(Client.rcpVersion) <= 0)
            {
              // send init
              this.initialize();
              this.setState(ClientState.Initialize);
            }
            else
            {
              this.errorAndClose("version mismatch!")
            }
          }
          else
          {
            this.errorAndClose("wrong data in info packet");
          }
        }
        else
        {
          this.errorAndClose(`received info in state: ${this.state}`);
        }

        break;


      //---------------------------------------
      case RcpTypes.PacketType.INITIALIZE:
      //---------------------------------------

        if (this.state == ClientState.Initialize)
        {
          this.expectedParameterCount = (packet.data as RcpInt).value;
          console.log(`expecting ${this.expectedParameterCount} parameters`);

          // NOTE: handle special case
          if (this.expectedParameterCount == 0)
          {
            this.setState(ClientState.FullyInitialized);
          }
        }
        else
        {
          this.errorAndClose(`received initialize in state: ${this.state}`);
          return;
        }
      
        break;

      //---------------------------------------
      case RcpTypes.PacketType.REMOVE:
      //---------------------------------------

        if (this.state == ClientState.FullyInitialized)
        {
          // TODO: remove parameter ids
        }
        else
        {
          console.error(`received remove in state: ${this.state}`);
          return;
        }

        break;

      //---------------------------------------
      case RcpTypes.PacketType.UPDATE:
      //---------------------------------------

        if (this.state == ClientState.Initialize ||
            this.state == ClientState.FullyInitialized)
        {
          if (packet.data instanceof Parameter)
          {
            this._update(packet.data);

            if (this.state != ClientState.FullyInitialized
                && this.valueCache.size == this.expectedParameterCount)
            {
              this.setState(ClientState.FullyInitialized);
            }
          }
          else
          {
            this.errorAndClose("invalid data in packet for update");
          }
        }
        else
        {
          // NOTE: don't close
          console.error(`received update in state: ${this.state}`);
          return;
        }

        break;

      //---------------------------------------
      case RcpTypes.PacketType.UPDATEVALUE:   
      //---------------------------------------
        
        if (this.state == ClientState.FullyInitialized)
        {
          if (packet.data instanceof Parameter)
          {
            this._update(packet.data);
          }
          else
          {
            this.errorAndClose("invalid data in packet for update-value");
          }            
        }
        else
        {
          console.error(`received update-value in state: ${this.state}`);
        }
      
        break;
    }
  }

  getServerApplicationId = () : string => {
    return this.serverApplicationId ? this.serverApplicationId : "";
  }

  dispose() {
    this.disconnect();
  }

  connect(host: string, port: number=0): void {
    this.transporter.connect(host, port);
  }

  disconnect() {
    console.log("disconnect transporter");
    this.transporter.disconnect();
  }

  /**
   * send initialize packet to server if transporter is connected
   */
  initialize() {
    const versionPacket = new Packet(RcpTypes.PacketType.INITIALIZE);
    versionPacket.data = new RcpInt(0);

    this.sendPacket(versionPacket)
  }

  //------------------------------
  //
  
  /**
   * send a packet using our transporter
   * 
   * @param packet the packet to sed
   */
  protected sendPacket(packet: Packet)
  {
    const dataOut = new Int8Array(packet.serialize(false))

    if (Client.VERBOSE ||
        Client.VERBOSE_SEND)
    {
      console.log("client writing: ", dataOut);
    }

    this.transporter.send(dataOut.buffer);
  } 

}
