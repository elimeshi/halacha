import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(path.dirname(__filename));

export function getFile(filePath) {
    return path.join(__dirname, ...(filePath.split(/[\/\\]/).filter(Boolean)))
}