import KaitaiStream from "./KaitaiStream";
import { RcpInt } from "./RcpInt";
import { Writeable } from "./Writeable";

export class UserData implements Writeable {

  data: Uint8Array

  constructor(data: Uint8Array)
  {
    this.data = data;
  }

  w(): number[]
  {
    const out: number[] = [];
    this.write(out, true);
    return out;
  }

  write(output: number[], all: boolean): void {
    // write length as RcpInt
    new RcpInt(this.data.length).write(output);

    // append data
    output.push.apply(output, Array.from(this.data));
  }

  static parse(io: KaitaiStream) : UserData {
    // read size from stream
    const size = RcpInt.parse(io).value;

    // read size-amount of bytes
    return new UserData(io.readBytes(size));
  }

}