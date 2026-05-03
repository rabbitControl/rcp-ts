import { Parameter } from './Parameter';
import { BangDefinition } from '../typedefinition/BangDefinition';

/**
 * BangParameter without value
 */
export class BangParameter extends Parameter {

  onBang?: () => void;

  constructor(id: number) {
    super(id, new BangDefinition());
  }

  doBang() {
    this.setDirty();
  }

  bang() {
    if (this.onBang)
    {
      this.onBang();
    }
  }

  public setOnBang(cb: () => void)
  {
    this.onBang = cb;
  }

}