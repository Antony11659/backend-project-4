import fs from 'fs';
import { after } from "./html.js";

const result = fs.readFileSync('./ru-hexlet-io-courses_files/ru-hexlet-io-courses.html', 'utf8');

console.log(result.trim());
