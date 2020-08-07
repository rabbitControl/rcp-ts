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
        // unsupported widgets
        case RcpTypes.Widgettype.SLIDER2D:
        case RcpTypes.Widgettype.RANGE:
        case RcpTypes.Widgettype.DROPDOWN:
        case RcpTypes.Widgettype.RADIOBUTTON:
        case RcpTypes.Widgettype.COLORBOX:
        case RcpTypes.Widgettype.TABLE:
        case RcpTypes.Widgettype.FILECHOOSER:
        case RcpTypes.Widgettype.DIRECTORYCHOOSER:
        case RcpTypes.Widgettype.IP:
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