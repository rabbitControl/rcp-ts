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