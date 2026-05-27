
export abstract class ServerTransporter
{
  // Events:
  received?: (data: ArrayBuffer, id: object) => void;

  abstract bind(port: number): void;
  abstract unbind(): void;

  abstract sendToOne(data: ArrayBuffer, id: object): void;
  abstract sendToAll(data: ArrayBuffer, excludeId: object): void;

  abstract closeClient(id: object): void;

  abstract getConnectionCount(): number;
}
