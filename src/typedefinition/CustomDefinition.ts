import { TypeDefinition } from './TypeDefinition';
import KaitaiStream from '../KaitaiStream';
import { RcpTypes } from '../RcpTypes';
import { UUID } from '../UUID';
import { DefaultDefinition } from './DefaultDefinition';
import { RcpInt } from '../RcpInt';

/**
 * CustomDefinition for CustomParameter
 * size: uint32 : mandatory
 * default: 'size' amount of bytes : optional
 * uuid: UUID (16 bytes) : optional (?)
 * config: 4-bytes prefixed bytearray : optional
 */
export class CustomDefinition extends DefaultDefinition<Uint8Array> {
    
    readValue(io: KaitaiStream): Uint8Array {
        return io.readBytes(this.size);
    }
    writeValue(buffer: Array<number>, value?: Uint8Array): void
    {
        if (value != undefined)
        {
            buffer.push(...Array.from(value));
        }
        else if (this._defaultValue)
        {
            buffer.push(...Array.from(this._defaultValue));
        }
        else
        {
            // TODO: is there a better way?
            for(var i=0; i<this.size; i++)
            {
                buffer.push(0);
            }
        }
    }
    getDefaultId(): number {
        return RcpTypes.CustomtypeOptions.DEFAULT;
    }
    getTypeDefault(): Uint8Array {
        return new Uint8Array();
    }

    private size: number = 0;
    private typeid?: number;
    private config?: Uint8Array;

    constructor() {
        super(RcpTypes.Datatype.CUSTOMTYPE);
    }

    readMandatory(io: KaitaiStream): void {
        // read size
        this.size = RcpInt.parse(io).value;
    }

    // implement
    didChange(): boolean {
        return false;
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId)
        {
            case RcpTypes.CustomtypeOptions.DEFAULT:
                if (this.size > 0)
                {
                    this.defaultValue = io.readBytes(this.size);
                }
                else
                {
                    this.defaultValue = undefined;
                }
                break;
            case RcpTypes.CustomtypeOptions.TYPEID:
                this.typeid = RcpInt.parse(io).value;
                break;
            case RcpTypes.CustomtypeOptions.CONFIG:
                {
                    const conf_size = RcpInt.parse(io).value;
                    this.config = io.readBytes(conf_size);
                    break;
                }
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void { }
    update(typedefinition: TypeDefinition): boolean { return false; }
}