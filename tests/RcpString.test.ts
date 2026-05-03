import KaitaiStream from "../src/KaitaiStream";
import { RcpString } from "../src/RcpString"

describe("RcpString", () =>
{
    it("should parse correctly", () => {
        expect(RcpString.parse(new KaitaiStream(new Uint8Array([128 + 4, 116, 101, 115, 116]).buffer, 0)).value).toBe("test");
    });

    it("should write correctly", () => {
        const out = new RcpString("test").w();
        expect(out).toStrictEqual([128 + 4, 116, 101, 115, 116]);
    });

    it("should write and parse correctly", () => {
        const out = new RcpString("A fox jumps over the fence.").w();
        expect(RcpString.parse(new KaitaiStream(new Uint8Array(out).buffer, 0)).value).toBe("A fox jumps over the fence.");
    });
});