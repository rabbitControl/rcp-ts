import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { NumberDefinition } from '../typedefinition/NumberDefinition';
import { RCPLanguageString } from '../RCPLanguageString';

export class DialWidget extends Widget {
    
    private _precision?: number;
    private _stepsizeMultiplier?: number;
    private _cyclic?: boolean;
    private _anyNanMeaning: RCPLanguageString = new RCPLanguageString();

    constructor() {
        super(RcpTypes.Widgettype.DIAL);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch(optionId) {
            case RcpTypes.DialWidgetOptions.PRECISION:
                this._precision = io.readU1();
                return true;

            case RcpTypes.DialWidgetOptions.STEPSIZE_MULTIPLIER: {
                
                const param = this.parameter;
                if (param) {
                    const td = param.typeDefinition;
                    if (td instanceof NumberDefinition) {
                        this._stepsizeMultiplier = td.readValue(io);
                    } else {
                        throw new Error('dial widget with non-number-parameter: can not read stepsize!');
                    }
                    return true;
                }
                break;
            }

            case RcpTypes.DialWidgetOptions.CYCLIC:
                this._cyclic = io.readU1() > 0;
                return true;

            case RcpTypes.DialWidgetOptions.NAN_MEANING:
                this._anyNanMeaning.update(RCPLanguageString.parse(io));
                return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.DialWidgetOptions.PRECISION)) {
            output.push(RcpTypes.DialWidgetOptions.PRECISION);
            if (this._precision) {
                output.push(this._precision);
            } else {
                output.push(2);
            }
        }

        if (all || this.changed.has(RcpTypes.DialWidgetOptions.STEPSIZE_MULTIPLIER)) {            
            const param = this.parameter;
            if (param) {
                const td = param.typeDefinition;
                if (td instanceof NumberDefinition) {
                    output.push(RcpTypes.DialWidgetOptions.STEPSIZE_MULTIPLIER);
                    td.writeValue(output, this._stepsizeMultiplier);                    
                } else {
                    throw new Error('dial widget with non-number-parameter: can not write stepsize multiplier!');
                } 
            }         
        }

        if (all || this.changed.has(RcpTypes.DialWidgetOptions.CYCLIC)) {
            output.push(RcpTypes.DialWidgetOptions.CYCLIC);
            if (this._cyclic) {
                output.push(this._cyclic ? 1 : 0);
            } else {
                output.push(0);
            }
        }

        if (all || this.changed.has(RcpTypes.DialWidgetOptions.NAN_MEANING)) {
            output.push(RcpTypes.DialWidgetOptions.NAN_MEANING);
            this._anyNanMeaning.write(output, all);
        }
    }

    // setter / getter

    //--------------------------------
    // precision
    set precision(precision: number | undefined) {

        if (this._precision === precision) {
            return;
        }

        this._precision = precision;
        this.changed.set(RcpTypes.DialWidgetOptions.PRECISION, true);
        this.setDirty();
    }

    get precision(): number | undefined {
        return this._precision;
    }

    //--------------------------------
    // stepsize multiplier
    set stepsizeMultiplier(stepsizeMultiplier: number | undefined) {

        if (this._stepsizeMultiplier === stepsizeMultiplier) {
            return;
        }

        this._stepsizeMultiplier = stepsizeMultiplier;
        this.changed.set(RcpTypes.DialWidgetOptions.STEPSIZE_MULTIPLIER, true);
        this.setDirty();
    }

    get stepsizeMultiplier(): number | undefined {
        return this._stepsizeMultiplier;
    }

    //--------------------------------
    // cyclic
    set cyclic(cyclic: boolean | undefined) {

        if (this._cyclic === cyclic) {
            return;
        }

        this._cyclic = cyclic;
        this.changed.set(RcpTypes.DialWidgetOptions.CYCLIC, true);
        this.setDirty();
    }

    get cyclic(): boolean | undefined {
        return this._cyclic;
    }

    //--------------------------------
    // nan meaning
    set nanMeaning(nanMeaning: string | undefined) {

        if (this._anyNanMeaning.setAnyLanguage(nanMeaning))
        {
            this.changed.set(RcpTypes.DialWidgetOptions.CYCLIC, true);
            this.setDirty();
        }
    }

    // TODO: setting for other languages

    get nanMeaning(): string | undefined {
        return this._anyNanMeaning.anyLanguage();
    }

}
