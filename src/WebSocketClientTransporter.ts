import { ClientTransporter } from './Transport';
import { RcpTypes } from './RcpTypes';
import { Client } from './Client';

export class WebSocketClientTransporter extends ClientTransporter {

  static errorMessage = {
    notConnected: 'Connection is not open.',
  }

  doSSL = false;
  host?: string;
  port?: number;
  private serverURL?: string;
  private websocket?: WebSocket;
  private readyState = RcpTypes.ClientStatus.DISCONNECTED;

  // callbacks from ClientTransporter class:
  // connected, disconnected, received, onError

  connect(host: string, port: number): void {

    // first disconnect    
    this.disconnect();

    this.host = host;
    this.port = port;

    if (this.doSSL) {
      this.serverURL = 'wss://' + host + ':' + port;
    } else {
      this.serverURL = 'ws://' + host + ':' + port;
    }
    
    if (Client.VERBOSE) {
      console.log("connect to: " + this.serverURL);
    }

    this.websocket = new WebSocket(this.serverURL);
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

    const websocket = this.websocket;
    return websocket && (this.readyState === RcpTypes.ClientStatus.CONNECTED || 
                        this.readyState === RcpTypes.ClientStatus.OK);
  }

  send(data: Int8Array) {

    if (!this.websocket) {
      throw new Error(WebSocketClientTransporter.errorMessage.notConnected);
    }

    const websocket = this.websocket;

    switch (this.readyState) {
      case RcpTypes.ClientStatus.DISCONNECTED:
      case RcpTypes.ClientStatus.VERSION_MISSMATCH:
        throw new Error(WebSocketClientTransporter.errorMessage.notConnected);

      case RcpTypes.ClientStatus.CONNECTED:
      case RcpTypes.ClientStatus.OK:
        websocket.send(data);
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
      console.log("received: " + data);
    }
  }
}
