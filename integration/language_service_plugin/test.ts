import {ChildProcess, fork} from 'child_process';
import {join} from 'path';
import {goldenMatcher} from './matcher';
import {Client} from './tsclient';

describe('Angular Language Service', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */
  const PWD = process.env.PWD!;
  const SERVER_PATH = './node_modules/typescript/lib/tsserver.js';
  let server: ChildProcess;
  let client: Client;

  beforeEach(() => {
    jasmine.addMatchers(goldenMatcher);
    server = fork(
        SERVER_PATH,
        [
          '--logVerbosity',
          'verbose',
          '--logFile',
          join(PWD, 'tsserver.log'),
        ],
        {
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
      'options': {
        module: 'CommonJS',
        target: 'ES6',
        allowSyntheticDefaultImports: true,
        allowNonTsExtensions: true,
        allowJs: true,
        jsx: 'Preserve'
      }
    });
    expect(response).toMatchGolden('compilerOptionsForInferredProjects.json');
    // Server does not send response to open request
    // https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L1055
    client.sendRequest('open', {
      file: `${PWD}/project/app/app.module.ts`,
    });
    // Server does not send response to geterr request
    // https://github.com/Microsoft/TypeScript/blob/master/lib/protocol.d.ts#L1770
    client.sendRequest('geterr', {delay: 0, files: [`${PWD}/project/app/app.module.ts`]});
  });

  it('should perform completions', async () => {
    await client.sendRequest('configure', {
      hostInfo: 'vscode',
    });
    await client.sendRequest('compilerOptionsForInferredProjects', {
      'options': {
        module: 'CommonJS',
        target: 'ES6',
        allowSyntheticDefaultImports: true,
        allowNonTsExtensions: true,
        allowJs: true,
        jsx: 'Preserve'
      }
    });

    client.sendRequest('open', {
      file: `${PWD}/project/app/app.component.ts`,
    });

    client.sendRequest('geterr', {delay: 0, files: [`${PWD}/project/app/app.component.ts`]});

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

  it('should perform quickinfo', async () => {
    client.sendRequest('open', {
      file: `${PWD}/project/app/app.component.ts`,
    });

    const resp1 = await client.sendRequest('reload', {
      file: `${PWD}/project/app/app.component.ts`,
      tmpFile: `${PWD}/project/app/app.component.ts`,
    }) as any;
    expect(resp1.command).toBe('reload');
    expect(resp1.success).toBe(true);

    const resp2 = await client.sendRequest('quickinfo', {
      file: `${PWD}/project/app/app.component.ts`,
      line: 5,
      offset: 28,
    });
    expect(resp2).toMatchGolden('quickinfo.json');
  });

  it('should perform definition', async () => {
    client.sendRequest('open', {
      file: `${PWD}/project/app/app.component.ts`,
    });

    const resp1 = await client.sendRequest('reload', {
      file: `${PWD}/project/app/app.component.ts`,
      tmpFile: `${PWD}/project/app/app.component.ts`,
    }) as any;
    expect(resp1.command).toBe('reload');
    expect(resp1.success).toBe(true);

    const resp2 = await client.sendRequest('definition', {
      file: `${PWD}/project/app/app.component.ts`,
      line: 5,
      offset: 28,
    });
    expect(resp2).toMatchGolden('definition.json');
  });

  it('should perform definitionAndBoundSpan', async () => {
    client.sendRequest('open', {
      file: `${PWD}/project/app/app.component.ts`,
    });

    const resp1 = await client.sendRequest('reload', {
      file: `${PWD}/project/app/app.component.ts`,
      tmpFile: `${PWD}/project/app/app.component.ts`,
    }) as any;
    expect(resp1.command).toBe('reload');
    expect(resp1.success).toBe(true);

    const resp2 = await client.sendRequest('definitionAndBoundSpan', {
      file: `${PWD}/project/app/app.component.ts`,
      line: 5,
      offset: 28,
    });
    expect(resp2).toMatchGolden('definitionAndBoundSpan.json');
  });

  it('should perform definitionAndBoundSpan for template URLs', async () => {
    client.sendRequest('open', {
      file: `${PWD}/project/app/widget.component.ts`,
    });

    const resp1 = await client.sendRequest('reload', {
      file: `${PWD}/project/app/widget.component.ts`,
      tmpFile: `${PWD}/project/app/widget.component.ts`,
    }) as any;
    expect(resp1.command).toBe('reload');
    expect(resp1.success).toBe(true);

    const resp2 = await client.sendRequest('definitionAndBoundSpan', {
      file: `${PWD}/project/app/widget.component.ts`,
      line: 5,
      offset: 19,
    });
    expect(resp2).toMatchGolden('templateUrlDefinition.json');
  });

  it('should perform definitionAndBoundSpan for style URLs', async () => {
    client.sendRequest('open', {
      file: `${PWD}/project/app/widget.component.ts`,
    });
    client.sendRequest('open', {
      file: `${PWD}/project/app/style.css`,
    });

    const resp1 = await client.sendRequest('reload', {
      file: `${PWD}/project/app/widget.component.ts`,
      tmpFile: `${PWD}/project/app/widget.component.ts`,
    }) as any;
    expect(resp1.command).toBe('reload');
    expect(resp1.success).toBe(true);

    const resp2 = await client.sendRequest('definitionAndBoundSpan', {
      file: `${PWD}/project/app/widget.component.ts`,
      line: 6,
      offset: 18,
    });
    expect(resp2).toMatchGolden('styleUrlsDefinition.json');
  });
});
