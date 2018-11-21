import { pushIn64ToArrayBe } from './Utils';
import Writeable from './Writeable';
import RcpTypes from './RcpTypes';

export default class Packet implements Writeable {

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
