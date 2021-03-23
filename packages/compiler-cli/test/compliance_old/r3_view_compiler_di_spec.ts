/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: dependency injection', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  it('should create factory methods', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule, Injectable, Attribute, Host, SkipSelf, Self, Optional} from '@angular/core';

              @Injectable()
              export class MyService {}

              function dynamicAttrName() {
                return 'the-attr';
              }

              @Component({
                selector: 'my-component',
                template: \`\`
              })
              export class MyComponent {
                constructor(
                  @Attribute('name') name:string,
                  @Attribute(dynamicAttrName()) other: string,
                  s1: MyService,
                  @Host() s2: MyService,
                  @Self() s4: MyService,
                  @SkipSelf() s3: MyService,
                  @Optional() s5: MyService,
                  @Self() @Optional() s6: MyService,
                ) {}
              }

              @NgModule({declarations: [MyComponent], providers: [MyService]})
              export class MyModule {}
          `
      }
    };

    const factory = `
      MyComponent.ɵfac = function MyComponent_Factory(t) {
        return new (t || MyComponent)(
          $r3$.ɵɵinjectAttribute('name'),
          $r3$.ɵɵinjectAttribute(dynamicAttrName()),
          $r3$.ɵɵdirectiveInject(MyService),
          $r3$.ɵɵdirectiveInject(MyService, 1),
          $r3$.ɵɵdirectiveInject(MyService, 2),
          $r3$.ɵɵdirectiveInject(MyService, 4),
          $r3$.ɵɵdirectiveInject(MyService, 8),
          $r3$.ɵɵdirectiveInject(MyService, 10)
        );
      }`;


    const result = compile(files, angularFiles);

    expectEmit(result.source, factory, 'Incorrect factory');
  });

  it('should create a factory definition for an injectable', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Injectable} from '@angular/core';

          class MyDependency {}

          @Injectable()
          export class MyService {
            constructor(dep: MyDependency) {}
          }
        `
      }
    };

    const factory = `
      MyService.ɵfac = function MyService_Factory(t) {
        return new (t || MyService)($r3$.ɵɵinject(MyDependency));
      }`;

    const def = `
      MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
        token: MyService,
        factory: MyService.ɵfac
      });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, factory, 'Incorrect factory definition');
    expectEmit(result.source, def, 'Incorrect injectable definition');
  });

  it('should create a factory definition for an injectable with an overloaded constructor', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Injectable, Optional} from '@angular/core';

          class MyDependency {}
          class MyOptionalDependency {}

          @Injectable()
          export class MyService {
            constructor(dep: MyDependency);
            constructor(dep: MyDependency, @Optional() optionalDep?: MyOptionalDependency) {}
          }
        `
      }
    };

    const factory = `
      MyService.ɵfac = function MyService_Factory(t) {
        return new (t || MyService)($r3$.ɵɵinject(MyDependency), $r3$.ɵɵinject(MyOptionalDependency, 8));
      }`;

    const def = `
      MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
        token: MyService,
        factory: MyService.ɵfac
      });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, factory, 'Incorrect factory definition');
    expectEmit(result.source, def, 'Incorrect injectable definition');
  });

  it('should create a single factory def if the class has more than one decorator', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Injectable, Pipe} from '@angular/core';

          @Injectable()
          @Pipe({name: 'my-pipe'})
          export class MyPipe {
          }
        `
      }
    };

    const result = compile(files, angularFiles).source;
    const matches = result.match(/MyPipe\.ɵfac = function MyPipe_Factory/g);
    expect(matches ? matches.length : 0).toBe(1);
  });

  it('should delegate directly to the alternate factory when setting `useFactory` without `deps`',
     () => {
       const files = {
         app: {
           'spec.ts': `
              import {Injectable} from '@angular/core';

              class MyAlternateService {}

              function alternateFactory() {
                return new MyAlternateService();
              }

              @Injectable({
                useFactory: alternateFactory
              })
              export class MyService {
              }
            `
         }
       };

       const def = `
          MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
            token: MyService,
            factory: function() {
              return alternateFactory();
            }
          });
        `;

       const result = compile(files, angularFiles);
       expectEmit(result.source, def, 'Incorrect injectable definition');
     });

  it('should not delegate directly to the alternate factory when setting `useFactory` with `deps`',
     () => {
       const files = {
         app: {
           'spec.ts': `
              import {Injectable} from '@angular/core';

              class SomeDep {}
              class MyAlternateService {}

              @Injectable({
                useFactory: () => new MyAlternateFactory(),
                deps: [SomeDep]
              })
              export class MyService {
              }
            `
         }
       };

       const def = `
          MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
            token: MyService,
            factory: function MyService_Factory(t) {
              let r = null;
              if (t) {
                r = new t();
              } else {
                r = (() => new MyAlternateFactory())($r3$.ɵɵinject(SomeDep));
              }
              return r;
            }
          });
        `;

       const result = compile(files, angularFiles);
       expectEmit(result.source, def, 'Incorrect injectable definition');
     });

  it('should delegate directly to the alternate class factory when setting `useClass` without `deps`',
     () => {
       const files = {
         app: {
           'spec.ts': `
              import {Injectable} from '@angular/core';

              @Injectable()
              class MyAlternateService {}

              @Injectable({
                useClass: MyAlternateService
              })
              export class MyService {
              }
            `
         }
       };

       const factory = `
          MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
            token: MyService,
            factory: function(t) {
              return MyAlternateService.ɵfac(t);
            }
          });
        `;

       const result = compile(files, angularFiles);
       expectEmit(result.source, factory, 'Incorrect factory definition');
     });

  it('should not delegate directly to the alternate class when setting `useClass` with `deps`',
     () => {
       const files = {
         app: {
           'spec.ts': `
            import {Injectable} from '@angular/core';

            class SomeDep {}

            @Injectable()
            class MyAlternateService {}

            @Injectable({
              useClass: MyAlternateService,
              deps: [SomeDep]
            })
            export class MyService {
            }
          `
         }
       };

       const factory = `
          MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
            token: MyService,
            factory: function MyService_Factory(t) {
              let r = null;
              if (t) {
                r = new t();
              } else {
                r = new MyAlternateService($r3$.ɵɵinject(SomeDep));
              }
              return r;
            }
          });
        `;

       const result = compile(files, angularFiles);
       expectEmit(result.source, factory, 'Incorrect factory definition');
     });

  it('should unwrap forward refs when delegating to a different class', () => {
    const files = {
      app: {
        'spec.ts': `
            import {Injectable, forwardRef} from '@angular/core';

            @Injectable({providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl)})
            abstract class SomeProvider {
            }

            @Injectable()
            class SomeProviderImpl extends SomeProvider {
            }
          `
      }
    };

    const factory = `
      SomeProvider.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
        token: SomeProvider,
        factory: function(t) {
          return SomeProviderImpl.ɵfac(t);
        },
        providedIn: 'root'
      });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, factory, 'Incorrect factory definition');
  });

  it('should have the pipe factory take precedence over the injectable factory, if a class has multiple decorators',
     () => {
       const files = {
         app: {
           'spec.ts': `
            import {Component, NgModule, Pipe, PipeTransform, Injectable} from '@angular/core';

            @Injectable()
            class Service {}

            @Injectable()
            @Pipe({name: 'myPipe'})
            export class MyPipe implements PipeTransform {
              constructor(service: Service) {}
              transform(value: any, ...args: any[]) { return value; }
            }

            @Pipe({name: 'myOtherPipe'})
            @Injectable()
            export class MyOtherPipe implements PipeTransform {
              constructor(service: Service) {}
              transform(value: any, ...args: any[]) { return value; }
            }

            @Component({
              selector: 'my-app',
              template: '{{0 | myPipe | myOtherPipe}}'
            })
            export class MyApp {}

            @NgModule({declarations: [MyPipe, MyOtherPipe, MyApp], declarations: [Service]})
            export class MyModule {}
          `
         }
       };

       const result = compile(files, angularFiles);
       const source = result.source;

       // The prov definition must be last so MyPipe.fac is defined
       const MyPipeDefs = `
        MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(i0.ɵɵdirectiveInject(Service, 16)); };
        MyPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "myPipe", type: MyPipe, pure: true });
        MyPipe.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyPipe, factory: MyPipe.ɵfac });
      `;

       // The prov definition must be last so MyOtherPipe.fac is defined
       const MyOtherPipeDefs = `
        MyOtherPipe.ɵfac = function MyOtherPipe_Factory(t) { return new (t || MyOtherPipe)($r3$.ɵɵdirectiveInject(Service, 16)); };
        MyOtherPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "myOtherPipe", type: MyOtherPipe, pure: true });
        MyOtherPipe.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyOtherPipe, factory: MyOtherPipe.ɵfac });
      `;

       expectEmit(source, MyPipeDefs, 'Invalid pipe factory function');
       expectEmit(source, MyOtherPipeDefs, 'Invalid pipe factory function');
       expect(source.match(/MyPipe\.ɵfac =/g)!.length).toBe(1);
       expect(source.match(/MyOtherPipe\.ɵfac =/g)!.length).toBe(1);
     });
});
