import { RcpClient } from "./RcpClient";

export const RCP_LIBRARY_VERSION = "1.0.0";

export function rcpLogVersion()
{
  console.log(`rcp ts library version: ${RCP_LIBRARY_VERSION} implementing rcp version: ${RcpClient.getRcpVersion()}`);  
}