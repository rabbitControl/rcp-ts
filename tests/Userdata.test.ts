import KaitaiStream from "../src/KaitaiStream";
import { UserData } from "../src/Userdata"

describe("Userdata", () =>
{
    it("should parse correctly", () => {
        expect(UserData.parse(new KaitaiStream(new Uint8Array([128 + 4, 1, 2, 3, 4]).buffer, 0)).data).toStrictEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it("should write correctly", () => {
        const out = new UserData(new Uint8Array([1, 2, 3, 4, 5])).w();
        expect(out).toStrictEqual([128 + 5, 1, 2, 3, 4, 5]);
    });

    it("should write and parse correctly", () => {
        const out = new UserData(new Uint8Array([1, 2, 3, 4])).w();
        expect(UserData.parse(new KaitaiStream(new Uint8Array(out).buffer, 0)).data).toStrictEqual(new Uint8Array([1, 2, 3, 4]));
    });
});