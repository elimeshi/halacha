import express from 'express';
import fs from 'fs';
import { getFile } from '../utils/files.js';

const router = express.Router();

router.get('/poskim', (req, res) => res.sendFile(getFile('data/poskim.txt')));
router.get('/question-sets', (req, res) => {
    fs.readdir(getFile('data/question-sets'), (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to load question sets.'});
        res.json({ files });
    })
});
router.get('/question-sets/:setName', (req, res) => res.sendFile(getFile('data/question-sets/' + req.params.setName + '.json')));

export default router;