import { ServerTransporter } from "./ServerTransporter";
import WebSocket from 'ws';

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer 
{
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  if (arrayBuffer instanceof ArrayBuffer)
  {
    return arrayBuffer;
  }
  
  throw new Error("SharedArrayBuffer");  
}

export class WebSocketServerTransporter extends ServerTransporter
{
    private wss?: WebSocket.Server

    private clients: Array<WebSocket> = [];

    // override
    bind(port: number): void
    {
        if (port > 0 && port < 65535)
        {
            this.wss = new WebSocket.Server({ port: port });

            this.wss.on('connection', (ws: WebSocket) =>
            {
                console.log(`New client connected: ${ws.url}`);
                
                this.clients.push(ws);

                ws.on('message', (message: WebSocket.RawData) =>
                {                    
                    if (message instanceof Buffer)
                    {
                        const data = bufferToArrayBuffer(message);

                        console.log("server received: ", new Uint8Array(data));
                        
                        if (this.received)
                        {
                            this.received(data, ws);
                        }
                        else {
                            console.log("no received!");
                            
                        }
                    }
                    else if (message instanceof ArrayBuffer)
                    {
                        console.log("server received: ", new Uint8Array(message));
                        
                        if (this.received)
                        {
                            this.received(message, ws);
                        }
                        else {
                            console.log("no received!");
                            
                        }
                    }
                    else
                    {
                        console.log("invalid message type!");
                    }
                });

                ws.on('close', () => {
                    console.log('Client disconnected: ' + ws.url);

                    // remove client
                    const index = this.clients.indexOf(ws);
                    if (index > -1) {
                        this.clients.splice(index, 1);
                    }
                });
            });
        }
        else
        {
            throw new Error(`Port out of range: ${port}`);
        }
    }

    unbind(): void {
        if (this.wss)
        {
            this.wss.close();
            this.wss = undefined;
        }
    }

    sendToOne(data: ArrayBuffer, id: object): void {
        const client = this.clients.find(client => client === id);
        if (client)
        {
            client.send(data);
        }
    }

    sendToAll(data: ArrayBuffer, excludeId: object): void {
        this.clients.forEach(client => {
            if (client !== excludeId)
            {
                client.send(data);
            }
        });
    }

    closeClient(id: object): void {
        const client = this.clients.find(client => client == id);
        if (client)
        {
            client.close();
        }
    }

    getConnectionCount(): number {
        return this.clients.length;
    }
}