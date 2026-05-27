import { RcpServer } from '../RcpServer';
import { WebSocketServerTransporter } from '../WebsocketServerTransporter';

const server = new RcpServer("rcp-ts-server", "version 123");
const transporter = new WebSocketServerTransporter();
server.addTransporter(transporter);

const bangParameter = server.exposeBang("Bang");
bangParameter.description = "A Bang";
bangParameter.setOnBang(() => {
  console.log("BANG!");
});

const stringParameter = server.exposeString("String", "test string");
// stringParameter.description = "A string";

const floatParam = server.exposeFloat("Float", 3.1415);
// floatParam.description = "A float";

const boolParam = server.exposeBoolean("Bool", true);
// boolParam.description = "A Bool";

transporter.bind(10000);