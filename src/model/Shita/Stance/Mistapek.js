import { Stance } from "./Stance.js";

export class Mistapek extends Stance {

    constructor(halacha1, halacha2) {
        super();
        this.name = "mistapek";
        [this.halacha1, this.halacha2] = [halacha1, halacha2].sort();
    }

    getComparableProps() {
        return {
            name: this.name,
            halacha1: this.halacha1,
            halacha2: this.halacha2
        }
    }

    toString(isPlural = false) {
        return 'מסתפק' + (isPlural ? "ים" : "") + ' אם ' + this.halacha1 + ' או ' + this.halacha2;
    }
}