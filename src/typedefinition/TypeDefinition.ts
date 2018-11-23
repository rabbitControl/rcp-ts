import { Writeable } from '../Writeable';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';

export abstract class TypeDefinition implements Writeable {

  static errorMessage = {
    invalidDefaultValue: 'Invalid defaultValue provided.',
  }

  //
  readonly datatype: number;

  constructor(datatype: number) {
    this.datatype = datatype;
  }

  abstract handleOption(optionId: number, io: KaitaiStream): boolean;

  readMandatory(io: KaitaiStream): void {
    // read mandatory data after typeid!    
  }

  parseOptions(io: KaitaiStream) {

    while (true) {
      // read option
      const optionId = io.readU1();

      if (optionId === RcpTypes.TERMINATOR) {
        break;
      }

      if (!this.handleOption(optionId, io)) {
        throw new Error("TypeDefinition option not handled: " + optionId);
      }
    }
  }

  abstract didChange() : boolean;
  abstract writeOptions(output: number[], all: boolean): void;

  // override to write mandatory data after datatype and before options
  writeMandatory(output: number[]) : void {}

  write(output: number[], all: boolean): void {
    // mandatory datatype
    output.push(this.datatype);

    // write mandatory beffore options
    this.writeMandatory(output);

    // write all options
    this.writeOptions(output, all);

    // mandatory terminator
    output.push(RcpTypes.TERMINATOR);
  }
}