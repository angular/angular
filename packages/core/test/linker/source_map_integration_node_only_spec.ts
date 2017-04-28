/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader} from '@angular/compiler';
import {SourceMap} from '@angular/compiler/src/output/source_map';
import {extractSourceMap, originalPositionFor} from '@angular/compiler/test/output/source_map_util';
import {MockResourceLoader} from '@angular/compiler/testing/src/resource_loader_mock';
import {Attribute, Component, Directive, ErrorHandler, ɵglobal} from '@angular/core';
import {getErrorLogger} from '@angular/core/src/errors';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';

export function main() {
  describe('jit source mapping', () => {
    let jitSpy: jasmine.Spy;
    let resourceLoader: MockResourceLoader;

    beforeEach(() => {
      jitSpy = spyOn(ɵglobal, 'Function').and.callThrough();
      resourceLoader = new MockResourceLoader();
      TestBed.configureCompiler({providers: [{provide: ResourceLoader, useValue: resourceLoader}]});
    });

    function getErrorLoggerStack(e: Error): string {
      let logStack: string = undefined !;
      getErrorLogger(e)(<any>{error: () => logStack = new Error().stack !}, e.message);
      return logStack;
    }

    function getSourceMap(genFile: string): SourceMap {
      const jitSources = jitSpy.calls.all().map((call) => call.args[call.args.length - 1]);
      return jitSources.map(source => extractSourceMap(source))
          .find(map => !!(map && map.file === genFile)) !;
    }

    function getSourcePositionForStack(stack: string):
        {source: string, line: number, column: number} {
      const ngFactoryLocations =
          stack
              .split('\n')
              // e.g. at View_MyComp_0 (ng:///DynamicTestModule/MyComp.ngfactory.js:153:40)
              .map(line => /\((.*\.ngfactory\.js):(\d+):(\d+)/.exec(line))
              .filter(match => !!match)
              .map(match => ({
                     file: match ![1],
                     line: parseInt(match ![2], 10),
                     column: parseInt(match ![3], 10)
                   }));
      const ngFactoryLocation = ngFactoryLocations[0];

      const sourceMap = getSourceMap(ngFactoryLocation.file);
      return originalPositionFor(
          sourceMap, {line: ngFactoryLocation.line, column: ngFactoryLocation.column});
    }

    function compileAndCreateComponent(comType: any) {
      TestBed.configureTestingModule({declarations: [comType]});

      let error: any;
      TestBed.compileComponents().catch((e) => error = e);
      if (resourceLoader.hasPendingRequests()) {
        resourceLoader.flush();
      }
      tick();
      if (error) {
        throw error;
      }
      return TestBed.createComponent(comType);
    }

    describe('inline templates', () => {
      const ngUrl = 'ng:///DynamicTestModule/MyComp.html';

      function templateDecorator(template: string) { return {template}; }

      declareTests({ngUrl, templateDecorator});
    });

    describe('external templates', () => {
      const ngUrl = 'ng:///some/url.html';
      const templateUrl = 'http://localhost:1234/some/url.html';

      function templateDecorator(template: string) {
        resourceLoader.expect(templateUrl, template);
        return {templateUrl};
      }

      declareTests({ngUrl, templateDecorator});
    });

    function declareTests(
        {ngUrl, templateDecorator}:
            {ngUrl: string, templateDecorator: (template: string) => { [key: string]: any }}) {
      it('should use the right source url in html parse errors', fakeAsync(() => {
           @Component({...templateDecorator('<div>\n  </error>')})
           class MyComp {
           }

           expect(() => compileAndCreateComponent(MyComp))
               .toThrowError(
                   new RegExp(`Template parse errors[\\s\\S]*${ngUrl.replace('$', '\\$')}@1:2`));
         }));

      it('should use the right source url in template parse errors', fakeAsync(() => {
           @Component({...templateDecorator('<div>\n  <div unknown="{{ctxProp}}"></div>')})
           class MyComp {
           }

           expect(() => compileAndCreateComponent(MyComp))
               .toThrowError(
                   new RegExp(`Template parse errors[\\s\\S]*${ngUrl.replace('$', '\\$')}@1:7`));
         }));

      it('should create a sourceMap for templates', fakeAsync(() => {
           const template = `Hello World!`;

           @Component({...templateDecorator(template)})
           class MyComp {
           }

           compileAndCreateComponent(MyComp);

           const sourceMap = getSourceMap('ng:///DynamicTestModule/MyComp.ngfactory.js');
           expect(sourceMap.sources).toEqual([
             'ng:///DynamicTestModule/MyComp.ngfactory.js', ngUrl
           ]);
           expect(sourceMap.sourcesContent).toEqual([' ', template]);
         }));


      it('should report source location for di errors', fakeAsync(() => {
           const template = `<div>\n    <div   someDir></div></div>`;

           @Component({...templateDecorator(template)})
           class MyComp {
           }

           @Directive({selector: '[someDir]'})
           class SomeDir {
             constructor() { throw new Error('Test'); }
           }

           TestBed.configureTestingModule({declarations: [SomeDir]});
           let error: any;
           try {
             compileAndCreateComponent(MyComp);
           } catch (e) {
             error = e;
           }
           // The error should be logged from the element
           expect(getSourcePositionForStack(getErrorLoggerStack(error))).toEqual({
             line: 2,
             column: 4,
             source: ngUrl,
           });
         }));

      it('should report di errors with multiple elements and directives', fakeAsync(() => {
           const template = `<div someDir></div><div someDir="throw"></div>`;

           @Component({...templateDecorator(template)})
           class MyComp {
           }

           @Directive({selector: '[someDir]'})
           class SomeDir {
             constructor(@Attribute('someDir') someDir: string) {
               if (someDir === 'throw') {
                 throw new Error('Test');
               }
             }
           }

           TestBed.configureTestingModule({declarations: [SomeDir]});
           let error: any;
           try {
             compileAndCreateComponent(MyComp);
           } catch (e) {
             error = e;
           }
           // The error should be logged from the 2nd-element
           expect(getSourcePositionForStack(getErrorLoggerStack(error))).toEqual({
             line: 1,
             column: 19,
             source: ngUrl,
           });
         }));

      it('should report source location for binding errors', fakeAsync(() => {
           const template = `<div>\n    <span   [title]="createError()"></span></div>`;

           @Component({...templateDecorator(template)})
           class MyComp {
             createError() { throw new Error('Test'); }
           }

           const comp = compileAndCreateComponent(MyComp);

           let error: any;
           try {
             comp.detectChanges();
           } catch (e) {
             error = e;
           }
           // the stack should point to the binding
           expect(getSourcePositionForStack(error.stack)).toEqual({
             line: 2,
             column: 12,
             source: ngUrl,
           });
           // The error should be logged from the element
           expect(getSourcePositionForStack(getErrorLoggerStack(error))).toEqual({
             line: 2,
             column: 4,
             source: ngUrl,
           });
         }));

      it('should report source location for event errors', fakeAsync(() => {
           const template = `<div>\n    <span   (click)="createError()"></span></div>`;

           @Component({...templateDecorator(template)})
           class MyComp {
             createError() { throw new Error('Test'); }
           }

           const comp = compileAndCreateComponent(MyComp);

           let error: any;
           const errorHandler = TestBed.get(ErrorHandler);
           spyOn(errorHandler, 'handleError').and.callFake((e: any) => error = e);
           comp.debugElement.children[0].children[0].triggerEventHandler('click', 'EVENT');
           expect(error).toBeTruthy();
           // the stack should point to the binding
           expect(getSourcePositionForStack(error.stack)).toEqual({
             line: 2,
             column: 12,
             source: ngUrl,
           });
           // The error should be logged from the element
           expect(getSourcePositionForStack(getErrorLoggerStack(error))).toEqual({
             line: 2,
             column: 4,
             source: ngUrl,
           });

         }));
    }
  });
}
