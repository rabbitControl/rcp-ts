import { Writeable } from '../Writeable';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { pushIn16ToArrayBe } from '../Utils';
import { Parameter } from '../parameter/Parameter';
import { RcpInt } from '../RcpInt';
import { UserData } from '../Userdata';

export abstract class Widget implements Writeable {

    static readonly allOptions: Map<number, boolean> = new Map().        
        set(RcpTypes.WidgetOptions.LABEL_VISIBLE, true).
        set(RcpTypes.WidgetOptions.VALUE_VISIBLE, true).
        set(RcpTypes.WidgetOptions.NEEDS_CONFIRMATION, true).
        set(RcpTypes.WidgetOptions.USERDATA, true);

    //
    // mandatory    
    readonly widgetType: number;

    // options
    private _labelVisible?: boolean = true;
    private _valueVisible?: boolean = true;
    private _needsConfirmation?: boolean = false;
    private _userdata?: UserData;

    //
    changed: Map<number, boolean> = new Map();
    parameter?: Parameter;

    constructor(type: number) {
        this.widgetType = type;
    }

    abstract handleOption(optionId: number, io: KaitaiStream): boolean;

    static widgetTypeToString(type: number): string {
        switch (type)
        {
            case 1: return "DEFAULT";
            case 2: return "CUSTOM";
            case 16: return "INFO";
            case 17: return "TEXTBOX";
            case 18: return "BUTTON";
            case 19: return "SWITCH";
            case 20: return "CHECKBOX";
            case 21: return "PRESS";
            case 22: return "NUMBERBOX";
            case 23: return "DIAL";
            case 24: return "SLIDER";
            case 25: return "SLIDER2D";
            case 26: return "RANGE";
            case 27: return "DROPDOWN";
            case 28: return "RADIOBUTTON";
            case 29: return "COLORCHOOSER";
            case 30: return "TABLE";
            case 31: return "URI";
            case 32: return "IP";
            case 33: return "IMAGE";
            case 16384: return "LIST";
            case 16385: return "TABS";

            default:
                return "Unknown widget";
        }
    }

    print() {
        console.log("-- widget:", Widget.widgetTypeToString(this.widgetType));

        if (this._labelVisible !== undefined)
        {
            console.log("--- label visible:", this._labelVisible);
        }
        if (this._valueVisible !== undefined)
        {
            console.log("--- value visible:", this._valueVisible);
        }
        if (this._needsConfirmation !== undefined)
        {
            console.log("--- needs confirmation:", this._needsConfirmation);
        }
        if (this._userdata !== undefined)
        {
            console.log("--- with userdata");
        }
    }

    parseOptions(io: KaitaiStream) {
        while (true) {
            // read option
            const v = io.readU1();
            const optionId = v & ~RcpInt.TERMINATOR;

            switch (optionId) {

                case RcpTypes.WidgetOptions.LABEL_VISIBLE: {
                    this._labelVisible = io.readU1() > 0;
                    break;
                }

                case RcpTypes.WidgetOptions.VALUE_VISIBLE: {
                    this._valueVisible = io.readU1() > 0;
                    break;
                }

                case RcpTypes.WidgetOptions.NEEDS_CONFIRMATION: {
                    this._needsConfirmation = io.readU1() > 0;
                    break;
                }

                case RcpTypes.WidgetOptions.USERDATA: {
                    this._userdata = UserData.parse(io);
                    break;
                }

                default:
                    if (!this.handleOption(optionId, io)) {
                        throw new Error('widget option not handled: ' + optionId);
                    }
            }

            if (v & RcpInt.TERMINATOR)
            {
                break;
            }
        }
    }

    abstract writeOptions(output: number[], all: boolean): void;

    write(output: number[], all: boolean): void {

        // write id
        pushIn16ToArrayBe(this.widgetType, output);

        let ch = this.changed;
        if (all) {
            ch = Widget.allOptions;
        }

        const keys = Array.from(ch.keys());
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // write options id
            output.push(key | ((i === keys.length - 1) ? RcpInt.TERMINATOR : 0));
        
            switch (key) {                

                case RcpTypes.WidgetOptions.LABEL_VISIBLE: {

                    if (this._labelVisible !== undefined) {
                        output.push(this._labelVisible ? 1 : 0);
                    } else {
                        output.push(1);
                    }
                    break;
                }

                case RcpTypes.WidgetOptions.VALUE_VISIBLE: {

                    if (this._valueVisible !== undefined) {
                        output.push(this._valueVisible ? 1 : 0);
                    } else {
                        output.push(1);
                    }
                    break;
                }

                case RcpTypes.WidgetOptions.NEEDS_CONFIRMATION: {

                    if (this._needsConfirmation !== undefined) {
                        output.push(this._needsConfirmation ? 1 : 0);
                    } else {
                        output.push(0);
                    }
                    break;
                }

                case RcpTypes.WidgetOptions.USERDATA: {

                    if (this._userdata !== undefined)
                    {
                        this._userdata.write(output, all);
                    }
                    else
                    {
                        output.push(RcpInt.TERMINATOR);
                    }
                    break;
                }
            }
        };

        // write other options
        this.writeOptions(output, all);

        // clear changes
        if (!all) {
            this.changed.clear();
        }
    }

    setDirty() {
        if (this.parameter) {
            this.parameter.setDirty();
        }
    }

    // setter / getter

    //--------------------------------
    // label-visible
    set labelVisible(visible: boolean | undefined) {

        if (this._labelVisible === visible) {
            return;
        }

        this._labelVisible = visible;
        this.changed.set(RcpTypes.WidgetOptions.LABEL_VISIBLE, true);
        this.setDirty();
    }

    get labelVisible(): boolean | undefined {
        return this._labelVisible;
    }

    //--------------------------------
    // label-visible
    set valueVisible(visible: boolean | undefined) {

        if (this._valueVisible === visible) {
            return;
        }

        this._valueVisible = visible;
        this.changed.set(RcpTypes.WidgetOptions.VALUE_VISIBLE, true);
        this.setDirty();
    }

    get valueVisible(): boolean | undefined {
        return this._valueVisible;
    }


    //--------------------------------
    // needs-confirmation
    set needsConfirmation(value: boolean | undefined) {

        if (this._needsConfirmation === value) {
            return;
        }

        this._needsConfirmation = value;
        this.changed.set(RcpTypes.WidgetOptions.NEEDS_CONFIRMATION, true);
        this.setDirty();
    }

    get needsConfirmation(): boolean | undefined {
        return this._needsConfirmation;
    }

    //--------------------------------
    // userdata
    set userdata(value: Uint8Array | undefined) {

        if (this._userdata?.data === value)
        {
            return;
        }

        if (value)
        {
            this._userdata = new UserData(value);            
        }
        else if (this._userdata !== undefined)
        {
            this.userdata = undefined;
        }

        this.changed.set(RcpTypes.WidgetOptions.USERDATA, true);
        this.setDirty();
    }

    get userdata(): Uint8Array | undefined
    {
        return this._userdata?.data;
    }
}