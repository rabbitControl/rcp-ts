import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { RCPLanguageString } from '../RCPLanguageString';
import { NumberDefinition } from '../typedefinition/NumberDefinition';

export enum TrackFillMode {
    None = 0,
    Left,
    Center,
    Right
};

export class SliderWidget extends Widget {

    private _precision?: number;
    private _stepsizeMultiplier?: number;
    private _horizontal?: boolean;
    private _nanMeaning: RCPLanguageString = new RCPLanguageString();
    private _trackFillMode?: TrackFillMode;

    constructor() {
        super(RcpTypes.Widgettype.SLIDER);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch(optionId)
        {
            case RcpTypes.SliderWidgetOptions.PRECISION:
                this._precision = io.readU1();
                return true;

            case RcpTypes.SliderWidgetOptions.STEPSIZE_MULTIPLIER:
            {
                const param = this.parameter;
                if (param) {
                    const td = param.typeDefinition;
                    if (td instanceof NumberDefinition) {
                        this._stepsizeMultiplier = td.readValue(io);
                    } else {
                        throw new Error('slider widget with non-number-parameter: can not read stepsize!');
                    }
                    return true;
                }
                break;
            }

            case RcpTypes.SliderWidgetOptions.HORIZONTAL:
                this._horizontal = io.readU1() > 0;
                return true;

            case RcpTypes.SliderWidgetOptions.NAN_MEANING:
                this._nanMeaning.update(RCPLanguageString.parse(io));
                return true;

            case RcpTypes.SliderWidgetOptions.TRACKFILL_MODE:
                const mode = io.readU1();
                if (mode <= TrackFillMode.Right)
                {
                    this._trackFillMode = mode;                    
                }
                else
                {
                    console.warn("invalid value for TrackFillMode:", mode);
                }
                return true;
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.SliderWidgetOptions.PRECISION)) {
            output.push(RcpTypes.SliderWidgetOptions.PRECISION);
            if (this._precision) {
                output.push(this._precision);
            } else {
                output.push(3);
            }
        }

        if (all || this.changed.has(RcpTypes.SliderWidgetOptions.STEPSIZE_MULTIPLIER)) {            
            const param = this.parameter;
            if (param) {
                const td = param.typeDefinition;
                if (td instanceof NumberDefinition) {
                    output.push(RcpTypes.SliderWidgetOptions.STEPSIZE_MULTIPLIER);
                    td.writeValue(output, this._stepsizeMultiplier);                    
                } else {
                    throw new Error('numberbox widget with non-number-parameter: can not write stepsize multiplier!');
                } 
            }         
        }

        if (all || this.changed.has(RcpTypes.SliderWidgetOptions.HORIZONTAL)) {
            output.push(RcpTypes.SliderWidgetOptions.HORIZONTAL);
            if (this._horizontal) {
                output.push(this._horizontal ? 1 : 0);
            } else {
                output.push(0);
            }
        }

        if (all || this.changed.has(RcpTypes.SliderWidgetOptions.NAN_MEANING)) {
            output.push(RcpTypes.SliderWidgetOptions.NAN_MEANING);
            this._nanMeaning.write(output, all);
        }

        if (all || this.changed.has(RcpTypes.SliderWidgetOptions.TRACKFILL_MODE)) {
            output.push(RcpTypes.SliderWidgetOptions.TRACKFILL_MODE);
            if (this._trackFillMode)
            {
                output.push(this._trackFillMode);
            }
            else
            {
                output.push(0);
            }
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
        this.changed.set(RcpTypes.SliderWidgetOptions.PRECISION, true);
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
        this.changed.set(RcpTypes.SliderWidgetOptions.STEPSIZE_MULTIPLIER, true);
        this.setDirty();
    }

    get stepsizeMultiplier(): number | undefined {
        return this._stepsizeMultiplier;
    }

    //--------------------------------
    // horizontal
    set horizontal(horizontal: boolean | undefined) {

        if (this._horizontal === horizontal) {
            return;
        }

        this._horizontal = horizontal;
        this.changed.set(RcpTypes.SliderWidgetOptions.HORIZONTAL, true);
        this.setDirty();
    }

    get horizontal(): boolean | undefined {
        return this._horizontal;
    }

    //--------------------------------
    // nan meaning
    set nanMeaning(nanMeaning: string | undefined) {

        if (this._nanMeaning.setAnyLanguage(nanMeaning))
        {
            this.changed.set(RcpTypes.SliderWidgetOptions.NAN_MEANING, true);
            this.setDirty();
        }
    }

    // TODO: setting for other languages

    get nanMeaning(): string | undefined {
        return this._nanMeaning.anyLanguage();
    }

    //--------------------------------
    // track fill mode
    set trackFillMode(trackFillMode: TrackFillMode | undefined) {

        if (this._trackFillMode === trackFillMode) {
            return;
        }

        this._trackFillMode = trackFillMode;
        this.changed.set(RcpTypes.SliderWidgetOptions.TRACKFILL_MODE, true);
        this.setDirty();
    }

    // TODO: setting for other languages

    get trackFillMode(): TrackFillMode | undefined {
        return this._trackFillMode;
    }
}