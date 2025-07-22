export class Shita {
    constructor(poskim, parentPoskim, stance) {
        this.poskim = poskim.filter(Boolean);
        this.parentPoskim = parentPoskim.filter(Boolean);
        this.stance = stance;
    }

    addPoskim(poskim) {
        this.poskim = [...new Set([...this.poskim, ...poskim])].filter(Boolean);
    }

    addParentPoskim(parentPoskim) {
        this.parentPoskim = [...new Set([...this.parentPoskim, ...parentPoskim])].filter(Boolean);
    }

    isBlank(arr) {
        return !arr || arr.length === 0;
    }

    toString() {
        return `${this.poskim.join(" ו") + (this.parentPoskim.length > 0 ? ' בשם ' + this.parentPoskim.join(" ו") : '')} ${this.stance.toString(this.poskim.length > 1)}`;
    }
}