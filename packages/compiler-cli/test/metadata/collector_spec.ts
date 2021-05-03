/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {MetadataCollector} from '../../src/metadata/collector';
import {ClassMetadata, ConstructorMetadata, isClassMetadata, isMetadataGlobalReferenceExpression, METADATA_VERSION, MetadataEntry, MetadataMap, MetadataSymbolicExpression, ModuleMetadata} from '../../src/metadata/schema';

import {Directory, expectValidSources, Host} from './typescript.mocks';

describe('Collector', () => {
  const documentRegistry = ts.createDocumentRegistry();
  let host: Host;
  let service: ts.LanguageService;
  let program: ts.Program;
  let collector: MetadataCollector;

  beforeEach(() => {
    host = new Host(FILES, [
      '/app/app.component.ts',    '/app/cases-data.ts',
      '/app/error-cases.ts',      '/promise.ts',
      '/unsupported-1.ts',        '/unsupported-2.ts',
      '/unsupported-3.ts',        'class-arity.ts',
      'declarations.d.ts',        'import-star.ts',
      'exported-classes.ts',      'exported-functions.ts',
      'exported-enum.ts',         'exported-type.ts',
      'exported-consts.ts',       'local-symbol-ref.ts',
      'local-function-ref.ts',    'local-symbol-ref-func.ts',
      'private-enum.ts',          're-exports.ts',
      're-exports-2.ts',          'export-as.d.ts',
      'named-module.d.ts',        'static-field-reference.ts',
      'static-method.ts',         'static-method-call.ts',
      'static-method-with-if.ts', 'static-method-with-default.ts',
      'class-inheritance.ts',     'class-inheritance-parent.ts',
      'interface-reference.ts',   'static-type-check-members.ts',
    ]);
    service = ts.createLanguageService(host, documentRegistry);
    program = service.getProgram()!;
    collector = new MetadataCollector({quotedNames: true});
  });

  it('should not have errors in test data', () => {
    expectValidSources(service, program);
  });

  it('should return undefined for modules that have no metadata', () => {
    const sourceFile = program.getSourceFile('app/empty.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toBeUndefined();
  });

  it('should treat all symbols of .d.ts files as exported', () => {
    const sourceFile = program.getSourceFile('declarations.d.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        DeclaredClass: {__symbolic: 'class'},
        declaredFn: {__symbolic: 'function'} as any,
      }
    });
  });

  it('should return an interface reference for types', () => {
    const sourceFile = program.getSourceFile('/exported-type.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {SomeType: {__symbolic: 'interface'}}
    });
  });

  it('should return an interface reference for interfaces', () => {
    const sourceFile = program.getSourceFile('app/hero.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {Hero: {__symbolic: 'interface'}}
    });
  });

  it('should preserve module names from TypeScript sources', () => {
    const sourceFile = program.getSourceFile('named-module.d.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata!['importAs']).toEqual('some-named-module');
  });

  it('should be able to collect a simple component\'s metadata', () => {
    const sourceFile = program.getSourceFile('app/hero-detail.component.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        HeroDetailComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: 'angular2/core',
              name: 'Component',
              line: 4,
              character: 7
            },
            arguments: [{
              selector: 'my-hero-detail',
              template: `
        <div *ngIf="hero">
          <h2>{{hero.name}} details!</h2>
          <div><label>id: </label>{{hero.id}}</div>
          <div>
            <label>name: </label>
            <input [(ngModel)]="hero.name" placeholder="name"/>
          </div>
        </div>
      `
            }]
          }],
          members: {
            hero: [{
              __symbolic: 'property',
              decorators: [{
                __symbolic: 'call',
                expression: {
                  __symbolic: 'reference',
                  module: 'angular2/core',
                  name: 'Input',
                  line: 18,
                  character: 9
                }
              }]
            }]
          }
        }
      }
    });
  });

  it('should be able to get a more complicated component\'s metadata', () => {
    const sourceFile = program.getSourceFile('/app/app.component.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        AppComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {
              __symbolic: 'reference',
              module: 'angular2/core',
              name: 'Component',
              line: 9,
              character: 7
            },
            arguments: [{
              selector: 'my-app',
              template: `
        <h2>My Heroes</h2>
        <ul class="heroes">
          <li *ngFor="#hero of heroes"
            (click)="onSelect(hero)"
            [class.selected]="hero === selectedHero">
            <span class="badge">{{hero.id | lowercase}}</span> {{hero.name | uppercase}}
          </li>
        </ul>
        <my-hero-detail [hero]="selectedHero"></my-hero-detail>
        `,
              directives: [
                {
                  __symbolic: 'reference',
                  module: './hero-detail.component',
                  name: 'HeroDetailComponent',
                  line: 22,
                  character: 21
                },
                {
                  __symbolic: 'reference',
                  module: 'angular2/common',
                  name: 'NgFor',
                  line: 22,
                  character: 42
                }
              ],
              providers: [{
                __symbolic: 'reference',
                module: './hero.service',
                default: true,
                line: 23,
                character: 20
              }],
              pipes: [
                {
                  __symbolic: 'reference',
                  module: 'angular2/common',
                  name: 'LowerCasePipe',
                  line: 24,
                  character: 16
                },
                {
                  __symbolic: 'reference',
                  module: 'angular2/common',
                  name: 'UpperCasePipe',
                  line: 24,
                  character: 38
                }
              ]
            }]
          }],
          members: {
            __ctor__: [{
              __symbolic: 'constructor',
              parameters: [{
                __symbolic: 'reference',
                module: './hero.service',
                default: true,
                line: 31,
                character: 42
              }]
            }],
            onSelect: [{__symbolic: 'method'}],
            ngOnInit: [{__symbolic: 'method'}],
            getHeroes: [{__symbolic: 'method'}]
          }
        }
      }
    });
  });

  it('should return the values of exported variables', () => {
    const sourceFile = program.getSourceFile('/app/mock-heroes.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        HEROES: [
          {'id': 11, 'name': 'Dr Nice', '$quoted$': ['id', 'name']},
          {'id': 12, 'name': 'Narco', '$quoted$': ['id', 'name']},
          {'id': 13, 'name': 'Bombasto', '$quoted$': ['id', 'name']},
          {'id': 14, 'name': 'Celeritas', '$quoted$': ['id', 'name']},
          {'id': 15, 'name': 'Magneta', '$quoted$': ['id', 'name']},
          {'id': 16, 'name': 'RubberMan', '$quoted$': ['id', 'name']},
          {'id': 17, 'name': 'Dynama', '$quoted$': ['id', 'name']},
          {'id': 18, 'name': 'Dr IQ', '$quoted$': ['id', 'name']},
          {'id': 19, 'name': 'Magma', '$quoted$': ['id', 'name']},
          {'id': 20, 'name': 'Tornado', '$quoted$': ['id', 'name']}
        ]
      }
    });
  });

  let casesFile: ts.SourceFile;
  let casesMetadata: ModuleMetadata;

  beforeEach(() => {
    casesFile = program.getSourceFile('/app/cases-data.ts')!;
    casesMetadata = collector.getMetadata(casesFile)!;
  });

  it('should provide any reference for an any ctor parameter type', () => {
    const casesAny = <ClassMetadata>casesMetadata.metadata['CaseAny'];
    expect(casesAny).toBeTruthy();
    const ctorData = casesAny.members!['__ctor__'] as ConstructorMetadata[];
    expect(ctorData).toEqual([{
      __symbolic: 'constructor',
      parameters: [{__symbolic: 'reference', name: 'any'} as MetadataSymbolicExpression]
    }]);
  });

  it('should record annotations on set and get declarations', () => {
    const propertyData = (line: number) => ({
      name: [{
        __symbolic: 'property',
        decorators: [{
          __symbolic: 'call',
          expression:
              {__symbolic: 'reference', module: 'angular2/core', name: 'Input', line, character: 9},
          arguments: ['firstName']
        }]
      }]
    } as any as MetadataMap);  // TODO: Review use of `any` here (#19904)

    const caseGetProp = <ClassMetadata>casesMetadata.metadata['GetProp'];
    expect(caseGetProp.members).toEqual(propertyData(11));
    const caseSetProp = <ClassMetadata>casesMetadata.metadata['SetProp'];
    expect(caseSetProp.members).toEqual(propertyData(19));
    const caseFullProp = <ClassMetadata>casesMetadata.metadata['FullProp'];
    expect(caseFullProp.members).toEqual(propertyData(27));
  });

  it('should record references to parameterized types', () => {
    const casesForIn = <ClassMetadata>casesMetadata.metadata['NgFor'];
    expect(casesForIn).toEqual({
      __symbolic: 'class',
      decorators: [{
        __symbolic: 'call',
        expression: {
          __symbolic: 'reference',
          module: 'angular2/core',
          name: 'Injectable',
          line: 40,
          character: 7
        }
      }],
      members: {
        __ctor__: [{
          __symbolic: 'constructor',
          parameters: [{
            __symbolic: 'reference',
            name: 'ClassReference',
            arguments: [{__symbolic: 'reference', name: 'NgForRow'}]
          }]
        }]
      }
    } as any as ClassMetadata);  // TODO: Review use of `any` here (#19904)
  });

  it('should report errors for destructured imports', () => {
    const unsupported1 = program.getSourceFile('/unsupported-1.ts')!;
    const metadata = collector.getMetadata(unsupported1);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        a: {__symbolic: 'error', message: 'Destructuring not supported', line: 1, character: 16},
        b: {__symbolic: 'error', message: 'Destructuring not supported', line: 1, character: 19},
        c: {__symbolic: 'error', message: 'Destructuring not supported', line: 2, character: 16},
        d: {__symbolic: 'error', message: 'Destructuring not supported', line: 2, character: 19},
        e: {__symbolic: 'error', message: 'Variable not initialized', line: 3, character: 15}
      }
    });
  });

  it('should report an error for references to unexpected types', () => {
    const unsupported1 = program.getSourceFile('/unsupported-2.ts')!;
    const metadata = collector.getMetadata(unsupported1)!;
    const barClass = <ClassMetadata>metadata.metadata['Bar'];
    const ctor = <ConstructorMetadata>barClass.members!['__ctor__'][0];
    const parameter = ctor.parameters![0];
    expect(parameter).toEqual({
      __symbolic: 'error',
      message: 'Reference to non-exported class',
      line: 3,
      character: 4,
      context: {className: 'Foo'}
    });
  });

  it('should be able to handle import star type references', () => {
    const importStar = program.getSourceFile('/import-star.ts')!;
    const metadata = collector.getMetadata(importStar)!;
    const someClass = <ClassMetadata>metadata.metadata['SomeClass'];
    const ctor = <ConstructorMetadata>someClass.members!['__ctor__'][0];
    const parameters = ctor.parameters;
    expect(parameters).toEqual([
      {__symbolic: 'reference', module: 'angular2/common', name: 'NgFor', line: 6, character: 29} as
      MetadataSymbolicExpression
    ]);
  });

  it('should record all exported classes', () => {
    const sourceFile = program.getSourceFile('/exported-classes.ts')!;
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        SimpleClass: {__symbolic: 'class'},
        AbstractClass: {__symbolic: 'class'},
        DeclaredClass: {__symbolic: 'class'}
      }
    });
  });

  it('should be able to record functions', () => {
    const exportedFunctions = program.getSourceFile('/exported-functions.ts')!;
    const metadata = collector.getMetadata(exportedFunctions);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: METADATA_VERSION,
      metadata: {
        one: {
          __symbolic: 'function',
          parameters: ['a', 'b', 'c'],
          value: {
            a: {__symbolic: 'reference', name: 'a'},
            b: {__symbolic: 'reference', name: 'b'},
            c: {__symbolic: 'reference', name: 'c'}
          }
        },
        two: {
          __symbolic: 'function',
          parameters: ['a', 'b', 'c'],
          value: {
            a: {__symbolic: 'reference', name: 'a'},
            b: {__symbolic: 'reference', name: 'b'},
            c: {__symbolic: 'reference', name: 'c'}
          }
        },
        three: {
          __symbolic: 'function',
          parameters: ['a', 'b', 'c'],
          value: [
            {__symbolic: 'reference', name: 'a'}, {__symbolic: 'reference', name: 'b'},
            {__symbolic: 'reference', name: 'c'}
          ]
        },
        supportsState: {
          __symbolic: 'function',
          parameters: [],
          value: {
            __symbolic: 'pre',
            operator: '!',
            operand: {
              __symbolic: 'pre',
              operator: '!',
              operand: {
                __symbolic: 'select',
                expression: {
                  __symbolic: 'select',
                  expression: {__symbolic: 'reference', name: 'window'},
                  member: 'history'
                },
                member: 'pushState'
              }
            }
          }
        },
        complexFn: {__symbolic: 'function'} as any,
        declaredFn: {__symbolic: 'function'} as any,
      }
    });
  });

  it('should be able to handle import star type references', () => {
    const importStar = program.getSourceFile('/import-star.ts')!;
    const metadata = collector.getMetadata(importStar)!;
    const someClass = <ClassMetadata>metadata.metadata['SomeClass'];
    const ctor = <ConstructorMetadata>someClass.members!['__ctor__'][0];
    const parameters = ctor.parameters;
    expect(parameters).toEqual([
      {__symbolic: 'reference', module: 'angular2/common', name: 'NgFor', line: 6, character: 29} as
      MetadataSymbolicExpression
    ]);
  });

  it('should be able to collect the value of an enum', () => {
    const enumSource = program.getSourceFile('/exported-enum.ts')!;
    const metadata = collector.getMetadata(enumSource)!;
    const someEnum: any = metadata.metadata['SomeEnum'];
    expect(someEnum).toEqual({A: 0, B: 1, C: 100, D: 101});
  });

  it('should ignore a non-export enum', () => {
    const enumSource = program.getSourceFile('/private-enum.ts')!;
    const metadata = collector.getMetadata(enumSource)!;
    const publicEnum: any = metadata.metadata['PublicEnum'];
    const privateEnum: any = metadata.metadata['PrivateEnum'];
    expect(publicEnum).toEqual({a: 0, b: 1, c: 2});
    expect(privateEnum).toBeUndefined();
  });

  it('should be able to collect enums initialized from consts', () => {
    const enumSource = program.getSourceFile('/exported-enum.ts')!;
    const metadata = collector.getMetadata(enumSource)!;
    const complexEnum: any = metadata.metadata['ComplexEnum'];
    expect(complexEnum).toEqual({
      A: 0,
      B: 1,
      C: 30,
      D: 40,
      E: {
        __symbolic: 'reference',
        module: './exported-consts',
        name: 'constValue',
        line: 5,
        character: 75
      }
    });
  });

  it('should be able to collect a simple static method', () => {
    const staticSource = program.getSourceFile('/static-method.ts')!;
    const metadata = collector.getMetadata(staticSource)!;
    expect(metadata).toBeDefined();
    const classData = <ClassMetadata>metadata.metadata['MyModule'];
    expect(classData).toBeDefined();
    expect(classData.statics).toEqual({
      with: {
        __symbolic: 'function',
        parameters: ['comp'],
        value: [
          {__symbolic: 'reference', name: 'MyModule'},
          {provider: 'a', useValue: {__symbolic: 'reference', name: 'comp'}}
        ]
      }
    });
  });

  it('should be able to collect a call to a static method', () => {
    const staticSource = program.getSourceFile('/static-method-call.ts')!;
    const metadata = collector.getMetadata(staticSource)!;
    expect(metadata).toBeDefined();
    const classData = <ClassMetadata>metadata.metadata['Foo'];
    expect(classData).toBeDefined();
    expect(classData.decorators).toEqual([
      {
        __symbolic: 'call',
        expression: {
          __symbolic: 'reference',
          module: 'angular2/core',
          name: 'Component',
          line: 4,
          character: 5
        },
        arguments: [{
          providers: {
            __symbolic: 'call',
            expression: {
              __symbolic: 'select',
              expression: {
                __symbolic: 'reference',
                module: './static-method',
                name: 'MyModule',
                line: 5,
                character: 17
              },
              member: 'with'
            },
            arguments: ['a']
          }
        }]
      }
    ] as any as MetadataSymbolicExpression[]);  // TODO: Review use of `any` here (#19904)
  });

  it('should be able to collect a static field', () => {
    const staticSource = program.getSourceFile('/static-field.ts')!;
    const metadata = collector.getMetadata(staticSource)!;
    expect(metadata).toBeDefined();
    const classData = <ClassMetadata>metadata.metadata['MyModule'];
    expect(classData).toBeDefined();
    expect(classData.statics).toEqual({VALUE: 'Some string'});
  });

  it('should ignore static type check members without a value', () => {
    const typeCheckMembers = program.getSourceFile('/static-type-check-members.ts')!;
    const metadata = collector.getMetadata(typeCheckMembers)!;
    const classData = <ClassMetadata>metadata.metadata['MyDirective'];
    expect(classData.statics).toEqual({
      foo: 'bar',
      declared: {__symbolic: 'error', message: 'Variable not initialized', line: 3, character: 13},
      ngTemplateContextGuard: {__symbolic: 'function', parameters: ['dir', 'ctx'], value: true},
      ngTemplateGuard_value: {__symbolic: 'function', parameters: ['dir', 'expr'], value: true},
    });
  });

  it('should be able to collect a reference to a static field', () => {
    const staticSource = program.getSourceFile('/static-field-reference.ts')!;
    const metadata = collector.getMetadata(staticSource)!;
    expect(metadata).toBeDefined();
    const classData = <ClassMetadata>metadata.metadata['Foo'];
    expect(classData).toBeDefined();
    expect(classData.decorators).toEqual([
      {
        __symbolic: 'call',
        expression: {
          __symbolic: 'reference',
          module: 'angular2/core',
          name: 'Component',
          line: 4,
          character: 5
        },
        arguments: [{
          providers: [{
            provide: 'a',
            useValue: {
              __symbolic: 'select',
              expression: {
                __symbolic: 'reference',
                module: './static-field',
                name: 'MyModule',
                line: 5,
                character: 45
              },
              member: 'VALUE'
            }
          }]
        }]
      }
    ] as any as MetadataSymbolicExpression[]);  // TODO: Review use of `any` here (#19904)
  });

  it('should be able to collect a method with a conditional expression', () => {
    const source = program.getSourceFile('/static-method-with-if.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata).toBeDefined();
    const classData = <ClassMetadata>metadata.metadata['MyModule'];
    expect(classData).toBeDefined();
    expect(classData.statics).toEqual({
      with: {
        __symbolic: 'function',
        parameters: ['cond'],
        value: [
          {__symbolic: 'reference', name: 'MyModule'}, {
            provider: 'a',
            useValue: {
              __symbolic: 'if',
              condition: {__symbolic: 'reference', name: 'cond'},
              thenExpression: '1',
              elseExpression: '2'
            }
          }
        ]
      }
    });
  });

  it('should be able to collect a method with a default parameter', () => {
    const source = program.getSourceFile('/static-method-with-default.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata).toBeDefined();
    const classData = <ClassMetadata>metadata.metadata['MyModule'];
    expect(classData).toBeDefined();
    expect(classData.statics).toEqual({
      with: {
        __symbolic: 'function',
        parameters: ['comp', 'foo', 'bar'],
        defaults: [undefined, true, false],
        value: [
          {__symbolic: 'reference', name: 'MyModule'}, {
            __symbolic: 'if',
            condition: {__symbolic: 'reference', name: 'foo'},
            thenExpression: {provider: 'a', useValue: {__symbolic: 'reference', name: 'comp'}},
            elseExpression: {provider: 'b', useValue: {__symbolic: 'reference', name: 'comp'}}
          },
          {
            __symbolic: 'if',
            condition: {__symbolic: 'reference', name: 'bar'},
            thenExpression: {provider: 'c', useValue: {__symbolic: 'reference', name: 'comp'}},
            elseExpression: {provider: 'd', useValue: {__symbolic: 'reference', name: 'comp'}}
          }
        ]
      }
    });
  });

  it('should be able to collect re-exported symbols', () => {
    const source = program.getSourceFile('/re-exports.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata.exports).toEqual([
      {from: './static-field', export: ['MyModule']},
      {from: './static-field-reference', export: [{name: 'Foo', as: 'OtherModule'}]},
      {from: 'angular2/core'}
    ]);
  });

  it('should be able to collect a export as symbol', () => {
    const source = program.getSourceFile('export-as.d.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata.metadata).toEqual({SomeFunction: {__symbolic: 'function'}});
  });

  it('should be able to collect exports with no module specifier', () => {
    const source = program.getSourceFile('/re-exports-2.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata.metadata).toEqual({
      MyClass: Object({__symbolic: 'class'}),
      OtherModule: {
        __symbolic: 'reference',
        module: './static-field-reference',
        name: 'Foo',
        line: 4,
        character: 12
      },
      MyOtherModule: {
        __symbolic: 'reference',
        module: './static-field',
        name: 'MyModule',
        line: 4,
        character: 25
      }
    });
  });

  it('should collect an error symbol if collecting a reference to a non-exported symbol', () => {
    const source = program.getSourceFile('/local-symbol-ref.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata.metadata).toEqual({
      REQUIRED_VALIDATOR: {
        __symbolic: 'error',
        message: 'Reference to a local symbol',
        line: 3,
        character: 8,
        context: {name: 'REQUIRED'}
      },
      SomeComponent: {
        __symbolic: 'class',
        decorators: [{
          __symbolic: 'call',
          expression: {
            __symbolic: 'reference',
            module: 'angular2/core',
            name: 'Component',
            line: 11,
            character: 5
          },
          arguments: [{providers: [{__symbolic: 'reference', name: 'REQUIRED_VALIDATOR'}]}]
        }]
      }
    });
  });

  it('should collect an error symbol if collecting a reference to a non-exported function', () => {
    const source = program.getSourceFile('/local-function-ref.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata.metadata).toEqual({
      REQUIRED_VALIDATOR: {
        __symbolic: 'error',
        message: 'Reference to a non-exported function',
        line: 3,
        character: 13,
        context: {name: 'required'}
      },
      SomeComponent: {
        __symbolic: 'class',
        decorators: [{
          __symbolic: 'call',
          expression: {
            __symbolic: 'reference',
            module: 'angular2/core',
            name: 'Component',
            line: 11,
            character: 5
          },
          arguments: [{providers: [{__symbolic: 'reference', name: 'REQUIRED_VALIDATOR'}]}]
        }]
      }
    });
  });

  it('should collect an error for a simple function that references a local variable', () => {
    const source = program.getSourceFile('/local-symbol-ref-func.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect(metadata.metadata).toEqual({
      foo: {
        __symbolic: 'function',
        parameters: ['index'],
        value: {
          __symbolic: 'error',
          message: 'Reference to a local symbol',
          line: 1,
          character: 8,
          context: {name: 'localSymbol'}
        }
      }
    });
  });

  it('should collect any for interface parameter reference', () => {
    const source = program.getSourceFile('/interface-reference.ts')!;
    const metadata = collector.getMetadata(source)!;
    expect((metadata.metadata['SomeClass'] as ClassMetadata).members).toEqual({
      __ctor__: [{
        __symbolic: 'constructor',
        parameterDecorators: [[{
          __symbolic: 'call',
          expression: {
            __symbolic: 'reference',
            module: 'angular2/core',
            name: 'Inject',
            line: 6,
            character: 19
          },
          arguments: ['a']
        }]],
        parameters: [{__symbolic: 'reference', name: 'any'}]
      }]
    } as any as MetadataMap);  // TODO: Review use of `any` here (#19904)
  });

  describe('with interpolations', () => {
    function e(expr: string, prefix?: string) {
      const metadata = collectSource(`${prefix || ''} export let value = ${expr};`);
      return expect(metadata.metadata['value']);
    }

    it('should be able to collect a raw interpolated string', () => {
      e('`simple value`').toBe('simple value');
    });

    it('should be able to interpolate a single value', () => {
      e('`${foo}`', 'const foo = "foo value"').toBe('foo value');
    });

    it('should be able to interpolate multiple values', () => {
      e('`foo:${foo}, bar:${bar}, end`', 'const foo = "foo"; const bar = "bar";')
          .toBe('foo:foo, bar:bar, end');
    });

    it('should be able to interpolate with an imported reference', () => {
      e('`external:${external}`', 'import {external} from "./external";').toEqual({
        __symbolic: 'binop',
        operator: '+',
        left: 'external:',
        right: {
          __symbolic: 'reference',
          module: './external',
          name: 'external',
          line: 0,
          character: 68,
        }
      });
    });

    it('should simplify a redundant template', () => {
      e('`${external}`', 'import {external} from "./external";').toEqual({
        __symbolic: 'reference',
        module: './external',
        name: 'external',
        line: 0,
        character: 59
      });
    });

    it('should be able to collect complex template with imported references', () => {
      e('`foo:${foo}, bar:${bar}, end`', 'import {foo, bar} from "./external";').toEqual({
        __symbolic: 'binop',
        operator: '+',
        left: {
          __symbolic: 'binop',
          operator: '+',
          left: {
            __symbolic: 'binop',
            operator: '+',
            left: {
              __symbolic: 'binop',
              operator: '+',
              left: 'foo:',
              right: {
                __symbolic: 'reference',
                module: './external',
                name: 'foo',
                line: 0,
                character: 63
              }
            },
            right: ', bar:'
          },
          right:
              {__symbolic: 'reference', module: './external', name: 'bar', line: 0, character: 75}
        },
        right: ', end'
      });
    });

    it('should reject a tagged literal', () => {
      e('tag`some value`').toEqual({
        __symbolic: 'error',
        message: 'Tagged template expressions are not supported in metadata',
        line: 0,
        character: 20
      });
    });
  });

  it('should ignore |null or |undefined in type expressions', () => {
    const metadata = collectSource(`
      import {Foo} from './foo';
      export class SomeClass {
        constructor (a: Foo, b: Foo | null, c: Foo | undefined, d: Foo | undefined | null, e: Foo | undefined | null | Foo) {}
      }
    `);
    expect((metadata.metadata['SomeClass'] as ClassMetadata).members).toEqual({
      __ctor__: [{
        __symbolic: 'constructor',
        parameters: [
          {__symbolic: 'reference', module: './foo', name: 'Foo', line: 3, character: 24},
          {__symbolic: 'reference', module: './foo', name: 'Foo', line: 3, character: 24},
          {__symbolic: 'reference', module: './foo', name: 'Foo', line: 3, character: 24},
          {__symbolic: 'reference', module: './foo', name: 'Foo', line: 3, character: 24},
          {__symbolic: 'reference', module: './foo', name: 'Foo', line: 3, character: 24}
        ]
      }]
    } as any as MetadataMap);  // TODO: Review use of `any` here (#19904)
  });

  it('should treat exported class expressions as a class', () => {
    const source = ts.createSourceFile(
        '', `
    export const InjectionToken: {new<T>(desc: string): InjectionToken<T>;} = class {
      constructor(protected _desc: string) {}

      toString(): string { return \`InjectionToken \${this._desc}\`; }
    } as any;`,
        ts.ScriptTarget.Latest, true);
    const metadata = collector.getMetadata(source)!;
    expect(metadata.metadata).toEqual({InjectionToken: {__symbolic: 'class'}});
  });

  describe('in strict mode', () => {
    it('should throw if an error symbol is collecting a reference to a non-exported symbol', () => {
      const source = program.getSourceFile('/local-symbol-ref.ts')!;
      expect(() => collector.getMetadata(source, true)).toThrowError(/Reference to a local symbol/);
    });

    it('should throw if an error if collecting a reference to a non-exported function', () => {
      const source = program.getSourceFile('/local-function-ref.ts')!;
      expect(() => collector.getMetadata(source, true))
          .toThrowError(/Reference to a non-exported function/);
    });

    it('should throw for references to unexpected types', () => {
      const unsupported2 = program.getSourceFile('/unsupported-2.ts')!;
      expect(() => collector.getMetadata(unsupported2, true))
          .toThrowError(/Reference to non-exported class/);
    });

    it('should throw for errors in a static method', () => {
      const unsupported3 = program.getSourceFile('/unsupported-3.ts')!;
      expect(() => collector.getMetadata(unsupported3, true))
          .toThrowError(/Reference to a non-exported class/);
    });
  });

  describe('with invalid input', () => {
    it('should not throw with a class with no name', () => {
      const fileName = '/invalid-class.ts';
      override(fileName, 'export class');
      const invalidClass = program.getSourceFile(fileName)!;
      expect(() => collector.getMetadata(invalidClass)).not.toThrow();
    });

    it('should not throw with a function with no name', () => {
      const fileName = '/invalid-function.ts';
      override(fileName, 'export function');
      const invalidFunction = program.getSourceFile(fileName)!;
      expect(() => collector.getMetadata(invalidFunction)).not.toThrow();
    });
  });

  describe(
      'inheritance', () => {
        it('should record `extends` clauses for declared classes',
           () => {
             const metadata =
                 collector.getMetadata(program.getSourceFile('/class-inheritance.ts')!)!;
             expect(metadata.metadata['DeclaredChildClass'])
          .toEqual({__symbolic: 'class', extends: {__symbolic: 'reference', name: 'ParentClass'}});
           });

        it('should record `extends` clauses for classes in the same file',
           () => {
             const metadata =
                 collector.getMetadata(program.getSourceFile('/class-inheritance.ts')!)!;
             expect(metadata.metadata['ChildClassSameFile'])
          .toEqual({__symbolic: 'class', extends: {__symbolic: 'reference', name: 'ParentClass'}});
           });

        it('should record `extends` clauses for classes in a different file', () => {
          const metadata = collector.getMetadata(program.getSourceFile('/class-inheritance.ts')!)!;
          expect(metadata.metadata['ChildClassOtherFile']).toEqual({
        __symbolic: 'class',
        extends: {
          __symbolic: 'reference',
          module: './class-inheritance-parent',
          name: 'ParentClassFromOtherFile',
          line: 9,
          character: 45,
        }
      });
        });

        function expectClass(entry: MetadataEntry): entry is ClassMetadata {
          const result = isClassMetadata(entry);
          expect(result).toBeTruthy();
          return result;
        }

        it('should collect the correct arity for a class', () => {
          const metadata = collector.getMetadata(program.getSourceFile('/class-arity.ts')!)!;

          const zero = metadata.metadata['Zero'];
          if (expectClass(zero)) expect(zero.arity).toBeUndefined();
          const one = metadata.metadata['One'];
          if (expectClass(one)) expect(one.arity).toBe(1);
          const two = metadata.metadata['Two'];
          if (expectClass(two)) expect(two.arity).toBe(2);
          const three = metadata.metadata['Three'];
          if (expectClass(three)) expect(three.arity).toBe(3);
          const nine = metadata.metadata['Nine'];
          if (expectClass(nine)) expect(nine.arity).toBe(9);
        });
      });

  describe('regression', () => {
    it('should be able to collect a short-hand property value', () => {
      const metadata = collectSource(`
        const children = { f1: 1 };
        export const r = [
          {path: ':locale', children}
        ];
      `);
      expect(metadata.metadata).toEqual({r: [{path: ':locale', children: {f1: 1}}]});
    });

    // #17518
    it('should skip a default function', () => {
      const metadata = collectSource(`
        export default function () {

          const mainRoutes = [
            {name: 'a', abstract: true, component: 'main'},

            {name: 'a.welcome', url: '/welcome', component: 'welcome'}
          ];

          return mainRoutes;

        }`);
      expect(metadata).toBeUndefined();
    });

    it('should skip a named default export', () => {
      const metadata = collectSource(`
        function mainRoutes() {

          const mainRoutes = [
            {name: 'a', abstract: true, component: 'main'},

            {name: 'a.welcome', url: '/welcome', component: 'welcome'}
          ];

          return mainRoutes;

        }

        exports = foo;
        `);
      expect(metadata).toBeUndefined();
    });

    it('should collect type guards', () => {
      const metadata = collectSource(`
        import {Directive, Input, TemplateRef} from '@angular/core';

        @Directive({selector: '[myIf]'})
        export class MyIf {

          constructor(private templateRef: TemplateRef) {}

          @Input() myIf: any;

          static typeGuard: <T>(v: T | null | undefined): v is T;
        }
      `);

      expect((metadata.metadata.MyIf as any).statics.typeGuard)
          .not.toBeUndefined('typeGuard was not collected');
    });
  });

  describe('references', () => {
    beforeEach(() => {
      collector = new MetadataCollector({quotedNames: true});
    });

    it('should record a reference to an exported field of a useValue', () => {
      const metadata = collectSource(`
        export var someValue = 1;
        export const v = {
          useValue: someValue
        };
      `);
      expect(metadata.metadata['someValue']).toEqual(1);
      expect(metadata.metadata['v']).toEqual({
        useValue: {__symbolic: 'reference', name: 'someValue'}
      });
    });

    it('should leave external references in place in an object literal', () => {
      const metadata = collectSource(`
        export const myLambda = () => [1, 2, 3];
        const indirect = [{a: 1, b: 3: c: myLambda}];
        export const v = {
          v: {i: indirect}
        }
      `);
      expect(metadata.metadata['v']).toEqual({
        v: {i: [{a: 1, b: 3, c: {__symbolic: 'reference', name: 'myLambda'}}]}
      });
    });

    it('should leave an external reference in place in an array literal', () => {
      const metadata = collectSource(`
        export const myLambda = () => [1, 2, 3];
        const indirect = [1, 3, myLambda}];
        export const v = {
          v: {i: indirect}
        }
      `);
      expect(metadata.metadata['v']).toEqual({
        v: {i: [1, 3, {__symbolic: 'reference', name: 'myLambda'}]}
      });
    });
  });

  describe('substitutions', () => {
    const lambdaTemp = 'lambdaTemp';

    it('should be able to substitute a lambda', () => {
      const source = createSource(`
        const b = 1;
        export const a = () => b;
      `);
      const metadata = collector.getMetadata(source, /* strict */ false, (value, node) => {
        if (node.kind === ts.SyntaxKind.ArrowFunction) {
          return {__symbolic: 'reference', name: lambdaTemp};
        }
        return value;
      });
      expect(metadata!.metadata['a']).toEqual({__symbolic: 'reference', name: lambdaTemp});
    });

    it('should compose substitution functions', () => {
      const collector = new MetadataCollector({
        substituteExpression: (value, node) =>
            isMetadataGlobalReferenceExpression(value) && value.name == lambdaTemp ?
            {__symbolic: 'reference', name: value.name + '2'} :
            value
      });
      const source = createSource(`
        const b = 1;
        export const a = () => b;
      `);
      const metadata = collector.getMetadata(source, /* strict */ false, (value, node) => {
        if (node.kind === ts.SyntaxKind.ArrowFunction) {
          return {__symbolic: 'reference', name: lambdaTemp};
        }
        return value;
      });
      expect(metadata!.metadata['a']).toEqual({__symbolic: 'reference', name: lambdaTemp + '2'});
    });
  });

  function override(fileName: string, content: string) {
    host.overrideFile(fileName, content);
    host.addFile(fileName);
    program = service.getProgram()!;
  }

  function collectSource(content: string): ModuleMetadata {
    const sourceFile = createSource(content);
    return collector.getMetadata(sourceFile)!;
  }
});

// TODO: Do not use \` in a template literal as it confuses clang-format
const FILES: Directory = {
  'app': {
    'app.component.ts': `
      import {Component as MyComponent, OnInit} from 'angular2/core';
      import * as common from 'angular2/common';
      import {Hero} from './hero';
      import {HeroDetailComponent} from './hero-detail.component';
      import HeroService from './hero.service';
      // thrown away
      import 'angular2/core';

      @MyComponent({
        selector: 'my-app',
        template:` +
        '`' +
        `
        <h2>My Heroes</h2>
        <ul class="heroes">
          <li *ngFor="#hero of heroes"
            (click)="onSelect(hero)"
            [class.selected]="hero === selectedHero">
            <span class="badge">{{hero.id | lowercase}}</span> {{hero.name | uppercase}}
          </li>
        </ul>
        <my-hero-detail [hero]="selectedHero"></my-hero-detail>
        ` +
        '`' +
        `,
        directives: [HeroDetailComponent, common.NgFor],
        providers: [HeroService],
        pipes: [common.LowerCasePipe, common.UpperCasePipe]
      })
      export class AppComponent implements OnInit {
        public title = 'Tour of Heroes';
        public heroes: Hero[];
        public selectedHero: Hero;

        constructor(private _heroService: HeroService) { }

        onSelect(hero: Hero) { this.selectedHero = hero; }

        ngOnInit() {
            this.getHeroes()
        }

        getHeroes() {
          this._heroService.getHeroesSlowly().then(heroes => this.heroes = heroes);
        }
      }`,
    'hero.ts': `
      export interface Hero {
        id: number;
        name: string;
      }`,
    'empty.ts': ``,
    'hero-detail.component.ts': `
      import {Component, Input} from 'angular2/core';
      import {Hero} from './hero';

      @Component({
        selector: 'my-hero-detail',
        template: ` +
        '`' +
        `
        <div *ngIf="hero">
          <h2>{{hero.name}} details!</h2>
          <div><label>id: </label>{{hero.id}}</div>
          <div>
            <label>name: </label>
            <input [(ngModel)]="hero.name" placeholder="name"/>
          </div>
        </div>
      ` +
        '`' +
        `,
      })
      export class HeroDetailComponent {
        @Input() public hero: Hero;
      }`,
    'mock-heroes.ts': `
      import {Hero as Hero} from './hero';

      export const HEROES: Hero[] = [
          {"id": 11, "name": "Dr Nice"},
          {"id": 12, "name": "Narco"},
          {"id": 13, "name": "Bombasto"},
          {"id": 14, "name": "Celeritas"},
          {"id": 15, "name": "Magneta"},
          {"id": 16, "name": "RubberMan"},
          {"id": 17, "name": "Dynama"},
          {"id": 18, "name": "Dr IQ"},
          {"id": 19, "name": "Magma"},
          {"id": 20, "name": "Tornado"}
      ];`,
    'default-exporter.ts': `
      let a: string;
      export default a;
    `,
    'hero.service.ts': `
      import {Injectable} from 'angular2/core';
      import {HEROES} from './mock-heroes';
      import {Hero} from './hero';

      @Injectable()
      class HeroService {
          getHeros() {
              return Promise.resolve(HEROES);
          }

          getHeroesSlowly() {
              return new Promise<Hero[]>(resolve =>
                setTimeout(()=>resolve(HEROES), 2000)); // 2 seconds
          }
      }
      export default HeroService;`,
    'cases-data.ts': `
      import {Injectable, Input} from 'angular2/core';

      @Injectable()
      export class CaseAny {
        constructor(param: any) {}
      }

      @Injectable()
      export class GetProp {
        private _name: string;
        @Input('firstName') get name(): string {
          return this._name;
        }
      }

      @Injectable()
      export class SetProp {
        private _name: string;
        @Input('firstName') set name(value: string) {
          this._name = value;
        }
      }

      @Injectable()
      export class FullProp {
        private _name: string;
        @Input('firstName') get name(): string {
          return this._name;
        }
        set name(value: string) {
          this._name = value;
        }
      }

      export class ClassReference<T> { }
      export class NgForRow {

      }

      @Injectable()
      export class NgFor {
        constructor (public ref: ClassReference<NgForRow>) {}
      }
     `,
    'error-cases.ts': `
      import HeroService from './hero.service';

      export class CaseCtor {
        constructor(private _heroService: HeroService) { }
      }
    `
  },
  'promise.ts': `
    interface PromiseLike<T> {
        then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): PromiseLike<TResult>;
        then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): PromiseLike<TResult>;
    }

    interface Promise<T> {
        then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<TResult>;
        then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): Promise<TResult>;
        catch(onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T>;
        catch(onrejected?: (reason: any) => void): Promise<T>;
    }

    interface PromiseConstructor {
        prototype: Promise<any>;
        new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
        reject(reason: any): Promise<void>;
        reject<T>(reason: any): Promise<T>;
        resolve<T>(value: T | PromiseLike<T>): Promise<T>;
        resolve(): Promise<void>;
    }

    declare var Promise: PromiseConstructor;
  `,
  'class-arity.ts': `
    export class Zero {}
    export class One<T> {}
    export class Two<T, V> {}
    export class Three<T1, T2, T3> {}
    export class Nine<T1, T2, T3, T4, T5, T6, T7, T8, T9> {}
  `,
  'unsupported-1.ts': `
    export let {a, b} = {a: 1, b: 2};
    export let [c, d] = [1, 2];
    export let e;
  `,
  'unsupported-2.ts': `
    import {Injectable} from 'angular2/core';

    class Foo {}

    @Injectable()
    export class Bar {
      constructor(private f: Foo) {}
    }
  `,
  'unsupported-3.ts': `
    class Foo {}

    export class SomeClass {
      static someStatic() {
        return Foo;
      }
    }
  `,
  'interface-reference.ts': `
    import {Injectable, Inject} from 'angular2/core';
    export interface Test {}

    @Injectable()
    export class SomeClass {
      constructor(@Inject("a") test: Test) {}
    }
  `,
  'import-star.ts': `
    import {Injectable} from 'angular2/core';
    import * as common from 'angular2/common';

    @Injectable()
    export class SomeClass {
      constructor(private f: common.NgFor) {}
    }
  `,
  'declarations.d.ts': `
    declare class DeclaredClass {}
    declare function declaredFn();
  `,
  'exported-classes.ts': `
    export class SimpleClass {}
    export abstract class AbstractClass {}
    export declare class DeclaredClass {}
  `,
  'class-inheritance-parent.ts': `
    export class ParentClassFromOtherFile {}
  `,
  'class-inheritance.ts': `
    import {ParentClassFromOtherFile} from './class-inheritance-parent';

    export class ParentClass {}

    export declare class DeclaredChildClass extends ParentClass {}

    export class ChildClassSameFile extends ParentClass {}

    export class ChildClassOtherFile extends ParentClassFromOtherFile {}
  `,
  'exported-functions.ts': `
    export function one(a: string, b: string, c: string) {
      return {a: a, b: b, c: c};
    }
    export function two(a: string, b: string, c: string) {
      return {a, b, c};
    }
    export function three({a, b, c}: {a: string, b: string, c: string}) {
      return [a, b, c];
    }
    export function supportsState(): boolean {
     return !!window.history.pushState;
    }
    export function complexFn(x: any): boolean {
      if (x) {
        return true;
      } else {
        return false;
      }
    }
    export declare function declaredFn();
  `,
  'exported-type.ts': `
    export type SomeType = 'a' | 'b';
  `,
  'exported-enum.ts': `
    import {constValue} from './exported-consts';

    export const someValue = 30;
    export enum SomeEnum { A, B, C = 100, D };
    export enum ComplexEnum { A, B, C = someValue, D = someValue + 10, E = constValue };
  `,
  'exported-consts.ts': `
    export const constValue = 100;
  `,
  'static-method.ts': `
    export class MyModule {
      static with(comp: any): any[] {
        return [
          MyModule,
          { provider: 'a', useValue: comp }
        ];
      }
    }
  `,
  'static-method-with-default.ts': `
    export class MyModule {
      static with(comp: any, foo: boolean = true, bar: boolean = false): any[] {
        return [
          MyModule,
          foo ? { provider: 'a', useValue: comp } : {provider: 'b', useValue: comp},
          bar ? { provider: 'c', useValue: comp } : {provider: 'd', useValue: comp}
        ];
      }
    }
  `,
  'static-method-call.ts': `
    import {Component} from 'angular2/core';
    import {MyModule} from './static-method';

    @Component({
      providers: MyModule.with('a')
    })
    export class Foo { }
  `,
  'static-field.ts': `
    export class MyModule {
      static VALUE = 'Some string';
    }
  `,
  'static-type-check-members.ts': `
    export class MyDirective<T> {
      static foo = 'bar';
      static declared: string;

      static ngAcceptInputType_disabled: boolean|string;
      static ngTemplateContextGuard(dir: any, ctx: any): any { return true; };
      static ngTemplateGuard_declared: 'binding';
      static ngTemplateGuard_value(dir: any, expr: any): any { return true; };
    }
  `,
  'static-field-reference.ts': `
    import {Component} from 'angular2/core';
    import {MyModule} from './static-field';

    @Component({
      providers: [ { provide: 'a', useValue: MyModule.VALUE } ]
    })
    export class Foo { }
  `,
  'static-method-with-if.ts': `
    export class MyModule {
      static with(cond: boolean): any[] {
        return [
          MyModule,
          { provider: 'a', useValue: cond ? '1' : '2' }
        ];
      }
    }
  `,
  're-exports.ts': `
    export {MyModule} from './static-field';
    export {Foo as OtherModule} from './static-field-reference';
    export * from 'angular2/core';
  `,
  're-exports-2.ts': `
    import {MyModule} from './static-field';
    import {Foo as OtherModule} from './static-field-reference';
    class MyClass {}
    export {OtherModule, MyModule as MyOtherModule, MyClass};
  `,
  'export-as.d.ts': `
     declare function someFunction(): void;
     export { someFunction as SomeFunction };
 `,
  'named-module.d.ts': `
    /// <amd-module name="some-named-module" />
    export type SomeType = 'a';
  `,
  'local-symbol-ref.ts': `
    import {Component, Validators} from 'angular2/core';

    var REQUIRED;

    export const REQUIRED_VALIDATOR: any = {
      provide: 'SomeToken',
      useValue: REQUIRED,
      multi: true
    };

    @Component({
      providers: [REQUIRED_VALIDATOR]
    })
    export class SomeComponent {}
  `,
  'private-enum.ts': `
    export enum PublicEnum { a, b, c }
    enum PrivateEnum { e, f, g }
  `,
  'local-function-ref.ts': `
    import {Component, Validators} from 'angular2/core';

    function required() {}

    export const REQUIRED_VALIDATOR: any = {
      provide: 'SomeToken',
      useValue: required,
      multi: true
    };

    @Component({
      providers: [REQUIRED_VALIDATOR]
    })
    export class SomeComponent {}
  `,
  'local-symbol-ref-func.ts': `
    var localSymbol: any[];

    export function foo(index: number): string {
      return localSymbol[index];
    }
  `,
  'node_modules': {
    'angular2': {
      'core.d.ts': `
          export interface Type extends Function { }
          export interface TypeDecorator {
              <T extends Type>(type: T): T;
              (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
              annotations: any[];
          }
          export interface ComponentDecorator extends TypeDecorator { }
          export interface ComponentFactory {
              (obj: {
                  selector?: string;
                  inputs?: string[];
                  outputs?: string[];
                  properties?: string[];
                  events?: string[];
                  host?: {
                      [key: string]: string;
                  };
                  bindings?: any[];
                  providers?: any[];
                  exportAs?: string;
                  moduleId?: string;
                  queries?: {
                      [key: string]: any;
                  };
                  viewBindings?: any[];
                  viewProviders?: any[];
                  templateUrl?: string;
                  template?: string;
                  styleUrls?: string[];
                  styles?: string[];
                  directives?: Array<Type | any[]>;
                  pipes?: Array<Type | any[]>;
              }): ComponentDecorator;
          }
          export declare var Component: ComponentFactory;
          export interface InputFactory {
              (bindingPropertyName?: string): any;
              new (bindingPropertyName?: string): any;
          }
          export declare var Input: InputFactory;
          export interface InjectableFactory {
              (): any;
          }
          export declare var Injectable: InjectableFactory;
          export interface InjectFactory {
            (binding?: any): any;
            new (binding?: any): any;
          }
          export declare var Inject: InjectFactory;
          export interface OnInit {
              ngOnInit(): any;
          }
          export class Validators {
            static required(): void;
          }
      `,
      'common.d.ts': `
        export declare class NgFor {
            ngForOf: any;
            ngForTemplate: any;
            ngDoCheck(): void;
        }
        export declare class LowerCasePipe  {
          transform(value: string, args?: any[]): string;
        }
        export declare class UpperCasePipe {
            transform(value: string, args?: any[]): string;
        }
      `
    }
  }
};

function createSource(text: string): ts.SourceFile {
  return ts.createSourceFile('', text, ts.ScriptTarget.Latest, true);
}
