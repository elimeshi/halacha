export class Sover {

    constructor(svara) {
        this.name = "sover";
        this.svara = svara;
    }

    getComparableProps() {
        return {
            name: this.name,
            svara: this.svara
        }
    }

    toString() {
        return 'סובר ש' + this.svara;
    }
}