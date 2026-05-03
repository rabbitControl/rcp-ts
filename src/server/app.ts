import WebSocket from 'ws';
import KaitaiStream from '../KaitaiStream';
import { Packet } from '../Packet';
import { RcpTypes } from '../RcpTypes';
import { InfoData } from '../InfoData';
import { RcpVersion } from '../RcpVersion';
import { RcpInt } from '../RcpInt';
import { Parameter } from '../parameter/Parameter';
import { RcpServer } from '../RcpServer';

const wss = new WebSocket.Server({ port: 10000 });

const server_rcp_version = new RcpVersion(1, 0);
const server_handshake_version = new RcpVersion(1, 0);
const server_is_strict = true;

// global parameters
const parameters: Parameter[] = [];


const server = new RcpServer();


const bangParameter = server.exposeBang("Bang");
// bangParameter.description = "A Bang";
bangParameter.setOnBang(() => {
  console.log("BANG!");
});

const stringParameter = server.exposeString("String", "test string");
// stringParameter.description = "A string";

const floatParam = server.exposeFloat("Float", 3.1415);
// floatParam.description = "A float";

const boolParam = server.exposeBoolean("Bool", true);
// boolParam.description = "A Bool";


parameters.push(bangParameter);
parameters.push(stringParameter);
parameters.push(floatParam);
parameters.push(boolParam);


function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer 
{
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  if (arrayBuffer instanceof ArrayBuffer)
  {
    return arrayBuffer;
  }
  
  throw new Error("SharedArrayBuffer");  
}

wss.on('connection', (ws: WebSocket) =>
{
  console.log('New client connected');

  // ws.on('message', (message: string) => {
  //   console.log(`Received message: ${message}`);
  // });

  ws.on('message', (message: WebSocket.RawData) =>
  {
    if (message instanceof Buffer)
    {
      console.log("RAW", bufferToArrayBuffer(message));

      const io = new KaitaiStream(bufferToArrayBuffer(message), 0);

      const packet = Packet.parse(io, server);

      switch (packet.type) {

        case RcpTypes.PacketType.INFO:

          // send version info to client
          const versionPacket = new Packet(RcpTypes.PacketType.INFO);
              versionPacket.data = new InfoData(
            server_rcp_version,
            server_handshake_version,
            "rcp-ts-server",
            "0.0.0-demo"
          );

          ws.send(new Int8Array(versionPacket.serialize(false)));

          // analyze infodata from client
          const infoData = packet.data as InfoData;

          const client_version_str = infoData.version.toString() + " - " + infoData.handshakeVersion.toString();

          console.log("client app id:", infoData.applicationid);
          console.log("client app ver:", infoData.applicationversion);
          console.log("client:", client_version_str);

          // check version
          /*
          Compatibility between the server and a client is ensured
          if the server handshake-version is between the clients rcp-version
          and clients handshake-version (inclusive). See Protocol Flow for the
          version handshake and more details.
          */
          if (server_handshake_version.compare(infoData.version) <= 0 &&
            server_handshake_version.compare(infoData.handshakeVersion) >= 0) {

            console.log("VERSION OK - waiting for init");

            // waiting for init
          }
          else if (server_is_strict)
          {
            // version not ok and strict
            console.log("VERSION NOT OK - disconnect");
            ws.close();
          }
          else
          {
            // version is not ok, but server knows that it will be all right
            // waiting for init
          }

          break;


        case RcpTypes.PacketType.INITIALIZE:
        {
          // send init
          const versionPacket = new Packet(RcpTypes.PacketType.INITIALIZE);
          versionPacket.data = new RcpInt(parameters.length);
          ws.send(new Int8Array(versionPacket.serialize(false)));


          parameters.forEach( (parameter) => 
          {
            console.log("sending parameter:", parameter.id, ":", parameter.label);

            const parameterPacket = new Packet(RcpTypes.PacketType.UPDATE);
            parameterPacket.data = parameter;


            const data = new Uint8Array(parameterPacket.serialize(true));

            console.log("send data:", data);
            

            ws.send(data);
          });          
  
          break;
        }

        default:
          console.log("invalid packet type", packet.type);

          break;
      }
    }

  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});