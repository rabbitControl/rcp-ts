import { Parameter } from './Parameter';
import GroupDefinition from '../typedefinition/GroupDefinition';
import KaitaiStream from '../KaitaiStream';
import { pushIn16ToArrayBe } from '../Utils';
import RcpTypes from '../RcpTypes';

export class GroupParameter extends Parameter {

    public children: Parameter[] = [];

    constructor(id: number) {
        super(id, new GroupDefinition());
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    addChild(parameter: Parameter) {
        
        if (this.children.indexOf(parameter) >= 0) {
            return;
        }

        this.children.push(parameter);
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
