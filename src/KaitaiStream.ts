import { TextDecoder } from 'text-encoding';

class EOFError extends Error {

  bytesReq: number;
  bytesAvail: number;

  constructor(bytesReq: number, bytesAvail: number) {
    super();
    this.name = "EOFError";
    this.message = "requested " + bytesReq + " bytes, but only " + bytesAvail + " bytes available";
    this.bytesReq = bytesReq;
    this.bytesAvail = bytesAvail;
    this.stack = (new Error()).stack;
  }
}


class UnexpectedDataError extends Error {

  expected: Uint8Array;
  actual: Uint8Array;

  constructor(expected: Uint8Array, actual: Uint8Array) {
    super();
    this.name = "UnexpectedDataError";
    this.message = "expected [" + expected + "], but got [" + actual + "]";
    this.expected = expected;
    this.actual = actual;
    this.stack = (new Error()).stack;
  }
}


  /**
KaitaiStream is an implementation of Kaitai Struct API for JavaScript.
Based on DataStream - https://github.com/kig/DataStream.js

@param {ArrayBuffer} arrayBuffer ArrayBuffer to read from.
@param {?Number} byteOffset Offset from arrayBuffer beginning for the KaitaiStream.
*/

export default class KaitaiStream {

  _byteOffset: number;
  pos: number = 0;
  _buffer: ArrayBuffer;
  _dataView: DataView;
  bits: number = 0;
  bitsLeft: number = 0;

  /**
  Virtual byte length of the KaitaiStream backing buffer.
  Updated to be max of original buffer size and last written size.
  If dynamicSize is false is set to buffer size.
  @type {number}
  */
   _byteLength: number = 0;

  constructor(arrayBuffer: ArrayBuffer, byteOffset: number) {

    this._byteOffset = byteOffset || 0;

    if (arrayBuffer instanceof ArrayBuffer) {
      // this.buffer = arrayBuffer
      this._buffer = arrayBuffer;
      this._dataView = new DataView(this._buffer, this._byteOffset);
      this._byteLength = this._buffer.byteLength;

    } else if (typeof arrayBuffer === "object") {    
      throw new Error("arrayBuffer === 'object'");
      // this.dataView = arrayBuffer
      // if (byteOffset) {
      //   this._byteOffset += byteOffset
      // }
    } else {
      // this.buffer = new ArrayBuffer(arrayBuffer || 1);
      this._buffer = new ArrayBuffer(arrayBuffer || 1);
      this._dataView = new DataView(this._buffer, this._byteOffset);
      this._byteLength = this._buffer.byteLength;
    }

    this.pos = 0;
    this.alignToByte();
  }

  // /**
  // Dependency configuration data. Holds urls for (optional) dynamic loading
  // of code dependencies from a remote server. For use by (static) processing functions.

  // Caller should the supported keys to the asset urls as needed.
  // NOTE: `depUrls` is a static property of KaitaiStream (the factory),like the various
  //       processing functions. It is NOT part of the prototype of instances.
  // @type {Object}
  // */
  // static depUrls = {
  //   // processZlib uses this and expected a link to a copy of pako.
  //   // specifically the pako_inflate.min.js script at:
  //   // https://raw.githubusercontent.com/nodeca/pako/master/dist/pako_inflate.min.js
  //   zlib: undefined
  // }

  /**
  Set/get the backing ArrayBuffer of the KaitaiStream object.
  The setter updates the DataView to point to the new buffer.
  @type {Object}
  */
  get buffer() {
    this._trimAlloc();
    return this._buffer;
  }
  set buffer(v) {
    this._buffer = v;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  /**
  Set/get the byteOffset of the KaitaiStream object.
  The setter updates the DataView to point to the new byteOffset.
  @type {number}
  */
  get byteOffset() {
    return this._byteOffset;
  }

  set byteOffset(v) {
    this._byteOffset = v;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  /**
  Set/get the backing DataView of the KaitaiStream object.
  The setter updates the buffer and byteOffset to point to the DataView values.
  @type {Object}
  */
  get dataView() {
    return this._dataView;
  }

  set dataView(v) {
    this._byteOffset = v.byteOffset;
    this._buffer = v.buffer;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._byteOffset + v.byteLength;
  }

  /**
  Internal function to trim the KaitaiStream buffer when required.
  Used for stripping out the extra bytes from the backing buffer when
  the virtual byteLength is smaller than the buffer byteLength (happens after
  growing the buffer with writes and not filling the extra space completely).

  @return {null}
  */
  _trimAlloc() {
    if (this._byteLength == this._buffer.byteLength) {
      return;
    }
    let buf = new ArrayBuffer(this._byteLength);
    let dst = new Uint8Array(buf);
    let src = new Uint8Array(this._buffer, 0, dst.length);
    dst.set(src);
    this.buffer = buf;
  }

// ========================================================================
// Stream positioning
// ========================================================================

  /**
  Returns true if the KaitaiStream seek pointer is at the end of buffer and
  there's no more data to read.

  @return {boolean} True if the seek pointer is at the end of the buffer.
  */
  isEof(): boolean {
    return (this.pos >= this.size);
  }

  /**
    Sets the KaitaiStream read/write position to given position.
    Clamps between 0 and KaitaiStream length.

    @param {number} pos Position to seek to.
    @return {null}
    */
  seek(pos: number) {
    let npos = Math.max(0, Math.min(this.size, pos));
    this.pos = (isNaN(npos) || !isFinite(npos)) ? 0 : npos;
  }

  /**
    Returns the byte length of the KaitaiStream object.
    @type {number}
  */
  get size(): number {
    return this._byteLength - this._byteOffset;
  }

// ========================================================================
// Integer numbers
// ========================================================================

// ------------------------------------------------------------------------
// Signed
// ------------------------------------------------------------------------

  /**
    Reads an 8-bit signed int from the stream.
    @return {number} The read number.
  */
  readS1(): number {
    let v = this._dataView.getInt8(this.pos);
    this.pos += 1;
    return v;
  }
// ........................................................................
// Big-endian
// ........................................................................

  /**
    Reads a 16-bit big-endian signed int from the stream.
    @return {number} The read number.
  */
  readS2be(): number {
    let v = this._dataView.getInt16(this.pos);
    this.pos += 2;
    return v;
  }
  /**
    Reads a 32-bit big-endian signed int from the stream.
    @return {number} The read number.
  */
  readS4be(): number {
    let v = this._dataView.getInt32(this.pos);
    this.pos += 4;
    return v;
  }
  /**
    Reads a 64-bit big-endian unsigned int from the stream. Note that
    JavaScript does not support 64-bit integers natively, so it will
    automatically upgrade internal representation to use IEEE 754
    double precision float.
    @return {number} The read number.
  */
  readS8be(): number {
    let v1 = this.readU4be();
    let v2 = this.readU4be();

    if ((v1 & 0x80000000) != 0) {
      // negative number
      return -(0x100000000 * (v1 ^ 0xffffffff) + (v2 ^ 0xffffffff)) - 1;
    } else {
      return 0x100000000 * v1 + v2;
    }
  }

  // ........................................................................
  // Little-endian
  // ........................................................................

  /**
    Reads a 16-bit little-endian signed int from the stream.
    @return {number} The read number.
  */
  readS2le(): number {
    let v = this._dataView.getInt16(this.pos, true);
    this.pos += 2;
    return v;
  }

  /**
    Reads a 32-bit little-endian signed int from the stream.
    @return {number} The read number.
  */
  readS4le(): number {
    let v = this._dataView.getInt32(this.pos, true);
    this.pos += 4;
    return v;
  }

  /**
    Reads a 64-bit little-endian unsigned int from the stream. Note that
    JavaScript does not support 64-bit integers natively, so it will
    automatically upgrade internal representation to use IEEE 754
    double precision float.
    @return {number} The read number.
  */
  readS8le(): number {
    let v1 = this.readU4le();
    let v2 = this.readU4le();

    if ((v2 & 0x80000000) != 0) {
      // negative number
      return -(0x100000000 * (v2 ^ 0xffffffff) + (v1 ^ 0xffffffff)) - 1;
    } else {
      return 0x100000000 * v2 + v1;
    }
  }

  // ------------------------------------------------------------------------
  // Unsigned
  // ------------------------------------------------------------------------

  /**
    Reads an 8-bit unsigned int from the stream.
    @return {number} The read number.
  */
  readU1(): number {
    let v = this._dataView.getUint8(this.pos);
    this.pos += 1;
    return v;
  }

  // ........................................................................
  // Big-endian
  // ........................................................................

  /**
    Reads a 16-bit big-endian unsigned int from the stream.
    @return {number} The read number.
  */
  readU2be(): number {
    let v = this._dataView.getUint16(this.pos);
    this.pos += 2;
    return v;
  }

  /**
    Reads a 32-bit big-endian unsigned int from the stream.
    @return {number} The read number.
  */
  readU4be(): number {
    let v = this._dataView.getUint32(this.pos);
    this.pos += 4;
    return v;
  }

  /**
    Reads a 64-bit big-endian unsigned int from the stream. Note that
    JavaScript does not support 64-bit integers natively, so it will
    automatically upgrade internal representation to use IEEE 754
    double precision float.
    @return {number} The read number.
  */
  readU8be(): number {
    let v1 = this.readU4be();
    let v2 = this.readU4be();
    return 0x100000000 * v1 + v2;
  }

  // ........................................................................
  // Little-endian
  // ........................................................................

  /**
    Reads a 16-bit little-endian unsigned int from the stream.
    @return {number} The read number.
  */
  readU2le(): number {
    let v = this._dataView.getUint16(this.pos, true);
    this.pos += 2;
    return v;
  }

  /**
    Reads a 32-bit little-endian unsigned int from the stream.
    @return {number} The read number.
  */
  readU4le(): number {
    let v = this._dataView.getUint32(this.pos, true);
    this.pos += 4;
    return v;
  }

  /**
    Reads a 64-bit little-endian unsigned int from the stream. Note that
    JavaScript does not support 64-bit integers natively, so it will
    automatically upgrade internal representation to use IEEE 754
    double precision float.
    @return {number} The read number.
  */
  readU8le(): number {
    let v1 = this.readU4le();
    let v2 = this.readU4le();
    return 0x100000000 * v2 + v1;
  }

  // ========================================================================
  // Floating point numbers
  // ========================================================================

  // ------------------------------------------------------------------------
  // Big endian
  // ------------------------------------------------------------------------

  readF4be(): number {
    let v = this._dataView.getFloat32(this.pos);
    this.pos += 4;
    return v;
  }

  readF8be(): number {
    let v = this._dataView.getFloat64(this.pos);
    this.pos += 8;
    return v;
  }

  // ------------------------------------------------------------------------
  // Little endian
  // ------------------------------------------------------------------------

  readF4le(): number {
    let v = this._dataView.getFloat32(this.pos, true);
    this.pos += 4;
    return v;
  }

  readF8le(): number {
    let v = this._dataView.getFloat64(this.pos, true);
    this.pos += 8;
    return v;
  }

  // ------------------------------------------------------------------------
  // Unaligned bit values
  // ------------------------------------------------------------------------

  alignToByte() {
    this.bits = 0;
    this.bitsLeft = 0;
  }

  readBitsInt(n: number): number {
    // JS only supports bit operations on 32 bits
    if (n > 32) {
      throw new Error(`readBitsInt: the maximum supported bit length is 32 (tried to read ${n} bits)`);
    }

    let bitsNeeded = n - this.bitsLeft
    if (bitsNeeded > 0) {
      // 1 bit  => 1 byte
      // 8 bits => 1 byte
      // 9 bits => 2 bytes
      let bytesNeeded = Math.ceil(bitsNeeded / 8);
      let buf = this.readBytes(bytesNeeded);
      for (let i = 0; i < buf.length; i++) {
        this.bits <<= 8;
        this.bits |= buf[i];
        this.bitsLeft += 8;
      }
    }

    // raw mask with required number of 1s, starting from lowest bit
    let mask = n == 32 ? 0xffffffff : (1 << n) - 1;
    // shift mask to align with highest bits available in this.bits
    let shiftBits = this.bitsLeft - n;
    mask <<= shiftBits;
    // derive reading result
    let res = (this.bits & mask) >>> shiftBits;
    // clear top bits that we've just read => AND with 1s
    this.bitsLeft -= n;
    mask = (1 << this.bitsLeft) - 1;
    this.bits &= mask;

    return res;
  }

  /**
    Native endianness. Either KaitaiStream.BIG_ENDIAN or KaitaiStream.LITTLE_ENDIAN
    depending on the platform endianness.

    @type {boolean}
  */
  static endianness = new Int8Array(new Int16Array([1]).buffer)[0] > 0;

  // ========================================================================
  // Byte arrays
  // ========================================================================

  readBytes(len: number): Uint8Array {
    return this.mapUint8Array(len);
  }

  readBytesFull(): Uint8Array {
    return this.mapUint8Array(this.size - this.pos);
  }

  readBytesTerm(terminator: number, include: boolean, consume: boolean, eosError: boolean): Uint8Array {
    let blen = this.size - this.pos;
    let u8 = new Uint8Array(this._buffer, this._byteOffset + this.pos);

    for (var i = 0; i < blen && u8[i] != terminator; i++); // find first zero byte
    
    if (i == blen) {
      // we've read all the buffer and haven't found the terminator
      if (eosError) {
        throw new Error("End of stream reached, but no terminator " + terminator + " found");
      } else {
        return this.mapUint8Array(i);
      }
    } else {
      let arr;
      if (include) {
        arr = this.mapUint8Array(i + 1);
      } else {
        arr = this.mapUint8Array(i);
      }
      if (consume) {
        this.pos += 1;
      }
      return arr;
    }
  }

  ensureFixedContents(expected: Uint8Array): Uint8Array {
    let actual = this.readBytes(expected.length);
    if (actual.length !== expected.length) {
      throw new UnexpectedDataError(expected, actual);
    }
    let actLen = actual.length;
    for (let i = 0; i < actLen; i++) {
      if (actual[i] != expected[i]) {
        throw new UnexpectedDataError(expected, actual);
      }
    }
    return actual;
  }

  static bytesStripRight(data: Uint8Array, padByte: number): Uint8Array {
    let newLen = data.length;
    while (data[newLen - 1] == padByte) {
      newLen--;
    }
    return data.slice(0, newLen);
  }

  static bytesTerminate(data: Uint8Array, term: number, include: boolean): Uint8Array {
    let newLen = 0;
    let maxLen = data.length;
    while (newLen < maxLen && data[newLen] != term) {
      newLen++;
    }
    if (include && newLen < maxLen) {
      newLen++;
    }
    return data.slice(0, newLen);
  }

  static bytesToStr(arr: Uint8Array, encoding: string): string {
    if (encoding == null || encoding.toLowerCase() == "ascii") {
      return this.createStringFromArray(arr);
    } else {
      if (typeof TextDecoder === 'function') {
        // we're in the browser that supports TextDecoder
        return (new TextDecoder(encoding)).decode(arr);
      } else 
      {
        // probably we're in node.js

        // check if it's supported natively by node.js Buffer
        // see https://github.com/nodejs/node/blob/master/lib/buffer.js#L187 for details
        switch (encoding.toLowerCase()) {
          case 'utf8':
          case 'utf-8':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return new Buffer(arr.buffer).toString(encoding);
          default:
            // unsupported encoding, we'll have to resort to iconv-lite
            // iconvlite.decode(arr, encoding);
            throw new Error('Encoding ${encoding} is not supported!');
        }
      }
    }
  }

  // ========================================================================
  // Byte array processing
  // ========================================================================

  static processXorOne(data: Uint8Array, key: number): Uint8Array {
    let r = new Uint8Array(data.length);
    let dl = data.length;
    for (let i = 0; i < dl; i++) {
      r[i] = data[i] ^ key;
    }
    return r;
  }

  static processXorMany(data: Uint8Array, key: Uint8Array): Uint8Array {
    let r = new Uint8Array(data.length);
    // let dl = data.length
    let kl = key.length;
    let ki = 0;
    for (let i = 0; i < data.length; i++) {
      r[i] = data[i] ^ key[ki]
      ki++;
      if (ki >= kl) {
        ki = 0;
      }
    }
    return r;
  }

  static processRotateLeft(data: Uint8Array, amount: number, groupSize: number): Uint8Array {
    if (groupSize != 1) {
      throw("unable to rotate group of " + groupSize + " bytes yet");
    }

    let mask = groupSize * 8 - 1;
    let antiAmount = -amount & mask;

    let r = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      r[i] = (data[i] << amount) & 0xff | (data[i] >> antiAmount);
    }

    return r;
  }

  // static processZlib(buf) {
  //   if (typeof require !== 'undefined')  {
  //     // require is available - we're running under node
  //     if (typeof KaitaiStream.zlib === 'undefined');
  //       KaitaiStream.zlib = require('zlib');
  //     if (buf instanceof Uint8Array) {
  //       let b = new Buffer(buf.buffer);
  //     } else {
  //       let b = buf
  //     }
  //     // use node's zlib module API
  //     let r = KaitaiStream.zlib.inflateSync(b);
  //     return r;
  //   } else {
  //     // no require() - assume we're running as a web worker in browser.
  //     // user should have configured KaitaiStream.depUrls.zlib, if not
  //     // we'll throw.
  //     if (typeof KaitaiStream.zlib === 'undefined'
  //       && typeof KaitaiStream.depUrls.zlib !== 'undefined') {
  //       importScripts(KaitaiStream.depUrls.zlib);
  //       KaitaiStream.zlib = pako
  //     }
  //     // use pako API
  //     r = KaitaiStream.zlib.inflate(buf);
  //     return r;
  //   }
  // }

  // ========================================================================
  // Misc runtime operations
  // ========================================================================

  // static mod(a: number, b: number): number {
  //   if (b <= 0) {
  //     throw new Error("mod divisor <= 0");
  //   }
  //   let r = a % b
  //   if (r < 0) {
  //     r += b
  //   }
  //   return r;
  // }

  // static arrayMin(arr: Uint8Array): number {
  //   let min = arr[0]
  //   let x
  //   for (let i = 1, n = arr.length; i < n; ++i) {
  //     x = arr[i]
  //     if (x < min) {
  //       min = x
  //     }
  //   }
  //   return min
  // }

  // static arrayMax(arr: Uint8Array): number {
  //   let max = arr[0]
  //   let x
  //   for (let i = 1, n = arr.length; i < n; ++i) {
  //     x = arr[i]
  //     if (x > max) {
  //       max = x
  //     }
  //   }
  //   return max
  // }

  // static byteArrayCompare(a: Uint8Array, b: Uint8Array): number {
  //   if (a === b) {
  //     return 0
  //   }

  //   let al = a.length
  //   let bl = b.length
  //   let minLen = al < bl ? al : bl
  //   for (let i = 0; i < minLen; i++) {
  //     let cmp = a[i] - b[i]
  //     if (cmp != 0) {
  //       return cmp
  //     }
  //   }

  //   // Reached the end of at least one of the arrays
  //   if (al == bl) {
  //     return 0
  //   } else {
  //     return al - bl
  //   }
  // }

// ========================================================================
// Internal implementation details
// ========================================================================


  /**
  Maps a Uint8Array into the KaitaiStream buffer.

  Nice for quickly reading in data.

  @param {number} length Number of elements to map.
  @return {Object} Uint8Array to the KaitaiStream backing buffer.
  */
  mapUint8Array(length: number): Uint8Array {
    length |= 0;

    if (this.pos + length > this.size) {
      throw new EOFError(length, this.size - this.pos);
    }

    let arr = new Uint8Array(this._buffer, this.byteOffset + this.pos, length);
    this.pos += length;
    return arr;
  }

  /**
  Creates an array from an array of character codes.
  Uses String.fromCharCode in chunks for memory efficiency and then concatenates
  the resulting string chunks.

  @param {array} array Array of character codes.
  @return {string} String created from the character codes.
  **/
  static createStringFromArray(array: Uint8Array): string {
    let chunk_size = 0x8000;
    let chunks = [];
    for (let i=0; i < array.length; i += chunk_size) {
      chunks.push(String.fromCharCode.apply(null, array.subarray(i, i + chunk_size)));
    }
    return chunks.join("");
  }
}