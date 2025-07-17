export class Posek {

    constructor(halacha, svara) {
        this.name = "posek";
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

    toString() {
        return 'פוסק ש' + this.halacha + (!isBlank(this.svara) ? ' משום ש' + this.svara : '');
    }
}