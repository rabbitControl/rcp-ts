// import { Widget } from './Widget';
// import { RcpTypes } from '../RcpTypes';
// import KaitaiStream from '../KaitaiStream';
// import { NumberDefinition } from '../typedefinition/NumberDefinition';

// export class NumberboxWidget extends Widget {
    
//     private _precision?: number;
//     private _format?: number;
//     private _stepsize?: number;
//     private _cyclic?: boolean;

//     constructor() {
//         super(RcpTypes.Widgettype.NUMBERBOX);
//     }

//     handleOption(optionId: number, io: KaitaiStream): boolean {

//         switch(optionId) {
//             case RcpTypes.NumberboxWidgetOptions.PRECISION:
//                 this._precision = io.readU1();
//                 return true;
//             case RcpTypes.NumberboxWidgetOptions.FORMAT: {
//                 this._format = io.readU1();
//                 return true;
//             }
//             case RcpTypes.NumberboxWidgetOptions.STEPSIZE: {
                
//                 const param = this.parameter;
//                 if (param) {
//                     const td = param.typeDefinition;
//                     if (td instanceof NumberDefinition) {
//                         this._stepsize = td.readValue(io);
//                     } else {
//                         throw new Error('numberbox widget with non-number-parameter: can not read stepsize!');
//                     }
//                     return true;
//                 }
//             }

//             case RcpTypes.NumberboxWidgetOptions.CYCLIC:
//                 this._cyclic = io.readU1() > 0;
//                 return true;
//         }

//         return false;
//     }

//     writeOptions(output: number[], all: boolean): void {

//         if (all || this.changed.has(RcpTypes.NumberboxWidgetOptions.FORMAT)) {
//             output.push(RcpTypes.NumberboxWidgetOptions.FORMAT);
//             if (this._format) {
//                 output.push(this._format);
//             } else {
//                 output.push(RcpTypes.NumberboxFormat.DEC);
//             }
//         }

//         if (all || this.changed.has(RcpTypes.NumberboxWidgetOptions.PRECISION)) {
//             output.push(RcpTypes.NumberboxWidgetOptions.PRECISION);
//             if (this._precision) {
//                 output.push(this._precision);
//             } else {
//                 output.push(2);
//             }
//         }

//         if (all || this.changed.has(RcpTypes.NumberboxWidgetOptions.STEPSIZE)) {
//             output.push(RcpTypes.NumberboxWidgetOptions.STEPSIZE);

//             const param = this.parameter;
//             if (param) {
//                 const td = param.typeDefinition;
//                 if (td instanceof NumberDefinition) {
//                     td.writeValue(output, this._stepsize);                    
//                 } else {
//                     throw new Error('numberbox widget with non-number-parameter: can not write stepsize!');
//                 } 
//             }         
//         }

//         if (all || this.changed.has(RcpTypes.NumberboxWidgetOptions.CYCLIC)) {
//             output.push(RcpTypes.NumberboxWidgetOptions.CYCLIC);
//             if (this._cyclic) {
//                 output.push(this._cyclic ? 1 : 0);
//             } else {
//                 output.push(0);
//             }
//         }
//     }

//     // setter / getter

//     //--------------------------------
//     // precision
//     set precision(precision: number | undefined) {

//         if (this._precision === precision) {
//             return;
//         }

//         this._precision = precision;
//         this.changed.set(RcpTypes.NumberboxWidgetOptions.PRECISION, true);
//         this.setDirty();
//     }

//     get precision(): number | undefined {
//         return this._precision;
//     }

//     //--------------------------------
//     // format
//     set format(format: number | undefined) {

//         if (this._format === format) {
//             return;
//         }

//         this._format = format;
//         this.changed.set(RcpTypes.NumberboxWidgetOptions.FORMAT, true);
//         this.setDirty();
//     }

//     get format(): number | undefined {
//         return this._format;
//     }

//     //--------------------------------
//     // stepsize
//     set stepsize(stepsize: number | undefined) {

//         if (this._stepsize === stepsize) {
//             return;
//         }

//         this._stepsize = stepsize;
//         this.changed.set(RcpTypes.NumberboxWidgetOptions.STEPSIZE, true);
//         this.setDirty();
//     }

//     get stepsize(): number | undefined {
//         return this._stepsize;
//     }

//     //--------------------------------
//     // cyclic
//     set cyclic(cyclic: boolean | undefined) {

//         if (this._cyclic === cyclic) {
//             return;
//         }

//         this._cyclic = cyclic;
//         this.changed.set(RcpTypes.NumberboxWidgetOptions.CYCLIC, true);
//         this.setDirty();
//     }

//     get cyclic(): boolean | undefined {
//         return this._cyclic;
//     }

// }
