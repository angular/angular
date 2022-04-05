import path from 'canonical-path';
import {ExampleZipper} from './exampleZipper.mjs';

const argv = process.argv.slice(2);
if (argv.length !== 2) {
    console.error("Usage: node generateZips.mjs [examples-path] [output-path]");
    process.exit(1);
}

const EXAMPLES_PATH = argv[0];
const OUTPUT_PATH = argv[1];
const ZIPS_PATH = path.join(OUTPUT_PATH, 'generated', 'zips');

new ExampleZipper(EXAMPLES_PATH, ZIPS_PATH);
