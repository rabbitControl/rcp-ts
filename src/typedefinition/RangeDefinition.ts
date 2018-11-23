import { DefaultDefinition } from './DefaultDefinition';
import { RcpTypes } from '../RcpTypes';
import KaitaiStream from '../KaitaiStream';
import { NumberDefinition } from './NumberDefinition';
import { createTypeDefinition } from '../RCPDefinitionFactory';

export class Range {

    value1: number;
    value2: number;

    constructor(v1: number, v2: number) {
        this.value1 = v1;        
        this.value2 = v2;
    }
}

export class RangeDefinition extends DefaultDefinition<Range> {

    elementType?: NumberDefinition;

    constructor() {
        super(RcpTypes.Datatype.RANGE);
    }

    readMandatory(io: KaitaiStream): void {

        // read mandatory data after typeid!
        const elementType = createTypeDefinition(io.readU1());
        elementType.readMandatory(io);

        // can we do this nicer?
        if (elementType instanceof NumberDefinition) {
            this.elementType = elementType as NumberDefinition;
        } else {
            throw Error("RangeDefinition: wrong element type: " + elementType.datatype);
        }
    }

    // override
    parseOptions(io: KaitaiStream) {

        if (!this.elementType) {
            throw new Error("cannot parse elementType options without elementType");
        }
        // first parse options for element type..
        this.elementType.parseOptions(io);

        // then parse own options
        super.parseOptions(io);
    }

    // override
    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch (optionId) {
            case RcpTypes.BooleanOptions.DEFAULT:
                this._defaultValue = this.readValue(io);
                return true;
        }

        return false;
    }

    readValue(io: KaitaiStream): Range {

        if (!this.elementType) {
            throw new Error('could not read from elementType');
        }

        return new Range(this.elementType.readValue(io), this.elementType.readValue(io));
    }

    writeValue(buffer: number[], value?: Range): void {

        if (!this.elementType) {
            throw new Error('could not write value without elementType');
        }

        if (value != undefined) {
            this.elementType.writeValue(buffer, value.value1);
            this.elementType.writeValue(buffer, value.value2);
        } else if (this._defaultValue) {
            this.elementType.writeValue(buffer, this._defaultValue.value1);
            this.elementType.writeValue(buffer, this._defaultValue.value2);
        } else {
            this.elementType.writeValue(buffer, undefined);
            this.elementType.writeValue(buffer, undefined);
        }
    }    
    
    getDefaultId(): number {
        return RcpTypes.RangeOptions.DEFAULT;
    }

    // override
    getTypeDefault(): Range {
        return new Range(0, 0);
    }

    // override
    writeMandatory(output: number[]) : void {

        if (!this.elementType) {
            throw new Error('RangeDefinition without elementType!');
        }

        output.push(this.elementType.datatype);
        this.elementType.writeMandatory(output);
    }

    writeOptions(output: number[], all: boolean): void {

        // first write options for element type
        if (!this.elementType) {
            throw new Error('RangeDefinition without elementType!');
        }
        this.elementType.writeOptions(output, all);
        output.push(RcpTypes.TERMINATOR);

        if (all || this.changed.has(RcpTypes.RangeOptions.DEFAULT)) {
            output.push(RcpTypes.RangeOptions.DEFAULT);
            this.writeValue(output, this._defaultValue);
        }

        if (!all) {
            this.changed.clear();
        }
    }
}