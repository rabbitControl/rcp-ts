import { Widget } from './Widget';
import { RcpTypes, Userdata } from '../RcpTypes'
import KaitaiStream from '../KaitaiStream';
import { pushFloat32ToArrayBe, pushIn64ToArrayBe } from '../Utils';

export default class CustomWidget extends Widget {

    private _uuid?: Uint8Array;
    private _config?: Uint8Array; //??

    constructor() {
        super(RcpTypes.Widgettype.CUSTOM);
    }

    handleOption(optionId: number, io: KaitaiStream): boolean {

        switch(optionId) {
            case RcpTypes.CustomwidgetOptions.UUID: {
                // TODO!! -- UUID
                this._uuid = io.readBytes(16);
                console.log("custom widget: uuid: " + this._uuid);
                return true;
            }

            case RcpTypes.CustomwidgetOptions.CONFIG: {
                this._config = new Userdata(io).data
                console.log("custom widget: config: " + KaitaiStream.createStringFromArray(this._config));
                
                return true;
            }
        }

        return false;
    }

    writeOptions(output: number[], all: boolean): void {

        if (all || this.changed.has(RcpTypes.CustomwidgetOptions.UUID)) {
            output.push(RcpTypes.CustomwidgetOptions.UUID);
            if (this._uuid) {
                // 
                // 16 bytes
                this._uuid.forEach( (e) => {
                    output.push(e);
                });
            } else {
                pushIn64ToArrayBe(0, output);
                pushIn64ToArrayBe(0, output);
            }
        }
        
        if (all || this.changed.has(RcpTypes.CustomwidgetOptions.CONFIG)) {
            output.push(RcpTypes.CustomwidgetOptions.CONFIG);
            if (this._config) {
                pushFloat32ToArrayBe(this._config.length, output);
                this._config.forEach((e) => {
                    output.push(e);
                });
            } else {
                pushFloat32ToArrayBe(0, output);
            }
        }

    }

    // setter / getter

    //--------------------------------
    // uuid
    set uuid(uuid: Uint8Array | undefined) {

        if (this._uuid === uuid) {
            return;
        }

        if (!uuid || uuid.length !== 16) {
            return;
        }

        this._uuid = uuid;
        this.changed.set(RcpTypes.CustomwidgetOptions.UUID, true);
        this.setDirty();
    }

    get uuid(): Uint8Array | undefined {
        return this._uuid;
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