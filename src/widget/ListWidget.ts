import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';

export class ListWidget extends Widget {

    constructor() {
        super(RcpTypes.Widgettype.LIST);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {
        return false;
    }

    writeOptions(output: number[], all: boolean): void {}
}