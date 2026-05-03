
export interface ServerTransporter {

  bind(port: number): void;
  unbind(): void;

  sendToOne(data: Int8Array, id: object): void;
  sendToAll(data: Int8Array, excludeId: object): void;

  getConnectionCount(): number;

  // Events:
  received?: (data: Uint8Array, id: object) => void;
}
