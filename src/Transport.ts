
export abstract class ClientTransporter {
  // Events:
  // connected()
  // disconnected()
  // received(byte[] _data)
  received?: (data: ArrayBuffer) => void;
  connected?: () => void;
  disconnected?: (event: CloseEvent) => void;
  onError?: () => void;

  abstract connect(host: string, port: number): void;
  abstract disconnect(): void;
  abstract isConnected(): boolean;
  abstract versionOk(): void;

  abstract send(data: Int8Array): void;
}

export interface ServerTransporter {

  bind(port: number): void;
  unbind(): void;

  sendToOne(data: Int8Array, id: object): void;
  sendToAll(data: Int8Array, excludeId: object): void;

  getConnectionCount(): number;

  // Events:
  received?: (data: Uint8Array, id: object) => void;
}
