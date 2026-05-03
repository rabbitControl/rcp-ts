import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';
import { TypeDefinition } from './TypeDefinition';
import { RcpString } from '../RcpString';
import { RcpInt } from '../RcpInt';

export class EnumDefinition extends DefaultDefinition<string> {
    
    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.EnumOptions.DEFAULT, true).
                            set(RcpTypes.EnumOptions.ENTRIES, true).
                            set(RcpTypes.EnumOptions.MAXIMUM_SELECTION_COUNT, true).
                            set(RcpTypes.EnumOptions.MINIMUM_SELECTION_COUNT, true);

    private _entries?: string[];
    private _maxSelectionCount?: number;
    private _minSelectionCount?: number;

    constructor() {
        super(RcpTypes.Datatype.ENUM);
    }


    update(typedefinition: TypeDefinition): boolean {

        let changed = false;
        
        if (typedefinition instanceof EnumDefinition) {

            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }

            if (typedefinition._entries !== undefined) {
                this._entries = typedefinition._entries;
                changed = true;
            }

            if (typedefinition._maxSelectionCount !== undefined) {
                this._maxSelectionCount = typedefinition._maxSelectionCount;
                changed = true;
            }
        }

        return changed;
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.EnumOptions.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;

            case RcpTypes.EnumOptions.ENTRIES:
                this._entries = [];

                while (true) {
                    const entry = RcpString.parse(io).value;
                    if (entry.length == 0 || entry === "") {
                        break;
                    }

                    this._entries.push(entry);
                }
                return true;
                
            case RcpTypes.EnumOptions.MAXIMUM_SELECTION_COUNT:
                this._maxSelectionCount = RcpInt.parse(io).value
                return true;

            case RcpTypes.EnumOptions.MINIMUM_SELECTION_COUNT:
                this._minSelectionCount = RcpInt.parse(io).value
                return true;
        }

        return false;
    }

    readValue(io: KaitaiStream): string {
        return RcpString.parse(io).value;
    }

    writeValue(buffer: Array<number>, value?: string) {
        new RcpString(value || (this._defaultValue || "")).write(buffer);
    }

    getDefaultId(): number {
        return RcpTypes.EnumOptions.DEFAULT;
    }

    // override
    getTypeDefault(): string {
        return this._entries ? this._entries[0] : "";
    }

    writeOptions(output: number[], all: boolean): void {

        let ch = this.changed;
        if (all) {
            ch = EnumDefinition.allOptions;
        }

        const keys = Array.from(ch.keys());
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // write options id
            output.push(key | ((i === keys.length - 1) ? RcpInt.TERMINATOR : 0));
        
            switch(key) {
                case RcpTypes.EnumOptions.DEFAULT: {
                    this.writeValue(output, this._defaultValue);
                    break;
                }

                case RcpTypes.EnumOptions.ENTRIES: {
                    this.entries?.forEach((entry => new RcpString(entry).write(output)));                    
                    output.push(0);
                    break;
                }

                case RcpTypes.EnumOptions.MAXIMUM_SELECTION_COUNT: {
                    new RcpInt(this._maxSelectionCount || 0).write(output);                    
                    break;
                }

                case RcpTypes.EnumOptions.MINIMUM_SELECTION_COUNT: {
                    new RcpInt(this._minSelectionCount || 0).write(output);                    
                    break;
                }
            }
        };
    
        if (!all) {
            this.changed.clear();
        }        
    }

    contains(value: string): boolean {        
        return this._entries != undefined && this._entries.indexOf(value) > -1;
    }

    // setter getter

    //--------------------------------
    // entries
    set entries(entries: string[] | undefined) {
        this._entries = entries;
        this.changed.set(RcpTypes.EnumOptions.ENTRIES, true);
        this.setDirty();
    }

    get entries(): string[] | undefined {
        return this._entries;
    }

    //--------------------------------
    // max selection count
    set maxSelectionCount(count: number | undefined) {

        if (this._maxSelectionCount === count) {
            return;
        }

        this._maxSelectionCount = count;
        this.changed.set(RcpTypes.EnumOptions.MAXIMUM_SELECTION_COUNT, true);
        this.setDirty();
    }

    get maxSelectionCount(): number | undefined {
        return this._maxSelectionCount;
    }

    //--------------------------------
    // min selection count
    set minSelectionCount(count: number | undefined) {

        if (this._minSelectionCount === count) {
            return;
        }

        this._minSelectionCount = count;
        this.changed.set(RcpTypes.EnumOptions.MINIMUM_SELECTION_COUNT, true);
        this.setDirty();
    }

    get minSelectionCount(): number | undefined {
        return this._minSelectionCount;
    }
}

