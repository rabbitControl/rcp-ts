import { ValueParameter } from "./ValueParameter";
import { IPv4 } from 'ip-num';
import IPv4Definition from "../typedefinition/IPv4Definition";

export class IPv4Parameter extends ValueParameter<IPv4> {

    constructor(id: number) {
        super(id, new IPv4Definition());
    }
    
    setStringValue(value: string): boolean {        
        // TODO
        return false;
    }
}