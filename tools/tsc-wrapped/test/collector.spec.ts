import * as ts from 'typescript';
import {MetadataCollector} from '../src/collector';
import {ClassMetadata, ModuleMetadata} from '../src/schema';

import {Directory, expectValidSources, Host} from './typescript.mocks';

describe('Collector', () => {
  let host: ts.LanguageServiceHost;
  let service: ts.LanguageService;
  let program: ts.Program;
  let typeChecker: ts.TypeChecker;
  let collector: MetadataCollector;

  beforeEach(() => {
    host = new Host(
        FILES,
        ['/app/app.component.ts', '/app/cases-data.ts', '/app/cases-no-data.ts', '/promise.ts']);
    service = ts.createLanguageService(host);
    program = service.getProgram();
    typeChecker = program.getTypeChecker();
    collector = new MetadataCollector();
  });

  it('should not have errors in test data', () => { expectValidSources(service, program); });

  it('should return undefined for modules that have no metadata', () => {
    const sourceFile = program.getSourceFile('app/hero.ts');
    const metadata = collector.getMetadata(sourceFile, typeChecker);
    expect(metadata).toBeUndefined();
  });

  it('should be able to collect import statements', () => {
    const sourceFile = program.getSourceFile('app/app.component.ts');
    expect(collector.collectImports(sourceFile)).toEqual([
      {
        from: 'angular2/core',
        namedImports: [{name: 'MyComponent', propertyName: 'Component'}, {name: 'OnInit'}]
      },
      {from: 'angular2/common', namespace: 'common'},
      {from: './hero', namedImports: [{name: 'Hero'}]},
      {from: './hero-detail.component', namedImports: [{name: 'HeroDetailComponent'}]},
      {from: './hero.service', defaultName: 'HeroService'}
    ]);
  });

  it('should be able to collect a simple component\'s metadata', () => {
    const sourceFile = program.getSourceFile('app/hero-detail.component.ts');
    const metadata = collector.getMetadata(sourceFile, typeChecker);
    expect(metadata).toEqual({
      __symbolic: 'module',
      metadata: {
        HeroDetailComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {__symbolic: 'reference', name: 'Component', module: 'angular2/core'},
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
                    {__symbolic: 'reference', name: 'Input', module: 'angular2/core'}
              }]
            }]
          }
        }
      }
    });
  });

  it('should be able to get a more complicated component\'s metadata', () => {
    const sourceFile = program.getSourceFile('/app/app.component.ts');
    const metadata = collector.getMetadata(sourceFile, typeChecker);
    expect(metadata).toEqual({
      __symbolic: 'module',
      metadata: {
        AppComponent: {
          __symbolic: 'class',
          decorators: [{
            __symbolic: 'call',
            expression: {__symbolic: 'reference', name: 'Component', module: 'angular2/core'},
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
                  name: 'HeroDetailComponent',
                  module: './hero-detail.component'
                },
                {__symbolic: 'reference', name: 'NgFor', module: 'angular2/common'}
              ],
              providers: [{__symbolic: 'reference', name: undefined, module: './hero.service'}],
              pipes: [
                {__symbolic: 'reference', name: 'LowerCasePipe', module: 'angular2/common'},
                {__symbolic: 'reference', name: 'UpperCasePipe', module: 'angular2/common'}
              ]
            }]
          }],
          members: {
            __ctor__: [{
              __symbolic: 'constructor',
              parameters: [{__symbolic: 'reference', name: undefined, module: './hero.service'}]
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
    const metadata = collector.getMetadata(sourceFile, typeChecker);
    expect(metadata).toEqual({
      __symbolic: 'module',
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

  it('should have no data produced for the no data cases', () => {
    const sourceFile = program.getSourceFile('/app/cases-no-data.ts');
    expect(sourceFile).toBeTruthy(sourceFile);
    const metadata = collector.getMetadata(sourceFile, typeChecker);
    expect(metadata).toBeFalsy();
  });

  let casesFile: ts.SourceFile;
  let casesMetadata: ModuleMetadata;

  beforeEach(() => {
    casesFile = program.getSourceFile('/app/cases-data.ts');
    casesMetadata = collector.getMetadata(casesFile, typeChecker);
  });

  it('should provide null for an any ctor pameter type', () => {
    const casesAny = <ClassMetadata>casesMetadata.metadata['CaseAny'];
    expect(casesAny).toBeTruthy();
    const ctorData = casesAny.members['__ctor__'];
    expect(ctorData).toEqual([{__symbolic: 'constructor', parameters: [null]}]);
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
     `,
    'cases-no-data.ts': `
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
