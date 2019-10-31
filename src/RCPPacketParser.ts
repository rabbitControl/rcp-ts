import { Packet } from './Packet';
import { RcpTypes, TinyString } from './RcpTypes';
import KaitaiStream from './KaitaiStream';
import { ParameterManager } from './ParameterManager';
import { InfoData, parseInfoData } from './InfoData';
import { parseParameter, parseUpdateValue } from './RCPParameterParser';
import { parseIdData } from './IdData';
import { Client } from '.';

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
  
      if (io.isEof()) {
        // no terminator but out of data!
        if (packetCommandId === RcpTypes.Command.INFO) {
          // that is probably ok... 
          // versionData versus InfoData problem
          break;
        }

        // else: let it fail
        throw new Error("buffer underrun");
      }    

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
              // expect IdData
              if (packet.data) {
                throw new Error('packet already has data');
              }
              packet.data = parseIdData(io);
              break;

            case RcpTypes.Command.REMOVE:
              if (packet.data) {
                throw new Error('packet already has data');
              }

              if (Client.serverVersionGt("0.0.0")) {
                // for versions > 0.0.0 we expect IdData
                packet.data = parseIdData(io);
              } else {
                // older versions expects a parameter
                packet.data = parseParameter(io, manager);
              }
              break;
  
            case RcpTypes.Command.INFO:
              // expect InfoData
              if (packet.data) {
                throw new Error('packet already has data');
              }
              packet.data = parseInfoData(io);
              break;

            case RcpTypes.Command.UPDATE:
              // expect Parameter
              if (packet.data) {
                throw new Error('packet already has data');
              }
              packet.data = parseParameter(io, manager);
              break;

            case RcpTypes.Command.UPDATEVALUE:
              // never happens, updatevalue is handled above              
            case RcpTypes.Command.INVALID:
            default:
              break;
          }
          break;
      }
    }
  
    // if (!packet.data) {
    //   throw new Error("packet has not data");
    // }

    return packet;
  }