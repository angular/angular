/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, AnimationPlayer, AnimationTriggerMetadata, state, style, transition, trigger} from '@angular/animations';
import {ɵAnimationEngine as AnimationEngine} from '@angular/animations/browser';
import {Component, destroyPlatform, Injectable, NgModule, NgZone, RendererFactory2, RendererType2, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserAnimationsModule, ɵAnimationRendererFactory as AnimationRendererFactory, ɵInjectableAnimationEngine as InjectableAnimationEngine} from '@angular/platform-browser/animations';
import {DomRendererFactory2} from '@angular/platform-browser/src/dom/dom_renderer';
import {onlyInIvy, withBody} from '@angular/private/testing';

import {el} from '../../testing/src/browser_util';

(function() {
if (isNode) return;
describe('AnimationRenderer', () => {
  let element: any;
  beforeEach(() => {
    element = el('<div></div>');

    TestBed.configureTestingModule({
      providers: [{provide: AnimationEngine, useClass: MockAnimationEngine}],
      imports: [BrowserAnimationsModule]
    });
  });

  function makeRenderer(animationTriggers: any[] = []) {
    const type = <RendererType2>{
      id: 'id',
      encapsulation: null!,
      styles: [],
      data: {'animation': animationTriggers}
    };
    return (TestBed.inject(RendererFactory2) as AnimationRendererFactory)
        .createRenderer(element, type);
  }

  it('should hook into the engine\'s insert operations when appending children', () => {
    const renderer = makeRenderer();
    const engine = TestBed.inject(AnimationEngine) as MockAnimationEngine;
    const container = el('<div></div>');

    renderer.appendChild(container, element);
    expect(engine.captures['onInsert'].pop()).toEqual([element]);
  });

  it('should hook into the engine\'s insert operations when inserting a child before another',
     () => {
       const renderer = makeRenderer();
       const engine = TestBed.inject(AnimationEngine) as MockAnimationEngine;
       const container = el('<div></div>');
       const element2 = el('<div></div>');
       container.appendChild(element2);

       renderer.insertBefore(container, element, element2);
       expect(engine.captures['onInsert'].pop()).toEqual([element]);
     });

  it('should hook into the engine\'s insert operations when removing children', () => {
    const renderer = makeRenderer();
    const engine = TestBed.inject(AnimationEngine) as MockAnimationEngine;
    const container = el('<div></div>');

    renderer.removeChild(container, element);
    expect(engine.captures['onRemove'].pop()).toEqual([element]);
  });

  it('should hook into the engine\'s setProperty call if the property begins with `@`', () => {
    const renderer = makeRenderer();
    const engine = TestBed.inject(AnimationEngine) as MockAnimationEngine;

    renderer.setProperty(element, 'prop', 'value');
    expect(engine.captures['setProperty']).toBeFalsy();

    renderer.setProperty(element, '@prop', 'value');
    expect(engine.captures['setProperty'].pop()).toEqual([element, 'prop', 'value']);
  });

  // https://github.com/angular/angular/issues/32794
  it('should support nested animation triggers', () => {
    makeRenderer([[trigger('myAnimation', [])]]);

    const {triggers} = TestBed.inject(AnimationEngine) as MockAnimationEngine;

    expect(triggers.length).toEqual(1);
    expect(triggers[0].name).toEqual('myAnimation');
  });

  describe('listen', () => {
    it('should hook into the engine\'s listen call if the property begins with `@`', () => {
      const renderer = makeRenderer();
      const engine = TestBed.inject(AnimationEngine) as MockAnimationEngine;

      const cb = (event: any): boolean => {
        return true;
      };

      renderer.listen(element, 'event', cb);
      expect(engine.captures['listen']).toBeFalsy();

      renderer.listen(element, '@event.phase', cb);
      expect(engine.captures['listen'].pop()).toEqual([element, 'event', 'phase']);
    });

    it('should resolve the body|document|window nodes given their values as strings as input',
       () => {
         const renderer = makeRenderer();
         const engine = TestBed.inject(AnimationEngine) as MockAnimationEngine;

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
  });

  describe('registering animations', () => {
    it('should only create a trigger definition once even if the registered multiple times');
  });

  describe('flushing animations', () => {
    // these tests are only mean't to be run within the DOM
    if (isNode) return;

    it('should flush and fire callbacks when the zone becomes stable', (async) => {
      @Component({
        selector: 'my-cmp',
        template: '<div [@myAnimation]="exp" (@myAnimation.start)="onStart($event)"></div>',
        animations: [trigger(
            'myAnimation',
            [transition(
                '* => state', [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
      })
      class Cmp {
        exp: any;
        event: any;
        onStart(event: any) {
          this.event = event;
        }
      }

      TestBed.configureTestingModule({
        providers: [{provide: AnimationEngine, useClass: InjectableAnimationEngine}],
        declarations: [Cmp]
      });

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

    it('should properly insert/remove nodes through the animation renderer that do not contain animations',
       (async) => {
         @Component({
           selector: 'my-cmp',
           template: '<div #elm *ngIf="exp"></div>',
           animations: [trigger(
               'someAnimation',
               [transition(
                   '* => *', [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
         })
         class Cmp {
           exp: any;
           @ViewChild('elm') public element: any;
         }

         TestBed.configureTestingModule({
           providers: [{provide: AnimationEngine, useClass: InjectableAnimationEngine}],
           declarations: [Cmp]
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

    it('should only queue up dom removals if the element itself contains a valid leave animation',
       () => {
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
           ]
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
           providers: [{provide: AnimationEngine, useClass: InjectableAnimationEngine}],
           declarations: [Cmp]
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
});

describe('AnimationRendererFactory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: RendererFactory2,
        useClass: ExtendedAnimationRendererFactory,
        deps: [DomRendererFactory2, AnimationEngine, NgZone]
      }],
      imports: [BrowserAnimationsModule]
    });
  });

  it('should provide hooks at the start and end of change detection', () => {
    @Component({
      selector: 'my-cmp',
      template: `
          <div [@myAnimation]="exp"></div>
        `,
      animations: [trigger('myAnimation', [])]
    })
    class Cmp {
      public exp: any;
    }

    TestBed.configureTestingModule({
      providers: [{provide: AnimationEngine, useClass: InjectableAnimationEngine}],
      declarations: [Cmp]
    });

    const renderer = TestBed.inject(RendererFactory2) as ExtendedAnimationRendererFactory;
    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;

    renderer.log = [];
    fixture.detectChanges();
    expect(renderer.log).toEqual(['begin', 'end']);

    renderer.log = [];
    fixture.detectChanges();
    expect(renderer.log).toEqual(['begin', 'end']);
  });
});

onlyInIvy('View Engine uses another mechanism of removing DOM nodes').describe('destroy', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it('should clear bootstrapped component contents',
     withBody('<div>before</div><app-root></app-root><div>after</div>', async () => {
       @Component({selector: 'app-root', template: 'app-root content'})
       class AppComponent {
       }

       @NgModule({
         imports: [BrowserAnimationsModule],
         declarations: [AppComponent],
         bootstrap: [AppComponent]
       })
       class AppModule {
       }

       const ngModuleRef = await platformBrowserDynamic().bootstrapModule(AppModule);

       const root = document.body.querySelector('app-root')!;
       expect(root.textContent).toEqual('app-root content');
       expect(document.body.childNodes.length).toEqual(3);

       ngModuleRef.destroy();

       expect(document.body.querySelector('app-root')).toBeFalsy();  // host element is removed
       expect(document.body.childNodes.length).toEqual(2);           // other elements are preserved
     }));
});
})();

@Injectable()
class MockAnimationEngine extends InjectableAnimationEngine {
  captures: {[method: string]: any[]} = {};
  triggers: AnimationTriggerMetadata[] = [];

  private _capture(name: string, args: any[]) {
    const data = this.captures[name] = this.captures[name] || [];
    data.push(args);
  }

  registerTrigger(
      componentId: string, namespaceId: string, hostElement: any, name: string,
      metadata: AnimationTriggerMetadata): void {
    this.triggers.push(metadata);
  }

  onInsert(namespaceId: string, element: any): void {
    this._capture('onInsert', [element]);
  }

  onRemove(namespaceId: string, element: any, domFn: () => any): void {
    this._capture('onRemove', [element]);
  }

  process(namespaceId: string, element: any, property: string, value: any): boolean {
    this._capture('setProperty', [element, property, value]);
    return true;
  }

  listen(
      namespaceId: string, element: any, eventName: string, eventPhase: string,
      callback: (event: any) => any): () => void {
    // we don't capture the callback here since the renderer wraps it in a zone
    this._capture('listen', [element, eventName, eventPhase]);
    return () => {};
  }

  flush() {}

  destroy(namespaceId: string) {}
}

@Injectable()
class ExtendedAnimationRendererFactory extends AnimationRendererFactory {
  public log: string[] = [];

  begin() {
    super.begin();
    this.log.push('begin');
  }

  end() {
    super.end();
    this.log.push('end');
  }
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
  players.forEach(player => player.finish());
}
