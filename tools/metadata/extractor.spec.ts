var mockfs = require('mock-fs');

import * as ts from 'typescript';
import * as fs from 'fs';
import {MockHost, expectNoDiagnostics, findClass} from './typescript.mock';
import {MetadataExtractor} from './extractor';

describe('MetadataExtractor', () => {
  // Read the lib.d.ts before mocking fs.
  let libTs: string = fs.readFileSync(ts.getDefaultLibFilePath({}), 'utf8');

  beforeEach(() => files['lib.d.ts'] = libTs);
  beforeEach(() => mockfs(files));
  afterEach(() => mockfs.restore());

  let host: ts.LanguageServiceHost;
  let service: ts.LanguageService;
  let program: ts.Program;
  let typeChecker: ts.TypeChecker;
  let extractor: MetadataExtractor;

  beforeEach(() => {
    host = new MockHost(['A.ts', 'B.ts', 'C.ts'], /*currentDirectory*/ undefined, 'lib.d.ts');
    service = ts.createLanguageService(host);
    program = service.getProgram();
    typeChecker = program.getTypeChecker();
    extractor = new MetadataExtractor(service);
  });

  it('should not have typescript errors in test data', () => {
    expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
    for (const sourceFile of program.getSourceFiles()) {
      expectNoDiagnostics(service.getSyntacticDiagnostics(sourceFile.fileName));
    }
  });

  it('should be able to extract metadata when defined by literals', () => {
    const sourceFile = program.getSourceFile('A.ts');
    const metadata = extractor.getMetadata(sourceFile, typeChecker);
    expect(metadata).toEqual({
      __symbolic: 'module',
      module: './A',
      metadata: {
        A: {
          __symbolic: 'class',
          decorators: [
            {
              __symbolic: 'call',
              expression: {__symbolic: 'reference', name: 'Pipe', module: './directives'},
              arguments: [{name: 'A', pure: false}]
            }
          ]
        }
      }
    });
  });

  it('should be able to extract metadata from metadata defined using vars', () => {
    const sourceFile = program.getSourceFile('B.ts');
    const metadata = extractor.getMetadata(sourceFile, typeChecker);
    expect(metadata).toEqual({
      __symbolic: 'module',
      module: './B',
      metadata: {
        B: {
          __symbolic: 'class',
          decorators: [
            {
              __symbolic: 'call',
              expression: {__symbolic: 'reference', name: 'Pipe', module: './directives'},
              arguments: [{name: 'some-name', pure: true}]
            }
          ]
        }
      }
    });
  });

  it('souce be able to extract metadata that uses external references', () => {
    const sourceFile = program.getSourceFile('C.ts');
    const metadata = extractor.getMetadata(sourceFile, typeChecker);
    expect(metadata).toEqual({
      __symbolic: 'module',
      module: './C',
      metadata: {
        B: {
          __symbolic: 'class',
          decorators: [
            {
              __symbolic: 'call',
              expression: {__symbolic: 'reference', name: 'Pipe', module: './directives'},
              arguments: [
                {
                  name: {__symbolic: "reference", module: "./external", name: "externalName"},
                  pure:
                      {__symbolic: "reference", module: "./external", name: "externalBool"}
                }
              ]
            }
          ]
        }
      }
    });
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
  `,
  'external.d.ts': `
    export const externalName: string;
    export const externalBool: boolean;
  `,
  'A.ts': `
    import {Pipe} from './directives';

    @Pipe({name: 'A', pure: false})
    export class A {}`,
  'B.ts': `
    import {Pipe} from './directives';
    import {someName, someBool} from './consts';

    @Pipe({name: someName, pure: someBool})
    export class B {}`,
  'C.ts': `
    import {Pipe} from './directives';
    import {externalName, externalBool} from './external';

    @Pipe({name: externalName, pure: externalBool})
    export class B {}`
}
