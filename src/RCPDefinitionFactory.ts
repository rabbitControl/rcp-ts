
import { RcpTypes } from './RcpTypes';
import { TypeDefinition } from './typedefinition/TypeDefinition';
import { BooleanDefinition } from './typedefinition/BooleanDefinition';
import { Int8Definition, Int16Definition, Int64Definition, Float32Definition, Float64Definition } from './typedefinition/NumberDefinition';
import { Int32Definition } from './typedefinition/Int32Definition';
import { StringDefinition } from './typedefinition/StringDefinition';
import { RGBDefinition, RGBADefinition } from './typedefinition/ColorDefinition';
import { EnumDefinition } from './typedefinition/EnumDefinition';
import { BangDefinition } from './typedefinition/BangDefinition';
import { GroupDefinition } from './typedefinition/GroupDefinition';
import { IPv4Definition } from './typedefinition/IPv4Definition';
import { IPv6Definition } from './typedefinition/IPv6Definition';
import { UriDefinition } from './typedefinition/UriDefinition';
import { Vector3F32Definition } from './typedefinition/Vector3Definitions';


export function createTypeDefinition(datatype: number): TypeDefinition {

    switch (datatype) {
        case RcpTypes.Datatype.CUSTOMTYPE:
            break;
        case RcpTypes.Datatype.BOOLEAN:
            return new BooleanDefinition();
        case RcpTypes.Datatype.INT8:
        case RcpTypes.Datatype.UINT8:
            return new Int8Definition();
        case RcpTypes.Datatype.INT16:
        case RcpTypes.Datatype.UINT16:
            return new Int16Definition();
        case RcpTypes.Datatype.INT32:
        case RcpTypes.Datatype.UINT32:
            return new Int32Definition();
        case RcpTypes.Datatype.INT64:
        case RcpTypes.Datatype.UINT64:
            return new Int64Definition();
        case RcpTypes.Datatype.FLOAT32:
            return new Float32Definition();
        case RcpTypes.Datatype.FLOAT64:
            return new Float64Definition();
        case RcpTypes.Datatype.VECTOR2I32:
        case RcpTypes.Datatype.VECTOR2F32:
        case RcpTypes.Datatype.VECTOR3I32:
            break;
        case RcpTypes.Datatype.VECTOR3F32:
            return new Vector3F32Definition();
        case RcpTypes.Datatype.VECTOR4I32:
        case RcpTypes.Datatype.VECTOR4F32:
            break;
        case RcpTypes.Datatype.STRING:
            return new StringDefinition();
        case RcpTypes.Datatype.RGB:
            return new RGBDefinition();
        case RcpTypes.Datatype.RGBA:
            return new RGBADefinition();
        case RcpTypes.Datatype.ENUM:
            return new EnumDefinition();
        case RcpTypes.Datatype.ARRAY:
        case RcpTypes.Datatype.LIST:
            break;
        case RcpTypes.Datatype.BANG:
            return new BangDefinition();
        case RcpTypes.Datatype.GROUP:
            return new GroupDefinition();
        case RcpTypes.Datatype.URI:
            return new UriDefinition();
        case RcpTypes.Datatype.IPV4:
            return new IPv4Definition();
        case RcpTypes.Datatype.IPV6:
            return new IPv6Definition();
        case RcpTypes.Datatype.RANGE:
            break;

        default:
            throw new Error('cannot create TypeDefinition for Datatype: ' + datatype);
    }

    throw new Error('cannot create TypeDefinition for Datatype: ' + datatype);
}


