import {TypeDefinition} from "./TypeDefinition";
import KaitaiStream from "../KaitaiStream";
import RcpTypes from "../RcpTypes";

/**
 * BangDefinition for BangParameter
 * has no value
 */
export default class BangDefinition extends TypeDefinition {
    constructor() {
      super(RcpTypes.Datatype.BANG);
    }
  
    handleOption(optionId: number, io: KaitaiStream): boolean {
      return false;
    }
  
    writeOptions(output: number[], all: boolean): void {}
  }