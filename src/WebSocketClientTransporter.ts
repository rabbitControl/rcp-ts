import { ClientTransporter } from './Transport';
import { RcpTypes } from './RcpTypes';
import { Client } from './Client';

const kNotConnectedStr: string = 'Connection is not open.';

export class WebSocketClientTransporter extends ClientTransporter
{
  private serverURL?: string;
  private websocket?: WebSocket;
  private readyState: number = RcpTypes.ClientStatus.DISCONNECTED;
  private protocol?: string[];

  // callbacks from ClientTransporter class:
  // connected, disconnected, received, onError

  constructor(protocol?: string[])
  {
    super();
    this.protocol = protocol;
  }

  connect(host: string, port: number = 0): void
  {
    // first disconnect    
    this.disconnect();

    if (!host.startsWith("http") &&
        !host.startsWith("ws"))
    {
      host = "http://" + host;
    }

    const url = new URL(host);

    if (port > 0)
    {
      url.port = ""+port;
    }

    url.protocol = (url.protocol.startsWith("https") || url.protocol.startsWith("wss")) ? "wss" : "ws";
    this.serverURL = url.toString();
    
    if (Client.VERBOSE) {
      console.log("connect to: " + this.serverURL);
    }

    this.websocket = new WebSocket(this.serverURL, this.protocol);
    this.websocket.binaryType = 'arraybuffer';

    // --------------------------------
    // set websocket callbacks
    this.websocket.onopen = (event) => {
      this.readyState = RcpTypes.ClientStatus.CONNECTED;
      // callback
      if (this.connected) {
        this.connected();
      }
    }
    this.websocket.onclose = (event) => {
      this.readyState = RcpTypes.ClientStatus.DISCONNECTED;
      // callback
      if (this.disconnected) { 
        this.disconnected(event);
      }
    }
    this.websocket.onerror = (event) => {
      // callback
      if (this.onError) {
        this.onError(event);
      }
    }
    this.websocket.onmessage = (event) => {
      try {      
        this.receive(event.data);
      } catch (error) {
        if (this.onError) {
          this.onError(error);
        } else {
          throw error;
        }
      }
    }
  }

  versionOk() {
    this.readyState = RcpTypes.ClientStatus.OK;
  }

  disconnect() {
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }

    this.readyState = RcpTypes.ClientStatus.DISCONNECTED;
  }

  isConnected(): boolean {

    if (!this.websocket) {
      console.log("no websocket");
      return false;
    }

    return this.websocket && (this.readyState === RcpTypes.ClientStatus.CONNECTED || 
                        this.readyState === RcpTypes.ClientStatus.OK);
  }

  send(data: Int8Array) {

    if (!this.websocket) {
      throw new Error(kNotConnectedStr);
    }

    switch (this.readyState) {
      case RcpTypes.ClientStatus.DISCONNECTED:
      case RcpTypes.ClientStatus.VERSION_MISSMATCH:
        throw new Error(kNotConnectedStr);

      case RcpTypes.ClientStatus.CONNECTED:
      case RcpTypes.ClientStatus.OK:        
        this.websocket.send(data);
        break;
    }
  }

  /**
   *
   * @param data
   */
  private receive(data: any) {

    if (data instanceof ArrayBuffer) {
      if (this.received) {
        this.received(<ArrayBuffer>data);
      }
    } else {
      console.log("received non ArrayBuffer data: " + data);
    }
  }
}
