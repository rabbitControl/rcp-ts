import KaitaiStream from './KaitaiStream';
import { RcpString } from './RcpString';
import { Writeable } from './Writeable';

export class RCPLanguageString implements Writeable
{
    static readonly LANGUAGE_ANY = "any";

    private languages: Map<string, string> = new Map();


    print() {
        this.languages.forEach((v, k) => console.log(`${k}: ${v}`));
    }

    size(): number {
        return this.languages.size;
    }

    clear() {
        this.languages.clear();
    }

    hasLangauge(code: string): boolean {
        return this.languages.has(code);
    }

    language(code: string): string | undefined {
        return this.languages.get(code);
    }

    hasAnyLanguage(): boolean {
        return this.hasLangauge(RCPLanguageString.LANGUAGE_ANY);
    }

    anyLanguage(): string | undefined {
        return this.language(RCPLanguageString.LANGUAGE_ANY);
    }

    // return true if changed
    setAnyLanguage(lang: string | undefined): boolean {
        return this.setLanguage(RCPLanguageString.LANGUAGE_ANY, lang);
    }

    setLanguage(code: string, lang: string | undefined) {
        var changed = this.languages.get(code) !== lang;

        if (lang !== undefined)
        {
            this.languages.set(code, lang);
        }
        else if (this.languages.has(code))
        {
            this.languages.delete(code);
        }

        return changed;
    }

    getLanguages(): IterableIterator<string> {
        return this.languages.keys();
    }

    // Writeable
    write(output: Array<number>, all: boolean): void {
        
        this.languages.forEach((value, code) => {
            if (code.length < 3) {
                return;
            }

            output.push(code.charCodeAt(0));
            output.push(code.charCodeAt(1));
            output.push(code.charCodeAt(2));
            new RcpString(value).write(output);
        });

        // terminator
        output.push(0);
    }

    // return true if it changed
    update(other: RCPLanguageString): boolean
    {
        var changed = false;

        other.languages.forEach((v, k) => {
            if (!this.languages.has(k) ||
                this.languages.get(k) !== v)
            {
                this.languages.set(k, v);
                changed = true;
            }
        });

        return changed;
    }

    static parse(io: KaitaiStream): RCPLanguageString
    {
        var lstr = new RCPLanguageString;

        let current = io.pos;
        let ppeekk  = io.readS1();

        // check for 0-byte terminator
        while (ppeekk > 0)
        {
            // rewind one
            io.seek(current);

            const lang_code = KaitaiStream.bytesToStr(io.readBytes(3), "utf8");
            const lang     = RcpString.parse(io).value;

            if (lang)
            {
                lstr.languages.set(lang_code, lang);
            }

            current = io.pos;
            ppeekk = io.readS1();
        }

        return lstr;
    }
}