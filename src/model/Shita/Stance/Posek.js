import { Stance } from "./Stance.js";

export class Posek extends Stance {

    constructor(halacha, svara) {
        super();
        this.name = "posek";
        this.halacha = String(halacha || "");
        this.svara = svara;
    }

    getComparableProps() {
        return {
            name: this.name,
            halacha: this.halacha,
            svara: this.svara
        }
    }

    toString(isPlural = false) {
        return 'פוסק' + (isPlural ? "ים" : "") + ' ש' + (this.halacha.endsWith('.') ? this.halacha.slice(0, -1) : this.halacha) + (!this.isBlank(this.svara) ? ', משום ש' + this.svara : '.');
    }
}