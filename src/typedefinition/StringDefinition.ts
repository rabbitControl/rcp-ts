import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { writeLongString } from '../Utils';
import { RcpTypes, LongString } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';

export class StringDefinition extends DefaultDefinition<string> {
    
    static readonly allOptions: Map<number, boolean> = new Map().
                    set(RcpTypes.StringOptions.DEFAULT, true).
                    set(RcpTypes.StringOptions.REGULAR_EXPRESSION, true);

    private _regex?: string;

    constructor() {
        super(RcpTypes.Datatype.STRING);
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof StringDefinition) {

            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }

            if (typedefinition._regex !== undefined) {
                this._regex = typedefinition._regex;
                changed = true;
            }
        }

        return changed;
    }

    // override
    handleOption(optionId: number, io: KaitaiStream): boolean {
        
        switch (optionId) {
            case RcpTypes.StringOptions.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
            case RcpTypes.StringOptions.REGULAR_EXPRESSION:
                this._regex = this.readValue(io);
                return true;
        }

        return false;
    }

    // override
    readValue(io: KaitaiStream): string {
        return new LongString(io).data;
    }

    // override
    writeValue(buffer: Array<number>, value?: string) {
        if (value != undefined) {
            writeLongString(value, buffer);
        } else if (this._defaultValue) {
            writeLongString(this._defaultValue, buffer);
        } else {
            writeLongString("", buffer);
        }
            
    }

    // override
    getDefaultId(): number {
        return RcpTypes.StringOptions.DEFAULT;
    }

    // override
    getTypeDefault(): string {
        return "";
    }

    // override
    writeOptions(output: number[], all: boolean): void {

        let ch = this.changed;
        if (all) {
            ch = StringDefinition.allOptions;
        }

        ch.forEach((v, key) => {
            switch (key) {
                case RcpTypes.StringOptions.DEFAULT: {
                    output.push(RcpTypes.StringOptions.DEFAULT);
                    this.writeValue(output, this._defaultValue);
                    break;
                }

                case RcpTypes.StringOptions.REGULAR_EXPRESSION: {
                    output.push(RcpTypes.StringOptions.REGULAR_EXPRESSION);
                    if (this._regex) {
                        writeLongString(this._regex, output);
                    } else {
                        writeLongString("", output);
                    }
                    break;
                }
            }
        });

        if (!all) {
            this.changed.clear();
        }
    }

    // setter / getter
    set regex(regex: string | undefined) {

        if (this._regex === regex) {
            return;
        }

        this._regex = regex;
        this.changed.set(RcpTypes.StringOptions.REGULAR_EXPRESSION, true);
        this.setDirty();
    }

    get regex(): string | undefined {
        return this._regex;
    }
}