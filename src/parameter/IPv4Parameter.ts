import { ValueParameter } from "./ValueParameter";
import { IPv4 } from 'ip-num';
import { IPv4Definition } from "../typedefinition/IPv4Definition";

export class IPv4Parameter extends ValueParameter<IPv4> {

    constructor(id: number) {
        super(id, new IPv4Definition());
    }

    setStringValue(value: string): boolean {
        try {
            const new_value = new IPv4(value);
    
            if (new_value.toString() === value)
            {
                this._value = new_value;
                return true;
            }
            
            return false;
        }
        catch (error)
        {
            console.error(error);
            return false;
        }
    }
}