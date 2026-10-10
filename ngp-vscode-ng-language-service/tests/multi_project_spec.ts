import * as path from 'path';
import * as fs from 'node:fs/promises';
import * as rpc from 'vscode-jsonrpc/node';
import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';

const testWorkspacePath = getTestWorkspacePath();

describe('Multi-Project Support', () => {
  let connection: rpc.MessageConnection;
  let tsgoConnection: rpc.MessageConnection;
  let serverCleanup: () => Promise<void>;
  let env: TestEnv;

  beforeAll(async () => {
    const result = await startTestServer(testWorkspacePath);
    connection = result.connection;
    tsgoConnection = result.tsgoConnection;
    serverCleanup = result.cleanup;
  });

  afterAll(async () => {
    await serverCleanup();
  });

  beforeEach(() => {
    const fileManager = new TestFileManager(testWorkspacePath);
    env = new TestEnv(connection, tsgoConnection, fileManager);
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it('should launch a separate Angular compiler for a subproject with its own tsconfig', async () => {
    const subprojectDir = path.join(testWorkspacePath, 'subproject_a');
    await fs.mkdir(subprojectDir, {recursive: true});

    const subprojectTsconfig = path.join(subprojectDir, 'tsconfig.json');
    await fs.writeFile(
      subprojectTsconfig,
      JSON.stringify(
        {
          extends: '../tsconfig.json',
          compilerOptions: {
            rootDir: '.',
          },
          include: ['*.ts'],
        },
        null,
        2,
      ),
    );
    await env.lspClient.didChangeWatchedFiles(subprojectTsconfig, 1);

    try {
      const componentContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-sub-test',
          template: '<div [title]="¦subprojectName"></div>',
          standalone: true,
        })
        export class SubprojectTestComponent {
          subprojectName: string = 'subproject-a';
        }
      `;

      await env.run('subproject_a/sub_test.component.ts', componentContent, async (filePath) => {
        await env.expectHoverAtCursor(filePath, ['subprojectName', 'string']);
      });
    } finally {
      await fs.rm(subprojectTsconfig, {force: true});
      await env.lspClient.didChangeWatchedFiles(subprojectTsconfig, 3);
      await fs.rm(subprojectDir, {recursive: true, force: true});
    }
  });

  it('should resolve referenced app tsconfig when external HTML template is opened first in a solution-style project', async () => {
    const solutionDir = path.join(testWorkspacePath, 'solution_proj');
    await fs.mkdir(solutionDir, {recursive: true});

    const rootTsconfig = path.join(solutionDir, 'tsconfig.json');
    const appTsconfig = path.join(solutionDir, 'tsconfig.app.json');

    await Promise.all([
      fs.writeFile(
        rootTsconfig,
        JSON.stringify(
          {
            files: [],
            references: [{path: './tsconfig.app.json'}],
          },
          null,
          2,
        ),
      ),
      fs.writeFile(
        appTsconfig,
        JSON.stringify(
          {
            extends: '../tsconfig.json',
            compilerOptions: {
              rootDir: '.',
            },
            include: ['*.ts'],
          },
          null,
          2,
        ),
      ),
    ]);

    await env.lspClient.didChangeWatchedFiles(rootTsconfig, 1);
    await env.lspClient.didChangeWatchedFiles(appTsconfig, 1);

    const tsContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-solution-test',
          templateUrl: './solution.component.html',
          standalone: true,
        })
        export class SolutionTestComponent {
          solutionTitle: string = 'solution-ok';
        }
      `;

    const htmlContent = '<div [title]="¦solutionTitle"></div>';
    const tsFilePath = await env.createFile('solution_proj/solution.component.ts', tsContent);

    try {
      await env.run('solution_proj/solution.component.html', htmlContent, async (htmlFilePath) => {
        // Open the TS file to populate the compiler with component declarations
        await env.openFile(tsFilePath, tsContent);

        // Verify hover on HTML file works cleanly
        await env.expectHoverAtCursor(htmlFilePath, ['solutionTitle', 'string']);
      });
    } finally {
      await Promise.all([fs.rm(rootTsconfig, {force: true}), fs.rm(appTsconfig, {force: true})]);
      await env.lspClient.didChangeWatchedFiles(rootTsconfig, 3);
      await env.lspClient.didChangeWatchedFiles(appTsconfig, 3);
      await fs.rm(solutionDir, {recursive: true, force: true});
    }
  }, 15000);
});
