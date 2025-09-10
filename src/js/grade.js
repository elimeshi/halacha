import { Sover } from '../model/Shita/Stance/Sover.js';
import { Posek } from '../model/Shita/Stance/Posek.js';
import { Metzaded } from '../model/Shita/Stance/Metzaded.js';
import { Mistapek } from '../model/Shita/Stance/Mistapek.js';
import { Lchatchila } from '../model/Shita/Stance/Lchatchila.js';
import { Posek as Rav } from '../model/Shita/Posek.js';
import { Shita } from '../model/Shita/Shita.js';

let userAnswers = [];
let correctAnswers = [];
let costMatrix = [];
let assignments = [];

const stanceClasses = {
    "sover": Sover,
    "posek": Posek,
    "metzaded": Metzaded,
    "mistapek": Mistapek,
    "Lchatchila": Lchatchila,
}

function upsertShita(shitos, newStance, poskim) {
    const foundShita = shitos.find(shita => {shita.stance.compareTo(newStance)});
    if (foundShita) {
        foundShita.addPoskim(poskim);
    } else {
        shitos.push(new Shita(poskim, newStance));
    }
}

export function canonicalize(rawAnswers) {
    let shitos = [];

    Object.keys(rawAnswers).forEach((i) => {
        const answer = rawAnswers[i];
        const sortedPoskim = answer.poskim.map(p => new Rav(p.posek, p.parentPoskim)).sort((p1, p2) => p1.posek.localCompare(p2.posek));
        answer.stances.forEach((st, sidx) => {
            const newStance = new stanceClasses[st.stance](...Object.values(st).slice(1));
            upsertShita(shitos, newStance, sortedPoskim);
        });
    });

    return shitos;
}

export function parseCorrectAnsersToShitos(rawCorrectAnswers) {
    let shitos = [];

    Object.keys(rawCorrectAnswers).forEach((i) => {
        const answer = rawCorrectAnswers[i];
        const newStance = new stanceClasses[answer.stance.name](...Object.values(answer.stance).slice(1));
        shitos.push(new Shita(answer.poskim.map(posek => new Rav(posek.posek, posek.parentPoskim)), newStance));
    });

    return shitos;
}

function equalPoseks(p1, p2) {
    return JSON.stringify(p1) === JSON.stringify(p2);
}

function compareShitaScore(userShita, correctShita) {
    let stanceScore = 0;
    let poskimScore = 0;
    const userStance = userShita.stance;
    const correctStance = correctShita.stance;
    const USName = userStance.name; // User Stance name ('posek' / 'metzaded' etc.)
    const CSName = correctStance.name; // Correct stance name

    // Compare stances
    const posekAndMetzaded = ["posek", "metzaded"];
    const mistapekAndLchatchila = ["mistapek", "Lchatchila"];
    if (posekAndMetzaded.includes(USName) && posekAndMetzaded.includes(CSName)) {
        if (userStance.svara === correctStance.svara) stanceScore += 3;
        if (userStance.halacha === correctStance.halacha) stanceScore += 3;
        if (USName === CSName) stanceScore += 2;
    } else if (USName === "sover" && CSName === "sover") {
        if (userStance.svara === correctStance.svara) stanceScore = 8;
    } else if ((posekAndMetzaded.includes(USName) && CSName === "sover") || (posekAndMetzaded.includes(CSName) && USName === "sover")) {
        if (userStance.svara === correctStance.svara) stanceScore = 6;
    } else if (mistapekAndLchatchila.includes(USName) && mistapekAndLchatchila.includes(CSName)) {
        if (USName === CSName) {
            if (userStance.halacha1 === correctStance.halacha1) stanceScore += 4;
            if (userStance.halacha2 === correctStance.halacha2) stanceScore += 4;
        } else {
            if (userStance.halacha1 === correctStance.halacha1 || userStance.halacha1 === correctStance.halacha2) stanceScore += 3;
            if (userStance.halacha2 === correctStance.halacha1 || userStance.halacha2 === correctStance.halacha2) stanceScore += 3;
        }
    }

    // compare poskim
    const userPoskim = userShita.poskim;
    const correctPoskim = correctShita.poskim;
    if (userPoskim.length > 0) {
        if (!userPoskim.some(p1 => correctPoskim.some(p2 => equalPoseks(p1, p2)))) poskimScore = 0;
        else poskimScore = userPoskim.every(p1 => correctPoskim.some(p2 => equalPoseks(p1, p2))) ? 2 : 1;
    } 

    return stanceScore + poskimScore;
}

function calculateCostMatrix(userAnswers, correctAnswers) {
    const costMatrix = [];
    userAnswers.forEach((userShita, i) => {
        costMatrix[i] = [];
        correctAnswers.forEach((correctShita, j) => {
            costMatrix[i][j] = compareShitaScore(userShita, correctShita);
        })
    })
    return costMatrix;
}

function indexOfMax(arr) {
    if (!arr || arr.length === 0) return -1;
    let max = arr[0];
    let idx = 0;
    for (let i = 1; i < arr.length; i++) if (arr[i] > max) {
        max = arr[i];
        idx = i;
    }
    return idx;
}

function highestShitaComparison(costMatrix) {
    let assignments = {};
    for (let i = 0; i < costMatrix[0].length; i++) assignments[i] = [];
    for (let i = 0; i < costMatrix.length; i++) assignments[indexOfMax(costMatrix[i])].push(i);
    return assignments;
}

function compare() {
    userAnswers = canonicalize(JSON.parse(sessionStorage.getItem('userAnswers')));
    correctAnswers = parseCorrectAnsersToShitos(JSON.parse(sessionStorage.getItem('correctAnswers')));
    costMatrix = calculateCostMatrix(userAnswers, correctAnswers);
    return highestShitaComparison(costMatrix);
}

export function getAssignments() {
    assignments = compare();
    console.log(assignments);
    return Object.keys(assignments).map((correctIdx) => {
        const userIdxs = assignments[correctIdx];
        console.log(userIdxs.map(i => userAnswers[i]));
        console.log(userIdxs.map(i => userAnswers[i]).join("\n"));
        return {
            userShita: userIdxs.map(i => userAnswers[i]).join("\n") || "-",
            correctShita: correctAnswers[correctIdx],
            score: (userIdxs.reduce((sum, i) => sum + costMatrix[i][correctIdx], 0) / userIdxs.length) || 0,
        };
    });
}