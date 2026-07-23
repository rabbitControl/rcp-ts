// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

export class RcpTypes {
  
  static EnumOptions = Object.freeze({
    DEFAULT: 48,
    ENTRIES: 49,
    MINIMUM_SELECTION_COUNT: 50,
    MAXIMUM_SELECTION_COUNT: 51,

    48: "DEFAULT",
    49: "ENTRIES",
    50: "MINIMUM_SELECTION_COUNT",
    51: "MAXIMUM_SELECTION_COUNT",
  });

  static TextboxWidgetOptions = Object.freeze({
    MULTILINE: 86,
    PASSWORD: 87,
    PLACEHOLDER: 88,

    86: "MULTILINE",
    87: "PASSWORD",
    88: "PLACEHOLDER",
  });

  static RgbOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static CustomtypeOptions = Object.freeze({
    DEFAULT: 48,
    TYPEID: 49,
    CONFIG: 50,

    48: "DEFAULT",
    49: "TYPEID",
    50: "CONFIG",
  });

  static WidgetOptions = Object.freeze({
    LABEL_VISIBLE: 81,
    VALUE_VISIBLE: 82,
    NEEDS_CONFIRMATION: 83,
    USERDATA: 84,

    81: "LABEL_VISIBLE",
    82: "VALUE_VISIBLE",
    83: "NEEDS_CONFIRMATION",
    84: "USERDATA",
  });

  static ClientStatus = Object.freeze({
    DISCONNECTED: 0,
    CONNECTED: 1,
    VERSION_MISSMATCH: 2,
    OK: 3,

    0: "DISCONNECTED",
    1: "CONNECTED",
    2: "VERSION_MISSMATCH",
    3: "OK",
  });

  static PacketType = Object.freeze({
    INFO: 1,
    INITIALIZE: 2,
    UPDATE: 3,
    UPDATEVALUE: 4,
    REMOVE: 5,

    1: "INFO",
    2: "INITIALIZE",
    3: "UPDATE",
    4: "UPDATEVALUE",
    5: "REMOVE",
  });

  static DialWidgetOptions = Object.freeze({
    PRECISION: 86,
    STEPSIZE_MULTIPLIER: 87,
    CYCLIC: 88,
    NAN_MEANING: 89,

    86: "PRECISION",
    87: "STEPSIZE_MULTIPLIER",
    88: "CYCLIC",
    89: "NAN_MEANING",
  });

  static ParameterOptions = Object.freeze({
    VALUE: 32,
    LABEL: 33,
    DESCRIPTION: 34,
    TAGS: 35,
    ORDER: 36,
    PARENTID: 37,
    WIDGET: 38,
    USERDATA: 39,
    USERID: 40,
    READONLY: 41,
    ENABLED: 42,

    32: "VALUE",
    33: "LABEL",
    34: "DESCRIPTION",
    35: "TAGS",
    36: "ORDER",
    37: "PARENTID",
    38: "WIDGET",
    39: "USERDATA",
    40: "USERID",
    41: "READONLY",
    42: "ENABLED",
  });

  static Ipv4Options = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static VectorOptions = Object.freeze({
    DEFAULT: 48,
    MINIMUM: 49,
    MAXIMUM: 50,
    MULTIPLEOF: 51,
    SCALE: 52,
    UNIT: 53,

    48: "DEFAULT",
    49: "MINIMUM",
    50: "MAXIMUM",
    51: "MULTIPLEOF",
    52: "SCALE",
    53: "UNIT",
  });

  static ImageOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static RangeWidgetOptions = Object.freeze({
    PRECISION: 86,
    STEPSIZE_MULTIPLIER: 87,
    NAN_MEANING: 88,

    86: "PRECISION",
    87: "STEPSIZE_MULTIPLIER",
    88: "NAN_MEANING",
  });

  static BooleanOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static Widgettype = Object.freeze({
    DEFAULT: 1,
    CUSTOM: 2,
    INFO: 16,
    TEXTBOX: 17,
    BUTTON: 18,
    SWITCH: 19,
    CHECKBOX: 20,
    PRESS: 21,
    NUMBERBOX: 22,
    DIAL: 23,
    SLIDER: 24,
    SLIDER2D: 25,
    RANGE: 26,
    DROPDOWN: 27,
    RADIOBUTTON: 28,
    COLORCHOOSER: 29,
    TABLE: 30,
    URI: 31,
    IP: 32,
    IMAGE: 33,
    LIST: 16384,
    TABS: 16385,

    1: "DEFAULT",
    2: "CUSTOM",
    16: "INFO",
    17: "TEXTBOX",
    18: "BUTTON",
    19: "SWITCH",
    20: "CHECKBOX",
    21: "PRESS",
    22: "NUMBERBOX",
    23: "DIAL",
    24: "SLIDER",
    25: "SLIDER2D",
    26: "RANGE",
    27: "DROPDOWN",
    28: "RADIOBUTTON",
    29: "COLORCHOOSER",
    30: "TABLE",
    31: "URI",
    32: "IP",
    33: "IMAGE",
    16384: "LIST",
    16385: "TABS",
  });

  static UriWidgetOptions = Object.freeze({
    PLACEHOLDER: 86,
    BUTTON_LABEL: 87,

    86: "PLACEHOLDER",
    87: "BUTTON_LABEL",
  });

  static TrackfillMode = Object.freeze({
    NONE: 0,
    LEFT: 1,
    CENTER: 2,
    RIGHT: 3,

    0: "NONE",
    1: "LEFT",
    2: "CENTER",
    3: "RIGHT",
  });

  static RgbaFloatOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static CheckboxWidgetOptions = Object.freeze({
    INDETERMINATE: 86,

    86: "INDETERMINATE",
  });

  static RgbaOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static RangeOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static UriOptions = Object.freeze({
    DEFAULT: 48,
    FILTER: 49,
    SCHEMA: 50,

    48: "DEFAULT",
    49: "FILTER",
    50: "SCHEMA",
  });

  static RgbFloatOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static ImageWidgetOptions = Object.freeze({
    OVERLAY_TEXT: 86,

    86: "OVERLAY_TEXT",
  });

  static StringOptions = Object.freeze({
    DEFAULT: 48,
    REGULAR_EXPRESSION: 49,

    48: "DEFAULT",
    49: "REGULAR_EXPRESSION",
  });

  static InfodataOptions = Object.freeze({
    APPLICATIONID: 26,
    APPLICATIONVERSION: 27,

    26: "APPLICATIONID",
    27: "APPLICATIONVERSION",
  });

  static ArrayOptions = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static Datatype = Object.freeze({
    CUSTOMTYPE: 1,
    BOOLEAN: 16,
    INT8: 17,
    UINT8: 18,
    INT16: 19,
    UINT16: 20,
    INT32: 21,
    UINT32: 22,
    INT64: 23,
    UINT64: 24,
    FLOAT32: 25,
    FLOAT64: 26,
    VECTOR2I32: 27,
    VECTOR2F32: 28,
    VECTOR3I32: 29,
    VECTOR3F32: 30,
    VECTOR4I32: 31,
    VECTOR4F32: 32,
    STRING: 33,
    RGB: 34,
    RGBA: 35,
    RGB_FLOAT: 36,
    RGBA_FLOAT: 37,
    ENUM: 38,
    ARRAY: 39,
    BANG: 40,
    GROUP: 41,
    URI: 42,
    IPV4: 43,
    IPV6: 44,
    RANGE: 45,
    IMAGE: 46,

    1: "CUSTOMTYPE",
    16: "BOOLEAN",
    17: "INT8",
    18: "UINT8",
    19: "INT16",
    20: "UINT16",
    21: "INT32",
    22: "UINT32",
    23: "INT64",
    24: "UINT64",
    25: "FLOAT32",
    26: "FLOAT64",
    27: "VECTOR2I32",
    28: "VECTOR2F32",
    29: "VECTOR3I32",
    30: "VECTOR3F32",
    31: "VECTOR4I32",
    32: "VECTOR4F32",
    33: "STRING",
    34: "RGB",
    35: "RGBA",
    36: "RGB_FLOAT",
    37: "RGBA_FLOAT",
    38: "ENUM",
    39: "ARRAY",
    40: "BANG",
    41: "GROUP",
    42: "URI",
    43: "IPV4",
    44: "IPV6",
    45: "RANGE",
    46: "IMAGE",
  });

  static NumberOptions = Object.freeze({
    DEFAULT: 48,
    MINIMUM: 49,
    MAXIMUM: 50,
    STEPSIZE: 51,
    UNIT: 52,

    48: "DEFAULT",
    49: "MINIMUM",
    50: "MAXIMUM",
    51: "STEPSIZE",
    52: "UNIT",
  });

  static Ipv6Options = Object.freeze({
    DEFAULT: 48,

    48: "DEFAULT",
  });

  static ButtonWidgetOptions = Object.freeze({
    BUTTON_LABEL: 86,
    TRIGGER_ON_UP: 87,

    86: "BUTTON_LABEL",
    87: "TRIGGER_ON_UP",
  });

  static SwitchWidgetOptions = Object.freeze({
    SWITCH_LABEL_ON: 86,
    SWITCH_LABEL_OFF: 87,

    86: "SWITCH_LABEL_ON",
    87: "SWITCH_LABEL_OFF",
  });

  static SliderWidgetOptions = Object.freeze({
    PRECISION: 86,
    STEPSIZE_MULTIPLIER: 87,
    HORIZONTAL: 88,
    NAN_MEANING: 89,
    TRACKFILL_MODE: 90,

    86: "PRECISION",
    87: "STEPSIZE_MULTIPLIER",
    88: "HORIZONTAL",
    89: "NAN_MEANING",
    90: "TRACKFILL_MODE",
  });

  static NumberboxWidgetOptions = Object.freeze({
    PRECISION: 86,
    STEPSIZE_MULTIPLIER: 87,
    CYCLIC: 88,
    NAN_MEANING: 89,

    86: "PRECISION",
    87: "STEPSIZE_MULTIPLIER",
    88: "CYCLIC",
    89: "NAN_MEANING",
  });

  static CustomwidgetOptions = Object.freeze({
    WIDGETID: 86,
    CONFIG: 87,

    86: "WIDGETID",
    87: "CONFIG",
  });

  static PressWidgetOptions = Object.freeze({
    PRESS_LABEL_ON: 86,
    PRESS_LABEL_OFF: 87,

    86: "PRESS_LABEL_ON",
    87: "PRESS_LABEL_OFF",
  });
    static Command: any;
}