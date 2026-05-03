import { ServerTransporter } from "./ServerTransporter";

export class WebSocketServerTransporter implements ServerTransporter
{
    bind(port: number): void {
        throw new Error("Method not implemented.");
    }
    unbind(): void {
        throw new Error("Method not implemented.");
    }
    sendToOne(data: Int8Array, id: object): void {
        throw new Error("Method not implemented.");
    }
    sendToAll(data: Int8Array, excludeId: object): void {
        throw new Error("Method not implemented.");
    }
    getConnectionCount(): number {
        throw new Error("Method not implemented.");
    }
    received?: ((data: Uint8Array, id: object) => void) | undefined;
}