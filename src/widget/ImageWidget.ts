import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';

export class ImageWidget extends Widget {

    private _overlay: RCPLanguageString = new RCPLanguageString();      

    constructor() {
        super(RcpTypes.Widgettype.IMAGE);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.ImageWidgetOptions.OVERLAY_TEXT)
        {
            this._overlay.update(RCPLanguageString.parse(io));
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.ImageWidgetOptions.OVERLAY_TEXT)) {
            output.push(RcpTypes.ImageWidgetOptions.OVERLAY_TEXT);
            this._overlay.write(output, all);
        }
    }

    // TODO: getter / setter
}