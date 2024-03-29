import { DefaultDefinition } from './DefaultDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes, TinyString } from '../RcpTypes';
import { writeTinyString } from '../Utils';
import { TypeDefinition } from './TypeDefinition';

export class EnumDefinition extends DefaultDefinition<string> {
    
    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.EnumOptions.DEFAULT, true).
                            set(RcpTypes.EnumOptions.ENTRIES, true).
                            set(RcpTypes.EnumOptions.MULTISELECT, true);

    private _entries?: string[];
    private _multiselect?: boolean;

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

            if (typedefinition._multiselect !== undefined) {
                this._multiselect = typedefinition._multiselect;
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
                    const entry = new TinyString(io).data;
                    if (entry.length == 0 || entry === "") {
                        break;
                    }

                    this._entries.push(entry);
                }
                return true;
                
            case RcpTypes.EnumOptions.MULTISELECT:
                this._multiselect = io.readU1() > 0
                return true;
        }

        return false;
    }

    readValue(io: KaitaiStream): string {
        return new TinyString(io).data;
    }

    writeValue(buffer: Array<number>, value?: string) {

        if (value != undefined) {
            writeTinyString(value, buffer);
        } else if (this._defaultValue) {
            writeTinyString(this._defaultValue, buffer);
        } else {
            writeTinyString("", buffer);
        }
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

        ch.forEach((v, key) => {
            switch(key) {
                case RcpTypes.EnumOptions.DEFAULT: {                    
                    output.push(RcpTypes.EnumOptions.DEFAULT);
                    this.writeValue(output, this._defaultValue);
                    break;
                }

                case RcpTypes.EnumOptions.ENTRIES: {
                    output.push(RcpTypes.EnumOptions.ENTRIES);
                    if (this._entries) {
                        for (let i=0; i<this._entries.length; i++) {
                            writeTinyString(this._entries[i], output);
                        }                        
                    }
                    output.push(0);
                    break;
                }

                case RcpTypes.EnumOptions.MULTISELECT: {
                    output.push(RcpTypes.EnumOptions.MULTISELECT);
                    if (this._multiselect) {
                        output.push(this._multiselect ? 1 : 0);
                    } else {
                        output.push(0);
                    }
                    break;
                }
            }
        });
    
        if (!all) {
            this.changed.clear();
        }        
    }

    contains(value: string): boolean {        
        return this._entries && this._entries.indexOf(value) > -1;
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
    // multiselect
    set multiselect(multiselect: boolean | undefined) {

        if (this._multiselect === multiselect) {
            return;
        }

        this._multiselect = multiselect;
        this.changed.set(RcpTypes.EnumOptions.MULTISELECT, true);
        this.setDirty();
    }

    get multiselect(): boolean | undefined {
        return this._multiselect;
    }
}

