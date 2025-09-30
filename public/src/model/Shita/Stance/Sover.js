import { Stance } from "./Stance.js";

export class Sover extends Stance {

    constructor(svara) {
        super();
        this.name = "sover";
        this.svara = svara;
    }

    getComparableProps() {
        return {
            name: this.name,
            svara: this.svara
        }
    }

    toString(isPlural = false) {
        return 'סובר' + (isPlural ? "ים" : "") + ' ש' + this.svara;
    }
}