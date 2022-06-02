import {StackblitzBuilder} from './builder.mjs';

const argv = process.argv.slice(2);
if (argv.length !== 2) {
    console.error("Usage: node generateStackblitz.mjs [example-path] [output-path]");
    process.exit(1);
}

const EXAMPLE_PATH = argv[0];
const OUTPUT_PATH = argv[1];

new StackblitzBuilder(EXAMPLE_PATH, OUTPUT_PATH).build();
