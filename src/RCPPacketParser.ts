import { Packet } from './Packet';
import { RcpTypes, TinyString } from './RcpTypes';
import KaitaiStream from './KaitaiStream';
import { ParameterManager } from './ParameterManager';
import { VersionData } from './VersionData';
import { parseParameter, parseUpdateValue } from './RCPParameterParser';

export function parsePacket(io: KaitaiStream, manager: ParameterManager): Packet {

    // read packet command
    let packetCommandId = io.readU1();
  
  
    if (packetCommandId < RcpTypes.Command.INVALID || packetCommandId > RcpTypes.Command.UPDATEVALUE) {
      throw new Error('no valid command when parsing packet');
    }
  
    let packet = new Packet(packetCommandId);
  

    if (packet.command === RcpTypes.Command.UPDATEVALUE) {
      // no options
      packet.data = parseUpdateValue(io, manager);

      // check data inconsistency
      if (!io.isEof()) {
        // still data to read!
        throw new Error("updatevalue - leftover data");
      }

      return packet;
    }


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
  
              packet.data = parseParameter(io, manager);
              break;
  
            case RcpTypes.Command.UPDATEVALUE:
              throw new Error('invalid command: updatevalue');
  
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