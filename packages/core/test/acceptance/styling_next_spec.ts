/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, HostBinding, Input, ViewChild} from '@angular/core';
import {SecurityContext} from '@angular/core/src/core';
import {DebugNode, LViewDebug, toDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {getCheckNoChangesMode} from '@angular/core/src/render3/state';
import {loadLContextFromNode} from '@angular/core/src/render3/util/discovery_utils';
import {ngDevModeResetPerfCounters as resetStylingCounters} from '@angular/core/src/util/ng_dev_mode';
import {TestBed} from '@angular/core/testing';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('new styling integration', () => {
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

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should only persist state values in a local map if template AND host styling is used together',
          () => {
            @Directive({selector: '[dir-that-sets-styling]'})
            class Dir {
              @HostBinding('style.width') w = '100px';
            }

            @Component({
              template: `
                <div #a dir-that-sets-styling></div>
                <div #b [style.width]="w"></div>
                <div #c dir-that-sets-styling [style.width]="w"></div>
              `
            })
            class Cmp {
              w = '200px';
              @ViewChild('a', {read: Dir, static: true}) a !: Dir;
              @ViewChild('c', {read: Dir, static: true}) c !: Dir;
            }

            TestBed.configureTestingModule({declarations: [Cmp, Dir]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            resetStylingCounters();

            comp.a.w = '999px';
            comp.w = '999px';
            comp.c.w = '999px';
            fixture.detectChanges();
            expect(ngDevMode !.stylingWritePersistedState).toEqual(totalUpdates(1));

            comp.a.w = '888px';
            fixture.detectChanges();
            expect(ngDevMode !.stylingWritePersistedState).toEqual(totalUpdates(2));

            comp.c.w = '777px';
            fixture.detectChanges();
            expect(ngDevMode !.stylingWritePersistedState).toEqual(totalUpdates(3));

            function totalUpdates(value: number) {
              // this is doubled because detectChanges is run twice to
              // see to check for checkNoChanges
              return value * 2;
            }
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

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate follow-up [style] maps even if a former map is null', () => {
        @Directive({selector: '[dir-with-styling]'})
        class DirWithStyleMap {
          @HostBinding('style') public styleMap: any = {color: 'red'};
        }

        @Directive({selector: '[dir-with-styling-part2]'})
        class DirWithStyleMapPart2 {
          @HostBinding('style') public styleMap: any = {width: '200px'};
        }

        @Component({
          template: `
        <div #div
             [style]="map"
             dir-with-styling
             dir-with-styling-part2></div>
      `
        })
        class Cmp {
          map: any = null;

          @ViewChild('div', {read: DirWithStyleMap, static: true})
          dir1 !: DirWithStyleMap;

          @ViewChild('div', {read: DirWithStyleMapPart2, static: true})
          dir2 !: DirWithStyleMapPart2;
        }

        TestBed.configureTestingModule(
            {declarations: [Cmp, DirWithStyleMap, DirWithStyleMapPart2]});
        const fixture = TestBed.createComponent(Cmp);
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;

        const values = styles.values;
        const props = Object.keys(values).sort();
        expect(props).toEqual(['color', 'width']);

        expect(values['width']).toEqual('200px');
        expect(values['color']).toEqual('red');
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate initial style/class values on a list of elements that changes', () => {
        @Component({
          template: `
            <div *ngFor="let item of items"
                 class="initial-class item-{{ item }}">
              {{ item }}
            </div>
          `
        })
        class Cmp {
          items = [1, 2, 3];
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        function getItemElements(): HTMLElement[] {
          return [].slice.call(fixture.nativeElement.querySelectorAll('div'));
        }

        function getItemClasses(): string[] {
          return getItemElements().map(e => e.className).sort().join(' ').split(' ');
        }

        expect(getItemElements().length).toEqual(3);
        expect(getItemClasses()).toEqual([
          'initial-class',
          'item-1',
          'initial-class',
          'item-2',
          'initial-class',
          'item-3',
        ]);

        comp.items = [2, 4, 6, 8];
        fixture.detectChanges();

        expect(getItemElements().length).toEqual(4);
        expect(getItemClasses()).toEqual([
          'initial-class',
          'item-2',
          'initial-class',
          'item-4',
          'initial-class',
          'item-6',
          'initial-class',
          'item-8',
        ]);
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should create and update multiple class bindings across multiple elements in a template',
          () => {
            @Component({
              template: `
            <header class="header">header</header>
            <div *ngFor="let item of items" class="item item-{{ item }}">
              {{ item }}
            </div>
            <footer class="footer">footer</footer>
          `
            })
            class Cmp {
              items = [1, 2, 3];
            }

            TestBed.configureTestingModule({declarations: [Cmp]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            function getItemElements(): HTMLElement[] {
              return [].slice.call(fixture.nativeElement.querySelectorAll('div'));
            }

            function getItemClasses(): string[] {
              return getItemElements().map(e => e.className).sort().join(' ').split(' ');
            }

            const header = fixture.nativeElement.querySelector('header');
            expect(header.classList.contains('header'));

            const footer = fixture.nativeElement.querySelector('footer');
            expect(footer.classList.contains('footer'));

            expect(getItemElements().length).toEqual(3);
            expect(getItemClasses()).toEqual([
              'item',
              'item-1',
              'item',
              'item-2',
              'item',
              'item-3',
            ]);
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should understand multiple directives which contain initial classes', () => {
        @Directive({selector: 'dir-one'})
        class DirOne {
          @HostBinding('class') public className = 'dir-one';
        }

        @Directive({selector: 'dir-two'})
        class DirTwo {
          @HostBinding('class') public className = 'dir-two';
        }

        @Component({
          template: `
            <dir-one></dir-one>
            <div class="initial"></div>
            <dir-two></dir-two>
          `
        })
        class Cmp {
        }

        TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        const dirOne = fixture.nativeElement.querySelector('dir-one');
        const div = fixture.nativeElement.querySelector('div');
        const dirTwo = fixture.nativeElement.querySelector('dir-two');

        expect(dirOne.classList.contains('dir-one')).toBeTruthy();
        expect(dirTwo.classList.contains('dir-two')).toBeTruthy();
        expect(div.classList.contains('initial')).toBeTruthy();
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate styling across the template directives when there are multiple elements/sources of styling',
          () => {
            @Directive({selector: '[one]'})
            class DirOne {
              @HostBinding('class') public className = 'dir-one';
            }

            @Directive({selector: '[two]'})
            class DirTwo {
              @HostBinding('class') public className = 'dir-two';
            }

            @Component({
              template: `
            <div class="a" [style.width.px]="w" one></div>
            <div class="b" [style.height.px]="h" one two></div>
            <div class="c" [style.color]="c" two></div>
          `
            })
            class Cmp {
              w = 100;
              h = 200;
              c = 'red';
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const divA = fixture.nativeElement.querySelector('.a');
            const divB = fixture.nativeElement.querySelector('.b');
            const divC = fixture.nativeElement.querySelector('.c');

            expect(divA.style.width).toEqual('100px');
            expect(divB.style.height).toEqual('200px');
            expect(divC.style.color).toEqual('red');
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate styling across the template and directives within embedded views',
          () => {
            @Directive({selector: '[some-dir-with-styling]'})
            class SomeDirWithStyling {
              @HostBinding('style')
              public styles = {
                width: '200px',
                height: '500px',
              };
            }

            @Component({
              template: `
                <div
                  class="item"
                  *ngFor="let item of items; let i = index"
                  [style.color]="c"
                  [style.height.px]="h * i"
                  some-dir-with-styling>
                  {{ item }}
                </div>
                <section [style.width.px]="w"></section>
                <p [style.height.px]="h"></p>
              `
            })
            class Cmp {
              items: any[] = [];
              c = 'red';
              w = 100;
              h = 100;
            }

            TestBed.configureTestingModule({declarations: [Cmp, SomeDirWithStyling]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            comp.items = [1, 2, 3, 4];
            fixture.detectChanges();

            const items = fixture.nativeElement.querySelectorAll('.item');
            expect(items.length).toEqual(4);
            const [a, b, c, d] = items;
            expect(a.style.height).toEqual('0px');
            expect(b.style.height).toEqual('100px');
            expect(c.style.height).toEqual('200px');
            expect(d.style.height).toEqual('300px');

            const section = fixture.nativeElement.querySelector('section');
            const p = fixture.nativeElement.querySelector('p');

            expect(section.style['width']).toEqual('100px');
            expect(p.style['height']).toEqual('100px');
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should flush bindings even if any styling hasn\'t changed in a previous directive',
          () => {
            @Directive({selector: '[one]'})
            class DirOne {
              @HostBinding('style.width') w = '100px';
              @HostBinding('style.opacity') o = '0.5';
            }

            @Directive({selector: '[two]'})
            class DirTwo {
              @HostBinding('style.height') h = '200px';
              @HostBinding('style.color') c = 'red';
            }

            @Component({template: '<div #target one two></div>'})
            class Cmp {
              @ViewChild('target', {read: DirOne, static: true}) one !: DirOne;
              @ViewChild('target', {read: DirTwo, static: true}) two !: DirTwo;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            const div = fixture.nativeElement.querySelector('div');
            expect(div.style.opacity).toEqual('0.5');
            expect(div.style.color).toEqual('red');
            expect(div.style.width).toEqual('100px');
            expect(div.style.height).toEqual('200px');

            comp.two.h = '300px';
            fixture.detectChanges();
            expect(div.style.opacity).toEqual('0.5');
            expect(div.style.color).toEqual('red');
            expect(div.style.width).toEqual('100px');
            expect(div.style.height).toEqual('300px');
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
