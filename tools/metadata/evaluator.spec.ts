var mockfs = require('mock-fs');

import * as ts from 'typescript';
import * as fs from 'fs';
import {MockHost, expectNoDiagnostics, findVar} from './typescript.mock';
import {Evaluator} from './evaluator';
import {Symbols} from './symbols';

describe('Evaluator', () => {
  // Read the lib.d.ts before mocking fs.
  let libTs: string = fs.readFileSync(ts.getDefaultLibFilePath({}), 'utf8');

  beforeEach(() => files['lib.d.ts'] = libTs);
  beforeEach(() => mockfs(files));
  afterEach(() => mockfs.restore());

  let host: ts.LanguageServiceHost;
  let service: ts.LanguageService;
  let program: ts.Program;
  let typeChecker: ts.TypeChecker;
  let symbols: Symbols;
  let evaluator: Evaluator;

  beforeEach(() => {
    host = new MockHost(['expressions.ts'], /*currentDirectory*/ undefined, 'lib.d.ts');
    service = ts.createLanguageService(host);
    program = service.getProgram();
    typeChecker = program.getTypeChecker();
    symbols = new Symbols();
    evaluator = new Evaluator(service, typeChecker, symbols, f => f);
  });

  it('should not have typescript errors in test data', () => {
    expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
    for (const sourceFile of program.getSourceFiles()) {
      expectNoDiagnostics(service.getSyntacticDiagnostics(sourceFile.fileName));
    }
  });

  it('should be able to fold literal expressions', () => {
    var consts = program.getSourceFile('consts.ts');
    expect(evaluator.isFoldable(findVar(consts, 'someName').initializer)).toBeTruthy();
    expect(evaluator.isFoldable(findVar(consts, 'someBool').initializer)).toBeTruthy();
    expect(evaluator.isFoldable(findVar(consts, 'one').initializer)).toBeTruthy();
    expect(evaluator.isFoldable(findVar(consts, 'two').initializer)).toBeTruthy();
  });

  it('should be able to fold expressions with foldable references', () => {
    var expressions = program.getSourceFile('expressions.ts');
    expect(evaluator.isFoldable(findVar(expressions, 'three').initializer)).toBeTruthy();
    expect(evaluator.isFoldable(findVar(expressions, 'four').initializer)).toBeTruthy();
    expect(evaluator.isFoldable(findVar(expressions, 'obj').initializer)).toBeTruthy();
    expect(evaluator.isFoldable(findVar(expressions, 'arr').initializer)).toBeTruthy();
  });

  it('should be able to evaluate literal expressions', () => {
    var consts = program.getSourceFile('consts.ts');
    expect(evaluator.evaluateNode(findVar(consts, 'someName').initializer)).toBe('some-name');
    expect(evaluator.evaluateNode(findVar(consts, 'someBool').initializer)).toBe(true);
    expect(evaluator.evaluateNode(findVar(consts, 'one').initializer)).toBe(1);
    expect(evaluator.evaluateNode(findVar(consts, 'two').initializer)).toBe(2);
  });

  it('should be able to evaluate expressions', () => {
    var expressions = program.getSourceFile('expressions.ts');
    expect(evaluator.evaluateNode(findVar(expressions, 'three').initializer)).toBe(3);
    expect(evaluator.evaluateNode(findVar(expressions, 'four').initializer)).toBe(4);
    expect(evaluator.evaluateNode(findVar(expressions, 'obj').initializer))
        .toEqual({one: 1, two: 2, three: 3, four: 4});
    expect(evaluator.evaluateNode(findVar(expressions, 'arr').initializer)).toEqual([1, 2, 3, 4]);
    expect(evaluator.evaluateNode(findVar(expressions, 'bTrue').initializer)).toEqual(true);
    expect(evaluator.evaluateNode(findVar(expressions, 'bFalse').initializer)).toEqual(false);
    expect(evaluator.evaluateNode(findVar(expressions, 'bAnd').initializer)).toEqual(true);
    expect(evaluator.evaluateNode(findVar(expressions, 'bOr').initializer)).toEqual(true);
    expect(evaluator.evaluateNode(findVar(expressions, 'nDiv').initializer)).toEqual(2);
    expect(evaluator.evaluateNode(findVar(expressions, 'nMod').initializer)).toEqual(1);
  });

  it('should report recursive references as symbolic', () => {
    var expressions = program.getSourceFile('expressions.ts');
    expect(evaluator.evaluateNode(findVar(expressions, 'recursiveA').initializer))
        .toEqual({__symbolic: "reference", name: "recursiveB", module: "expressions.ts"});
    expect(evaluator.evaluateNode(findVar(expressions, 'recursiveB').initializer))
        .toEqual({__symbolic: "reference", name: "recursiveA", module: "expressions.ts"});
  });
});

const files = {
  'directives.ts': `
    export function Pipe(options: { name?: string, pure?: boolean}) {
      return function(fn: Function) { }
    }
    `,
  'consts.ts': `
    export var someName = 'some-name';
    export var someBool = true;
    export var one = 1;
    export var two = 2;
  `,
  'expressions.ts': `
    import {someName, someBool, one, two} from './consts';

    export var three = one + two;
    export var four = two * two;
    export var obj = { one: one, two: two, three: three, four: four };
    export var arr = [one, two, three, four];
    export var bTrue = someBool;
    export var bFalse = !someBool;
    export var bAnd = someBool && someBool;
    export var bOr = someBool || someBool;
    export var nDiv = four / two;
    export var nMod = (four + one) % two;

    export var recursiveA = recursiveB;
    export var recursiveB = recursiveA;
  `,
  'A.ts': `
    import {Pipe} from './directives';

    @Pipe({name: 'A', pure: false})
    export class A {}`,
  'B.ts': `
    import {Pipe} from './directives';
    import {someName, someBool} from './consts';

    @Pipe({name: someName, pure: someBool})
    export class B {}`
}
