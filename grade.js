import { Sover } from './Shita/Stance/Sover.js';
import { Posek } from './Shita/Stance/Posek.js';
import { Metzaded } from './Shita/Stance/Metzaded.js';
import { Mistapek } from './Shita/Stance/Mistapek.js';
import { Lchatchila } from './Shita/Stance/Lchatchila.js';
import { Shita } from './Shita/Shita.js';

const stanceClasses = {
    "sover": Sover,
    "posek": Posek,
    "metzaded": Metzaded,
    "mistapek": Mistapek,
    "Lchatchila": Lchatchila,
}

function upsertShita(shitos, newStance, poskim, parentPoskim) {
    const foundShita = shitos.find(shita => {shita.stance.compareTo(newStance)});
    if (foundShita) {
        foundShita.addPoskim(poskim);
        foundShita.addParentPoskim(parentPoskim);
    } else {
        shitos.push(new Shita(poskim, parentPoskim, newStance));
    }
}

export function canonicalize(rawAnswers) {
    let shitos = [];

    rawAnswers.forEach((answer) => {
        const sortedMainPosek = [...answer.posek].sort();
        const sortedParentPoskim = [...answer.parentPoskim].sort();
        answer.stances.forEach((st, sidx) => {
            const newStance = new stanceClasses[st.stance](...Object.values(st).slice(1));
            upsertShita(shitos, newStance, sortedMainPosek, sortedParentPoskim);
        })
    })

    return shitos;
}