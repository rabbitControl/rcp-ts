import KaitaiStream from "../src/KaitaiStream";
import {RcpInt} from "../src/RcpInt"

describe("RcpInt", () =>
{
    it("should parse correctly #1", () => {
        expect(RcpInt.parse(new KaitaiStream(new Uint8Array([129]).buffer, 0)).value).toBe(1);
    });

    it("should parse correctly #2", () => {
        expect(RcpInt.parse(new KaitaiStream(new Uint8Array([1, 129]).buffer, 0)).value).toBe(129);
    });

    it("should write correctly", () => {
        const out = new RcpInt(5).w();
        expect(out).toStrictEqual([133]);
    });

    it("should write and parse correctly", () => {
        const out = new RcpInt(455).w();
        expect(out).toStrictEqual([3, 199]);
    });
});