import { Parameter } from './Parameter';
import { BangDefinition } from '../typedefinition/BangDefinition';

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
  }