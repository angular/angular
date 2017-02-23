/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationTriggerMetadata, animate, state, style, transition, trigger} from '@angular/animations';
import {USE_VIEW_ENGINE} from '@angular/compiler/src/config';
import {Component, Injectable, RendererFactoryV2, RendererTypeV2, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserAnimationModule, ɵAnimationEngine, ɵAnimationRendererFactory} from '@angular/platform-browser/animations';

import {InjectableAnimationEngine} from '../../animations/src/browser_animation_module';
import {el} from '../../testing/browser_util';

export function main() {
  describe('ɵAnimationRenderer', () => {
    let element: any;
    beforeEach(() => {
      element = el('<div></div>');

      TestBed.configureTestingModule({
        providers: [{provide: ɵAnimationEngine, useClass: MockAnimationEngine}],
        imports: [BrowserAnimationModule]
      });
    });

    function makeRenderer(animationTriggers: any[] = []) {
      const type = <RendererTypeV2>{
        id: 'id',
        encapsulation: null,
        styles: [],
        data: {'animation': animationTriggers}
      };
      return (TestBed.get(RendererFactoryV2) as ɵAnimationRendererFactory)
          .createRenderer(element, type);
    }

    it('should register the provided triggers with the view engine when created', () => {
      const renderer = makeRenderer([trigger('trig1', []), trigger('trig2', [])]);

      const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;
      expect(engine.triggers.map(t => t.name)).toEqual(['trig1', 'trig2']);
    });

    it('should hook into the engine\'s insert operations when appending children', () => {
      const renderer = makeRenderer();
      const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;
      const container = el('<div></div>');

      renderer.appendChild(container, element);
      expect(engine.captures['onInsert'].pop()).toEqual([element]);
    });

    it('should hook into the engine\'s insert operations when inserting a child before another',
       () => {
         const renderer = makeRenderer();
         const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;
         const container = el('<div></div>');
         const element2 = el('<div></div>');
         container.appendChild(element2);

         renderer.insertBefore(container, element, element2);
         expect(engine.captures['onInsert'].pop()).toEqual([element]);
       });

    it('should hook into the engine\'s insert operations when removing children', () => {
      const renderer = makeRenderer();
      const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;
      const container = el('<div></div>');

      renderer.removeChild(container, element);
      expect(engine.captures['onRemove'].pop()).toEqual([element]);
    });

    it('should hook into the engine\'s setProperty call if the property begins with `@`', () => {
      const renderer = makeRenderer();
      const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;

      renderer.setProperty(element, 'prop', 'value');
      expect(engine.captures['setProperty']).toBeFalsy();

      renderer.setProperty(element, '@prop', 'value');
      expect(engine.captures['setProperty'].pop()).toEqual([element, 'prop', 'value']);
    });

    describe('listen', () => {
      it('should hook into the engine\'s listen call if the property begins with `@`', () => {
        const renderer = makeRenderer();
        const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;

        const cb = (event: any): boolean => { return true; };

        renderer.listen(element, 'event', cb);
        expect(engine.captures['listen']).toBeFalsy();

        renderer.listen(element, '@event.phase', cb);
        expect(engine.captures['listen'].pop()).toEqual([element, 'event', 'phase']);
      });

      it('should resolve the body|document|window nodes given their values as strings as input',
         () => {
           const renderer = makeRenderer();
           const engine = TestBed.get(ɵAnimationEngine) as MockAnimationEngine;

           const cb = (event: any): boolean => { return true; };

           renderer.listen('body', '@event', cb);
           expect(engine.captures['listen'].pop()[0]).toBe(document.body);

           renderer.listen('document', '@event', cb);
           expect(engine.captures['listen'].pop()[0]).toBe(document);

           renderer.listen('window', '@event', cb);
           expect(engine.captures['listen'].pop()[0]).toBe(window);
         });
    });

    describe('flushing animations', () => {
      // these tests are only mean't to be run within the DOM
      if (typeof Element == 'undefined') return;

      beforeEach(() => {
        TestBed.configureCompiler(
            {useJit: true, providers: [{provide: USE_VIEW_ENGINE, useValue: true}]});
      });

      it('should flush and fire callbacks when the zone becomes stable', (async) => {
        @Component({
          selector: 'my-cmp',
          template: '<div [@myAnimation]="exp" (@myAnimation.start)="onStart($event)"></div>',
          animations: [trigger(
              'myAnimation',
              [transition(
                  '* => state',
                  [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
        })
        class Cmp {
          exp: any;
          event: any;
          onStart(event: any) { this.event = event; }
        }

        TestBed.configureTestingModule({
          providers: [{provide: ɵAnimationEngine, useClass: InjectableAnimationEngine}],
          declarations: [Cmp]
        });

        const engine = TestBed.get(ɵAnimationEngine);
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
             providers: [{provide: ɵAnimationEngine, useClass: InjectableAnimationEngine}],
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
    });
  });
}

@Injectable()
class MockAnimationEngine extends ɵAnimationEngine {
  captures: {[method: string]: any[]} = {};
  triggers: AnimationTriggerMetadata[] = [];

  private _capture(name: string, args: any[]) {
    const data = this.captures[name] = this.captures[name] || [];
    data.push(args);
  }

  registerTrigger(trigger: AnimationTriggerMetadata) { this.triggers.push(trigger); }

  onInsert(element: any, domFn: () => any): void { this._capture('onInsert', [element]); }

  onRemove(element: any, domFn: () => any): void { this._capture('onRemove', [element]); }

  setProperty(element: any, property: string, value: any): void {
    this._capture('setProperty', [element, property, value]);
  }

  listen(element: any, eventName: string, eventPhase: string, callback: (event: any) => any):
      () => void {
    // we don't capture the callback here since the renderer wraps it in a zone
    this._capture('listen', [element, eventName, eventPhase]);
    return () => {};
  }

  flush() {}
}
