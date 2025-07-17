export class Lchatchila {

    constructor(halacha1, halacha2) {
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

    toString() {
        return 'פוסק שלכתחילה ' + this.halacha1 + ' ובדיעבד ' + this.halacha2;
    }
}