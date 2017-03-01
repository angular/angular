import * as fs from 'fs';
import * as minimist from 'minimist';

const RE_PWD = /\$\$PWD\$\$/g;

let errorsDetected = false;

function reportError(arg: string): boolean {
  console.error(`Unknown argument: ${arg}`);
  errorsDetected = true;
  return false;
}

function help() {
  console.log('TypeScript Host')
  console.log(`${process.argv[1]} --file <file-name> [--pwd <pwd>]`);
  console.log(`
  Send JSON message using the JSON RPC protocol to stdout.
  `)
}

let args = minimist(process.argv.slice(2), { string: ['file', 'pwd'], unknown: reportError });

if (errorsDetected) {
  help();
  process.exit(2);
}

const file = args['file'];
if (!file) {
  console.log('stdin form not supported yet.')
  process.exit(1);
}

// Sender
const pending: string[] = [];
let writing = false;

function writeMessage(message: string) {
  writing = true;
  process.stdout.write(message + '\n', checkPending);
}

function checkPending() {
  writing = false;
  if (pending.length) {
    writeMessage(pending.shift());
  }
}

function send(message: string) {
  if (writing) {
    pending.push(message);
  } else {
    writeMessage(message);
  }
}

try {
  let content = fs.readFileSync(file, 'utf8');
  if (args['pwd']) {
    content = content.replace(RE_PWD, args['pwd']);
  }

  const json = JSON.parse(content);
  
  if (Array.isArray(json)) {
    for (const message of json) {
      send(JSON.stringify(message));
    }
  } else {
    throw Error('Expected an array for input messages.')
  }
} catch(e) {
  console.error(`Error: ${e.message}`);
  process.exit(2);
}