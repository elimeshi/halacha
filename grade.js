import { Sover } from './Shita/Stance/Sover.js';
import { Posek } from './Shita/Stance/Posek.js';
import { Metzaded } from './Shita/Stance/Metzaded.js';
import { Mistapek } from './Shita/Stance/Mistapek.js';
import { Lchatchila } from './Shita/Stance/Lchatchila.js';
import { Shita } from './Shita/Shita.js';

import { Munkres } from './munkres.js';

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

    Object.keys(rawAnswers).forEach((i) => {
        const answer = rawAnswers[i];
        const sortedMainPosek = [...answer.posek].sort();
        const sortedParentPoskim = [...(answer.parentPoskim || [])].sort();
        answer.stances.forEach((st, sidx) => {
            const newStance = new stanceClasses[st.stance](...Object.values(st).slice(1));
            upsertShita(shitos, newStance, sortedMainPosek, sortedParentPoskim);
        });
    });

    return shitos;
}

export function parseCorrectAnsersToShitos(rawCorrectAnswers) {
    let shitos = [];

    Object.keys(rawCorrectAnswers).forEach((i) => {
        const answer = rawCorrectAnswers[i];
        const newStance = new stanceClasses[answer.stance.name](...Object.values(answer.stance).slice(1));
        shitos.push(new Shita(answer.poskim, answer.parentPoskim, newStance));
    });

    return shitos;
}

function compareShitaScore(userShita, correctShita) {
    let stanceScore = 0;
    let poskimScore = 0;
    const userStance = userShita.stance;
    const correctStance = correctShita.stance;

    // Compare stances
    const USName = userStance.name;
    const CSName = correctStance.name;
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
    const userPoskim = userShita.poskim.concat(userShita.parentPoskim);
    const correctPoskim = correctShita.poskim.concat(correctShita.parentPoskim);
    if (userPoskim.length > 0) {
        if (userPoskim.every(p => correctPoskim.includes(p))) poskimScore = 2;
        else if (userPoskim.some(p => correctPoskim.includes(p))) poskimScore = 1;
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

function invertCostMatrix(costMatrix) {
    const max = Math.max(...costMatrix.flat());
    return costMatrix.map(row => row.map(val => max - val));
}

function squareMatrix(matrix) {
    const size = Math.max(matrix.length, matrix[0].length);
    matrix.map(row => {
        while (row.length < size) row.push(Number.MAX_SAFE_INTEGER);
    })
    while (matrix.length < size) {
        matrix.push(new Array(size).fill(Number.MAX_SAFE_INTEGER));
    }
    return matrix;
}

function compare() {
    userAnswers = canonicalize(JSON.parse(sessionStorage.getItem('userAnswers')));
    correctAnswers = parseCorrectAnsersToShitos(JSON.parse(sessionStorage.getItem('correctAnswers')));
    costMatrix = calculateCostMatrix(userAnswers, correctAnswers);
    const invertedMatrix = invertCostMatrix(costMatrix);
    const squaredMatrix = squareMatrix(invertedMatrix);
    return new Munkres().compute(squaredMatrix);
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

// In this comparement, each correct answer can have multiple user answers assigned to it
function directCompare() {
    userAnswers = canonicalize(JSON.parse(sessionStorage.getItem('userAnswers')));
    correctAnswers = parseCorrectAnsersToShitos(JSON.parse(sessionStorage.getItem('correctAnswers')));
    costMatrix = calculateCostMatrix(userAnswers, correctAnswers);
    return highestShitaComparison(costMatrix);
}

// Every correct answer is assigned to one user answer, and vice versa
export function getAssignments() {
    assignments = compare();
    console.log(assignments);
    return assignments.map(([userIdx, correctIdx]) => {
        // if (userIdx >= userAnswers.length || correctIdx >= correctAnswers.length) return null;
        return {
            userShita: userAnswers[userIdx] || "-",
            correctShita: correctAnswers[correctIdx] || "-",
            score: userAnswers[userIdx] && correctAnswers[correctIdx]? compareShitaScore(userAnswers[userIdx], correctAnswers[correctIdx]) : 0
        }
    });
}

// In this comparement, each correct answer can have multiple user answers assigned to it
export function getDirectAssignments() {
    assignments = directCompare();
    console.log(assignments);
    return Object.keys(assignments).map((correctIdx) => {
        const userIdxs = assignments[correctIdx];
        return {
            userShitas: userIdxs.map(i => userAnswers[i]).join("\n") || "-",
            correctShita: correctAnswers[correctIdx],
            score: (userIdxs.reduce((sum, i) => sum + costMatrix[i][correctIdx], 0) / userIdxs.length) || 0,
        }
    })
}