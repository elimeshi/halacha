export class Shita {
    constructor(poskim, stance) {
        this.poskim = poskim.filter(Boolean);
        this.stance = stance;
    }

    addPoskim(poskim) {
        this.poskim = [...new Set([...this.poskim, ...poskim])].filter(Boolean);
    }

    isBlank(arr) {
        return !arr || arr.length === 0;
    }

    toString() {
        return `${this.poskim.join(" ו")} ${this.stance.toString(this.poskim.length > 1)}`;
    }
}