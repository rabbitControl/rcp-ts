import { pushIn64ToArrayBe } from './Utils';
import { Writeable } from './Writeable';
import { RcpTypes } from './RcpTypes';
import { Parameter } from './parameter/Parameter';

export class Packet implements Writeable {

  readonly command: number;
  timestamp?: number;
  data?: Writeable;

  constructor(command: number) {
    this.command = command;
  }

  serialize(all: boolean): number[] {
    let data = new Array<number>();
    this.write(data, all);
    return data;
  }

  write(output: number[], all: boolean) {

    // push command
    output.push(this.command);

    if (this.command === RcpTypes.Command.UPDATEVALUE) {
      //
      if (this.data instanceof Parameter) {
        this.data.writeValueUpdate(output);
      } else {
        throw new Error("wrong data in updatevalue packet");
      }

    } else {
      // other command
      if (this.timestamp) {
        output.push(RcpTypes.PacketOptions.TIMESTAMP);
        pushIn64ToArrayBe(this.timestamp, output);
      }
  
      if (this.data) {      
        output.push(RcpTypes.PacketOptions.DATA);
        this.data.write(output, all);
      }

      output.push(RcpTypes.TERMINATOR);
    }
  }
}
