
class ByteHexMappings {
    byteToHex: string[] = [];
    hexToByte: { [hex: string]: number; } = {};

    constructor() {
        for (let i = 0; i < 256; i++) {
            this.byteToHex[i] = (i + 0x100).toString(16).substr(1);
            this.hexToByte[this.byteToHex[i]] = i;
        }
    }
}

const byteHexMappings = new ByteHexMappings();

export class UUID
{
    private _data: Uint8Array;

    constructor(data: Uint8Array)
    {
        this._data = data;
    }

    get data(): Uint8Array
    {
        return this._data;
    }

    set data(uuid: Uint8Array)
    {
        this._data = uuid;
    }

    toString() : string
    {
        if (this._data.byteLength < 16)
        {
            return "";
        }

        let i = 0;
        const bth = byteHexMappings.byteToHex;
        return  bth[this._data[i++]] + bth[this._data[i++]] +
                bth[this._data[i++]] + bth[this._data[i++]] + "-" +
                bth[this._data[i++]] + bth[this._data[i++]] + "-" +
                bth[this._data[i++]] + bth[this._data[i++]] + "-" +
                bth[this._data[i++]] + bth[this._data[i++]] + "-" +
                bth[this._data[i++]] + bth[this._data[i++]] +
                bth[this._data[i++]] + bth[this._data[i++]] +
                bth[this._data[i++]] + bth[this._data[i++]];
    }

    compare(uuid: string) : boolean
    {
        return this.toString().toUpperCase() === uuid.toUpperCase();
    }

    compareRaw(uuid: Uint8Array) : boolean
    {
        if (this._data == uuid)
        {
            return true;
        }

        if (this._data.byteLength !== uuid.byteLength)
        {
            return false;
        }

        for (var i = 0 ; i != this._data.byteLength ; i++)
        {
            if (this._data[i] != uuid[i]) return false;
        }

        return true;
    }
}