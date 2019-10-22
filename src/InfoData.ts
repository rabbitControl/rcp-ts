import { Writeable } from "./Writeable";
import { writeTinyString } from './Utils';
import { RcpTypes } from ".";
import KaitaiStream from "./KaitaiStream";
import { TinyString } from "./RcpTypes";

export class InfoData implements Writeable {

    version: string = "0.0.0";
    applicationid: string = "";

    constructor(version: string, applicationid: string) {
        this.version = version;
        this.applicationid = applicationid;
    }

    write(output: number[], all: boolean): void {
        
        // write mandatory
        writeTinyString(this.version, output);

        // write options
        if (this.applicationid && this.applicationid !== "") {
            output.push(RcpTypes.InfodataOptions.APPLICATIONID);
            writeTinyString(this.applicationid, output);
        }
    }
}


export function parseInfoData(io: KaitaiStream): InfoData {
    
    // get mandatory
    const version = new TinyString(io).data;
    let appid = "";

    // read options

    while (true) {
  
        let optionId = io.readU1();
    
        if (optionId === RcpTypes.TERMINATOR) {
          break;
        }
    
        switch (optionId) {
            case RcpTypes.InfodataOptions.APPLICATIONID:
                appid = new TinyString(io).data;
                break;
        }
    }

    return new InfoData(version, appid);
}