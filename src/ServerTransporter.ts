export type ServerTransporterClient = {
  client: object;
  sendToAll: boolean; // should be initialized false, gets set true if client is fully initialized
}

export abstract class ServerTransporter
{
  // Events:
  received?: (data: ArrayBuffer, id: ServerTransporterClient, transporter: ServerTransporter) => void;
  connected?: (client: ServerTransporterClient, transporter: ServerTransporter) => void;
  disconnected?: (client: ServerTransporterClient, transporter: ServerTransporter) => void;

  abstract bind(port: number): void;
  abstract unbind(): void;

  abstract sendToOne(data: ArrayBuffer, id: ServerTransporterClient): void;
  abstract sendToAll(data: ArrayBuffer, excludeId?: ServerTransporterClient): void;

  abstract closeClient(id: ServerTransporterClient): void;

  abstract getConnectionCount(): number;
}