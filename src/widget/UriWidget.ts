import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';

export class UriWidget extends Widget {

    private _placeholder: RCPLanguageString = new RCPLanguageString();    
    private _label: RCPLanguageString = new RCPLanguageString();    

    constructor() {
        super(RcpTypes.Widgettype.URI);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.UriWidgetOptions.PLACEHOLDER)
        {
            this._placeholder.update(RCPLanguageString.parse(io));
            return true;
        }

        if (optionId === RcpTypes.UriWidgetOptions.BUTTON_LABEL)
        {
            this._label.update(RCPLanguageString.parse(io));
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.UriWidgetOptions.PLACEHOLDER)) {
            output.push(RcpTypes.UriWidgetOptions.PLACEHOLDER);
            this._placeholder.write(output, all);
        }

        if (all || this.changed.has(RcpTypes.UriWidgetOptions.BUTTON_LABEL)) {
            output.push(RcpTypes.UriWidgetOptions.BUTTON_LABEL);
            this._label.write(output, all);
        }
    }

    // TODO: getter / setter
}