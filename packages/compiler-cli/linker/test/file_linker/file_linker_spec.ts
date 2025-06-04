/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {outputAst as o} from '@angular/compiler';
import ts from 'typescript';

import {MockFileSystemNative} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {TypeScriptAstFactory} from '../../../src/ngtsc/translator';
import {AstHost} from '../../src/ast/ast_host';
import {TypeScriptAstHost} from '../../src/ast/typescript/typescript_ast_host';
import {DeclarationScope} from '../../src/file_linker/declaration_scope';
import {FileLinker} from '../../src/file_linker/file_linker';
import {LinkerEnvironment} from '../../src/file_linker/linker_environment';
import {DEFAULT_LINKER_OPTIONS} from '../../src/file_linker/linker_options';
import {PartialDirectiveLinkerVersion1} from '../../src/file_linker/partial_linkers/partial_directive_linker_1';

import {generate} from './helpers';

describe('FileLinker', () => {
  let factory: TypeScriptAstFactory;
  beforeEach(() => (factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false)));

  describe('isPartialDeclaration()', () => {
    it('should return true if the callee is recognized', () => {
      const {fileLinker} = createFileLinker();
      expect(fileLinker.isPartialDeclaration('ɵɵngDeclareDirective')).toBe(true);
      expect(fileLinker.isPartialDeclaration('ɵɵngDeclareComponent')).toBe(true);
    });

    it('should return false if the callee is not recognized', () => {
      const {fileLinker} = createFileLinker();
      expect(fileLinker.isPartialDeclaration('$foo')).toBe(false);
    });
  });

  describe('linkPartialDeclaration()', () => {
    it('should throw an error if the function name is not recognised', () => {
      const {fileLinker} = createFileLinker();
      const version = factory.createLiteral('0.0.0-PLACEHOLDER');
      const ngImport = factory.createIdentifier('core');
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'minVersion', quoted: false, value: version},
        {propertyName: 'version', quoted: false, value: version},
        {propertyName: 'ngImport', quoted: false, value: ngImport},
      ]);
      expect(() =>
        fileLinker.linkPartialDeclaration('foo', [declarationArg], new MockDeclarationScope()),
      ).toThrowError('Unknown partial declaration function foo.');
    });

    it('should throw an error if the metadata object does not have a `minVersion` property', () => {
      const {fileLinker} = createFileLinker();
      const version = factory.createLiteral('0.0.0-PLACEHOLDER');
      const ngImport = factory.createIdentifier('core');
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'version', quoted: false, value: version},
        {propertyName: 'ngImport', quoted: false, value: ngImport},
      ]);
      expect(() =>
        fileLinker.linkPartialDeclaration(
          'ɵɵngDeclareDirective',
          [declarationArg],
          new MockDeclarationScope(),
        ),
      ).toThrowError(`Expected property 'minVersion' to be present.`);
    });

    it('should throw an error if the metadata object does not have a `version` property', () => {
      const {fileLinker} = createFileLinker();
      const version = factory.createLiteral('0.0.0-PLACEHOLDER');
      const ngImport = factory.createIdentifier('core');
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'minVersion', quoted: false, value: version},
        {propertyName: 'ngImport', quoted: false, value: ngImport},
      ]);
      expect(() =>
        fileLinker.linkPartialDeclaration(
          'ɵɵngDeclareDirective',
          [declarationArg],
          new MockDeclarationScope(),
        ),
      ).toThrowError(`Expected property 'version' to be present.`);
    });

    it('should throw an error if the metadata object does not have a `ngImport` property', () => {
      const {fileLinker} = createFileLinker();
      const version = factory.createLiteral('0.0.0-PLACEHOLDER');
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'minVersion', quoted: false, value: version},
        {propertyName: 'version', quoted: false, value: version},
      ]);
      expect(() =>
        fileLinker.linkPartialDeclaration(
          'ɵɵngDeclareDirective',
          [declarationArg],
          new MockDeclarationScope(),
        ),
      ).toThrowError(`Expected property 'ngImport' to be present.`);
    });

    it('should call `linkPartialDeclaration()` on the appropriate partial compiler', () => {
      const {fileLinker} = createFileLinker();
      const compileSpy = spyOn(
        PartialDirectiveLinkerVersion1.prototype,
        'linkPartialDeclaration',
      ).and.returnValue({
        expression: o.literal('compilation result'),
        statements: [],
      });

      const ngImport = factory.createIdentifier('core');
      const version = factory.createLiteral('0.0.0-PLACEHOLDER');
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'ngImport', quoted: false, value: ngImport},
        {propertyName: 'minVersion', quoted: false, value: version},
        {propertyName: 'version', quoted: false, value: version},
      ]);

      const compilationResult = fileLinker.linkPartialDeclaration(
        'ɵɵngDeclareDirective',
        [declarationArg],
        new MockDeclarationScope(),
      );

      expect(compilationResult).toEqual(factory.createLiteral('compilation result'));
      expect(compileSpy).toHaveBeenCalled();
      expect(compileSpy.calls.mostRecent().args[1].getNode('ngImport')).toBe(ngImport);
    });
  });

  describe('block syntax support', () => {
    function linkComponentWithTemplate(version: string, template: string): string {
      // Note that the `minVersion` is set to the placeholder,
      // because that's what we have in the source code as well.
      const source = `
        ɵɵngDeclareComponent({
          minVersion: "0.0.0-PLACEHOLDER",
          version: "${version}",
          ngImport: core,
          template: \`${template}\`,
          isInline: true,
          type: SomeComp
        });
      `;

      // We need to create a new source file here, because template parsing requires
      // the template string to have offsets which synthetic nodes do not.
      const {fileLinker} = createFileLinker(source);
      const sourceFile = ts.createSourceFile('', source, ts.ScriptTarget.Latest, true);
      const call = (sourceFile.statements[0] as ts.ExpressionStatement)
        .expression as ts.CallExpression;
      const result = fileLinker.linkPartialDeclaration(
        'ɵɵngDeclareComponent',
        [call.arguments[0]],
        new MockDeclarationScope(),
      );
      return ts.createPrinter().printNode(ts.EmitHint.Unspecified, result, sourceFile);
    }

    it('should enable block syntax if compiled with version 17 or above', () => {
      for (const version of ['17.0.0', '17.0.1', '17.1.0', '17.0.0-next.0', '18.0.0']) {
        expect(linkComponentWithTemplate(version, '@defer {}')).toContain('ɵɵdefer(');
      }
    });

    it('should enable block syntax if compiled with a local version', () => {
      expect(linkComponentWithTemplate('0.0.0-PLACEHOLDER', '@defer {}')).toContain('ɵɵdefer(');
    });

    it('should not enable block syntax if compiled with a version older than 17', () => {
      expect(
        linkComponentWithTemplate('16.2.0', '@Input() is a decorator. This is a brace }'),
      ).toContain('@Input() is a decorator. This is a brace }');
    });
  });

  describe('getConstantStatements()', () => {
    it('should capture shared constant values', () => {
      const {fileLinker} = createFileLinker();
      spyOnLinkPartialDeclarationWithConstants(o.literal('REPLACEMENT'));

      // Here we use the `core` identifier for `ngImport` to trigger the use of a shared scope for
      // constant statements.
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'ngImport', quoted: false, value: factory.createIdentifier('core')},
        {
          propertyName: 'minVersion',
          quoted: false,
          value: factory.createLiteral('0.0.0-PLACEHOLDER'),
        },
        {propertyName: 'version', quoted: false, value: factory.createLiteral('0.0.0-PLACEHOLDER')},
      ]);

      const replacement = fileLinker.linkPartialDeclaration(
        'ɵɵngDeclareDirective',
        [declarationArg],
        new MockDeclarationScope(),
      );
      expect(generate(replacement)).toEqual('"REPLACEMENT"');

      const results = fileLinker.getConstantStatements();
      expect(results.length).toEqual(1);
      const {constantScope, statements} = results[0];
      expect(constantScope).toBe(MockConstantScopeRef.singleton);
      expect(statements.map(generate)).toEqual(['const _c0 = [1];']);
    });

    it('should be no shared constant statements to capture when they are emitted into the replacement IIFE', () => {
      const {fileLinker} = createFileLinker();
      spyOnLinkPartialDeclarationWithConstants(o.literal('REPLACEMENT'));

      // Here we use a string literal `"not-a-module"` for `ngImport` to cause constant
      // statements to be emitted in an IIFE rather than added to the shared constant scope.
      const declarationArg = factory.createObjectLiteral([
        {propertyName: 'ngImport', quoted: false, value: factory.createLiteral('not-a-module')},
        {
          propertyName: 'minVersion',
          quoted: false,
          value: factory.createLiteral('0.0.0-PLACEHOLDER'),
        },
        {
          propertyName: 'version',
          quoted: false,
          value: factory.createLiteral('0.0.0-PLACEHOLDER'),
        },
      ]);

      const replacement = fileLinker.linkPartialDeclaration(
        'ɵɵngDeclareDirective',
        [declarationArg],
        new MockDeclarationScope(),
      );
      expect(generate(replacement)).toEqual(
        'function () { const _c0 = [1]; return "REPLACEMENT"; }()',
      );

      const results = fileLinker.getConstantStatements();
      expect(results.length).toEqual(0);
    });
  });

  function createFileLinker(code = '// test code'): {
    host: AstHost<ts.Expression>;
    fileLinker: FileLinker<MockConstantScopeRef, ts.Statement, ts.Expression>;
  } {
    const fs = new MockFileSystemNative();
    const logger = new MockLogger();
    const linkerEnvironment = LinkerEnvironment.create<ts.Statement, ts.Expression>(
      fs,
      logger,
      new TypeScriptAstHost(),
      new TypeScriptAstFactory(/* annotateForClosureCompiler */ false),
      DEFAULT_LINKER_OPTIONS,
    );
    const fileLinker = new FileLinker<MockConstantScopeRef, ts.Statement, ts.Expression>(
      linkerEnvironment,
      fs.resolve('/test.js'),
      code,
    );
    return {host: linkerEnvironment.host, fileLinker};
  }
});

/**
 * This mock implementation of `DeclarationScope` will return a singleton instance of
 * `MockConstantScopeRef` if the expression is an identifier, or `null` otherwise.
 *
 * This way we can simulate whether the constants will be shared or inlined into an IIFE.
 */
class MockDeclarationScope implements DeclarationScope<MockConstantScopeRef, ts.Expression> {
  getConstantScopeRef(expression: ts.Expression): MockConstantScopeRef | null {
    if (ts.isIdentifier(expression)) {
      return MockConstantScopeRef.singleton;
    } else {
      return null;
    }
  }
}

class MockConstantScopeRef {
  private constructor() {}
  static singleton = new MockDeclarationScope();
}

/**
 * Spy on the `PartialDirectiveLinkerVersion1.linkPartialDeclaration()` method, triggering
 * shared constants to be created.
 */
function spyOnLinkPartialDeclarationWithConstants(replacement: o.Expression) {
  let callCount = 0;
  spyOn(PartialDirectiveLinkerVersion1.prototype, 'linkPartialDeclaration').and.callFake(((
    constantPool,
  ) => {
    const constArray = o.literalArr([o.literal(++callCount)]);
    // We have to add the constant twice or it will not create a shared statement
    constantPool.getConstLiteral(constArray);
    constantPool.getConstLiteral(constArray);
    return {
      expression: replacement,
      statements: [],
    };
  }) as typeof PartialDirectiveLinkerVersion1.prototype.linkPartialDeclaration);
}
