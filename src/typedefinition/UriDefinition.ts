import { DefaultDefinition } from './DefaultDefinition';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { TypeDefinition } from './TypeDefinition';
import { RcpString } from '../RcpString';
import { RcpInt } from '../RcpInt';

export class UriDefinition extends DefaultDefinition<string> {
    
    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.UriOptions.DEFAULT, true).
                            set(RcpTypes.UriOptions.FILTER, true).
                            set(RcpTypes.UriOptions.SCHEMA, true);

    private _filter?: string;
    private _schema?: string;

    constructor() {
        super(RcpTypes.Datatype.URI);
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof UriDefinition) {
            
            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }

            if (typedefinition._filter !== undefined) {
                this._filter = typedefinition._filter;
                changed = true;
            }
            
            if (typedefinition._schema !== undefined) {
                this._schema = typedefinition._schema;
                changed = true;
            }            
        }

        return changed;
    }

    // override
    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.UriOptions.DEFAULT:
                this._defaultValue = RcpString.parse(io).value;
                return true;

            case RcpTypes.UriOptions.FILTER:
                this._filter = RcpString.parse(io).value;
                return true;

            case RcpTypes.UriOptions.SCHEMA:
                this._schema = RcpString.parse(io).value;
                return true;
        }

        return false;
    }

    // override
    readValue(io: KaitaiStream): string {
        return RcpString.parse(io).value;
    }

    // override
    writeValue(buffer: number[], value?: string): void {
        new RcpString(value || (this._defaultValue || "")).write(buffer);
    }
    
    // override
    getDefaultId(): number {
        return RcpTypes.UriOptions.DEFAULT;
    }

    // override
    getTypeDefault(): string {
        return "";
    }

    // override
    writeOptions(output: number[], all: boolean): void {

        let ch = this.changed;
        if (all) {
            ch = UriDefinition.allOptions;
        }
        
        const keys = Array.from(ch.keys());
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // write options id
            output.push(key | ((i === keys.length - 1) ? RcpInt.TERMINATOR : 0));

            switch(key) {
                case RcpTypes.UriOptions.DEFAULT: {
                    this.writeValue(output, this._defaultValue);                    
                    break;
                }

                case RcpTypes.UriOptions.FILTER: {
                    new RcpString(this._filter || "").write(output);                    
                    break;
                }

                case RcpTypes.UriOptions.SCHEMA: {
                    new RcpString(this._schema || "").write(output);                    
                    break;
                }
            }
        };

        if (!all) {
            this.changed.clear();
        }
    }

    // setter / getter

    //--------------------------------
    // filter
    set filter(filter: string | undefined) {
        if (this._filter === filter) {
            return;
        }

        this._filter = filter;
        this.changed.set(RcpTypes.UriOptions.FILTER, true);
        this.setDirty();
    }

    get filter(): string | undefined {
        return this._filter;
    }

    //--------------------------------
    // schema
    set schema(schema: string | undefined) {
        if (this._schema === schema) {
            return;
        }

        this._schema = schema;
        this.changed.set(RcpTypes.UriOptions.SCHEMA, true);
        this.setDirty();
    }

    get schema(): string | undefined {
        return this._schema;
    }
}