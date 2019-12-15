import { Parameter } from './Parameter';
import { BangDefinition } from '../typedefinition/BangDefinition';

/**
 * BangParameter without value
 */
export class BangParameter extends Parameter {

    constructor(id: number) {
      super(id, new BangDefinition());
    }

    doBang() {
      this.setDirty();
    }
  }