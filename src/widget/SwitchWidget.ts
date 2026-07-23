import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';

export class SwitchWidget extends Widget {

    private _labelOn: RCPLanguageString = new RCPLanguageString();    
    private _labelOff: RCPLanguageString = new RCPLanguageString();    

    constructor() {
        super(RcpTypes.Widgettype.SWITCH);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean
    {
        if (optionId === RcpTypes.SwitchWidgetOptions.SWITCH_LABEL_ON)
        {
            this._labelOn.update(RCPLanguageString.parse(io));
            return true;
        }
        
        if (optionId === RcpTypes.SwitchWidgetOptions.SWITCH_LABEL_OFF)
        {
            this._labelOff.update(RCPLanguageString.parse(io));
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void
    {
        if (all || this.changed.has(RcpTypes.SwitchWidgetOptions.SWITCH_LABEL_ON)) {
            output.push(RcpTypes.SwitchWidgetOptions.SWITCH_LABEL_ON);
            this._labelOn.write(output, all);
        }

        if (all || this.changed.has(RcpTypes.SwitchWidgetOptions.SWITCH_LABEL_OFF)) {
            output.push(RcpTypes.SwitchWidgetOptions.SWITCH_LABEL_OFF);
            this._labelOff.write(output, all);
        }
    }

    // TODO: setter and getter
}
