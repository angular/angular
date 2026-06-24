/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  animate,
  AnimationPlayer,
  AnimationTriggerMetadata,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ɵAnimationEngine as AnimationEngine,
  ɵAnimationRenderer as AnimationRenderer,
  ɵAnimationRendererFactory as AnimationRendererFactory,
  ɵBaseAnimationRenderer as BaseAnimationRenderer,
} from '@angular/animations/browser';
import {DOCUMENT} from '@angular/common';
import {
  afterNextRender,
  ANIMATION_MODULE_TYPE,
  Component,
  ErrorHandler,
  inject,
  Injectable,
  Injector,
  NgZone,
  provideZoneChangeDetection,
  RendererFactory2,
  RendererType2,
  runInInjectionContext,
  ViewChild,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '../../../index';
import {InjectableAnimationEngine} from '../../../animations/src/providers';
import {el, isNode} from '@angular/private/testing';

import {
  AsyncAnimationRendererFactory,
  DynamicDelegationRenderer,
  ɵASYNC_ANIMATION_LOADING_SCHEDULER_FN,
} from '../src/async_animation_renderer';
import {provideAnimationsAsync} from '../public_api';

type AnimationBrowserModule = typeof import('@angular/animations/browser');

(function () {
  if (isNode) {
    it('empty test so jasmine doesnt complain', () => {});
    return;
  }

  describe('AnimationRenderer', () => {
    let element: any;
    beforeEach(() => {
      element = el('<div></div>');

      TestBed.configureTestingModule({
        providers: [
          {
            provide: RendererFactory2,
            useFactory: (
              doc: Document,
              renderer: DomRendererFactory2,
              zone: NgZone,
              engine: MockAnimationEngine,
            ) => {
              const animationModule = {
                ɵcreateEngine: (_: 'animations' | 'noop', _2: Document): AnimationEngine => engine,
                ɵAnimationEngine: MockAnimationEngine as any,
                ɵAnimationRenderer: AnimationRenderer,
                ɵBaseAnimationRenderer: BaseAnimationRenderer,
                ɵAnimationRendererFactory: AnimationRendererFactory,
              } satisfies Partial<AnimationBrowserModule> as AnimationBrowserModule;

              return new AsyncAnimationRendererFactory(
                doc,
                renderer,
                zone,
                'animations',
                Promise.resolve(animationModule),
              );
            },
            deps: [DOCUMENT, DomRendererFactory2, NgZone, AnimationEngine],
          },
          {provide: ANIMATION_MODULE_TYPE, useValue: 'BrowserAnimations'},
          {provide: AnimationEngine, useClass: MockAnimationEngine},
        ],
      });
    });

    function makeRenderer(animationTriggers: any[] = []): Promise<DynamicDelegationRenderer> {
      const type = <RendererType2>{
        id: 'id',
        encapsulation: null!,
        styles: [],
        data: {'animation': animationTriggers},
      };
      const factory = TestBed.inject(RendererFactory2) as AsyncAnimationRendererFactory;
      const renderer = factory.createRenderer(element, type);
      return (factory as any)._rendererFactoryPromise.then(() => renderer);
    }

    it("should hook into the engine's insert operations when appending children", async () => {
      const renderer = await makeRenderer();
      const engine = (renderer as any).delegate.engine as MockAnimationEngine;
      const container = el('<div></div>');

      renderer.appendChild(container, element);
      expect(engine.captures['onInsert'].pop()).toEqual([element]);
    });

    it("should hook into the engine's insert operations when inserting a child before another", async () => {
      const renderer = await makeRenderer();
      const engine = (renderer as any).delegate.engine as MockAnimationEngine;
      const container = el('<div></div>');
      const element2 = el('<div></div>');
      container.appendChild(element2);

      renderer.insertBefore(container, element, element2);
      expect(engine.captures['onInsert'].pop()).toEqual([element]);
    });

    it("should hook into the engine's insert operations when removing children", async () => {
      const renderer = await makeRenderer();
      const engine = (renderer as any).delegate.engine as MockAnimationEngine;

      renderer.removeChild(null, element, false);
      expect(engine.captures['onRemove'].pop()).toEqual([element]);
    });

    it("should hook into the engine's setProperty call if the property begins with `@`", async () => {
      const renderer = await makeRenderer();
      const engine = (renderer as any).delegate.engine as MockAnimationEngine;

      renderer.setProperty(element, 'prop', 'value');
      expect(engine.captures['setProperty']).toBeFalsy();

      renderer.setProperty(element, '@prop', 'value');
      expect(engine.captures['setProperty'].pop()).toEqual([element, 'prop', 'value']);
    });

    // https://github.com/angular/angular/issues/32794
    it('should support nested animation triggers', async () => {
      const renderer = await makeRenderer([[trigger('myAnimation', [])]]);

      const {triggers} = (renderer as any).delegate.engine as MockAnimationEngine;

      expect(triggers.length).toEqual(1);
      expect(triggers[0].name).toEqual('myAnimation');
    });

    describe('listen', () => {
      it("should hook into the engine's listen call if the property begins with `@`", async () => {
        const renderer = await makeRenderer();
        const engine = (renderer as any).delegate.engine as MockAnimationEngine;

        const cb = (event: any): boolean => {
          return true;
        };

        renderer.listen(element, 'event', cb);
        expect(engine.captures['listen']).toBeFalsy();

        renderer.listen(element, '@event.phase', cb);
        expect(engine.captures['listen'].pop()).toEqual([element, 'event', 'phase']);
      });

      it('should resolve the body|document|window nodes given their values as strings as input', async () => {
        const renderer = await makeRenderer();
        const engine = (renderer['delegate'] as AnimationRenderer).engine as MockAnimationEngine;

        const cb = (event: any): boolean => {
          return true;
        };

        renderer.listen('body', '@event', cb);
        expect(engine.captures['listen'].pop()[0]).toBe(document.body);

        renderer.listen('document', '@event', cb);
        expect(engine.captures['listen'].pop()[0]).toBe(document);

        renderer.listen('window', '@event', cb);
        expect(engine.captures['listen'].pop()[0]).toBe(window);
      });

      it('should store animations events passed to the default renderer and register them against the animation renderer', async () => {
        const type = <RendererType2>{
          id: 'id',
          encapsulation: null!,
          styles: [],
          data: {'animation': []},
        };

        const factory = TestBed.inject(RendererFactory2) as AsyncAnimationRendererFactory;
        const renderer = factory.createRenderer(element, type) as DynamicDelegationRenderer;

        const cb = (event: any): boolean => true;
        renderer.listen('body', '@event', cb);
        renderer.listen('document', '@event', cb);
        renderer.listen('window', '@event', cb);

        // The animation renderer is not loaded yet
        expect((renderer['delegate'] as AnimationRenderer).engine).toBeUndefined();

        // This will change the delegate renderer from the default one to the AnimationRenderer
        await factory['_rendererFactoryPromise']!.then(() => renderer);

        const engine = (renderer['delegate'] as AnimationRenderer).engine as MockAnimationEngine;

        expect(engine.captures['listen'][0][0]).toBe(document.body);
        expect(engine.captures['listen'][1][0]).toBe(document);
        expect(engine.captures['listen'][2][0]).toBe(window);
      });
    });

    it('should store animations properties set on the default renderer and set them also on the animation renderer', async () => {
      const type = <RendererType2>{
        id: 'id',
        encapsulation: null!,
        styles: [],
        data: {'animation': []},
      };

      const factory = TestBed.inject(RendererFactory2) as AsyncAnimationRendererFactory;
      const renderer = factory.createRenderer(element, type) as DynamicDelegationRenderer;

      renderer.setProperty(element, '@openClose', 'closed');
      renderer.setProperty(element, '@openClose', 'open');

      // The animation renderer is not loaded yet
      expect((renderer['delegate'] as AnimationRenderer).engine).toBeUndefined();

      // This will change the delegate renderer from the default one to the AnimationRenderer
      await factory['_rendererFactoryPromise']!.then(() => renderer);

      const engine = (renderer['delegate'] as AnimationRenderer).engine as MockAnimationEngine;

      expect(engine.captures['setProperty'][0][2]).toBe('closed');
      expect(engine.captures['setProperty'][1][2]).toBe('open');
    });

    describe('registering animations', () => {
      it('should only create a trigger definition once even if the registered multiple times');
    });

    describe('flushing animations', () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
      });

      // these tests are only meant to be run within the DOM
      if (isNode) return;

      it('should flush and fire callbacks when the zone becomes stable', (async) => {
        @Component({
          selector: 'my-cmp',
          template: '<div [@myAnimation]="exp" (@myAnimation.start)="onStart($event)"></div>',
          animations: [
            trigger('myAnimation', [
              transition('* => state', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any;
          event: any;
          onStart(event: any) {
            this.event = event;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(AnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'state';
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(cmp.event.triggerName).toEqual('myAnimation');
          expect(cmp.event.phaseName).toEqual('start');
          cmp.event = null;

          engine.flush();
          expect(cmp.event).toBeFalsy();
          async();
        });
      });

      it('should properly insert/remove nodes through the animation renderer that do not contain animations', (async) => {
        @Component({
          selector: 'my-cmp',
          template: '<div #elm *ngIf="exp"></div>',
          animations: [
            trigger('someAnimation', [
              transition('* => *', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any;
          @ViewChild('elm') public element: any;
        }

        TestBed.configureTestingModule({
          declarations: [Cmp],
          providers: [provideZoneChangeDetection()],
        });

        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          cmp.exp = false;
          const element = cmp.element;
          expect(element.nativeElement.parentNode).toBeTruthy();

          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(element.nativeElement.parentNode).toBeFalsy();
            async();
          });
        });
      });

      it('should only queue up dom removals if the element itself contains a valid leave animation', () => {
        @Component({
          selector: 'my-cmp',
          template: `
               <div #elm1 *ngIf="exp1"></div>
               <div #elm2 @animation1 *ngIf="exp2"></div>
               <div #elm3 @animation2 *ngIf="exp3"></div>
            `,
          animations: [
            trigger('animation1', [transition('a => b', [])]),
            trigger('animation2', [transition(':leave', [])]),
          ],
          standalone: false,
        })
        class Cmp {
          exp1: any = true;
          exp2: any = true;
          exp3: any = true;

          @ViewChild('elm1') public elm1: any;

          @ViewChild('elm2') public elm2: any;

          @ViewChild('elm3') public elm3: any;
        }

        TestBed.configureTestingModule({
          declarations: [Cmp],
          providers: [provideZoneChangeDetection()],
        });

        const engine = TestBed.inject(AnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        fixture.detectChanges();
        const elm1 = cmp.elm1;
        const elm2 = cmp.elm2;
        const elm3 = cmp.elm3;
        assertHasParent(elm1);
        assertHasParent(elm2);
        assertHasParent(elm3);
        engine.flush();
        finishPlayers(engine.players);

        cmp.exp1 = false;
        fixture.detectChanges();
        assertHasParent(elm1, false);
        assertHasParent(elm2);
        assertHasParent(elm3);
        engine.flush();
        expect(engine.players.length).toEqual(0);

        cmp.exp2 = false;
        fixture.detectChanges();
        assertHasParent(elm1, false);
        assertHasParent(elm2, false);
        assertHasParent(elm3);
        engine.flush();
        expect(engine.players.length).toEqual(0);

        cmp.exp3 = false;
        fixture.detectChanges();
        assertHasParent(elm1, false);
        assertHasParent(elm2, false);
        assertHasParent(elm3);
        engine.flush();
        expect(engine.players.length).toEqual(1);
      });
    });

    describe('custom scheduling', () => {
      it('should be able to use a custom loading scheduler', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideAnimationsAsync(),
            {
              provide: ɵASYNC_ANIMATION_LOADING_SCHEDULER_FN,
              useFactory: () => {
                const injector = inject(Injector);
                return <T>(loadFn: () => T) => {
                  return new Promise<T>((res) => {
                    runInInjectionContext(injector, () => afterNextRender(() => res(loadFn())));
                  });
                };
              },
            },
          ],
        });
        const renderer = await makeRenderer();
        expect(renderer).toBeInstanceOf(DynamicDelegationRenderer);
        expect(renderer['delegate']).toBeInstanceOf(AnimationRenderer);
      });

      it('should handle scheduling error', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideAnimationsAsync(),
            {
              provide: ɵASYNC_ANIMATION_LOADING_SCHEDULER_FN,
              useValue: () => {
                throw new Error('SchedulingError');
              },
            },
          ],
        });

        try {
          await makeRenderer();
        } catch (err) {
          expect((err as Error).message).toBe('SchedulingError');
        }
      });
    });

    it('should be able to inject the renderer factory in an ErrorHandler', async () => {
      @Injectable({providedIn: 'root'})
      class CustomErrorHandler {
        renderer = inject(RendererFactory2).createRenderer(null, null);
      }

      @Component({template: ''})
      class App {}

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideAnimationsAsync(),
          {provide: ErrorHandler, useClass: CustomErrorHandler},
        ],
      });

      expect(() => TestBed.createComponent(App)).not.toThrow();
    });
  });
})();

@Injectable()
class MockAnimationEngine extends InjectableAnimationEngine {
  captures: {[method: string]: any[]} = {};
  triggers: AnimationTriggerMetadata[] = [];

  private _capture(name: string, args: any[]) {
    const data = (this.captures[name] = this.captures[name] || []);
    data.push(args);
  }

  override registerTrigger(
    componentId: string,
    namespaceId: string,
    hostElement: any,
    name: string,
    metadata: AnimationTriggerMetadata,
  ): void {
    this.triggers.push(metadata);
  }

  override onInsert(namespaceId: string, element: any): void {
    this._capture('onInsert', [element]);
  }

  override onRemove(namespaceId: string, element: any, domFn: () => any): void {
    this._capture('onRemove', [element]);
  }

  override process(namespaceId: string, element: any, property: string, value: any): boolean {
    this._capture('setProperty', [element, property, value]);
    return true;
  }

  override listen(
    namespaceId: string,
    element: any,
    eventName: string,
    eventPhase: string,
    callback: (event: any) => any,
  ): () => void {
    // we don't capture the callback here since the renderer wraps it in a zone
    this._capture('listen', [element, eventName, eventPhase]);
    return () => {};
  }

  override flush() {}

  override destroy(namespaceId: string) {}
}

function assertHasParent(element: any, yes: boolean = true) {
  const parent = element.nativeElement.parentNode;
  if (yes) {
    expect(parent).toBeTruthy();
  } else {
    expect(parent).toBeFalsy();
  }
}

function finishPlayers(players: AnimationPlayer[]) {
  players.forEach((player) => player.finish());
}
