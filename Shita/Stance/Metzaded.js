export class Metzaded {

    constructor(halacha, svara) {
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

    toString() {
        return 'מצדד ש' + this.halacha + (!isBlank(this.svara) ? ' משום ש' + this.svara : '');
    }
}