import { Widget } from './Widget';
import RcpTypes from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';

export class TextboxWidget extends Widget {

    private _multiline?: boolean;
    private _wordwrap?: boolean;
    private _password?: boolean;

    constructor() {
        super(RcpTypes.Widgettype.TEXTBOX);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        if (optionId === RcpTypes.TextboxOptions.MULTILINE) {
            this._multiline = io.readU1() > 0;
            return true;
        }

        if (optionId === RcpTypes.TextboxOptions.WORDWRAP) {
            this._wordwrap = io.readU1() > 0;
            return true;
        }

        if (optionId === RcpTypes.TextboxOptions.PASSWORD) {
            this._password = io.readU1() > 0;
            return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.TextboxOptions.MULTILINE)) {
            output.push(RcpTypes.TextboxOptions.MULTILINE);
            if (this._multiline) {
                output.push(this._multiline ? 1 : 0);
            } else {
                output.push(0);
            }
        }

        if (all || this.changed.has(RcpTypes.TextboxOptions.WORDWRAP)) {
            output.push(RcpTypes.TextboxOptions.WORDWRAP);
            if (this._wordwrap) {
                output.push(this._wordwrap ? 1 : 0);
            } else {
                output.push(0);
            }
        }

        if (all || this.changed.has(RcpTypes.TextboxOptions.PASSWORD)) {
            output.push(RcpTypes.TextboxOptions.PASSWORD);
            if (this._password) {
                output.push(this._password ? 1 : 0);
            } else {
                output.push(0);
            }
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
        this.changed.set(RcpTypes.TextboxOptions.MULTILINE, true);
        this.setDirty();
    }

    get multiline(): boolean | undefined {
        return this._multiline;
    }

    //--------------------------------
    // wordwrap
    set wordwrap(wordwrap: boolean | undefined) {

        if (this._wordwrap === wordwrap) {
            return;
        }

        this._wordwrap = wordwrap;
        this.changed.set(RcpTypes.TextboxOptions.WORDWRAP, true);
        this.setDirty();
    }

    get wordwrap(): boolean | undefined {
        return this._wordwrap;
    }

    //--------------------------------
    // password
    set password(password: boolean | undefined) {

        if (this._password === password) {
            return;
        }

        this._password = password;
        this.changed.set(RcpTypes.TextboxOptions.PASSWORD, true);
        this.setDirty();
    }

    get password(): boolean | undefined {
        return this._password;
    }
}