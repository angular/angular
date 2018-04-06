/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {main, readCommandLineAndConfiguration, watchMode} from '../../src/main';

import {isInBazel, makeTempDir, setup} from '../test_support';

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

describe('ngc transformer command-line', () => {
  let basePath: string;
  let outDir: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function shouldExist(fileName: string) {
    if (!fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function shouldNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function getContents(fileName: string): string {
    shouldExist(fileName);
    const modulePath = path.resolve(outDir, fileName);
    return fs.readFileSync(modulePath, 'utf8');
  }

  function writeConfig(
      tsconfig: string =
          '{"extends": "./tsconfig-base.json", "angularCompilerOptions": {"enableIvy": "ngtsc"}}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    if (isInBazel) {
      const support = setup();
      basePath = support.basePath;
      outDir = path.join(basePath, 'built');
      process.chdir(basePath);
      write = (fileName: string, content: string) => { support.write(fileName, content); };
    } else {
      basePath = makeTempDir();
      process.chdir(basePath);
      write = (fileName: string, content: string) => {
        const dir = path.dirname(fileName);
        if (dir != '.') {
          const newDir = path.join(basePath, dir);
          if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
        }
        fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
      };
      outDir = path.resolve(basePath, 'built');
      const ngRootDir = getNgRootDir();
      const nodeModulesPath = path.resolve(basePath, 'node_modules');
      fs.mkdirSync(nodeModulesPath);
      fs.symlinkSync(
          path.resolve(ngRootDir, 'dist', 'all', '@angular'),
          path.resolve(nodeModulesPath, '@angular'));
      fs.symlinkSync(
          path.resolve(ngRootDir, 'node_modules', 'rxjs'), path.resolve(nodeModulesPath, 'rxjs'));
    }
    write('tsconfig-base.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "types": [],
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "declaration": true,
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"],
        "typeRoots": ["node_modules/@types"]
      },
      "angularCompilerOptions": {
        "enableIvy": "ngtsc"
      }
    }`);
  });

  it('should compile without errors', () => {
    writeConfig();
    write('test.ts', 'export const A = 1;');

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const contents = getContents('test.js');
    expect(contents).toContain('A = 1');
    shouldExist('testc.d.ts');
  });
});
