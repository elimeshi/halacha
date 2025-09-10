export class Posek {
    constructor(posek, parentPoskim) {
        this.posek = posek;
        this.parentPoskim = (parentPoskim || []).sort();
    }

    toString() {
        return this.posek + (this.parentPoskim.length > 0 ? ' בשם ' + this.parentPoskim.join(' ו') : '');
    }
}