import { DefaultDefinition } from './DefaultDefinition';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { pushIn32ToArrayBe } from '../Utils';
import { TypeDefinition } from './TypeDefinition';

function byteToHex(num: number): string {
    // Turns a number (0-255) into a 2-character hex number (00-ff);
    return ('0'+num.toString(16)).slice(-2);
}

function numToRGB(color: number): string {

    const r = color & 0xff;
    const g = (color >> 8) & 0xff;
    const b = (color >> 16) & 0xff;
    // const a = (color >> 24) & 0xff;

    return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
}

function numToRGBA(color: number): string {

    const r = color & 0xff;
    const g = (color >> 8) & 0xff;
    const b = (color >> 16) & 0xff;
    const a = (color >> 24) & 0xff;

    return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b) + byteToHex(a);
}

function RGBToNum(color: string): number {

    if (!color.startsWith("#")) {
        throw new Error(`not a valid color: ${color}`);
    }

    // make sure we have RGB colors
    while (color.length < 7) {
        color += "f";
    }

    const rpart = color.slice(1, 3);
    const gpart = color.slice(3, 5);
    const bpart = color.slice(5, 7);
  
    const r = parseInt(rpart, 16);
    const g = parseInt(gpart, 16);
    const b = parseInt(bpart, 16);
  
    return (r + (g << 8) + (b << 16));
}

function RGBAToNum(color: string): number {

    if (!color.startsWith("#")) {
        throw new Error(`not a valid color: ${color}`);
    }

    // make sure we have RGBA colors
    while (color.length < 9) {
        color += "f";
    }

    const rpart = color.slice(1, 3);
    const gpart = color.slice(3, 5);
    const bpart = color.slice(5, 7);
    const apart = color.slice(7, 9);
  
    const r = parseInt(rpart, 16);
    const g = parseInt(gpart, 16);
    const b = parseInt(bpart, 16);
    const a = parseInt(apart, 16);
  
    return (r + (g << 8) + (b << 16) + (a << 24));
}

abstract class ColorDefinition extends DefaultDefinition<string> {

    static readonly allOptions: Map<number, boolean> = new Map().
                            set(RcpTypes.ColorOptions.DEFAULT, true);

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.ColorOptions.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
        }

        return false;
    }

    getDefaultId(): number {
        return RcpTypes.ColorOptions.DEFAULT;
    }

    writeOptions(output: number[], all: boolean): void {
        
        if (all || this.changed.has(RcpTypes.ColorOptions.DEFAULT)) {

            output.push(RcpTypes.ColorOptions.DEFAULT);
            this.writeValue(output, this._defaultValue);            
        }

        if (!all) {
            this.changed.clear();
        }
    }
}


export class RGBADefinition extends ColorDefinition {

    constructor() {
        super(RcpTypes.Datatype.RGBA);
    }

    // override
    getTypeDefault(): string {
        return "#00000000";
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof RGBADefinition) {
            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }
        }

        return changed;
    }

    readValue(io: KaitaiStream): string {
        return numToRGBA(io.readU4be());
    }

    writeValue(buffer: number[], value?: string): void {

        if (value != undefined) {
            pushIn32ToArrayBe(RGBAToNum(value), buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(RGBAToNum(this._defaultValue), buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
        }
    }
}

export class RGBDefinition extends ColorDefinition {

    constructor() {
        super(RcpTypes.Datatype.RGB);
    }

    // override
    getTypeDefault(): string {
        return "#000000";
    }

    update(typedefinition: TypeDefinition): boolean {

        let changed = false;

        if (typedefinition instanceof RGBDefinition) {
            if (typedefinition._defaultValue !== undefined) {
                this._defaultValue = typedefinition._defaultValue;
                changed = true;
            }
        }

        return changed;
    }

    readValue(io: KaitaiStream): string {
        return numToRGB(io.readU4be());
    }

    writeValue(buffer: number[], value?: string): void {

        if (value != undefined) {
            pushIn32ToArrayBe(RGBToNum(value), buffer);
        } else if (this._defaultValue) {
            pushIn32ToArrayBe(RGBToNum(this._defaultValue), buffer);
        } else {
            pushIn32ToArrayBe(0, buffer);
        }
    }
}