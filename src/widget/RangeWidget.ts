import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';
import { NumberDefinition } from '../typedefinition/NumberDefinition';

export class RangeWidget extends Widget {

    private _precision?: number;
    private _stepsizeMultiplier?: number;
    private _nanMeaning: RCPLanguageString = new RCPLanguageString();

    constructor() {
        super(RcpTypes.Widgettype.RANGE);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch(optionId) {
            case RcpTypes.RangeWidgetOptions.PRECISION:
                this._precision = io.readU1();
                return true;

            case RcpTypes.RangeWidgetOptions.STEPSIZE_MULTIPLIER: {
                
                const param = this.parameter;
                if (param) {
                    const td = param.typeDefinition;
                    if (td instanceof NumberDefinition) {
                        this._stepsizeMultiplier = td.readValue(io);
                    } else {
                        throw new Error('numberbox widget with non-number-parameter: can not read stepsize!');
                    }
                    return true;
                }
                break;
            }

            case RcpTypes.RangeWidgetOptions.NAN_MEANING:
                this._nanMeaning.update(RCPLanguageString.parse(io));
                return true;
        }
        
        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.RangeWidgetOptions.PRECISION)) {
            output.push(RcpTypes.RangeWidgetOptions.PRECISION);
            if (this._precision) {
                output.push(this._precision);
            } else {
                output.push(2);
            }
        }

        if (all || this.changed.has(RcpTypes.RangeWidgetOptions.STEPSIZE_MULTIPLIER)) {            
            const param = this.parameter;
            if (param) {
                const td = param.typeDefinition;
                if (td instanceof NumberDefinition) {
                    output.push(RcpTypes.RangeWidgetOptions.STEPSIZE_MULTIPLIER);
                    td.writeValue(output, this._stepsizeMultiplier);                    
                } else {
                    throw new Error('numberbox widget with non-number-parameter: can not write stepsize multiplier!');
                } 
            }         
        }

        if (all || this.changed.has(RcpTypes.RangeWidgetOptions.NAN_MEANING)) {
            output.push(RcpTypes.RangeWidgetOptions.NAN_MEANING);
            this._nanMeaning.write(output, all);
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
        this.changed.set(RcpTypes.RangeWidgetOptions.PRECISION, true);
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
        this.changed.set(RcpTypes.RangeWidgetOptions.STEPSIZE_MULTIPLIER, true);
        this.setDirty();
    }

    get stepsizeMultiplier(): number | undefined {
        return this._stepsizeMultiplier;
    }

    //--------------------------------
    // nan meaning
    set nanMeaning(nanMeaning: string | undefined) {

        if (this._nanMeaning.setAnyLanguage(nanMeaning))
        {
            this.changed.set(RcpTypes.RangeWidgetOptions.NAN_MEANING, true);
            this.setDirty();
        }
    }

    // TODO: setting for other languages

    get nanMeaning(): string | undefined {
        return this._nanMeaning.anyLanguage();
    }
}