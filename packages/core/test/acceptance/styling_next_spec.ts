/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompilerStylingMode, compilerSetStylingMode} from '@angular/compiler/src/render3/view/styling_state';
import {Component, Directive, HostBinding, Input} from '@angular/core';
import {DebugNode, LViewDebug, toDebug} from '@angular/core/src/render3/debug';
import {RuntimeStylingMode, runtimeSetStylingMode} from '@angular/core/src/render3/styling_next/state';
import {loadLContextFromNode} from '@angular/core/src/render3/util/discovery_utils';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('new styling integration', () => {
  beforeEach(() => {
    runtimeSetStylingMode(RuntimeStylingMode.UseNew);
    compilerSetStylingMode(CompilerStylingMode.UseNew);
  });

  afterEach(() => {
    runtimeSetStylingMode(RuntimeStylingMode.UseOld);
    compilerSetStylingMode(CompilerStylingMode.UseOld);
  });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should apply single property styles/classes to the element and default to any static styling values',
          () => {
            @Component({
              template: `
        <div [style.width]="w"
             [style.height]="h"
             [style.opacity]="o"
             style="width:200px; height:200px;"
             [class.abc]="abc"
             [class.xyz]="xyz"></div>
      `
            })
            class Cmp {
              w: string|null = '100px';
              h: string|null = '100px';
              o: string|null = '0.5';
              abc = true;
              xyz = false;
            }

            TestBed.configureTestingModule({declarations: [Cmp]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');
            expect(element.style.width).toEqual('100px');
            expect(element.style.height).toEqual('100px');
            expect(element.style.opacity).toEqual('0.5');
            expect(element.classList.contains('abc')).toBeTruthy();
            expect(element.classList.contains('xyz')).toBeFalsy();

            fixture.componentInstance.w = null;
            fixture.componentInstance.h = null;
            fixture.componentInstance.o = null;
            fixture.componentInstance.abc = false;
            fixture.componentInstance.xyz = true;
            fixture.detectChanges();

            expect(element.style.width).toEqual('200px');
            expect(element.style.height).toEqual('200px');
            expect(element.style.opacity).toBeFalsy();
            expect(element.classList.contains('abc')).toBeFalsy();
            expect(element.classList.contains('xyz')).toBeTruthy();
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should apply single style/class across the template and directive host bindings', () => {
        @Directive({selector: '[dir-that-sets-width]'})
        class DirThatSetsWidthDirective {
          @Input('dir-that-sets-width') @HostBinding('style.width') public width: string = '';
        }

        @Directive({selector: '[another-dir-that-sets-width]', host: {'[style.width]': 'width'}})
        class AnotherDirThatSetsWidthDirective {
          @Input('another-dir-that-sets-width') public width: string = '';
        }

        @Component({
          template: `
        <div [style.width]="w0"
             [dir-that-sets-width]="w1"
             [another-dir-that-sets-width]="w2">
      `
        })
        class Cmp {
          w0: string|null = null;
          w1: string|null = null;
          w2: string|null = null;
        }

        TestBed.configureTestingModule(
            {declarations: [Cmp, DirThatSetsWidthDirective, AnotherDirThatSetsWidthDirective]});
        const fixture = TestBed.createComponent(Cmp);
        fixture.componentInstance.w0 = '100px';
        fixture.componentInstance.w1 = '200px';
        fixture.componentInstance.w2 = '300px';
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        expect(element.style.width).toEqual('100px');

        fixture.componentInstance.w0 = null;
        fixture.detectChanges();

        expect(element.style.width).toEqual('200px');

        fixture.componentInstance.w1 = null;
        fixture.detectChanges();

        expect(element.style.width).toEqual('300px');

        fixture.componentInstance.w2 = null;
        fixture.detectChanges();

        expect(element.style.width).toBeFalsy();

        fixture.componentInstance.w2 = '400px';
        fixture.detectChanges();

        expect(element.style.width).toEqual('400px');

        fixture.componentInstance.w1 = '500px';
        fixture.componentInstance.w0 = '600px';
        fixture.detectChanges();

        expect(element.style.width).toEqual('600px');
      });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should combine all styling across the template, directive and component host bindings',
          () => {
            @Directive({selector: '[dir-with-styling]'})
            class DirWithStyling {
              @HostBinding('style.color') public color = 'red';

              @HostBinding('style.font-size') public fontSize = '100px';

              @HostBinding('class.dir') public dirClass = true;
            }

            @Component({selector: 'comp-with-styling'})
            class CompWithStyling {
              @HostBinding('style.width') public width = '900px';

              @HostBinding('style.height') public height = '900px';

              @HostBinding('class.comp') public compClass = true;
            }

            @Component({
              template: `
        <comp-with-styling
          [style.opacity]="opacity"
          [style.width]="width"
          [class.tpl]="tplClass"
          dir-with-styling>...</comp-with-styling>
      `
            })
            class Cmp {
              opacity: string|null = '0.5';
              width: string|null = 'auto';
              tplClass = true;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirWithStyling, CompWithStyling]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('comp-with-styling');

            const node = getDebugNode(element) !;
            const styles = node.styles !;
            const classes = node.classes !;

            expect(styles.values).toEqual({
              'color': 'red',
              'width': 'auto',
              'opacity': '0.5',
              'height': '900px',
              'font-size': '100px'
            });
            expect(classes.values).toEqual({
              'dir': true,
              'comp': true,
              'tpl': true,
            });

            fixture.componentInstance.width = null;
            fixture.componentInstance.opacity = null;
            fixture.componentInstance.tplClass = false;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'color': 'red',
              'width': '900px',
              'opacity': null,
              'height': '900px',
              'font-size': '100px'
            });
            expect(classes.values).toEqual({
              'dir': true,
              'comp': true,
              'tpl': false,
            });
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should properly apply styling across sub and super class directive host bindings',
          () => {
            @Directive({selector: '[super-class-dir]'})
            class SuperClassDirective {
              @HostBinding('style.width') public w1 = '100px';
            }

            @Component({selector: '[sub-class-dir]'})
            class SubClassDirective extends SuperClassDirective {
              @HostBinding('style.width') public w2 = '200px';
            }

            @Component({
              template: `
          <div sub-class-dir [style.width]="w3"></div>
      `
            })
            class Cmp {
              w3: string|null = '300px';
            }

            TestBed.configureTestingModule(
                {declarations: [Cmp, SuperClassDirective, SubClassDirective]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');

            const node = getDebugNode(element) !;
            const styles = node.styles !;

            expect(styles.values).toEqual({
              'width': '300px',
            });

            fixture.componentInstance.w3 = null;
            fixture.detectChanges();
            expect(styles.values).toEqual({
              'width': '200px',
            });
          });

  onlyInIvy('only ivy has style debugging support')
      .it('should support situations where there are more than 32 bindings', () => {
        const TOTAL_BINDINGS = 34;

        let bindingsHTML = '';
        let bindingsArr: any[] = [];
        for (let i = 0; i < TOTAL_BINDINGS; i++) {
          bindingsHTML += `[style.prop${i}]="bindings[${i}]" `;
          bindingsArr.push(null);
        }

        @Component({template: `<div ${bindingsHTML}></div>`})
        class Cmp {
          bindings = bindingsArr;

          updateBindings(value: string) {
            for (let i = 0; i < TOTAL_BINDINGS; i++) {
              this.bindings[i] = value + i;
            }
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);

        let testValue = 'initial';
        fixture.componentInstance.updateBindings('initial');
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');

        const node = getDebugNode(element) !;
        const styles = node.styles !;

        let values = styles.values;
        let props = Object.keys(values);
        expect(props.length).toEqual(TOTAL_BINDINGS);

        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          const value = values[prop] as string;
          const num = value.substr(testValue.length);
          expect(value).toEqual(`initial${num}`);
        }

        testValue = 'final';
        fixture.componentInstance.updateBindings('final');
        fixture.detectChanges();

        values = styles.values;
        props = Object.keys(values);
        expect(props.length).toEqual(TOTAL_BINDINGS);
        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          const value = values[prop] as string;
          const num = value.substr(testValue.length);
          expect(value).toEqual(`final${num}`);
        }
      });
});

function getDebugNode(element: Node): DebugNode|null {
  const lContext = loadLContextFromNode(element);
  const lViewDebug = toDebug(lContext.lView) as LViewDebug;
  const debugNodes = lViewDebug.nodes || [];
  for (let i = 0; i < debugNodes.length; i++) {
    const n = debugNodes[i];
    if (n.native === element) {
      return n;
    }
  }
  return null;
}
