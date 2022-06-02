import {ExampleZipper} from './exampleZipper.mjs';

const argv = process.argv.slice(2);
if (argv.length !== 2) {
    console.error('Usage: node generateZip.mjs [example-path] [output-path]');
    process.exit(1);
}

const EXAMPLE_PATH = argv[0];
const OUTPUT_PATH = argv[1];

new ExampleZipper(EXAMPLE_PATH, OUTPUT_PATH);
