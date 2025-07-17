import { canonicalize } from './grade.js';

const container = document.getElementById('x');
canonicalize(JSON.parse(sessionStorage.getItem('userAnswers'))).forEach(element => {
    container.appendChild(document.createElement('p').appendChild(document.createTextNode(element.toString())));
});