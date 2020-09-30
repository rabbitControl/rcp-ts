import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';

export class DirectorychooserWidget extends Widget {

    constructor() {
        super(RcpTypes.Widgettype.DIRECTORYCHOOSER);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    writeOptions(output: number[], all: boolean): void {}
}