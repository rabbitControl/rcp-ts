import { RcpServer } from "./RcpServer";
import { ServerTransporter, ServerTransporterClient } from "./ServerTransporter";
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
    private wsServer?: WebSocket.Server
    private clients: Map<WebSocket, ServerTransporterClient> = new Map();

    // override
    override bind(port: number): void
    {
        if (port > 0 && port < 65535)
        {
            this.wsServer = new WebSocket.Server({ port: port });

            this.wsServer.on('connection', (client: WebSocket) =>
            {
                console.log(`New client connected: ${client.url}`);
                
                this.clients.set(client, {client: client, sendToAll: false});

                client.on('message', (message: WebSocket.RawData) =>
                {                    
                    if (message instanceof Buffer)
                    {
                        const data = bufferToArrayBuffer(message);

                        console.log("server received: ", new Uint8Array(data));
                        
                        if (this.received)
                        {
                            this.received(data, this.clients.get(client)!, this);
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
                            this.received(message, this.clients.get(client)!, this);
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

                client.on('close', () => {

                    if (RcpServer.VERBOSE) {
                        console.log('Client disconnected: ' + client.url);
                    }

                    // remove client
                    if (this.clients.has(client))
                    {
                        this.clients.delete(client);
                    }
                });
            });
        }
        else
        {
            throw new Error(`Port out of range: ${port}`);
        }
    }

    override unbind(): void {
        if (this.wsServer)
        {
            this.wsServer.close();
            this.wsServer = undefined;
            this.clients.clear();
        }
    }

    override sendToOne(data: ArrayBuffer, id: ServerTransporterClient): void {

        console.log("sending: ", data);        

        (id.client as WebSocket).send(data);
    }

    override sendToAll(data: ArrayBuffer, excludeId?: ServerTransporterClient): void {
        this.clients.forEach((o, client) => {
            if (o !== excludeId && o.sendToAll) {
                client.send(data);
            }
        });
    }

    override closeClient(id: ServerTransporterClient): void {
        (id.client as WebSocket).close();        
    }

    override getConnectionCount(): number {
        return this.clients.size;
    }
}