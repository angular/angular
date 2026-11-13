/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The sidecar's stdio JSON-RPC transport: one JSON message per `\n`-terminated line.
 *
 * `serde_json` escapes `\n` and `\r` inside strings but leaves U+2028 and U+2029 unescaped, so
 * the reader must frame on `\n` alone (Node's `readline` also splits on U+2028/U+2029). A line
 * that still fails to parse must fail the run rather than silently drop what it carried.
 */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'path';
import {createHybridCompiler, FileUpdateType, run, SidecarAnalyzer} from '../api.js';
import type {CompilationChunk} from '../src/types.js';
import {
  getOrCreateSyntheticNodeModules,
  resolveSidecarBinary,
  runPipeline,
  TestFile,
} from './utils.js';

const LS = '\u2028';
const PS = '\u2029';

async function drain(stream: AsyncGenerator<CompilationChunk>): Promise<CompilationChunk[]> {
  const chunks: CompilationChunk[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

describe('sidecar JSON-RPC framing', () => {
  it('preserves U+2028 / U+2029 in templates analyzed by the ng-analyze sidecar', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {target: 'es2022', module: 'esnext'},
          files: ['faq.component.ts'],
        }),
      },
      {
        path: '/faq.component.ts',
        content: `
import {Component} from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
})
export class FaqComponent {}
`,
      },
      {
        path: '/faq.component.html',
        content: `<p>Check enrollment ${LS}status for details.</p><p>Next${PS}paragraph</p>`,
      },
    ];

    const outputs = await runPipeline(files, {optimize: false, sidecar: true, format: false});

    const emitted = outputs.find((f) => f.path.endsWith('/faq.component.ts'));
    expect(emitted).withContext('FaqComponent chunk was dropped').toBeDefined();
    expect(emitted!.content).toContain('ɵɵdefineComponent');
  });

  describe('with a scripted sidecar', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(process.env['TEST_TMPDIR'] || os.tmpdir(), 'sidecar-'));
    });

    afterEach(async () => {
      await fs.rm(tmpDir, {recursive: true, force: true});
    });

    /**
     * Writes an executable that answers every request with a `null` result and, on `analyze`,
     * writes each of `analyzeOutput` to stdout as a separate write, byte-for-byte, followed by an
     * `analysisComplete` notification.
     */
    async function createFakeSidecar(analyzeOutput: Buffer[]): Promise<string> {
      const script = path.join(tmpDir, 'fake_sidecar.mjs');
      await fs.writeFile(
        script,
        `
import * as readline from 'node:readline';
const analyzeOutput = ${JSON.stringify(analyzeOutput.map((b) => b.toString('base64')))};
const send = (message) => process.stdout.write(JSON.stringify(message) + '\\n');
const write = (b64) =>
  new Promise((resolve) => process.stdout.write(Buffer.from(b64, 'base64'), resolve));
readline.createInterface({input: process.stdin}).on('line', async (line) => {
  const {id, method} = JSON.parse(line);
  send({id, result: null});
  if (method === 'analyze') {
    for (const b64 of analyzeOutput) {
      await write(b64);
    }
    send({method: 'analysisComplete', params: null});
  }
});
`,
      );
      const launcher = path.join(tmpDir, 'fake_sidecar');
      await fs.writeFile(launcher, `#!/bin/sh\nexec "${process.execPath}" "${script}"\n`);
      await fs.chmod(launcher, 0o755);
      return launcher;
    }

    beforeEach(() => {
      if (process.platform === 'win32') {
        pending('The scripted sidecar launcher is a POSIX shell script.');
      }
    });

    it('frames messages on newlines only, across chunk boundaries', async () => {
      const chunk: CompilationChunk = {
        files: [{filePath: `/a${LS}b${PS}c.ts`} as CompilationChunk['files'][number]],
      };
      const bytes = Buffer.from(
        JSON.stringify({method: 'analysisResult', params: chunk}) + '\n',
        'utf8',
      );
      // Split inside the 3-byte UTF-8 encoding of U+2028 to exercise partial-line buffering.
      const split = bytes.indexOf(Buffer.from(LS, 'utf8')) + 1;
      const sidecarPath = await createFakeSidecar([
        bytes.subarray(0, split),
        bytes.subarray(split),
      ]);

      const sidecar = new SidecarAnalyzer(sidecarPath);
      try {
        await sidecar.initialize('/tsconfig.json', false);
        expect(await drain(sidecar.analyze())).toEqual([chunk]);
      } finally {
        sidecar.close();
      }
    });

    it('fails the analysis stream and later requests on an unparseable message', async () => {
      const sidecarPath = await createFakeSidecar([
        Buffer.from('{"method":"analysisResult","params":\n', 'utf8'),
      ]);

      const sidecar = new SidecarAnalyzer(sidecarPath);
      try {
        await sidecar.initialize('/tsconfig.json', false);
        await expectAsync(drain(sidecar.analyze())).toBeRejectedWithError(
          /Sidecar emitted an unparseable message .* during analysis/,
        );
        await expectAsync(sidecar.getFileContent('/a.ts')).toBeRejectedWithError(
          /Sidecar emitted an unparseable message/,
        );
      } finally {
        sidecar.close();
      }
    });
  });

  it('supports incremental invalidation and cross-file dependency template prefetch in sidecar mode', async () => {
    const tmpDir = await fs.realpath(
      await fs.mkdtemp(path.join(process.env['TEST_TMPDIR'] || os.tmpdir(), 'sidecar-inc-')),
    );
    const sidecar = new SidecarAnalyzer(resolveSidecarBinary());
    try {
      const nodeModules = getOrCreateSyntheticNodeModules();
      if (nodeModules) {
        await fs.symlink(nodeModules, path.join(tmpDir, 'node_modules'), 'dir');
      }
      const childTs = path.join(tmpDir, 'child.component.ts');
      const deferredTs = path.join(tmpDir, 'deferred.component.ts');
      const parentTs = path.join(tmpDir, 'parent.component.ts');
      const parentHtml = path.join(tmpDir, 'parent.component.html');
      const tsconfigPath = path.join(tmpDir, 'tsconfig.json');

      await Promise.all([
        fs.writeFile(
          childTs,
          `
import {Component} from '@angular/core';
@Component({selector: 'app-child', template: '<ng-content></ng-content>'})
export class ChildComponent {}
`,
        ),
        fs.writeFile(
          deferredTs,
          `
import {Component} from '@angular/core';
@Component({selector: 'app-deferred', template: '<ng-content select="[slot]"></ng-content>'})
export class DeferredComponent {}
`,
        ),
        fs.writeFile(
          parentTs,
          `
import {Component} from '@angular/core';
import {ChildComponent} from './child.component';
import {DeferredComponent} from './deferred.component';
@Component({
  selector: 'app-parent',
  imports: [ChildComponent, DeferredComponent],
  templateUrl: './parent.component.html',
})
export class ParentComponent {}
`,
        ),
        fs.writeFile(
          parentHtml,
          `<app-child>v1</app-child>@defer {<app-deferred><span slot>d</span></app-deferred>}`,
        ),
        fs.writeFile(
          tsconfigPath,
          JSON.stringify({
            compilerOptions: {target: 'es2022', module: 'esnext'},
            files: ['child.component.ts', 'deferred.component.ts', 'parent.component.ts'],
          }),
        ),
      ]);

      await sidecar.initialize(tsconfigPath, true, undefined, undefined, {
        workspaceName: 'custom_ws',
      });
      expect(sidecar.getCompilerOptions().workspaceName).toBe('custom_ws');

      const compiler = createHybridCompiler(sidecar, {
        optimize: true,
        rootDir: tmpDir,
        incremental: true,
      });

      await run(compiler, {
        inPlace: true,
        rootDir: tmpDir,
        tsconfigPath,
        keepAnalyzerAlive: true,
      });
      expect(compiler.fileCache.get(parentTs)?.boundFingerprint).toBeDefined();
      expect((await sidecar.getMetadataForFile(parentTs))?.fingerprint).toMatch(/^[0-9a-f]{16}$/);

      await fs.writeFile(
        parentHtml,
        `<app-child>v2</app-child>@defer {<app-deferred><span slot>d</span></app-deferred>}`,
      );
      const changes = [{filePath: parentHtml, updateType: FileUpdateType.Changed}];
      const invalidated = await sidecar.invalidateFiles(changes);
      expect(invalidated).toContain(parentTs);
      compiler.applyInvalidations(changes, invalidated);

      const serializeCached = spyOn<any>(compiler, 'serializeCached').and.callThrough();

      await run(compiler, {
        inPlace: true,
        rootDir: tmpDir,
        tsconfigPath,
        keepAnalyzerAlive: true,
      });
      const parentNgTs = await fs.readFile(path.join(tmpDir, 'parent.component.ng.ts'), 'utf-8');
      expect(parentNgTs).toContain('v2');
      expect(
        serializeCached.calls
          .allArgs()
          .some((args) => args[0] && typeof args[0] === 'object' && 'classes' in args[0]),
      ).toBeFalse();
    } finally {
      sidecar.close();
      await fs.rm(tmpDir, {recursive: true, force: true});
    }
  });
});
