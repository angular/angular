import * as ts from 'typescript';

import {MetadataCollector} from '../src/collector';
import {ClassMetadata, ConstructorMetadata, ModuleMetadata} from '../src/schema';

import {Directory, Host, expectValidSources} from './typescript.mocks';

describe('Collector', () => {
  let documentRegistry = ts.createDocumentRegistry();
  let host: ts.LanguageServiceHost;
  let service: ts.LanguageService;
  let program: ts.Program;
  let collector: MetadataCollector;

  beforeEach(() => {
    host = new Host(FILES, [
      '/app/app.component.ts',
      '/app/cases-data.ts',
      '/app/error-cases.ts',
      '/promise.ts',
      '/unsupported-1.ts',
      '/unsupported-2.ts',
      'import-star.ts',
      'exported-functions.ts',
      'exported-enum.ts',
      'exported-consts.ts',
      'local-symbol-ref.ts',
      'local-function-ref.ts',
      'local-symbol-ref-func.ts',
      'local-symbol-ref-func-dynamic.ts',
      'private-enum.ts',
      're-exports.ts',
      'static-field-reference.ts',
      'static-method.ts',
      'static-method-call.ts',
      'static-method-with-if.ts',
      'static-method-with-default.ts',
    ]);
    service = ts.createLanguageService(host, documentRegistry);
    program = service.getProgram();
    collector = new MetadataCollector();
  });

  it('should not have errors in test data', () => { expectValidSources(service, program); });

  it('should return undefined for modules that have no metadata', () => {
    const sourceFile = program.getSourceFile('app/hero.ts');
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toBeUndefined();
  });

  it('should be able to collect a simple component\'s metadata', () => {
    const sourceFile = program.getSourceFile('app/hero-detail.component.ts');
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: 1,
      metadata: {
        HeroDetailComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Component'},
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
                expression:
                    {__symbolic: 'reference', module: 'angular2/core', name: 'Input'}
              }]
            }]
          }
        }
      }
    });
  });

  it('should be able to get a more complicated component\'s metadata', () => {
    const sourceFile = program.getSourceFile('/app/app.component.ts');
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: 1,
      metadata: {
        AppComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Component'},
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
                },
                {__symbolic: 'reference', module: 'angular2/common', name: 'NgFor'}
              ],
              providers: [{__symbolic: 'reference', module: './hero.service', default: true}],
              pipes: [
                {__symbolic: 'reference', module: 'angular2/common', name: 'LowerCasePipe'},
                {__symbolic: 'reference', module: 'angular2/common', name: 'UpperCasePipe'}
              ]
            }]
          }],
          members: {
            __ctor__: [{
              __symbolic: 'constructor',
              parameters: [{__symbolic: 'reference', module: './hero.service', default: true}]
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
    const sourceFile = program.getSourceFile('/app/mock-heroes.ts');
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: 1,
      metadata: {
        HEROES: [
          {'id': 11, 'name': 'Mr. Nice'}, {'id': 12, 'name': 'Narco'},
          {'id': 13, 'name': 'Bombasto'}, {'id': 14, 'name': 'Celeritas'},
          {'id': 15, 'name': 'Magneta'}, {'id': 16, 'name': 'RubberMan'},
          {'id': 17, 'name': 'Dynama'}, {'id': 18, 'name': 'Dr IQ'}, {'id': 19, 'name': 'Magma'},
          {'id': 20, 'name': 'Tornado'}
        ]
      }
    });
  });

  it('should return undefined for modules that have no metadata', () => {
    const sourceFile = program.getSourceFile('/app/error-cases.ts');
    expect(sourceFile).toBeTruthy(sourceFile);
    const metadata = collector.getMetadata(sourceFile);
    expect(metadata).toBeUndefined();
  });

  let casesFile: ts.SourceFile;
  let casesMetadata: ModuleMetadata;

  beforeEach(() => {
    casesFile = program.getSourceFile('/app/cases-data.ts');
    casesMetadata = collector.getMetadata(casesFile);
  });

  it('should provide any reference for an any ctor parameter type', () => {
    const casesAny = <ClassMetadata>casesMetadata.metadata['CaseAny'];
    expect(casesAny).toBeTruthy();
    const ctorData = casesAny.members['__ctor__'];
    expect(ctorData).toEqual(
        [{__symbolic: 'constructor', parameters: [{__symbolic: 'reference', name: 'any'}]}]);
  });

  it('should record annotations on set and get declarations', () => {
    const propertyData = {
      name: [{
        __symbolic: 'property',
        decorators: [{
          __symbolic: 'call',
          expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Input'},
          arguments: ['firstName']
        }]
      }]
    };
    const caseGetProp = <ClassMetadata>casesMetadata.metadata['GetProp'];
    expect(caseGetProp.members).toEqual(propertyData);
    const caseSetProp = <ClassMetadata>casesMetadata.metadata['SetProp'];
    expect(caseSetProp.members).toEqual(propertyData);
    const caseFullProp = <ClassMetadata>casesMetadata.metadata['FullProp'];
    expect(caseFullProp.members).toEqual(propertyData);
  });

  it('should record references to parameterized types', () => {
    const casesForIn = <ClassMetadata>casesMetadata.metadata['NgFor'];
    expect(casesForIn).toEqual({
      __symbolic: 'class',
      decorators: [{
        __symbolic: 'call',
        expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Injectable'}
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
    });
  });

  it('should report errors for destructured imports', () => {
    let unsupported1 = program.getSourceFile('/unsupported-1.ts');
    let metadata = collector.getMetadata(unsupported1);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: 1,
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
    let unsupported1 = program.getSourceFile('/unsupported-2.ts');
    let metadata = collector.getMetadata(unsupported1);
    let barClass = <ClassMetadata>metadata.metadata['Bar'];
    let ctor = <ConstructorMetadata>barClass.members['__ctor__'][0];
    let parameter = ctor.parameters[0];
    expect(parameter).toEqual({
      __symbolic: 'error',
      message: 'Reference to non-exported class',
      line: 3,
      character: 4,
      context: {className: 'Foo'}
    });
  });

  it('should be able to handle import star type references', () => {
    let importStar = program.getSourceFile('/import-star.ts');
    let metadata = collector.getMetadata(importStar);
    let someClass = <ClassMetadata>metadata.metadata['SomeClass'];
    let ctor = <ConstructorMetadata>someClass.members['__ctor__'][0];
    let parameters = ctor.parameters;
    expect(parameters).toEqual([
      {__symbolic: 'reference', module: 'angular2/common', name: 'NgFor'}
    ]);
  });

  it('should be able to record functions', () => {
    let exportedFunctions = program.getSourceFile('/exported-functions.ts');
    let metadata = collector.getMetadata(exportedFunctions);
    expect(metadata).toEqual({
      __symbolic: 'module',
      version: 1,
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
        }
      }
    });
  });

  it('should be able to handle import star type references', () => {
    let importStar = program.getSourceFile('/import-star.ts');
    let metadata = collector.getMetadata(importStar);
    let someClass = <ClassMetadata>metadata.metadata['SomeClass'];
    let ctor = <ConstructorMetadata>someClass.members['__ctor__'][0];
    let parameters = ctor.parameters;
    expect(parameters).toEqual([
      {__symbolic: 'reference', module: 'angular2/common', name: 'NgFor'}
    ]);
  });

  it('should be able to collect the value of an enum', () => {
    let enumSource = program.getSourceFile('/exported-enum.ts');
    let metadata = collector.getMetadata(enumSource);
    let someEnum: any = metadata.metadata['SomeEnum'];
    expect(someEnum).toEqual({A: 0, B: 1, C: 100, D: 101});
  });

  it('should ignore a non-export enum', () => {
    let enumSource = program.getSourceFile('/private-enum.ts');
    let metadata = collector.getMetadata(enumSource);
    let publicEnum: any = metadata.metadata['PublicEnum'];
    let privateEnum: any = metadata.metadata['PrivateEnum'];
    expect(publicEnum).toEqual({a: 0, b: 1, c: 2});
    expect(privateEnum).toBeUndefined();
  });

  it('should be able to collect enums initialized from consts', () => {
    let enumSource = program.getSourceFile('/exported-enum.ts');
    let metadata = collector.getMetadata(enumSource);
    let complexEnum: any = metadata.metadata['ComplexEnum'];
    expect(complexEnum).toEqual({
      A: 0,
      B: 1,
      C: 30,
      D: 40,
      E: {__symbolic: 'reference', module: './exported-consts', name: 'constValue'}
    });
  });

  it('should be able to collect a simple static method', () => {
    let staticSource = program.getSourceFile('/static-method.ts');
    let metadata = collector.getMetadata(staticSource);
    expect(metadata).toBeDefined();
    let classData = <ClassMetadata>metadata.metadata['MyModule'];
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
    let staticSource = program.getSourceFile('/static-method-call.ts');
    let metadata = collector.getMetadata(staticSource);
    expect(metadata).toBeDefined();
    let classData = <ClassMetadata>metadata.metadata['Foo'];
    expect(classData).toBeDefined();
    expect(classData.decorators).toEqual([{
      __symbolic: 'call',
      expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Component'},
      arguments: [{
        providers: {
          __symbolic: 'call',
          expression: {
            __symbolic: 'select',
            expression: {__symbolic: 'reference', module: './static-method', name: 'MyModule'},
            member: 'with'
          },
          arguments: ['a']
        }
      }]
    }]);
  });

  it('should be able to collect a static field', () => {
    let staticSource = program.getSourceFile('/static-field.ts');
    let metadata = collector.getMetadata(staticSource);
    expect(metadata).toBeDefined();
    let classData = <ClassMetadata>metadata.metadata['MyModule'];
    expect(classData).toBeDefined();
    expect(classData.statics).toEqual({VALUE: 'Some string'});
  });

  it('should be able to collect a reference to a static field', () => {
    let staticSource = program.getSourceFile('/static-field-reference.ts');
    let metadata = collector.getMetadata(staticSource);
    expect(metadata).toBeDefined();
    let classData = <ClassMetadata>metadata.metadata['Foo'];
    expect(classData).toBeDefined();
    expect(classData.decorators).toEqual([{
      __symbolic: 'call',
      expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Component'},
      arguments: [{
        providers: [{
          provide: 'a',
          useValue: {
            __symbolic: 'select',
            expression: {__symbolic: 'reference', module: './static-field', name: 'MyModule'},
            member: 'VALUE'
          }
        }]
      }]
    }]);
  });

  it('should be able to collect a method with a conditional expression', () => {
    let source = program.getSourceFile('/static-method-with-if.ts');
    let metadata = collector.getMetadata(source);
    expect(metadata).toBeDefined();
    let classData = <ClassMetadata>metadata.metadata['MyModule'];
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
    let source = program.getSourceFile('/static-method-with-default.ts');
    let metadata = collector.getMetadata(source);
    expect(metadata).toBeDefined();
    let classData = <ClassMetadata>metadata.metadata['MyModule'];
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
    let source = program.getSourceFile('/re-exports.ts');
    let metadata = collector.getMetadata(source);
    expect(metadata.exports).toEqual([
      {from: './static-field', export: ['MyModule']},
      {from: './static-field-reference', export: [{name: 'Foo', as: 'OtherModule'}]},
      {from: 'angular2/core'}
    ]);
  });

  it('should collect an error symbol if collecting a reference to a non-exported symbol', () => {
    let source = program.getSourceFile('/local-symbol-ref.ts');
    let metadata = collector.getMetadata(source);
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
          expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Component'},
          arguments: [{providers: [{__symbolic: 'reference', name: 'REQUIRED_VALIDATOR'}]}]
        }]
      }
    });
  });

  it('should collect an error symbol if collecting a reference to a non-exported function', () => {
    let source = program.getSourceFile('/local-function-ref.ts');
    let metadata = collector.getMetadata(source);
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
          expression: {__symbolic: 'reference', module: 'angular2/core', name: 'Component'},
          arguments: [{providers: [{__symbolic: 'reference', name: 'REQUIRED_VALIDATOR'}]}]
        }]
      }
    })
  });

  it('should collect an error for a simple function that references a local variable', () => {
    let source = program.getSourceFile('/local-symbol-ref-func.ts');
    let metadata = collector.getMetadata(source);
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
    })
  });

  describe('in strict mode', () => {
    it('should throw if an error symbol is collecting a reference to a non-exported symbol', () => {
      let source = program.getSourceFile('/local-symbol-ref.ts');
      expect(() => collector.getMetadata(source, true)).toThrowError(/Reference to a local symbol/);
    });

    it('should throw if an error if collecting a reference to a non-exported function', () => {
      let source = program.getSourceFile('/local-function-ref.ts');
      expect(() => collector.getMetadata(source, true))
          .toThrowError(/Reference to a non-exported function/);
    });

    it('should throw for references to unexpected types', () => {
      let unsupported1 = program.getSourceFile('/unsupported-2.ts');
      expect(() => collector.getMetadata(unsupported1, true))
          .toThrowError(/Reference to non-exported class/);
    });
  })
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
          this._heroService.getHeroesSlowly().then(heros => this.heroes = heros);
        }
      }`,
    'hero.ts': `
      export interface Hero {
        id: number;
        name: string;
      }`,
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
          {"id": 11, "name": "Mr. Nice"},
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
  'import-star.ts': `
    import {Injectable} from 'angular2/core';
    import * as common from 'angular2/common';

    @Injectable()
    export class SomeClass {
      constructor(private f: common.NgFor) {}
    }
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
    import {Injectable} from 'angular2/core';

    @Injectable()
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
    import {Injectable} from 'angular2/core';

    @Injectable()
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
    import {Injectable} from 'angular2/core';

    @Injectable()
    export class MyModule {
      static VALUE = 'Some string';
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
    import {Injectable} from 'angular2/core';

    @Injectable()
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
