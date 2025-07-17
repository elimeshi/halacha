export class Mistapek {

    constructor(halacha1, halacha2) {
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

    toString() {
        return 'מסתפק אם ' + this.halacha1 + ' או ' + this.halacha2;
    }
}