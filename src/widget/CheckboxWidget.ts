import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';

export class CheckboxWidget extends Widget {

    private _indeterminate?: boolean;

    constructor() {
        super(RcpTypes.Widgettype.CHECKBOX);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean
    {
        if (optionId === RcpTypes.CheckboxWidgetOptions.INDETERMINATE)
        {
            this._indeterminate = io.readU1() > 0;
        }        

        return false;
    }

    writeOptions(output: number[], all: boolean): void
    {
        if (all || this.changed.has(RcpTypes.CheckboxWidgetOptions.INDETERMINATE)) {
            output.push(RcpTypes.CheckboxWidgetOptions.INDETERMINATE);
            if (this._indeterminate)
            {
                output.push(this._indeterminate ? 1 : 0);
            }
            else
            {
                output.push(0);
            }
        }
    }

    // TODO: setter and getter
}
