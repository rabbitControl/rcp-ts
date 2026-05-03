import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';
import { RcpString } from '../RcpString';
import { RcpInt } from '../RcpInt';

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
                this._defaultValue = RcpString.parse(io).value;
                return true;
            case RcpTypes.StringOptions.REGULAR_EXPRESSION:
                this._regex = RcpString.parse(io).value;
                return true;
        }

        return false;
    }

    // override
    readValue(io: KaitaiStream): string {
        return RcpString.parse(io).value;
    }

    // override
    writeValue(buffer: Array<number>, value?: string) {
        new RcpString(value || (this._defaultValue || "")).write(buffer);
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

        const keys = Array.from(ch.keys());
        for (let i = 0; i < keys.length; i++)
        {
            const key = keys[i];

            if (key >= RcpTypes.StringOptions.DEFAULT &&
                    key <= RcpTypes.StringOptions.REGULAR_EXPRESSION)
            {
                // write options id
                output.push(key | ((i === keys.length-1) ? RcpInt.TERMINATOR : 0));
            }

            switch (key) {
                case RcpTypes.StringOptions.DEFAULT: {                    
                    new RcpString(this._defaultValue || "").write(output);
                    break;
                }

                case RcpTypes.StringOptions.REGULAR_EXPRESSION: {
                    new RcpString(this._regex || "").write(output);                    
                    break;
                }
            }
        };

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