import { ValueParameter } from './ValueParameter';
import { ImageDefinition } from '../typedefinition/ImageDefinition';

export class ImageParameter extends ValueParameter<Uint8Array> {
    
    constructor(id: number) {
        super(id, new ImageDefinition());
    }

    setStringValue(value: string): boolean {    
        return false;
    }
}