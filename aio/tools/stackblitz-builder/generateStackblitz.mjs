import {join} from 'path';
import {StackblitzBuilder} from './builder.mjs';

const argv = process.argv.slice(2);
if (argv.length !== 2) {
    console.error("Usage: node generateStackblitz.mjs [examples-path] [output-path]");
    process.exit(1);
}

const EXAMPLES_PATH = argv[0];
const OUTPUT_PATH = argv[1];
const LIVE_EXAMPLES_PATH = join(OUTPUT_PATH, 'generated', 'live-examples');

new StackblitzBuilder(EXAMPLES_PATH, LIVE_EXAMPLES_PATH).build();
