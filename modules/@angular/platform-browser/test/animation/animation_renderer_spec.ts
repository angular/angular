/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationTriggerMetadata, trigger} from '@angular/animations';
import {Injectable, RendererFactoryV2, RendererTypeV2} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserAnimationModule, ɵAnimationEngine, ɵAnimationRendererFactory} from '@angular/platform-browser/animations';

import {BrowserModule} from '../../src/browser';
import {el} from '../../testing/browser_util';

export function main() {
  describe('ɵAnimationRenderer', () => {
    let element: any;
    beforeEach(() => {
      element = el('<div></div>');

      TestBed.configureTestingModule({
        providers: [{provide: ɵAnimationEngine, useClass: MockAnimationEngine}],
        imports: [BrowserModule, BrowserAnimationModule]
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
        expect(engine.captures['listen'].pop()).toEqual([element, 'event', 'phase', cb]);
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
    this._capture('listen', [element, eventName, eventPhase, callback]);
    return () => {};
  }
}
