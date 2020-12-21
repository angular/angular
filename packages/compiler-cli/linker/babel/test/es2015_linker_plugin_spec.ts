/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler/src/output/output_ast';
import {NodePath, PluginObj, transformSync} from '@babel/core';
import generate from '@babel/generator';
import * as t from '@babel/types';

import {FileLinker} from '../../../linker';
import {MockFileSystemNative} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {PartialDirectiveLinkerVersion1} from '../../src/file_linker/partial_linkers/partial_directive_linker_1';
import {createEs2015LinkerPlugin} from '../src/es2015_linker_plugin';

describe('createEs2015LinkerPlugin()', () => {
  it('should return a Babel plugin visitor that handles Program (enter/exit) and CallExpression nodes',
     () => {
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       expect(plugin.visitor).toEqual({
         Program: {
           enter: jasmine.any(Function),
           exit: jasmine.any(Function),
         },
         CallExpression: jasmine.any(Function),
       });
     });

  it('should return a Babel plugin that calls FileLinker.isPartialDeclaration() on each call expression',
     () => {
       const isPartialDeclarationSpy = spyOn(FileLinker.prototype, 'isPartialDeclaration');

       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       transformSync(
           [
             'var core;', `fn1()`, 'fn2({prop: () => fn3({})});', `x.method(() => fn4());`,
             'spread(...x);'
           ].join('\n'),
           {
             plugins: [plugin],
             filename: '/test.js',
             parserOpts: {sourceType: 'unambiguous'},
           });
       expect(isPartialDeclarationSpy.calls.allArgs()).toEqual([
         ['fn1'],
         ['fn2'],
         ['fn3'],
         ['method'],
         ['fn4'],
         ['spread'],
       ]);
     });

  it('should return a Babel plugin that calls FileLinker.linkPartialDeclaration() on each matching declaration',
     () => {
       const linkSpy = spyOn(FileLinker.prototype, 'linkPartialDeclaration')
                           .and.returnValue(t.identifier('REPLACEMENT'));
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});

       transformSync(
           [
             'var core;',
             `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core, x: 1});`,
             `ɵɵngDeclareComponent({version: '0.0.0-PLACEHOLDER', ngImport: core, foo: () => ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core, x: 2})});`,
             `x.qux(() => ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core, x: 3}));`,
             'spread(...x);',
           ].join('\n'),
           {
             plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
             filename: '/test.js',
             parserOpts: {sourceType: 'unambiguous'},
           });

       expect(humanizeLinkerCalls(linkSpy.calls)).toEqual([
         ['ɵɵngDeclareDirective', '{version:\'0.0.0-PLACEHOLDER\',ngImport:core,x:1}'],
         [
           'ɵɵngDeclareComponent',
           '{version:\'0.0.0-PLACEHOLDER\',ngImport:core,foo:()=>ɵɵngDeclareDirective({version:\'0.0.0-PLACEHOLDER\',ngImport:core,x:2})}'
         ],
         // Note we do not process `x:2` declaration since it is nested within another declaration
         ['ɵɵngDeclareDirective', '{version:\'0.0.0-PLACEHOLDER\',ngImport:core,x:3}']
       ]);
     });

  it('should return a Babel plugin that replaces call expressions with the return value from FileLinker.linkPartialDeclaration()',
     () => {
       let replaceCount = 0;
       spyOn(FileLinker.prototype, 'linkPartialDeclaration')
           .and.callFake(() => t.identifier('REPLACEMENT_' + ++replaceCount));
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       const result = transformSync(
           [
             'var core;',
             'ɵɵngDeclareDirective({version: \'0.0.0-PLACEHOLDER\', ngImport: core});',
             'ɵɵngDeclareDirective({version: \'0.0.0-PLACEHOLDER\', ngImport: core, foo: () => bar({})});',
             'x.qux();',
             'spread(...x);',
           ].join('\n'),
           {
             plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
             filename: '/test.js',
             parserOpts: {sourceType: 'unambiguous'},
             generatorOpts: {compact: true},
           });
       expect(result!.code).toEqual('var core;REPLACEMENT_1;REPLACEMENT_2;x.qux();spread(...x);');
     });

  it('should return a Babel plugin that adds shared statements after any imports', () => {
    spyOnLinkPartialDeclarationWithConstants(o.literal('REPLACEMENT'));
    const fileSystem = new MockFileSystemNative();
    const logger = new MockLogger();
    const plugin = createEs2015LinkerPlugin({fileSystem, logger});
    const result = transformSync(
        [
          'import * as core from \'some-module\';',
          'import {id} from \'other-module\';',
          `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
          `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
          `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
        ].join('\n'),
        {
          plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
          filename: '/test.js',
          parserOpts: {sourceType: 'unambiguous'},
          generatorOpts: {compact: true},
        });
    expect(result!.code)
        .toEqual(
            'import*as core from\'some-module\';import{id}from\'other-module\';const _c0=[1];const _c1=[2];const _c2=[3];"REPLACEMENT";"REPLACEMENT";"REPLACEMENT";');
  });

  it('should return a Babel plugin that adds shared statements at the start of the program if it is an ECMAScript Module and there are no imports',
     () => {
       spyOnLinkPartialDeclarationWithConstants(o.literal('REPLACEMENT'));
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       const result = transformSync(
           [
             'var core;',
             `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
           ].join('\n'),
           {
             plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
             filename: '/test.js',
             // We declare the file as a module because this cannot be inferred from the source
             parserOpts: {sourceType: 'module'},
             generatorOpts: {compact: true},
           });
       expect(result!.code)
           .toEqual(
               'const _c0=[1];const _c1=[2];const _c2=[3];var core;"REPLACEMENT";"REPLACEMENT";"REPLACEMENT";');
     });

  it('should return a Babel plugin that adds shared statements at the start of the function body if the ngImport is from a function parameter',
     () => {
       spyOnLinkPartialDeclarationWithConstants(o.literal('REPLACEMENT'));
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       const result = transformSync(
           [
             'function run(core) {',
             `  ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             `  ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             `  ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`, '}'
           ].join('\n'),
           {
             plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
             filename: '/test.js',
             parserOpts: {sourceType: 'unambiguous'},
             generatorOpts: {compact: true},
           });
       expect(result!.code)
           .toEqual(
               'function run(core){const _c0=[1];const _c1=[2];const _c2=[3];"REPLACEMENT";"REPLACEMENT";"REPLACEMENT";}');
     });

  it('should return a Babel plugin that adds shared statements into an IIFE if no scope could not be derived for the ngImport',
     () => {
       spyOnLinkPartialDeclarationWithConstants(o.literal('REPLACEMENT'));
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       const result = transformSync(
           [
             'function run() {',
             `  ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             `  ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             `  ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
             '}',
           ].join('\n'),
           {
             plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
             filename: '/test.js',
             parserOpts: {sourceType: 'unambiguous'},
             generatorOpts: {compact: true},
           });
       expect(result!.code).toEqual([
         `function run(){`,
         `(function(){const _c0=[1];return"REPLACEMENT";})();`,
         `(function(){const _c0=[2];return"REPLACEMENT";})();`,
         `(function(){const _c0=[3];return"REPLACEMENT";})();`,
         `}`,
       ].join(''));
     });

  it('should still execute other plugins that match AST nodes inside the result of the replacement',
     () => {
       spyOnLinkPartialDeclarationWithConstants(o.fn([], [], null, null, 'FOO'));
       const fileSystem = new MockFileSystemNative();
       const logger = new MockLogger();
       const plugin = createEs2015LinkerPlugin({fileSystem, logger});
       const result = transformSync(
           [
             `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core}); FOO;`,
           ].join('\n'),
           {
             plugins: [
               createEs2015LinkerPlugin({fileSystem, logger}),
               createIdentifierMapperPlugin('FOO', 'BAR'),
               createIdentifierMapperPlugin('_c0', 'x1'),
             ],
             filename: '/test.js',
             parserOpts: {sourceType: 'module'},
             generatorOpts: {compact: true},
           });
       expect(result!.code).toEqual([
         `(function(){const x1=[1];return function BAR(){};})();BAR;`,
       ].join(''));
     });

  it('should not process call expressions within inserted functions', () => {
    spyOn(PartialDirectiveLinkerVersion1.prototype, 'linkPartialDeclaration')
        .and.callFake((constantPool => {
                        // Insert a call expression into the constant pool. This is inserted into
                        // Babel's AST upon program exit, and will therefore be visited by Babel
                        // outside of an active linker context.
                        constantPool.statements.push(
                            o.fn(/* params */[], /* body */[], /* type */ undefined,
                                 /* sourceSpan */ undefined, /* name */ 'inserted')
                                .callFn([])
                                .toStmt());

                        return o.literal('REPLACEMENT');
                      }) as typeof PartialDirectiveLinkerVersion1.prototype.linkPartialDeclaration);

    const isPartialDeclarationSpy =
        spyOn(FileLinker.prototype, 'isPartialDeclaration').and.callThrough();

    const fileSystem = new MockFileSystemNative();
    const logger = new MockLogger();
    const plugin = createEs2015LinkerPlugin({fileSystem, logger});
    const result = transformSync(
        [
          'import * as core from \'some-module\';',
          `ɵɵngDeclareDirective({version: '0.0.0-PLACEHOLDER', ngImport: core})`,
        ].join('\n'),
        {
          plugins: [createEs2015LinkerPlugin({fileSystem, logger})],
          filename: '/test.js',
          parserOpts: {sourceType: 'unambiguous'},
          generatorOpts: {compact: true},
        });
    expect(result!.code)
        .toEqual('import*as core from\'some-module\';(function inserted(){})();"REPLACEMENT";');

    expect(isPartialDeclarationSpy.calls.allArgs()).toEqual([['ɵɵngDeclareDirective']]);
  });
});

/**
 * Convert the arguments of the spied-on `calls` into a human readable array.
 */
function humanizeLinkerCalls(
    calls: jasmine.Calls<typeof FileLinker.prototype.linkPartialDeclaration>) {
  return calls.all().map(({args: [fn, args]}) => [fn, generate(args[0], {compact: true}).code]);
}

/**
 * Spy on the `PartialDirectiveLinkerVersion1.linkPartialDeclaration()` method, triggering
 * shared constants to be created.
 */
function spyOnLinkPartialDeclarationWithConstants(replacement: o.Expression) {
  let callCount = 0;
  spyOn(PartialDirectiveLinkerVersion1.prototype, 'linkPartialDeclaration')
      .and.callFake((constantPool => {
                      const constArray = o.literalArr([o.literal(++callCount)]);
                      // We have to add the constant twice or it will not create a shared statement
                      constantPool.getConstLiteral(constArray);
                      constantPool.getConstLiteral(constArray);
                      return replacement;
                    }) as typeof PartialDirectiveLinkerVersion1.prototype.linkPartialDeclaration);
}

/**
 * A simple Babel plugin that will replace all identifiers that match `<src>` with identifiers
 * called `<dest>`.
 */
function createIdentifierMapperPlugin(src: string, dest: string): PluginObj {
  return {
    visitor: {
      Identifier(path: NodePath<t.Identifier>) {
        if (path.node.name === src) {
          path.replaceWith(t.identifier(dest));
        }
      }
    },
  };
}
