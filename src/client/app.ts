// src/app.ts

import { RcpClient } from "../RcpClient";
import { WebSocketClientTransporter } from "../WebSocketClientTransporter";


const transporter = new WebSocketClientTransporter
const client = new RcpClient(transporter);

client.connect("127.0.0.1", 10000);