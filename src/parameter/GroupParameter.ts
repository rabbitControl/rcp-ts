import { Parameter } from './Parameter';
import { GroupDefinition } from '../typedefinition/GroupDefinition';
import KaitaiStream from '../KaitaiStream';

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

    removeChild(parameter: Parameter) {

        const index = this.children.indexOf(parameter);

        if (index >= 0) {
            this.children.splice(index, 1);
        }
    }
}
