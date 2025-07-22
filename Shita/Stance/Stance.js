export class Stance {
    
    compareTo(other) {
        return this.constructor === other.constructor && JSON.stringify(this.getComparableProps()) === JSON.stringify(other.getComparableProps());
    }

    getComparableProps() {}

    toString() {}

    isBlank(str) {
        return !str || str.trim() === '';
    }
}