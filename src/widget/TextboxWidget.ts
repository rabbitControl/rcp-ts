import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';

export class TextboxWidget extends Widget {

    private _multiline?: boolean;
    private _password?: boolean;
    private _placeholder: RCPLanguageString = new RCPLanguageString();

    constructor() {
        super(RcpTypes.Widgettype.TEXTBOX);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.TextboxWidgetOptions.MULTILINE) {
            this._multiline = io.readU1() > 0;
            return true;
        }

        if (optionId === RcpTypes.TextboxWidgetOptions.PASSWORD) {
            this._password = io.readU1() > 0;
            return true;
        }

        if (optionId === RcpTypes.TextboxWidgetOptions.PLACEHOLDER) {
            this._placeholder.update(RCPLanguageString.parse(io));
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.TextboxWidgetOptions.MULTILINE)) {
            output.push(RcpTypes.TextboxWidgetOptions.MULTILINE);
            if (this._multiline) {
                output.push(this._multiline ? 1 : 0);
            } else {
                output.push(0);
            }
        }

        if (all || this.changed.has(RcpTypes.TextboxWidgetOptions.PASSWORD)) {
            output.push(RcpTypes.TextboxWidgetOptions.PASSWORD);
            if (this._password) {
                output.push(this._password ? 1 : 0);
            } else {
                output.push(0);
            }
        }

        if (all || this.changed.has(RcpTypes.TextboxWidgetOptions.PLACEHOLDER)) {
            output.push(RcpTypes.TextboxWidgetOptions.PASSWORD);
            this._placeholder.write(output, all);
        }
    }

    // setter / getter

    //--------------------------------
    // multiline
    set multiline(multiline: boolean | undefined) {

        if (this._multiline === multiline) {
            return;
        }

        this._multiline = multiline;
        this.changed.set(RcpTypes.TextboxWidgetOptions.MULTILINE, true);
        this.setDirty();
    }

    get multiline(): boolean | undefined {
        return this._multiline;
    }

    //--------------------------------
    // password
    set password(password: boolean | undefined) {

        if (this._password === password) {
            return;
        }

        this._password = password;
        this.changed.set(RcpTypes.TextboxWidgetOptions.PASSWORD, true);
        this.setDirty();
    }

    get password(): boolean | undefined {
        return this._password;
    }

    //--------------------------------
    // placeholder
    set placeholder(placeholder: string | undefined) {

        if (this._placeholder.setAnyLanguage(placeholder))
        {
            this.changed.set(RcpTypes.TextboxWidgetOptions.PLACEHOLDER, true);
            this.setDirty();
        }
    }

    // TODO: setting for other languages

    get placeholder(): string | undefined {
        return this._placeholder.anyLanguage();
    }
}