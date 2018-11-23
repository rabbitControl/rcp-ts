import { DefaultDefinition } from './DefaultDefinition';
import { RcpTypes, LongString, TinyString } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { writeLongString, writeTinyString } from '../Utils';

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

    // override
    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.UriOptions.DEFAULT:
                this._defaultValue = new LongString(io).data;
                return true;

            case RcpTypes.UriOptions.FILTER:
                this._filter = new TinyString(io).data;
                return true;

            case RcpTypes.UriOptions.SCHEMA:
                this._schema = new TinyString(io).data;
                return true;
        }

        return false;
    }

    // override
    readValue(io: KaitaiStream): string {
        return new LongString(io).data;
    }

    // override
    writeValue(buffer: number[], value?: string): void {

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

        ch.forEach((v, key) => {
            switch(key) {
                case RcpTypes.UriOptions.DEFAULT: {
                    output.push(RcpTypes.UriOptions.DEFAULT);
                    this.writeValue(output, this._defaultValue);                    
                    break;
                }

                case RcpTypes.UriOptions.FILTER: {
                    output.push(RcpTypes.UriOptions.FILTER);
                    if (this._filter) {
                        writeTinyString(this._filter, output);
                    } else {
                        writeTinyString("", output);
                    }
                    break;
                }

                case RcpTypes.UriOptions.SCHEMA: {
                    output.push(RcpTypes.UriOptions.SCHEMA);
                    if (this._schema) {
                        writeTinyString(this._schema, output);
                    } else {
                        writeTinyString("", output);
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