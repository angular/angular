/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as ts from 'typescript';

import MagicString from 'magic-string';
import {fromObject, generateMapFileComment} from 'convert-source-map';
import {makeProgram} from '../helpers/utils';
import {CompiledClass, DecorationAnalyzer} from '../../src/analysis/decoration_analyzer';
import {SwitchMarkerAnalyzer} from '../../src/analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {Renderer} from '../../src/rendering/renderer';

class TestRenderer extends Renderer {
  constructor(host: Esm2015ReflectionHost) { super(host, false, null, '/src', '/dist', false); }
  addImports(output: MagicString, imports: {name: string, as: string}[]) {
    output.prepend('\n// ADD IMPORTS\n');
  }
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    output.prepend('\n// ADD CONSTANTS\n');
  }
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string) {
    output.prepend('\n// ADD DEFINITIONS\n');
  }
  removeDecorators(output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>) {
    output.prepend('\n// REMOVE DECORATORS\n');
  }
  rewriteSwitchableDeclarations(output: MagicString, sourceFile: ts.SourceFile): void {
    output.prepend('\n// REWRITTEN DECLARATIONS\n');
  }
}

function createTestRenderer(file: {name: string, contents: string}) {
  const program = makeProgram(file);
  const host = new Esm2015ReflectionHost(false, program.getTypeChecker());
  const decorationAnalyses =
      new DecorationAnalyzer(program.getTypeChecker(), host, [''], false).analyzeProgram(program);
  const switchMarkerAnalyses = new SwitchMarkerAnalyzer(host).analyzeProgram(program);
  const renderer = new TestRenderer(host);
  spyOn(renderer, 'addImports').and.callThrough();
  spyOn(renderer, 'addDefinitions').and.callThrough();
  spyOn(renderer, 'removeDecorators').and.callThrough();

  return {renderer, program, decorationAnalyses, switchMarkerAnalyses};
}


describe('Renderer', () => {
  const INPUT_PROGRAM = {
    name: '/src/file.js',
    contents:
        `import { Directive } from '@angular/core';\nexport class A {\n    foo(x) {\n        return x;\n    }\n}\nA.decorators = [\n    { type: Directive, args: [{ selector: '[a]' }] }\n];\n`
  };

  const INPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'file': '/src/file.js',
    'sourceRoot': '',
    'sources': ['/src/file.ts'],
    'names': [],
    'mappings':
        'AAAA,OAAO,EAAE,SAAS,EAAE,MAAM,eAAe,CAAC;AAC1C,MAAM;IACF,GAAG,CAAC,CAAS;QACT,OAAO,CAAC,CAAC;IACb,CAAC;;AACM,YAAU,GAAG;IAChB,EAAE,IAAI,EAAE,SAAS,EAAE,IAAI,EAAE,CAAC,EAAE,QAAQ,EAAE,KAAK,EAAE,CAAC,EAAE;CACnD,CAAC',
    'sourcesContent': [INPUT_PROGRAM.contents]
  });

  const RENDERED_CONTENTS =
      `\n// REMOVE DECORATORS\n\n// ADD IMPORTS\n\n// ADD CONSTANTS\n\n// ADD DEFINITIONS\n` +
      INPUT_PROGRAM.contents;

  const OUTPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'file': '/dist/file.js',
    'sources': ['/src/file.js'],
    'sourcesContent': [INPUT_PROGRAM.contents],
    'names': [],
    'mappings': ';;;;;;;;AAAA;;;;;;;;;'
  });

  const MERGED_OUTPUT_PROGRAM_MAP = fromObject({
    'version': 3,
    'sources': ['/src/file.ts'],
    'names': [],
    'mappings': ';;;;;;;;AAAA',
    'file': '/dist/file.js',
    'sourcesContent': [INPUT_PROGRAM.contents]
  });

  describe('renderProgram()', () => {
    it('should render the modified contents; and a new map file, if the original provided no map file.',
       () => {
         const {renderer, program, decorationAnalyses, switchMarkerAnalyses} =
             createTestRenderer(INPUT_PROGRAM);
         const result = renderer.renderProgram(program, decorationAnalyses, switchMarkerAnalyses);
         expect(result[0].path).toEqual('/dist/file.js');
         expect(result[0].contents)
             .toEqual(RENDERED_CONTENTS + '\n' + generateMapFileComment('/dist/file.js.map'));
         expect(result[1].path).toEqual('/dist/file.js.map');
         expect(result[1].contents).toEqual(OUTPUT_PROGRAM_MAP.toJSON());
       });

    it('should call addImports with the source code and info about the core Angular library.',
       () => {
         const {decorationAnalyses, program, renderer, switchMarkerAnalyses} =
             createTestRenderer(INPUT_PROGRAM);
         renderer.renderProgram(program, decorationAnalyses, switchMarkerAnalyses);
         const addImportsSpy = renderer.addImports as jasmine.Spy;
         expect(addImportsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
         expect(addImportsSpy.calls.first().args[1]).toEqual([
           {name: '@angular/core', as: 'ɵngcc0'}
         ]);
       });

    it('should call addDefinitions with the source code, the analyzed class and the renderered definitions.',
       () => {
         const {decorationAnalyses, program, renderer, switchMarkerAnalyses} =
             createTestRenderer(INPUT_PROGRAM);
         renderer.renderProgram(program, decorationAnalyses, switchMarkerAnalyses);
         const addDefinitionsSpy = renderer.addDefinitions as jasmine.Spy;
         expect(addDefinitionsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);
         expect(addDefinitionsSpy.calls.first().args[1]).toEqual(jasmine.objectContaining({
           name: 'A',
           decorators: [jasmine.objectContaining({name: 'Directive'})],
         }));
         expect(addDefinitionsSpy.calls.first().args[2])
             .toEqual(`/*@__PURE__*/ ɵngcc0.ɵsetClassMetadata(A, [{
        type: Directive,
        args: [{ selector: '[a]' }]
    }], null, { foo: [] });
A.ngDirectiveDef = ɵngcc0.ɵdefineDirective({ type: A, selectors: [["", "a", ""]], factory: function A_Factory(t) { return new (t || A)(); } });`);
       });

    it('should call removeDecorators with the source code, a map of class decorators that have been analyzed',
       () => {
         const {decorationAnalyses, program, renderer, switchMarkerAnalyses} =
             createTestRenderer(INPUT_PROGRAM);
         renderer.renderProgram(program, decorationAnalyses, switchMarkerAnalyses);
         const removeDecoratorsSpy = renderer.removeDecorators as jasmine.Spy;
         expect(removeDecoratorsSpy.calls.first().args[0].toString()).toEqual(RENDERED_CONTENTS);

         // Each map key is the TS node of the decorator container
         // Each map value is an array of TS nodes that are the decorators to remove
         const map = removeDecoratorsSpy.calls.first().args[1] as Map<ts.Node, ts.Node[]>;
         const keys = Array.from(map.keys());
         expect(keys.length).toEqual(1);
         expect(keys[0].getText())
             .toEqual(`[\n    { type: Directive, args: [{ selector: '[a]' }] }\n]`);
         const values = Array.from(map.values());
         expect(values.length).toEqual(1);
         expect(values[0].length).toEqual(1);
         expect(values[0][0].getText()).toEqual(`{ type: Directive, args: [{ selector: '[a]' }] }`);
       });

    it('should merge any inline source map from the original file and write the output as an inline source map',
       () => {
         const {decorationAnalyses, program, renderer, switchMarkerAnalyses} = createTestRenderer({
           ...INPUT_PROGRAM,
           contents: INPUT_PROGRAM.contents + '\n' + INPUT_PROGRAM_MAP.toComment()
         });
         const result = renderer.renderProgram(program, decorationAnalyses, switchMarkerAnalyses);
         expect(result[0].path).toEqual('/dist/file.js');
         expect(result[0].contents)
             .toEqual(RENDERED_CONTENTS + '\n' + MERGED_OUTPUT_PROGRAM_MAP.toComment());
         expect(result[1]).toBeUndefined();
       });

    it('should merge any external source map from the original file and write the output to an external source map',
       () => {
         // Mock out reading the map file from disk
         spyOn(fs, 'readFileSync').and.returnValue(INPUT_PROGRAM_MAP.toJSON());
         const {decorationAnalyses, program, renderer, switchMarkerAnalyses} = createTestRenderer({
           ...INPUT_PROGRAM,
           contents: INPUT_PROGRAM.contents + '\n//# sourceMappingURL=file.js.map'
         });
         const result = renderer.renderProgram(program, decorationAnalyses, switchMarkerAnalyses);
         expect(result[0].path).toEqual('/dist/file.js');
         expect(result[0].contents)
             .toEqual(RENDERED_CONTENTS + '\n' + generateMapFileComment('/dist/file.js.map'));
         expect(result[1].path).toEqual('/dist/file.js.map');
         expect(result[1].contents).toEqual(MERGED_OUTPUT_PROGRAM_MAP.toJSON());
       });
  });
});
