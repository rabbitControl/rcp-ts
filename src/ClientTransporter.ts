
export abstract class ClientTransporter {
  // Events:
  // connected()
  // disconnected()
  // received(byte[] _data)
  received?: (data: ArrayBuffer) => void;
  connected?: () => void;
  disconnected?: (event: CloseEvent) => void;
  onError?: (error: any) => void;

  abstract connect(host: string, port: number): void;
  abstract disconnect(): void;
  abstract isConnected(): boolean;

  abstract send(data: ArrayBuffer): void;
}
