import { RCP_LIBRARY_VERSION } from './version';
import { Client } from "./Client";

export function pushIn16ToArrayBe(num: number, array: Array<number>) {

  const dataview = new DataView(new Uint32Array([num]).buffer);
  array.push(dataview.getUint8(1));
  array.push(dataview.getUint8(0));
}

export function pushIn32ToArrayBe(num: number, array: Array<number>) {

  const dataview = new DataView(new Uint32Array([num]).buffer);
  array.push(dataview.getUint8(3));
  array.push(dataview.getUint8(2));
  array.push(dataview.getUint8(1));
  array.push(dataview.getUint8(0));
}

export function pushIn64ToArrayBe(num: number, array: Array<number>) {

  const dataview = new DataView(new Uint32Array([num]).buffer);
  array.push(dataview.getUint8(7));
  array.push(dataview.getUint8(6));
  array.push(dataview.getUint8(5));
  array.push(dataview.getUint8(4));
  array.push(dataview.getUint8(3));
  array.push(dataview.getUint8(2));
  array.push(dataview.getUint8(1));
  array.push(dataview.getUint8(0));
}

export function pushFloat64ToArrayBe(num: number, array: Array<number>) {

  // string length
  let arr = new Float64Array([num]);
  let dataview = new DataView(arr.buffer);
  array.push(dataview.getUint8(7));
  array.push(dataview.getUint8(6));
  array.push(dataview.getUint8(5));
  array.push(dataview.getUint8(4));
  array.push(dataview.getUint8(3));
  array.push(dataview.getUint8(2));
  array.push(dataview.getUint8(1));
  array.push(dataview.getUint8(0));
}

export function pushFloat32ToArrayBe(num: number, array: Array<number>) {

  // string length
  let arr = new Float32Array([num]);
  let dataview = new DataView(arr.buffer);
  array.push(dataview.getUint8(3));
  array.push(dataview.getUint8(2));
  array.push(dataview.getUint8(1));
  array.push(dataview.getUint8(0));
}


export function writeTinyString(str: string, array: Array<number>) {

  const enc = new TextEncoder();
  let stringarray = enc.encode(str);
  // let stringarray = new Array<number>().slice.call(enc.encode(str));


  if (stringarray.length > 255) {
    // TODO console.error('tiny string is too long');
    stringarray = stringarray.slice(1, 256);
  }
  
  // string length
  array.push(stringarray.length);
  
  // add array
  stringarray.forEach((element) => {
    array.push(element as number);
  });
}

export function writeShortString(str: string, array: Array<number>) {

  const enc = new TextEncoder();
  let stringarray = enc.encode(str);
  
  if (stringarray.length > 65535) {
    // TODO console.error('tiny string is too long');
    stringarray = stringarray.slice(1, 65536);
  }
  
  // string length
  pushIn16ToArrayBe(stringarray.length, array);
  
  // add array
  stringarray.forEach((element) => {
    array.push(element);
  });
}

export function writeLongString(str: string, array: Array<number>) {

  const enc = new TextEncoder();
  let stringarray = enc.encode(str);

  // check length?
  
  // string length
  pushIn32ToArrayBe(stringarray.length, array);
  
  // add array
  stringarray.forEach((element) => {
    array.push(element);
  });
}

export function rcpLogVersion()
{
  console.log(`rcp ts library version: ${RCP_LIBRARY_VERSION} implementing rcp version: ${Client.getRcpVersion()}`);  
}