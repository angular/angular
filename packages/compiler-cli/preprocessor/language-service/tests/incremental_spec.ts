/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import * as rpc from 'vscode-jsonrpc/node';
import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from './test_file_manager';

import {TsGoFacade} from '../src/facade';

const testWorkspacePath = getTestWorkspacePath();

describe('Incremental Analysis', () => {
  let connection: rpc.MessageConnection;
  let facade: TsGoFacade;
  let serverCleanup: () => Promise<void>;
  let env: TestEnv;

  beforeAll(async () => {
    const result = await startTestServer(testWorkspacePath);
    facade = result.facade;
    connection = result.connection;
    serverCleanup = result.cleanup;
  });

  beforeEach(() => {
    const fileManager = new TestFileManager(testWorkspacePath);
    env = new TestEnv(facade, fileManager, connection);
  });

  afterAll(async () => {
    await serverCleanup();
  });

  it('should update hover info when file content changes', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-inc-test',
        template: '<div [title]="¦name"></div>',
        standalone: true,
      })
      export class AppIncTestComponent {
        name!: string;
      }
    `;

    await env.run('app_inc_test.ts', appTsContent, async (ls, filePath) => {
      await env.expectHoverAtCursor(ls, filePath, ['string']);

      const updatedContent = `
      import {Component} from '@angular/core';
      @Component({ template: '<div [title]="¦name"></div>'})
      export class AppIncTestComponent {
        name!: number;
      }
    `;
      await env.editFile(filePath, updatedContent, 'virtual');

      await env.expectHoverAtCursor(ls, filePath, ['number']);
    });
  });

  it('should resolve hover when imported file is added', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      import {value} from './new_file';
      @Component({
        selector: 'app-add-test',
        template: '{{¦val}}',
        standalone: true,
      })
      export class AppAddTestComponent {
        readonly val = value;
      }
    `;

    await env.run('app_add_test.ts', appTsContent, async (ls, filePath) => {
      const newFilePath = path.join(testWorkspacePath, 'new_file.ts');
      const newFileContent = `export const value = "hello";`;

      await env.openFile(newFilePath, newFileContent);

      await env.expectHoverAtCursor(ls, filePath, ['"hello"']);
    });
  });
});
