import { Stance } from "./Stance.js";

export class Metzaded extends Stance {

    constructor(halacha, svara) {
        super();
        this.name = "metzaded";
        this.halacha = halacha;
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
        return 'מצדד' + (isPlural ? "ים" : "") + ' ש' + this.halacha + (!this.isBlank(this.svara) ? ' משום ש' + this.svara : '');
    }
}