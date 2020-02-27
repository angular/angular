/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom as _, FileSystem, getFileSystem, getSourceFileOrError, NgtscCompilerHost, setFileSystem} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NgCompilerOptions} from '../api';
import {NgCompiler} from '../src/compiler';
import {NgCompilerHost} from '../src/host';


runInEachFileSystem(() => {
  describe('NgCompiler', () => {
    let fs: FileSystem;

    beforeEach(() => {
      fs = getFileSystem();
      fs.ensureDir(_('/node_modules/@angular/core'));
      fs.writeFile(_('/node_modules/@angular/core/index.d.ts'), `
        export declare const Component: any;
      `);
    });

    it('should also return template diagnostics when asked for component diagnostics', () => {
      const COMPONENT = _('/cmp.ts');
      fs.writeFile(COMPONENT, `
        import {Component} from '@angular/core';
        @Component({
          selector: 'test-cmp',
          templateUrl: './template.html',
        })
        export class Cmp {}
      `);
      fs.writeFile(_('/template.html'), `{{does_not_exist.foo}}`);

      const options: NgCompilerOptions = {
        strictTemplates: true,
      };
      const baseHost = new NgtscCompilerHost(getFileSystem(), options);
      const host = NgCompilerHost.wrap(baseHost, [COMPONENT], options, /* oldProgram */ null);
      const program = ts.createProgram({host, options, rootNames: host.inputFiles});
      const compiler = new NgCompiler(host, options, program);

      const diags = compiler.getDiagnostics(getSourceFileOrError(program, COMPONENT));
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('does_not_exist');
    });
  });
});
