import { Parameter } from './parameter/Parameter';
import KaitaiStream from './KaitaiStream';
import { ParameterManager } from './ParameterManager';
import { BooleanParameter } from './parameter/BooleanParameter';
import { EnumParameter } from './parameter/EnumParameter';
import { GroupParameter } from './parameter/GroupParameter';
import { BangParameter } from './parameter/BangParameter';
import { RGBParameter, RGBAParameter } from './parameter/ColorParameter';
import { UriParameter } from './parameter/UriParameter';
import { IPv4Parameter } from './parameter/IPv4Parameter';
import { RangeParameter } from './parameter/RangeParameter';
import { StringParameter } from './parameter/StringParameter';
import { Int8Parameter, Int16Parameter, Int32Parameter, Int64Parameter, Float32Parameter, Float64Parameter } from './parameter/NumberParameter';
import { Vector3F32Parameter } from './parameter/Vector3Parameters';
import { RcpTypes } from './RcpTypes';

export function parseParameter(io: KaitaiStream, manager: ParameterManager): Parameter {

  // read parameter id
  let parameter_id = io.readS2be();
  let datatype = io.readU1();

  let parameter = null;
  parameter = createParameter(parameter_id, datatype);

  parameter.manager = manager;
  parameter.parseOptions(io);
  return parameter;
}


export function createParameter(id: number, datatype: number): Parameter {

  switch (datatype) {
      case RcpTypes.Datatype.CUSTOMTYPE:
          break;
      case RcpTypes.Datatype.BOOLEAN:
          return new BooleanParameter(id);
      case RcpTypes.Datatype.INT8:
      case RcpTypes.Datatype.UINT8:
          return new Int8Parameter(id);
      case RcpTypes.Datatype.INT16:
      case RcpTypes.Datatype.UINT16:
          return new Int16Parameter(id);
      case RcpTypes.Datatype.INT32:
      case RcpTypes.Datatype.UINT32:
          return new Int32Parameter(id);
      case RcpTypes.Datatype.INT64:
      case RcpTypes.Datatype.UINT64:
          return new Int64Parameter(id);
      case RcpTypes.Datatype.FLOAT32:
          return new Float32Parameter(id);
      case RcpTypes.Datatype.FLOAT64:
          return new Float64Parameter(id);
      case RcpTypes.Datatype.VECTOR2I32:
      case RcpTypes.Datatype.VECTOR2F32:
      case RcpTypes.Datatype.VECTOR3I32:
          break;
      case RcpTypes.Datatype.VECTOR3F32:
          return new Vector3F32Parameter(id);
      case RcpTypes.Datatype.VECTOR4I32:
      case RcpTypes.Datatype.VECTOR4F32:
          break;
      case RcpTypes.Datatype.STRING:
          return new StringParameter(id);
      case RcpTypes.Datatype.RGB:
          return new RGBParameter(id);
      case RcpTypes.Datatype.RGBA:
          return new RGBAParameter(id);
      case RcpTypes.Datatype.ENUM:
          return new EnumParameter(id);
      case RcpTypes.Datatype.ARRAY:
      case RcpTypes.Datatype.LIST:
          break;
      case RcpTypes.Datatype.BANG:
          return new BangParameter(id);
      case RcpTypes.Datatype.GROUP:
          return new GroupParameter(id);
      case RcpTypes.Datatype.URI:
          return new UriParameter(id);
      case RcpTypes.Datatype.IPV4:
          return new IPv4Parameter(id);
      case RcpTypes.Datatype.IPV6:
      case RcpTypes.Datatype.RANGE:
          return new RangeParameter(id);

      default:
          throw new Error('unknown Datatype: ' + datatype);
  }

  throw new Error('could not create Parameter: ' + datatype);
}
