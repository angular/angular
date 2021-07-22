import path from 'canonical-path';
import {fileURLToPath} from 'url';
import {ExampleZipper} from './exampleZipper.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLES_PATH = path.join(__dirname, '../../content/examples');
const ZIPS_PATH = path.join(__dirname, '../../src/generated/zips');

new ExampleZipper(EXAMPLES_PATH, ZIPS_PATH);
