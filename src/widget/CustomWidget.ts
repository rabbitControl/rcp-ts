import { Widget } from './Widget';
import { RcpTypes } from '../RcpTypes'
import KaitaiStream from '../KaitaiStream';
import { pushFloat32ToArrayBe, pushIn64ToArrayBe } from '../Utils';
import { RcpInt } from '../RcpInt';
import { UserData } from '../Userdata';

export class CustomWidget extends Widget {

    private _widgetid?: number;
    private _config?: Uint8Array; //??

    constructor() {
        super(RcpTypes.Widgettype.CUSTOM);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch(optionId) {
            case RcpTypes.CustomwidgetOptions.WIDGETID: {
                this._widgetid = RcpInt.parse(io).value;
                console.log("custom widget: widgetid: " + this._widgetid);
                return true;
            }

            case RcpTypes.CustomwidgetOptions.CONFIG: {
                this._config = UserData.parse(io).data
                console.log("custom widget: config: " + KaitaiStream.createStringFromArray(this._config));
                
                return true;
            }
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.CustomwidgetOptions.WIDGETID)) {
            output.push(RcpTypes.CustomwidgetOptions.WIDGETID);
            new RcpInt(this._widgetid || 0).write(output)            
        }
        
        if (all || this.changed.has(RcpTypes.CustomwidgetOptions.CONFIG)) {
            output.push(RcpTypes.CustomwidgetOptions.CONFIG);
            if (this._config) {
                new UserData(this._config).write(output, all);                
            } else {
                new RcpInt(0).write(output);
            }
        }

    }

    // setter / getter

    //--------------------------------
    // uuid
    set widgetid(widgetid: number | undefined)
    {
        if (this._widgetid === widgetid) {
            return;
        }

        this._widgetid = widgetid;
        this.changed.set(RcpTypes.CustomwidgetOptions.WIDGETID, true);
        this.setDirty();
    }

    get widgetid(): number | undefined {
        return this._widgetid;
    }

    //--------------------------------
    // config
    set config(config: any) {

        if (this._config === config) {
            return;
        }

        this._config = config;
        this.changed.set(RcpTypes.CustomwidgetOptions.CONFIG, true);
        this.setDirty();
    }

    get config(): any {
        return this._config;
    }

}