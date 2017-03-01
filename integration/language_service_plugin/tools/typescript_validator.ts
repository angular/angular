import * as fs from 'fs';
import * as minimist from 'minimist';

let errorsDetected = false;

const start = Date.now();

function reportError(arg: string): boolean {
  console.error(`Unknown argument: ${arg}`);
  errorsDetected = true;
  return false;
}

function help() {
  console.log('TypeScript Validator')
  console.log(`${process.argv[1]} [--expect <file-name> | --golden] [--pwd <dir>]`);
  console.log(`
  Validate that the emitted output produces the expect JSON.`)
}

let args = minimist(process.argv.slice(2), { string: ['expect', 'pwd'], boolean: ['golden'], unknown: reportError });

if (!args.golden && !args.expect) {
  console.log('Expected -golden or -expect');
  errorsDetected = true;
}

if (args.golden && args.expect) {
  console.log('Expected -golded or -expect but not both');
  errorsDetected = true;
}

if (errorsDetected) {
  help();
  process.exit(2);
}

var expected: any;
if (args.expect) {
  expected = JSON.parse(fs.readFileSync(args.expect, 'utf8'));
}

// Reader
let pending = Buffer.alloc(0);

const prefix = 'Content-Length: ';

function tryReadMessage(cb: (message: any) => void) {
  const firstLine = pending.indexOf(10);
  if (firstLine >= 1) {
    const line = pending.toString('utf8', 0, firstLine);
    if (!line.startsWith(prefix)) {
      throw Error(`Unexpected input: ${line}`);
    }
    const length = +line.substring(prefix.length, firstLine - 1);
    const dataStart = firstLine + 2;
    const messageText = pending.toString('utf8', dataStart, dataStart + length);
    const message = JSON.parse(messageText);
    pending = pending.slice(dataStart + length + 1);
    cb(message);
    tryReadMessage(cb);
  }
}

function collect(cb: (error: any, messages: any[]) => void) {
  const result: any[] = [];

  function report(error: any, messages: any[]) {
    cb(error, messages);
    cb = () => {};
  }

  process.stdin.on('error', report);
  process.stdin.on('data', (data: Buffer) => {
    try {
      pending = Buffer.concat([pending, data], pending.length + data.length);
      tryReadMessage((message: any) => {
        result.push(message);    
      });
    } catch (e) {
      report(e, []);
    }
  });

  process.stdin.on('close', () => {
    report(null, result);
  });
}

function sanitize(messages: any[]): any[] {
  return messages.filter((message: any) => {
    return message && message.type == 'response';
  }).map((message: any) => {
    // Only preserve a fixed set of fields.
    const result: any = {};
    if (message.type != null) result.type = message.type;
    if (message.command != null) result.command = message.command;
    if (message.success != null) result.success = message.success;
    if (message.body != null) result.body = message.body;
    return result;
  });
}


function isPrimitive(value: any): boolean {
  return Object(value) !== value;
}

function expectPrimitive(received: any, expected: any) {
  if (received !== expected) {
    throw new Error(`Expected ${expected} but received ${received}`);
  }
}

function expectArray(received: any, expected: any[]) {
  if (!Array.isArray(received)) {
    throw new Error(`Expected an array, received ${JSON.stringify(received)}`);
  }
  if (received.length != expected.length) {
    throw new Error(`Expected an array length ${expected.length}, received ${JSON.stringify(received)}`);
  }
  for (let i = 0; i < expected.length; i++) {
    expect(received[i], expected[i]);
  }
}

function expectObject(received: any, expected: any) {
  for (const name of Object.getOwnPropertyNames(expected)) {
    if (!received.hasOwnProperty(name)) {
      throw new Error(`Expected object an object containing a field ${name}, received  ${JSON.stringify(expected)}`);
    }
    expect(received[name], expected[name]);
  }
}

function expect(received: any, expected: any) {
  if (isPrimitive(expected)) {
    expectPrimitive(received, expected);
  } else if (Array.isArray(expected)) {
    expectArray(received, expected);
  } else {
    expectObject(received, expected);
  }
}


collect((err: any, messages: any[]) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  if (args.golden) {
    console.log(JSON.stringify(sanitize(messages), null, ' '));
  } else {
    try {
      expect(sanitize(messages), expected);
      console.log('PASSED:', Date.now() - start, 'ms');
      process.exit(0);
    } catch(e) {
      console.log('FAILED:', e.message);
      process.exit(1);
    }
  }
});
