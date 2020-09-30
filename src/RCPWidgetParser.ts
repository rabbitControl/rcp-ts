import { IpWidget } from './widget/IpWidget';
import { DirectorychooserWidget } from './widget/DirectorychooserWidget';
import { FilechooserWidget } from './widget/FilechooserWidget';
import { TableWidget } from './widget/TableWidget';
import { ColorboxWidget } from './widget/ColorboxWidget';
import { RadiobuttonWidget } from './widget/RadiobuttonWidget';
import { DropdownWidget } from './widget/DropdownWidget';
import { RangeWidget } from './widget/RangeWidget';
import { Slider2dWidget } from './widget/Slider2dWidget';
import { TabsWidget } from './widget/TabsWidget';
import { ListPageWidget } from './widget/ListPageWidget';
import { ListWidget } from './widget/ListWidget';
import KaitaiStream from './KaitaiStream';
import { Parameter } from './parameter/Parameter';
import { RcpTypes } from './RcpTypes';
import { Widget } from './widget/Widget';
import { CustomWidget } from './widget/CustomWidget';
import { DialWidget } from './widget/DialWidget';
import { SliderWidget } from './widget/SliderWidget';
import { NumberboxWidget } from './widget/NumberboxWidget';
import { TextboxWidget } from './widget/TextboxWidget';
import { InfoWidget } from './widget/InfoWidget';
import { BangWidget } from './widget/BangWidget';
import { PressWidget } from './widget/PressWidget';
import { ToggleWidget } from './widget/ToggleWidget';
import { DefaultWidget } from './widget/DefaultWidget';

export function parseWidget(io: KaitaiStream, parameter: Parameter): Widget {

    const widgetType = io.readU2be();
    
    const widget = createWidget(widgetType);
    widget.parameter = parameter;
    widget.parseOptions(io);
    
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
        case RcpTypes.Widgettype.BANG:
            return new BangWidget();
        case RcpTypes.Widgettype.PRESS:
            return new PressWidget();
        case RcpTypes.Widgettype.TOGGLE:
            return new ToggleWidget();
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
        case RcpTypes.Widgettype.COLORBOX:
            return new ColorboxWidget();
        case RcpTypes.Widgettype.TABLE:
            return new TableWidget();
        case RcpTypes.Widgettype.FILECHOOSER:
            return new FilechooserWidget();
        case RcpTypes.Widgettype.DIRECTORYCHOOSER:
            return new DirectorychooserWidget();
        case RcpTypes.Widgettype.IP:
            return new IpWidget();
        // group widgets
        case RcpTypes.Widgettype.LIST:
            return new ListWidget();
        case RcpTypes.Widgettype.LISTPAGE:
            return new ListPageWidget();
        case RcpTypes.Widgettype.TABS:
            return new TabsWidget();

        default:
            break;
    }        

    throw new Error("could not create widget for type: " + type);
}