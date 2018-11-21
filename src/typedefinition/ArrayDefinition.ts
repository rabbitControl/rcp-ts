// import DefaultDefinition from "./DefaultDefinition";
// import RcpTypes from "../RcpTypes";
// import KaitaiStream from "../KaitaiStream";
// import { pushIn32ToArrayBe } from "../utils";

// export default class ArrayDefinition<T, E> extends DefaultDefinition<T> {

//     static readonly allOptions: Map<number, boolean> = new Map().
//                     set(RcpTypes.ArrayOptions.DEFAULT, true).
//                     set(RcpTypes.ArrayOptions.STRUCTURE, true)

//     elementType: DefaultDefinition<E>;
//     dimensions: number;
//     dimSizes: number[];

//     vuf: ArrayBufferView;



//     constructor() {
//         super(RcpTypes.Datatype.ARRAY);
//     }

//     // override
//     handleOption(optionId: number, io: KaitaiStream): boolean {

//         switch (optionId) {
//             case RcpTypes.ArrayOptions.DEFAULT:
//                 this._defaultValue = this.readValue(io)
//                 return true

//             case RcpTypes.ArrayOptions.STRUCTURE:
//                 return false;

//         }

//         return false
//     }

//     readToArray() {
        
//     }

    
//     intoarray(array: T, dim: number, io: KaitaiStream) {

//         if (dim >= this.dimSizes.length) {
//           return;
//         }
      
//         for (let i = 0; i < this.dimSizes[dim]; i++) {
      
//             if (dim == this.dimSizes.length-1) {
//                 array[i] = this.elementType.readValue(io);                        
//             } else {
//                 array[i] = [];
//                 this.intoarray(array[i], dim+1, io);
//             }
//         }
//     }

//     activator<T>(type: { new(): T ;} ): T {
//         // do stuff to return new instance of T.
//         return new type();
//     }

//     // override
//     readValue(io: KaitaiStream): T {

//         // rcp-array-data:
//         // rcp-array-structure <bytes>

//         // rcp-array-structure:
//         // dimension-count followed by elements per dimension

//         // 3 2 3 1 <data>
//         const dims = io.readS4be();
//         const dimSizes : number[] = [dims];
//         for (let i = 0; i < dims; i++) {
//             dimSizes[i] = io.readS4be();            
//         }

//         if ((this.dimensions == 0) && (this.dimSizes.length == 0)) {
//             this.dimensions = dims;
//             this.dimSizes = dimSizes;
//         }

//         if (this.dimensions != dims) {
//             // error!
//             console.error("dimension mismatch");
//         }

//         let array : T = [];
//         // create types at compile time in JS
//         // create instance with JS
//         this.intoarray(array, 0, io);

// // use buffer directly...
// // and put BufferViews on it
// // threejs has arrays? - use it?



//         return undefined;
//     }

//     // override
//     writeValue(value: T | null, buffer: Array<number>) {

//         if (value != null) {

//             // push num of dimensions
//             pushIn32ToArrayBe(this.dimensions, buffer);
//             // push size of dimensions
//             for (let i = 0; i < this.dimensions; i++) {
//                 pushIn32ToArrayBe(this.dimSizes[i], buffer);
//             }

//             // push data
//             // value.entries

            

//             buffer.push(value ? 1 : 0)
//         } else if (this._defaultValue) {
//             buffer.push(this._defaultValue ? 1 : 0)
//         } else {
//             buffer.push(0)
//         }
//     }

//     // override
//     getDefaultId(): number {
//         return RcpTypes.ArrayOptions.DEFAULT;
//     }

//     // override
//     getDefaultValue(): T | undefined {
//         return undefined;
//     }

//     // override
//     writeOptions(output: number[], all: boolean): void {

//         let ch = this.changed;
//         if (all) {
//             ch = ArrayDefinition.allOptions;
//         }

//         ch.forEach((v, key) => {
//             switch (key) {
//                 case RcpTypes.ArrayOptions.DEFAULT: {

//                     output.push(RcpTypes.ArrayOptions.DEFAULT);

//                     if (this._defaultValue) {
//                         this.writeValue(this._defaultValue, output);
//                     } else {
//                         this.writeValue(null, output);
//                     }
//                     break;
//                 }

//                 case RcpTypes.ArrayOptions.STRUCTURE: {

//                     output.push(RcpTypes.ArrayOptions.STRUCTURE);

//                     // if (this._regex) {
//                     //     writeLongString(this._regex, output)
//                     // } else {
//                     //     writeLongString("", output)
//                     // }
//                     break;
//                 }
//             }
//         });      

//         if (!all) {
//             this.changed.clear()
//         }
//     }

// }