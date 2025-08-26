import { getAssignments } from './grade.js';
import { getDirectAssignments } from './grade.js';

const TOTAL_QUESTIONS = 2; // Total number of questions in the quiz
let totalScore = 0;
let isLastQuestion = false;

createScoreTable();
saveProgress();

document.getElementById('nextButton').addEventListener('click', () => {
    if (isLastQuestion) {
        alert('סיימת את המבחן! תודה רבה על השתתפותך.');
        localStorage.removeItem('answeredQuestions');
        window.location.href = 'index.html';
    } else window.location.href = 'question.html';
})

function createScoreTable() {
    const container = document.getElementById('results');
    const totalScoreCell = document.getElementById('totalScore');
    
    getDirectAssignments().forEach(element => {
        const row = document.createElement('tr');
        row.className = 'assignment';
        row.appendChild(createCell(element.userShita));
        row.appendChild(createCell(element.correctShita));
        row.appendChild(createCell(element.score));
        container.appendChild(row);
        totalScoreCell.textContent = (totalScore += element.score);
    });
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function saveProgress() {
    let session = JSON.parse(localStorage.getItem('quiz')) || {
        completed: 0,
        score: 0
    }

    if (++session.completed >= TOTAL_QUESTIONS) isLastQuestion = true;;
    session.score += totalScore;

    localStorage.setItem('quiz', JSON.stringify(session));
    setTimeout(() => {
        alert(`ההתקדמות נשמרה בהצלחה!\n\nענית עד כה על ${session.completed} שאלות\nציונך עד כה הוא ${session.score} נקודות`);
    });
}