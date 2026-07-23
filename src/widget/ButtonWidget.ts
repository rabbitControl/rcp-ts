import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';

export class ButtonWidget extends Widget {

    private _valueLabel: RCPLanguageString = new RCPLanguageString();    
    private _triggerOnUp?: boolean;

    constructor() {
        super(RcpTypes.Widgettype.BUTTON);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean
    {
        if (optionId === RcpTypes.ButtonWidgetOptions.BUTTON_LABEL)
        {
            this._valueLabel.update(RCPLanguageString.parse(io));
        }
        else if (optionId === RcpTypes.ButtonWidgetOptions.TRIGGER_ON_UP)
        {
            this._triggerOnUp = io.readU1() > 0;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void
    {
        if (all || this.changed.has(RcpTypes.ButtonWidgetOptions.BUTTON_LABEL)) {
            output.push(RcpTypes.ButtonWidgetOptions.BUTTON_LABEL);
            this._valueLabel.write(output, all);
        }

        if (all || this.changed.has(RcpTypes.ButtonWidgetOptions.TRIGGER_ON_UP)) {
            output.push(RcpTypes.ButtonWidgetOptions.TRIGGER_ON_UP);
            if (this._triggerOnUp) {
                output.push(this._triggerOnUp ? 1 : 0);
            } else {
                output.push(0);
            }
        }
    }

    // TODO: setter and getter
}
