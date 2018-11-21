import { Packet } from './Packet';
import { RcpTypes, TinyString } from './RcpTypes';
import KaitaiStream from './KaitaiStream';
import { ParameterManager } from './ParameterManager';
import { VersionData } from './VersionData';
import { parseParameter } from './RCPParameterParser';

export function parsePacket(io: KaitaiStream, manager: ParameterManager): Packet {
    // read command
    let commandId = io.readU1();
  
  
    if (commandId < RcpTypes.Command.INVALID || commandId > RcpTypes.Command.UPDATEVALUE) {
      throw new Error('no valid command when parsing packet');
    }
  
    let packet = new Packet(commandId);
  
    while (true) {
  
      let optionId = io.readU1();
  
      if (optionId === RcpTypes.TERMINATOR) {
        break;
      }
  
      switch (optionId) {
        case RcpTypes.PacketOptions.TIMESTAMP:
          packet.timestamp = io.readU8be();
          break;
  
        case RcpTypes.PacketOptions.DATA:
          // expect different data for different commands
          switch (packet.command) {
  
            case RcpTypes.Command.INITIALIZE:
            case RcpTypes.Command.DISCOVER:
              // expect 
              break;
  
            case RcpTypes.Command.VERSION:
              // version
              if (packet.data) {
                throw new Error('packet already has data');
              }
              packet.data = new VersionData(new TinyString(io).data);
              break;
  
            case RcpTypes.Command.UPDATE:
            case RcpTypes.Command.REMOVE:
              // expect Parameter
  
              if (packet.data) {
                throw new Error('packet already has data');
              }
  
              let parameter = parseParameter(io, manager);
              packet.data = parameter;
  
              break;
  
            case RcpTypes.Command.UPDATEVALUE:
              // special update value command
              break;
  
            case RcpTypes.Command.INVALID:
            default:
              break;
          }
          break;
      }
    }
  
    if (!packet.data) {
      throw new Error("packet has not data");
    }

    return packet;
  }