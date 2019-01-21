import { fork, ChildProcess } from 'child_process';
import { join } from 'path';
import { Client } from './tsclient';
import { goldenMatcher } from './matcher';

describe('Angular Language Service', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */
  const PWD = process.env.PWD!;
  const SERVER_PATH = "./node_modules/typescript/lib/tsserver.js";
  let server: ChildProcess;
  let client: Client;

  beforeEach(() => {
    jasmine.addMatchers(goldenMatcher);
    server = fork(SERVER_PATH, [
      '--globalPlugins', '@angular/language-service',
      '--logVerbosity', 'verbose',
      '--logFile', join(PWD, 'tsserver.log'),
    ], {
        stdio: ['pipe', 'pipe', 'inherit', 'ipc'],
      });
    client = new Client(server);
    client.listen();
  });

  afterEach(async () => {
    client.sendRequest('exit', {});

    // Give server process some time to flush all messages
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it('should be launched as tsserver plugin', async () => {
    let response = await client.sendRequest('configure', {
      hostInfo: 'vscode',
    });
    expect(response).toMatchGolden('configure.json');
    response = await client.sendRequest('compilerOptionsForInferredProjects', {
      "options": {
        module: "CommonJS",
        target: "ES6",
        allowSyntheticDefaultImports: true,
        allowNonTsExtensions: true,
        allowJs: true,
        jsx: "Preserve"
      }
    });
    expect(response).toMatchGolden('compilerOptionsForInferredProjects.json');
    // Server does not send response to open request
    // https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L1055
    client.sendRequest('open', {
      file: `${PWD}/project/app/app.module.ts`,
      fileContent: ""
    });
    // Server does not send response to geterr request
    // https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L1770
    client.sendRequest('geterr', {
      delay: 0,
      files: [`${PWD}/project/app/app.module.ts`]
    });
  });

  it('should perform completions', async () => {
    await client.sendRequest('configure', {
      hostInfo: 'vscode',
    });
    await client.sendRequest('compilerOptionsForInferredProjects', {
      "options": {
        module: "CommonJS",
        target: "ES6",
        allowSyntheticDefaultImports: true,
        allowNonTsExtensions: true,
        allowJs: true,
        jsx: "Preserve"
      }
    });

    client.sendRequest('open', {
      file: `${PWD}/project/app/app.component.ts`,
      fileContent: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'my-app',\n  template: `<h1>Hello {{name}}</h1>`,\n})\nexport class AppComponent  { name = 'Angular'; }\n"
    });

    client.sendRequest('geterr', {
      delay: 0,
      files: [`${PWD}/project/app/app.component.ts`]
    });

    client.sendRequest('change', {
      file: `${PWD}/project/app/app.component.ts`,
      line: 5,
      offset: 30,
      endLine: 5,
      endOffset: 30,
      insertString: '.',
    });

    const response = await client.sendRequest('completionInfo', {
      file: `${PWD}/project/app/app.component.ts`,
      line: 5,
      offset: 31,
    });
    expect(response).toMatchGolden('completionInfo.json');
  });
});
