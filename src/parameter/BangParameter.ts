import { Parameter } from "./Parameter";
import BangDefinition from "../typedefinition/BangDefinition";
import { pushIn16ToArrayBe } from "../Utils";
import RcpTypes from "../RcpTypes";

/**
 * BangParameter without value
 */
export class BangParameter extends Parameter {

    constructor(id: number) {
      super(id, new BangDefinition());
    }
  
    handleOption(): boolean {
      return false;
    }

    doBang() {
      this.setDirty();
    }

    //------------------------------------
    //
    write(output: Array<number>, all: boolean): void {

      // write id
      pushIn16ToArrayBe(this.id, output);

      // typedefinition
      this.typeDefinition.write(output, all);

      // write options
      super.write(output, all);
      
      output.push(RcpTypes.TERMINATOR);
    }   
  }