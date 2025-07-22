import { getAssignments } from './grade.js';

const container = document.getElementById('results');
const totalScoreCell = document.getElementById('totalScore');
let totalcScore = 0;
getAssignments().forEach(element => {
    const row = document.createElement('tr');
    row.className = 'assignment';
    row.appendChild(createCell(element.userShita));
    row.appendChild(createCell(element.correctShita));
    row.appendChild(createCell(element.score));
    container.appendChild(row);
    totalScoreCell.textContent = (totalcScore += element.score);
});

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}