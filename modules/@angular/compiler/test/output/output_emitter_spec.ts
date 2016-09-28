/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {interpretStatements} from '@angular/compiler/src/output/output_interpreter';
import {jitStatements} from '@angular/compiler/src/output/output_jit';
import {EventEmitter} from '@angular/core';
import {ViewType} from '@angular/core/src/linker/view_type';
import {beforeEach, describe, it} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

import * as typed from './output_emitter_codegen_typed';
import * as untyped from './output_emitter_codegen_untyped';
import {ExternalClass, codegenStmts} from './output_emitter_util';

export function main() {
  var outputDefs: any[] /** TODO #9100 */ = [];
  outputDefs.push({
    'getExpressions': () => interpretStatements(codegenStmts, 'getExpressions'),
    'name': 'interpreted'
  });

  if (!getDOM().supportsDOMEvents()) {
    // Our generator only works on node.js
    outputDefs.push({'getExpressions': () => typed.getExpressions, 'name': 'typed'});
  } else {
    // Our generator only works on node.js
    if (!getDOM().supportsDOMEvents()) {
      outputDefs.push({'getExpressions': () => untyped.getExpressions, 'name': 'untyped'});
    }
    outputDefs.push({
      'getExpressions': () => jitStatements('output_emitter_spec', codegenStmts, 'getExpressions'),
      'name': 'jit'
    });
  }

  describe('output emitter', () => {
    outputDefs.forEach((outputDef) => {
      describe(`${outputDef['name']}`, () => {
        var expressions: any /** TODO #9100 */;
        beforeEach(() => { expressions = outputDef['getExpressions']()(); });

        it('should support literals', () => {
          expect(expressions['stringLiteral']).toEqual('Hello World!');
          expect(expressions['intLiteral']).toEqual(42);
          expect(expressions['boolLiteral']).toEqual(true);
          expect(expressions['arrayLiteral']).toEqual([0]);
          expect(expressions['mapLiteral']).toEqual({'key0': 0});
        });

        it('should support reading vars/keys/props', () => {
          expect(expressions['readVar']).toEqual('someValue');
          expect(expressions['readKey']).toEqual('someValue');
          expect(expressions['readPropExternalInstance']).toEqual('someValue');
          expect(expressions['readPropDynamicInstance']).toEqual('dynamicValue');
          expect(expressions['readGetterDynamicInstance'])
              .toEqual({'data': 'someValue', 'dynamicProp': 'dynamicValue'});
        });

        it('should support writing to vars / keys / props', () => {
          expect(expressions['changedVar']).toEqual('changedValue');
          expect(expressions['changedKey']).toEqual('changedValue');
          expect(expressions['changedPropExternalInstance']).toEqual('changedValue');
          expect(expressions['changedPropDynamicInstance']).toEqual('changedValue');
        });

        it('should support declaring functions with parameters and return', () => {
          expect(expressions['fn']('someParam')).toEqual({'param': 'someParam'});
          expect(expressions['closureInDynamicInstance']('someParam'))
              .toEqual({'param': 'someParam', 'data': 'someValue', 'dynamicProp': 'dynamicValue'});
        });

        it('should support invoking functions and methods', () => {
          expect(expressions['invokeFn']).toEqual({'param': 'someParam'});
          expect(expressions['concatedArray']).toEqual([0, 1]);
          expect(expressions['invokeMethodExternalInstance'])
              .toEqual({'data': 'someValue', 'param': 'someParam'});
          expect(expressions['invokeMethodExternalInstanceViaBind'])
              .toEqual({'data': 'someValue', 'param': 'someParam'});
          expect(expressions['invokeMethodDynamicInstance'])
              .toEqual({'data': 'someValue', 'dynamicProp': 'dynamicValue', 'param': 'someParam'});
          expect(expressions['invokeMethodDynamicInstanceViaBind'])
              .toEqual({'data': 'someValue', 'dynamicProp': 'dynamicValue', 'param': 'someParam'});
        });

        it('should support conditionals', () => {
          expect(expressions['conditionalTrue']).toEqual('true');
          expect(expressions['conditionalFalse']).toEqual('false');
        });

        it('should support not', () => { expect(expressions['not']).toEqual(true); });

        it('should support reading external identifiers', () => {
          expect(expressions['externalTestIdentifier']).toBe(ExternalClass);
          expect(expressions['externalSrcIdentifier']).toBe(EventEmitter);
          expect(expressions['externalEnumIdentifier']).toBe(ViewType.HOST);
        });

        it('should support instantiating classes', () => {
          expect(expressions['externalInstance']).toBeAnInstanceOf(ExternalClass);
          // Note: toBeAnInstanceOf does not check super classes in Dart...
          expect(expressions['dynamicInstance'] instanceof ExternalClass).toBe(true);
        });

        describe('operators', () => {
          var ops: any /** TODO #9100 */;
          var aObj: any /** TODO #9100 */, bObj: any /** TODO #9100 */;
          beforeEach(() => {
            ops = expressions['operators'];
            aObj = new Object();
            bObj = new Object();
          });
          it('should support ==', () => {
            expect(ops['=='](aObj, aObj)).toBe(true);
            expect(ops['=='](aObj, bObj)).toBe(false);
            expect(ops['=='](1, 1)).toBe(true);
            expect(ops['=='](0, 1)).toBe(false);
            expect(ops['==']('a', 'a')).toBe(true);
            expect(ops['==']('a', 'b')).toBe(false);
          });
          it('should support !=', () => {
            expect(ops['!='](aObj, aObj)).toBe(false);
            expect(ops['!='](aObj, bObj)).toBe(true);
            expect(ops['!='](1, 1)).toBe(false);
            expect(ops['!='](0, 1)).toBe(true);
            expect(ops['!=']('a', 'a')).toBe(false);
            expect(ops['!=']('a', 'b')).toBe(true);
          });
          it('should support ===', () => {
            expect(ops['==='](aObj, aObj)).toBe(true);
            expect(ops['==='](aObj, bObj)).toBe(false);
            expect(ops['==='](1, 1)).toBe(true);
            expect(ops['==='](0, 1)).toBe(false);
          });
          it('should support !==', () => {
            expect(ops['!=='](aObj, aObj)).toBe(false);
            expect(ops['!=='](aObj, bObj)).toBe(true);
            expect(ops['!=='](1, 1)).toBe(false);
            expect(ops['!=='](0, 1)).toBe(true);
          });
          it('should support -', () => { expect(ops['-'](3, 2)).toEqual(1); });
          it('should support +', () => { expect(ops['+'](1, 2)).toEqual(3); });
          it('should support /', () => { expect(ops['/'](6, 2)).toEqual(3); });
          it('should support *', () => { expect(ops['*'](2, 3)).toEqual(6); });
          it('should support %', () => { expect(ops['%'](3, 2)).toEqual(1); });
          it('should support &&', () => {
            expect(ops['&&'](true, true)).toBe(true);
            expect(ops['&&'](true, false)).toBe(false);
          });
          it('should support ||', () => {
            expect(ops['||'](true, false)).toBe(true);
            expect(ops['||'](false, false)).toBe(false);
          });
          it('should support <', () => {
            expect(ops['<'](1, 2)).toBe(true);
            expect(ops['<'](1, 1)).toBe(false);
          });
          it('should support <=', () => {
            expect(ops['<='](1, 2)).toBe(true);
            expect(ops['<='](1, 1)).toBe(true);
          });
          it('should support >', () => {
            expect(ops['>'](2, 1)).toBe(true);
            expect(ops['>'](1, 1)).toBe(false);
          });
          it('should support >=', () => {
            expect(ops['>='](2, 1)).toBe(true);
            expect(ops['>='](1, 1)).toBe(true);
          });
        });

        it('should support throwing errors',
           () => { expect(expressions['throwError']).toThrowError('someError'); });

        it('should support catching errors', () => {
          function someOperation() { throw new Error('Boom!'); }

          var errorAndStack = expressions['catchError'](someOperation);
          expect(errorAndStack[0].message).toEqual('Boom!');
          // Somehow we don't get stacktraces on ios7...
          if (!browserDetection.isIOS7 && !browserDetection.isIE) {
            expect(errorAndStack[1].toString()).toContain('someOperation');
          }
        });
      });
    });
  });
}
