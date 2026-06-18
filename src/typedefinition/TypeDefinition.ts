import { Writeable } from '../Writeable';
import KaitaiStream from '../KaitaiStream';
import { RcpInt } from '../RcpInt';

export abstract class TypeDefinition implements Writeable {

  //
  readonly datatype: number;

  constructor(datatype: number) {
    this.datatype = datatype;
  }

  print() {
    console.log(`--- typedefinition: ${this.datatype}`);    
  };

  abstract handleOption(optionId: number, io: KaitaiStream): boolean;

  readMandatory(io: KaitaiStream): void {
    // read mandatory data after typeid!    
  }

  parseOptions(io: KaitaiStream) {

    while (true) {
      // read option
      const v = io.readU1();
      const optionId = v & ~RcpInt.TERMINATOR;

      if (!this.handleOption(optionId, io)) {
        throw new Error("TypeDefinition option not handled: " + optionId);
      }

      if (v & RcpInt.TERMINATOR)
      {
        break;
      }
    }
  }

  abstract didChange() : boolean;
  abstract writeOptions(output: number[], all: boolean): void;
  abstract update(typedefinition: TypeDefinition): boolean;

  // override to write mandatory data after datatype and before options
  writeMandatory(output: number[]) : void {}

  write(output: number[], all: boolean): void {
    // mandatory datatype    
    const no_options = true;
    output.push(this.datatype | (no_options ? RcpInt.TERMINATOR : 0));

    // write mandatory before options
    this.writeMandatory(output);

    // write all options
    // TODO: write options
    // this.writeOptions(output, all);
  }
}