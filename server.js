import express from 'express';
import { __dirname, getFile } from './utils/files.js';
import data from './routes/data.js';

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static(getFile('public')));
app.use('/data', data);

app.get('/', (req, res) => res.sendFile(getFile('public/index.html')));
app.get('/question', (req, res) => res.sendFile(getFile('public/src/question.html')));
app.get('/createQuestion', (req, res) => res.sendFile(getFile('public/src/createQuestion.html')));
app.get('/results', (req, res) => res.sendFile(getFile('public/src/results.html')));

app.listen(PORT, () => console.log('Server running on port ' + PORT));