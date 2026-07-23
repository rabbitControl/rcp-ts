import { IpWidget } from './widget/IpWidget';
import { TableWidget } from './widget/TableWidget';
import { RadiobuttonWidget } from './widget/RadiobuttonWidget';
import { DropdownWidget } from './widget/DropdownWidget';
import { RangeWidget } from './widget/RangeWidget';
import { Slider2dWidget } from './widget/Slider2dWidget';
import { TabsWidget } from './widget/TabsWidget';
import { ListWidget } from './widget/ListWidget';
import KaitaiStream from './KaitaiStream';
import { Parameter } from './parameter/Parameter';
import { RcpTypes } from './RcpTypes';
import { Widget } from './widget/Widget';
import { CustomWidget } from './widget/CustomWidget';
import { DialWidget } from './widget/DialWidget';
import { SliderWidget } from './widget/SliderWidget';
import { TextboxWidget } from './widget/TextboxWidget';
import { InfoWidget } from './widget/InfoWidget';
import { PressWidget } from './widget/PressWidget';
import { DefaultWidget } from './widget/DefaultWidget';
import { NumberboxWidget } from './widget/NumberboxWidget';
import { ButtonWidget } from './widget/ButtonWidget';
import { SwitchWidget } from './widget/SwitchWidget';
import { CheckboxWidget } from './widget/CheckboxWidget';
import { ColorChooserWidget } from './widget/ColorChooserWidget';
import { UriWidget } from './widget/UriWidget';
import { ImageWidget } from './widget/ImageWidget';

export function parseWidget(io: KaitaiStream, parameter: Parameter): Widget {

    const widgetType = io.readU2be();
    
    const widget = createWidget(widgetType & ~0x8000);
    widget.parameter = parameter;

    if (!(widgetType & 0x8000))
    {
        widget.parseOptions(io);
    }
    
    return widget;
}

export function createWidget(type: number): Widget {
        
    switch (type) {
        case RcpTypes.Widgettype.DEFAULT:
            return new DefaultWidget();
        case RcpTypes.Widgettype.CUSTOM:
            return new CustomWidget();
        case RcpTypes.Widgettype.INFO:
            return new InfoWidget();
        case RcpTypes.Widgettype.TEXTBOX:
            return new TextboxWidget();
        case RcpTypes.Widgettype.BUTTON:
            return new ButtonWidget();
        case RcpTypes.Widgettype.SWITCH:
            return new SwitchWidget();
        case RcpTypes.Widgettype.CHECKBOX:
            return new CheckboxWidget();
        case RcpTypes.Widgettype.PRESS:
            return new PressWidget();
        case RcpTypes.Widgettype.NUMBERBOX:
            return new NumberboxWidget();
        case RcpTypes.Widgettype.DIAL:
            return new DialWidget();
        case RcpTypes.Widgettype.SLIDER:
            return new SliderWidget();
        case RcpTypes.Widgettype.SLIDER2D:
            return new Slider2dWidget();
        case RcpTypes.Widgettype.RANGE:
            return new RangeWidget();
        case RcpTypes.Widgettype.DROPDOWN:
            return new DropdownWidget();
        case RcpTypes.Widgettype.RADIOBUTTON:
            return new RadiobuttonWidget();
        case RcpTypes.Widgettype.COLORCHOOSER:
            return new ColorChooserWidget();
        case RcpTypes.Widgettype.TABLE:
            return new TableWidget();
        case RcpTypes.Widgettype.URI:
            return new UriWidget();
        case RcpTypes.Widgettype.IP:
            return new IpWidget();
        case RcpTypes.Widgettype.IMAGE:
            return new ImageWidget();
        // group widgets
        case RcpTypes.Widgettype.LIST:
            return new ListWidget();
        case RcpTypes.Widgettype.TABS:
            return new TabsWidget();

        default:
            break;
    }        

    throw new Error("could not create widget for type: " + type);
}