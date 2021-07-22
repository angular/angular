import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {StackblitzBuilder} from './builder.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_PATH = join(__dirname, '../../content/examples');
const LIVE_EXAMPLES_PATH = join(__dirname, '../../src/generated/live-examples');

new StackblitzBuilder(EXAMPLES_PATH, LIVE_EXAMPLES_PATH).build();
