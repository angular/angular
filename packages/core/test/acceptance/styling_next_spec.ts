/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompilerStylingMode, compilerSetStylingMode} from '@angular/compiler/src/render3/view/styling_state';
import {Component, Directive, HostBinding, Input, ViewChild} from '@angular/core';
import {SecurityContext} from '@angular/core/src/core';
import {getLContext} from '@angular/core/src/render3/context_discovery';
import {DebugNode, LViewDebug, toDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {SANITIZER} from '@angular/core/src/render3/interfaces/view';
import {RuntimeStylingMode, runtimeSetStylingMode, setCurrentStyleSanitizer} from '@angular/core/src/render3/styling_next/state';
import {loadLContextFromNode} from '@angular/core/src/render3/util/discovery_utils';
import {ngDevModeResetPerfCounters as resetStylingCounters} from '@angular/core/src/util/ng_dev_mode';
import {TestBed} from '@angular/core/testing';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
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

  onlyInIvy('only ivy has style/class bindings debugging support')
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

  onlyInIvy('only ivy has style debugging support')
      .it('should apply map-based style and class entries', () => {
        @Component({template: '<div [style]="s" [class]="c"></div>'})
        class Cmp {
          public c !: {[key: string]: any};
          updateClasses(prop: string) {
            this.c = {...this.c || {}};
            this.c[prop] = true;
          }

          public s !: {[key: string]: any};
          updateStyles(prop: string, value: string|number|null) {
            this.s = {...this.s || {}};
            this.s[prop] = value;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        comp.updateStyles('width', '100px');
        comp.updateStyles('height', '200px');
        comp.updateClasses('abc');
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;
        const classes = node.classes !;

        const stylesSummary = styles.summary;
        const widthSummary = stylesSummary['width'];
        expect(widthSummary.prop).toEqual('width');
        expect(widthSummary.value).toEqual('100px');

        const heightSummary = stylesSummary['height'];
        expect(heightSummary.prop).toEqual('height');
        expect(heightSummary.value).toEqual('200px');

        const classesSummary = classes.summary;
        const abcSummary = classesSummary['abc'];
        expect(abcSummary.prop).toEqual('abc');
        expect(abcSummary.value as any).toEqual(true);
      });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should resolve styling collisions across templates, directives and components for prop and map-based entries',
          () => {
            @Directive({selector: '[dir-that-sets-styling]'})
            class DirThatSetsStyling {
              @HostBinding('style') public map: any = {color: 'red', width: '777px'};
            }

            @Component({
              template: `
        <div [style.width]="width"
             [style]="map"
             style="width:200px; font-size:99px"
             dir-that-sets-styling
             #dir
             [class.xyz]="xyz"></div>
      `
            })
            class Cmp {
              map: any = {width: '111px', opacity: '0.5'};
              width: string|null = '555px';

              @ViewChild('dir', {read: DirThatSetsStyling, static: true})
              dir !: DirThatSetsStyling;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirThatSetsStyling]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');
            const node = getDebugNode(element) !;

            const styles = node.styles !;
            expect(styles.values).toEqual({
              'width': '555px',
              'color': 'red',
              'font-size': '99px',
              'opacity': '0.5',
            });

            comp.width = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '111px',
              'color': 'red',
              'font-size': '99px',
              'opacity': '0.5',
            });

            comp.map = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '777px',
              'color': 'red',
              'font-size': '99px',
              'opacity': null,
            });

            comp.dir.map = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '200px',
              'color': null,
              'font-size': '99px',
              'opacity': null,
            });
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should only apply each styling property once per CD across templates, components, directives',
          () => {
            @Directive({selector: '[dir-that-sets-styling]'})
            class DirThatSetsStyling {
              @HostBinding('style') public map: any = {width: '999px', height: '999px'};
            }

            @Component({
              template: `
                <div #dir
                  style="width:0px; height:0px"
                  [style.width]="width"
                  [style.height]="height"
                  [style]="map"
                  dir-that-sets-styling></div>
              `
            })
            class Cmp {
              width: string|null = '111px';
              height: string|null = '111px';

              map: any = {width: '555px', height: '555px'};

              @ViewChild('dir', {read: DirThatSetsStyling, static: true})
              dir !: DirThatSetsStyling;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirThatSetsStyling]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;

            resetStylingCounters();
            fixture.detectChanges();
            const element = fixture.nativeElement.querySelector('div');

            // both are applied because this is the first pass
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '111px');
            assertStyle(element, 'height', '111px');

            comp.width = '222px';
            resetStylingCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '222px');
            assertStyle(element, 'height', '111px');

            comp.height = '222px';
            resetStylingCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '222px');
            assertStyle(element, 'height', '222px');

            comp.width = null;
            resetStylingCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '555px');
            assertStyle(element, 'height', '222px');

            comp.width = '123px';
            comp.height = '123px';
            resetStylingCounters();
            fixture.detectChanges();

            assertStyle(element, 'width', '123px');
            assertStyle(element, 'height', '123px');

            comp.map = {};
            resetStylingCounters();
            fixture.detectChanges();

            // both are applied because the map was altered
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '123px');
            assertStyle(element, 'height', '123px');

            comp.width = null;
            resetStylingCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '999px');
            assertStyle(element, 'height', '123px');

            comp.dir.map = null;
            resetStylingCounters();
            fixture.detectChanges();

            // both are applied because the map was altered
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '0px');
            assertStyle(element, 'height', '123px');

            comp.dir.map = {width: '1000px', height: '1000px', color: 'red'};
            resetStylingCounters();
            fixture.detectChanges();

            // all three are applied because the map was altered
            assertStyleCounters(3, 0);
            assertStyle(element, 'width', '1000px');
            assertStyle(element, 'height', '123px');
            assertStyle(element, 'color', 'red');

            comp.height = null;
            resetStylingCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '1000px');
            assertStyle(element, 'height', '1000px');
            assertStyle(element, 'color', 'red');

            comp.map = {color: 'blue', width: '2000px', opacity: '0.5'};
            resetStylingCounters();
            fixture.detectChanges();

            // all four are applied because the map was altered
            assertStyleCounters(4, 0);
            assertStyle(element, 'width', '2000px');
            assertStyle(element, 'height', '1000px');
            assertStyle(element, 'color', 'blue');
            assertStyle(element, 'opacity', '0.5');

            comp.map = {color: 'blue', width: '2000px'};
            resetStylingCounters();
            fixture.detectChanges();

            // all four are applied because the map was altered
            assertStyleCounters(3, 1);
            assertStyle(element, 'width', '2000px');
            assertStyle(element, 'height', '1000px');
            assertStyle(element, 'color', 'blue');
            assertStyle(element, 'opacity', '');
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should sanitize style values before writing them', () => {
        @Component({
          template: `
                <div [style.width]="widthExp"
                     [style.background-image]="bgImageExp"
                     [style]="styleMapExp"></div>
              `
        })
        class Cmp {
          widthExp = '';
          bgImageExp = '';
          styleMapExp: any = {};
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;

        const lastSanitizedProps: any[] = [];
        styles.overrideSanitizer((prop, value) => {
          lastSanitizedProps.push(prop);
          return value;
        });

        comp.bgImageExp = '123';
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'background-image': '123',
          'width': null,
        });

        expect(lastSanitizedProps).toEqual(['background-image']);
        lastSanitizedProps.length = 0;

        comp.styleMapExp = {'clip-path': '456'};
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'background-image': '123',
          'clip-path': '456',
          'width': null,
        });

        expect(lastSanitizedProps).toEqual(['background-image', 'clip-path']);
        lastSanitizedProps.length = 0;

        comp.widthExp = '789px';
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'background-image': '123',
          'clip-path': '456',
          'width': '789px',
        });

        expect(lastSanitizedProps).toEqual(['background-image', 'clip-path']);
        lastSanitizedProps.length = 0;
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should apply a unit to a style before writing it', () => {
        @Component({
          template: `
            <div [style.width.px]="widthExp"
                 [style.height.em]="heightExp"></div>
          `
        })
        class Cmp {
          widthExp: string|number|null = '';
          heightExp: string|number|null = '';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;

        comp.widthExp = '200';
        comp.heightExp = 10;
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'width': '200px',
          'height': '10em',
        });

        comp.widthExp = 0;
        comp.heightExp = null;
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'width': '0px',
          'height': null,
        });
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should pick up and use the sanitizer present in the lView', () => {
        @Component({
          template: `
            <div [style.width]="w"></div>
          `
        })
        class Cmp {
          w = '100px';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const lView = getLContext(element) !.lView;
        lView[SANITIZER] = new MockSanitizer(value => { return `${value}-safe`; });

        comp.w = '200px';
        fixture.detectChanges();

        const node = getDebugNode(element) !;
        const styles = node.styles !;
        expect(styles.values['width']).toEqual('200px-safe');

        // this is here so that it won't get picked up accidentally in another test
        lView[SANITIZER] = null;
        setCurrentStyleSanitizer(null);
      });

  it('should be able to bind a SafeValue to clip-path', () => {
    @Component({template: '<div [style.clip-path]="path"></div>'})
    class Cmp {
      path !: SafeStyle;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const sanitizer: DomSanitizer = TestBed.get(DomSanitizer);

    fixture.componentInstance.path = sanitizer.bypassSecurityTrustStyle('url("#test")');
    fixture.detectChanges();

    const html = fixture.nativeElement.innerHTML;

    // Note that check the raw HTML, because (at the time of writing) the Node-based renderer
    // that we use to run tests doesn't support `clip-path` in `CSSStyleDeclaration`.
    expect(html).toMatch(/style=["|']clip-path:\s*url\(.*#test.*\)/);
  });
});

function assertStyleCounters(countForSet: number, countForRemove: number) {
  expect(ngDevMode !.rendererSetStyle).toEqual(countForSet);
  expect(ngDevMode !.rendererRemoveStyle).toEqual(countForRemove);
}

function assertStyle(element: HTMLElement, prop: string, value: any) {
  expect((element.style as any)[prop]).toEqual(value);
}

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

class MockSanitizer {
  constructor(private _interceptorFn: ((value: any) => any)) {}
  sanitize(context: SecurityContext, value: any): string|null { return this._interceptorFn(value); }
}
