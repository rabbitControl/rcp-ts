import { Writeable } from '../Writeable';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { pushIn16ToArrayBe } from '../Utils';
import { Parameter } from '../parameter/Parameter';
import { RcpInt } from '../RcpInt';

export abstract class Widget implements Writeable {

    static readonly allOptions: Map<number, boolean> = new Map().        
        set(RcpTypes.WidgetOptions.LABEL_VISIBLE, true).
        set(RcpTypes.WidgetOptions.VALUE_VISIBLE, true).
        set(RcpTypes.WidgetOptions.NEEDS_CONFIRMATION, true).
        set(RcpTypes.WidgetOptions.USERDATA, true);

    static parse(io: KaitaiStream): Widget | undefined {
        // TODO
        return undefined;
    }

    //
    // mandatory    
    readonly widgetType: number;

    // options
    private _enabled?: boolean = true;
    private _labelVisible?: boolean = true;
    private _valueVisible?: boolean = true;
    private _needsConfirmation?: boolean = false;

    //
    changed: Map<number, boolean> = new Map();
    parameter?: Parameter;

    constructor(type: number) {
        this.widgetType = type;
    }

    abstract handleOption(optionId: number, io: KaitaiStream): boolean;

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

                // case RcpTypes.WidgetOptions.USERDATA: {
                //     break;
                // }

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

                    if (this._labelVisible != undefined) {
                        output.push(this._labelVisible ? 1 : 0);
                    } else {
                        output.push(1);
                    }
                    break;
                }

                case RcpTypes.WidgetOptions.VALUE_VISIBLE: {

                    if (this._valueVisible != undefined) {
                        output.push(this._valueVisible ? 1 : 0);
                    } else {
                        output.push(1);
                    }
                    break;
                }

                case RcpTypes.WidgetOptions.NEEDS_CONFIRMATION: {

                    if (this._needsConfirmation != undefined) {
                        output.push(this._needsConfirmation ? 1 : 0);
                    } else {
                        output.push(0);
                    }
                    break;
                }

                case RcpTypes.WidgetOptions.USERDATA: {

                    // TODO:
                    // if (this._needsConfirmation != undefined) {
                    //     output.push(this._needsConfirmation ? 1 : 0);
                    // } else {
                    //     output.push(0);
                    // }
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
    // TODO: userdata
}