import express from 'express';
import fs from 'fs';
import { getFile } from '../utils/files.js';

const router = express.Router();
router.use(express.json());

router.get('/poskim', (req, res) => res.sendFile(getFile('data/poskim.txt')));
router.get('/question-sets', (req, res) => {
    fs.readdir(getFile('data/question-sets'), (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to load question sets.'});
        res.json({ files });
    })
});
router.get('/question-sets/:setName', (req, res) => res.sendFile(getFile('data/question-sets/' + req.params.setName + '.json')));
router.post('/question-sets/:setName', (req, res) => {
    const { mode, ...question } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing question data.'});
    const questionStr = JSON.stringify(question);
    const filePath = getFile('data/question-sets/' + req.params.setName + '.json');
    const post = function(err) { return err ? res.status(500).json({ error: "Couldn't append to file" }) : res.json({ message: 'Question appended successfully!' })};
    mode === 'append' ? fs.appendFile(filePath, questionStr, post) : fs.writeFile(filePath, questionStr, post);
});
export default router;