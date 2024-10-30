/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFactoryResolver} from '../../src/render3/component_ref';
import {Renderer} from '../../src/render3/interfaces/renderer';
import {RElement} from '../../src/render3/interfaces/renderer_dom';
import {TestBed} from '../../testing';

import {
  ComponentRef,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  NgModuleRef,
  OnChanges,
  Output,
  RendererType2,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '../../src/core';
import {ComponentFactory} from '../../src/linker/component_factory';
import {RendererFactory2} from '../../src/render/api';
import {Sanitizer} from '../../src/sanitization/sanitizer';

import {MockRendererFactory} from './instructions/mock_renderer_factory';

const THROWING_RENDERER_FACTOR2_PROVIDER = {
  provide: RendererFactory2,
  useValue: {
    createRenderer: () => {
      throw new Error('Incorrect injector for Renderer2');
    },
  },
};

describe('ComponentFactory', () => {
  const cfr = new ComponentFactoryResolver();

  describe('constructor()', () => {
    it('should correctly populate default properties', () => {
      @Component({
        selector: 'test[foo], bar',
        template: '',
      })
      class TestComponent {}

      const cf = cfr.resolveComponentFactory(TestComponent);

      expect(cf.selector).toBe('test[foo],bar');
      expect(cf.componentType).toBe(TestComponent);
      expect(cf.ngContentSelectors).toEqual([]);
      expect(cf.inputs).toEqual([]);
      expect(cf.outputs).toEqual([]);
    });

    it('should correctly populate defined properties', () => {
      function transformFn() {}

      @Component({
        selector: 'test[foo], bar',
        template: `
          <ng-content></ng-content>
          <ng-content select="a"></ng-content>
          <ng-content select="b"></ng-content>
        `,
      })
      class TestComponent {
        @Input() in1: unknown;

        @Input('input-attr-2') in2: unknown;

        @Input({alias: 'input-attr-3', transform: transformFn}) in3: unknown;

        @Output() out1: unknown;

        @Output('output-attr-2') out2: unknown;
      }

      const cf = cfr.resolveComponentFactory(TestComponent);

      expect(cf.componentType).toBe(TestComponent);
      expect(cf.ngContentSelectors).toEqual(['*', 'a', 'b']);
      expect(cf.selector).toBe('test[foo],bar');

      expect(cf.inputs).toEqual([
        {propName: 'in1', templateName: 'in1', isSignal: false},
        {propName: 'in2', templateName: 'input-attr-2', isSignal: false},
        {propName: 'in3', templateName: 'input-attr-3', transform: transformFn, isSignal: false},
      ]);
      expect(cf.outputs).toEqual([
        {propName: 'out1', templateName: 'out1'},
        {propName: 'out2', templateName: 'output-attr-2'},
      ]);
    });
  });

  describe('create()', () => {
    let rendererFactorySpy = new MockRendererFactory();
    let cf: ComponentFactory<any>;

    beforeEach(() => {
      @Component({
        selector: 'test',
        template: '...',
        host: {
          'class': 'HOST_COMPONENT',
        },
        encapsulation: ViewEncapsulation.None,
        standalone: false,
      })
      class TestComponent {}

      cf = cfr.resolveComponentFactory(TestComponent);
    });

    describe('(when `ngModuleRef` is not provided)', () => {
      it('should retrieve `RendererFactory2` from the specified injector', () => {
        const injector = Injector.create({
          providers: [{provide: RendererFactory2, useValue: rendererFactorySpy}],
        });

        cf.create(injector);

        expect(rendererFactorySpy.wasCalled).toBeTrue();
      });

      it('should retrieve `Sanitizer` from the specified injector', () => {
        const sanitizerFactorySpy = jasmine.createSpy('sanitizerFactory').and.returnValue({});
        const injector = Injector.create({
          providers: [
            {provide: RendererFactory2, useValue: rendererFactorySpy},
            {provide: Sanitizer, useFactory: sanitizerFactorySpy, deps: []},
          ],
        });

        cf.create(injector);

        expect(sanitizerFactorySpy).toHaveBeenCalled();
      });
    });

    describe('(when `ngModuleRef` is provided)', () => {
      it('should retrieve `RendererFactory2` from the specified injector first', () => {
        const injector = Injector.create({
          providers: [{provide: RendererFactory2, useValue: rendererFactorySpy}],
        });
        const mInjector = Injector.create({providers: [THROWING_RENDERER_FACTOR2_PROVIDER]});

        cf.create(injector, undefined, undefined, {injector: mInjector} as NgModuleRef<any>);

        expect(rendererFactorySpy.wasCalled).toBeTrue();
      });

      it('should retrieve `RendererFactory2` from the `ngModuleRef` if not provided by the injector', () => {
        const injector = Injector.create({providers: []});
        const mInjector = Injector.create({
          providers: [{provide: RendererFactory2, useValue: rendererFactorySpy}],
        });

        cf.create(injector, undefined, undefined, {injector: mInjector} as NgModuleRef<any>);

        expect(rendererFactorySpy.wasCalled).toBeTrue();
      });

      it('should retrieve `Sanitizer` from the specified injector first', () => {
        const iSanitizerFactorySpy = jasmine
          .createSpy('Injector#sanitizerFactory')
          .and.returnValue({});
        const injector = Injector.create({
          providers: [{provide: Sanitizer, useFactory: iSanitizerFactorySpy, deps: []}],
        });

        const mSanitizerFactorySpy = jasmine
          .createSpy('NgModuleRef#sanitizerFactory')
          .and.returnValue({});
        const mInjector = Injector.create({
          providers: [
            {provide: RendererFactory2, useValue: rendererFactorySpy},
            {provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []},
          ],
        });

        cf.create(injector, undefined, undefined, {injector: mInjector} as NgModuleRef<any>);

        expect(iSanitizerFactorySpy).toHaveBeenCalled();
        expect(mSanitizerFactorySpy).not.toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the `ngModuleRef` if not provided by the injector', () => {
        const injector = Injector.create({providers: []});

        const mSanitizerFactorySpy = jasmine
          .createSpy('NgModuleRef#sanitizerFactory')
          .and.returnValue({});
        const mInjector = Injector.create({
          providers: [
            {provide: RendererFactory2, useValue: rendererFactorySpy},
            {provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []},
          ],
        });

        cf.create(injector, undefined, undefined, {injector: mInjector} as NgModuleRef<any>);

        expect(mSanitizerFactorySpy).toHaveBeenCalled();
      });
    });

    describe('(when the factory is bound to a `ngModuleRef`)', () => {
      it('should retrieve `RendererFactory2` from the specified injector first', () => {
        const injector = Injector.create({
          providers: [{provide: RendererFactory2, useValue: rendererFactorySpy}],
        });
        (cf as any).ngModule = {
          injector: Injector.create({providers: [THROWING_RENDERER_FACTOR2_PROVIDER]}),
        };

        cf.create(injector);

        expect(rendererFactorySpy.wasCalled).toBeTrue();
      });

      it('should retrieve `RendererFactory2` from the `ngModuleRef` if not provided by the injector', () => {
        const injector = Injector.create({providers: []});
        (cf as any).ngModule = {
          injector: Injector.create({
            providers: [{provide: RendererFactory2, useValue: rendererFactorySpy}],
          }),
        };

        cf.create(injector);

        expect(rendererFactorySpy.wasCalled).toBeTrue();
      });

      it('should retrieve `Sanitizer` from the specified injector first', () => {
        const iSanitizerFactorySpy = jasmine
          .createSpy('Injector#sanitizerFactory')
          .and.returnValue({});
        const injector = Injector.create({
          providers: [
            {provide: RendererFactory2, useValue: rendererFactorySpy},
            {provide: Sanitizer, useFactory: iSanitizerFactorySpy, deps: []},
          ],
        });

        const mSanitizerFactorySpy = jasmine
          .createSpy('NgModuleRef#sanitizerFactory')
          .and.returnValue({});
        (cf as any).ngModule = {
          injector: Injector.create({
            providers: [{provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []}],
          }),
        };

        cf.create(injector);

        expect(iSanitizerFactorySpy).toHaveBeenCalled();
        expect(mSanitizerFactorySpy).not.toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the `ngModuleRef` if not provided by the injector', () => {
        const injector = Injector.create({providers: []});

        const mSanitizerFactorySpy = jasmine
          .createSpy('NgModuleRef#sanitizerFactory')
          .and.returnValue({});
        (cf as any).ngModule = {
          injector: Injector.create({
            providers: [
              {provide: RendererFactory2, useValue: rendererFactorySpy},
              {provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []},
            ],
          }),
        };

        cf.create(injector);

        expect(mSanitizerFactorySpy).toHaveBeenCalled();
      });
    });

    it('should ensure that rendererFactory is called after initial styling is set', () => {
      class TestMockRendererFactory extends MockRendererFactory {
        override createRenderer(
          hostElement: RElement | null,
          rendererType: RendererType2 | null,
        ): Renderer {
          if (hostElement) {
            hostElement.classList.add('HOST_RENDERER');
          }
          return super.createRenderer(hostElement, rendererType);
        }
      }

      const injector = Injector.create({
        providers: [
          {provide: RendererFactory2, useFactory: () => new TestMockRendererFactory(), deps: []},
        ],
      });

      const hostNode = document.createElement('div');
      const componentRef = cf.create(injector, undefined, hostNode);
      expect(hostNode.className).toEqual('HOST_COMPONENT HOST_RENDERER');
    });
  });

  describe('setInput', () => {
    it('should allow setting inputs on the ComponentRef', () => {
      const inputChangesLog: string[] = [];

      @Component({template: `{{input}}`, standalone: false})
      class DynamicCmp implements OnChanges {
        ngOnChanges(changes: SimpleChanges): void {
          const inChange = changes['input'];
          inputChangesLog.push(
            `${inChange.previousValue}:${inChange.currentValue}:${inChange.firstChange}`,
          );
        }

        @Input() input: string | undefined;
      }

      const fixture = TestBed.createComponent(DynamicCmp);

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('');
      expect(inputChangesLog).toEqual([]);

      fixture.componentRef.setInput('input', 'first');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('first');
      expect(inputChangesLog).toEqual(['undefined:first:true']);

      fixture.componentRef.setInput('input', 'second');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('second');
      expect(inputChangesLog).toEqual(['undefined:first:true', 'first:second:false']);
    });

    it('should allow setting mapped inputs on the ComponentRef', () => {
      @Component({template: `{{input}}`, standalone: false})
      class DynamicCmp {
        @Input('publicName') input: string | undefined;
      }

      const fixture = TestBed.createComponent(DynamicCmp);

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('');

      fixture.componentRef.setInput('publicName', 'in value');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('in value');

      fixture.componentRef.setInput('input', 'should not change');
      fixture.detectChanges();
      // The value doesn't change, since `in` is an internal name of the input.
      expect(fixture.nativeElement.textContent).toBe('in value');
    });

    it('should log or throw error on unknown inputs', () => {
      @Component({template: ``, standalone: false})
      class NoInputsCmp {}

      const fixture = TestBed.createComponent(NoInputsCmp);
      fixture.detectChanges();

      spyOn(console, 'error');
      fixture.componentRef.setInput('doesNotExist', '');

      const msgL1 = `NG0303: Can't set value of the 'doesNotExist' input on the 'NoInputsCmp' component. `;
      const msgL2 = `Make sure that the 'doesNotExist' property is annotated with @Input() or a mapped @Input('doesNotExist') exists.`;
      expect(console.error).toHaveBeenCalledWith(msgL1 + msgL2);
    });

    it('should mark components for check when setting an input on a ComponentRef', () => {
      @Component({
        template: `{{input}}`,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class DynamicCmp {
        @Input() input: string | undefined;
      }

      const fixture = TestBed.createComponent(DynamicCmp);

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('');

      fixture.componentRef.setInput('input', 'pushed');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('pushed');
    });

    it('should not set input if value is the same as the previous', () => {
      let log: string[] = [];
      @Component({
        template: `{{input}}`,
        standalone: true,
      })
      class DynamicCmp {
        @Input()
        set input(v: string) {
          log.push(v);
        }
      }

      const fixture = TestBed.createComponent(DynamicCmp);
      fixture.componentRef.setInput('input', '1');
      fixture.detectChanges();
      fixture.componentRef.setInput('input', '1');
      fixture.detectChanges();
      fixture.componentRef.setInput('input', '2');
      fixture.detectChanges();
      expect(log).toEqual(['1', '2']);
    });

    it('marks parents dirty so component is not "shielded" by a non-dirty OnPush parent', () => {
      @Component({
        template: `{{input}}`,
        selector: 'dynamic',
      })
      class DynamicCmp {
        @Input() input?: string;
      }

      @Component({
        template: '<ng-template #template></ng-template>',
        imports: [DynamicCmp],
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class Wrapper {
        @ViewChild('template', {read: ViewContainerRef}) template?: ViewContainerRef;
        componentRef?: ComponentRef<DynamicCmp>;

        create() {
          this.componentRef = this.template!.createComponent(DynamicCmp);
        }
        setInput(value: string) {
          this.componentRef!.setInput('input', value);
        }
      }

      const fixture = TestBed.createComponent(Wrapper);
      fixture.detectChanges();
      fixture.componentInstance.create();

      fixture.componentInstance.setInput('1');
      fixture.detectChanges();
      expect(fixture.nativeElement.innerText).toBe('1');

      fixture.componentInstance.setInput('2');
      fixture.detectChanges();
      expect(fixture.nativeElement.innerText).toBe('2');
    });
  });
});
