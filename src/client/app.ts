// src/app.ts

import { Client } from "../Client";
import { WebSocketClientTransporter } from "../WebSocketClientTransporter";


const transporter = new WebSocketClientTransporter
const client = new Client(transporter);

client.connect("127.0.0.1", 10000);