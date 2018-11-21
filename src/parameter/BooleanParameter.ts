import BooleanDefinition from '../typedefinition/BooleanDefinition';
import { ValueParameter } from './ValueParameter';

export class BooleanParameter extends ValueParameter<boolean> {
    
    constructor(id: number) {
        super(id, new BooleanDefinition());
    }

    setStringValue(value: string): boolean {
        
        const num = parseInt(value);
        if (!isNaN(num)) {
            this.value = num > 0;
            return true;
        } else {
            switch(value.toLowerCase().trim()) {
                case "true": case "yes": this.value = true; return true;
                case "false": case "no": case null: this.value = false; return true;
            }
        }
        
        return false;
    }
}