import { Stance } from "./Stance.js";

export class Lchatchila extends Stance {

    constructor(halacha1, halacha2) {
        super();
        this.name = "Lchatchila";
        this.halacha1 = halacha1;
        this.halacha2 = halacha2;
    }

    getComparableProps() {
        return {
            name: this.name,
            halacha1: this.halacha1,
            halacha2: this.halacha2
        }
    }

    toString(isPlural = false) {
        return 'פוסק' + (isPlural ? "ים " : " ") + 'שלכתחילה ' + this.halacha1 + ' ובדיעבד ' + this.halacha2;
    }
}