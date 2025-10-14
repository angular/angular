/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Component, inject, viewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {AnimationLayerDirective} from './animation-layer.directive';
import {AnimationCreatorService} from './animation-creator.service';
// Test component
const TEST_TIMESTEP = 500;
let AnimationHost = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-animation-host',
      imports: [AnimationLayerDirective],
      providers: [AnimationCreatorService],
      template: `
    <div adevAnimationLayer layerId="layer-1">
      <div class="circle"></div>
    </div>
    <div adevAnimationLayer layerId="layer-2">
      <div class="square"></div>
    </div>
    <div adevAnimationLayer layerId="layer-3">
      <div class="triangle"></div>
      <div class="triangle"></div>
    </div>
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AnimationHost = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AnimationHost = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    animationCreator = inject(AnimationCreatorService);
    layers = viewChildren(AnimationLayerDirective);
    animation;
    ngAfterViewInit() {
      this.animation = this.animationCreator.createAnimation(this.layers(), {
        timestep: TEST_TIMESTEP,
      });
    }
  };
  return (AnimationHost = _classThis);
})();
// Animation definition
const DEFINITION = [
  {
    selector: 'layer-1 >> .circle',
    timeframe: [0, 4],
    from: {
      'opacity': '0',
      'transform': 'translateX(0)',
    },
    to: {
      'opacity': '1',
      'transform': 'translateX(100%)',
    },
  },
  {
    selector: 'layer-2 >> .square',
    timeframe: [1, 5],
    from: {
      'font-size': '20px',
      'color': '#000',
    },
    to: {
      'font-size': '10px',
      'color': '#ffffff',
    },
  },
];
describe('Animation', () => {
  let component;
  let fixture;
  let animation;
  const layerObjects = new Map();
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationHost],
    });
    fixture = TestBed.createComponent(AnimationHost);
    component = fixture.componentInstance;
    fixture.detectChanges();
    animation = component.animation;
    // Store all layer objects in a map for easier access.
    for (const l of component.layers()) {
      const layerEl = l.elementRef.nativeElement;
      layerObjects.set(l.id(), layerEl);
      const layerObj = layerEl.firstChild;
      layerObjects.set('.' + layerObj.className, layerObj);
    }
  });
  it('should load the layers and initialize the animation', () => {
    expect(animation).toBeTruthy();
    expect(layerObjects.get('layer-1')).toBeInstanceOf(HTMLElement);
    expect(layerObjects.get('.circle')).toBeInstanceOf(HTMLElement);
    expect(layerObjects.get('layer-2')).toBeInstanceOf(HTMLElement);
    expect(layerObjects.get('.square')).toBeInstanceOf(HTMLElement);
    expect(layerObjects.get('layer-3')).toBeInstanceOf(HTMLElement);
  });
  it(`should throw an error if a layer doesn't exist`, () => {
    const defineFn = () =>
      animation.define([
        {
          selector: 'layer-4',
          at: 1,
          styles: {},
        },
      ]);
    expect(defineFn).toThrowError('Animation: Missing layer ID: layer-4');
  });
  it('should return the config timestep', () => {
    expect(animation.timestep).toEqual(TEST_TIMESTEP);
  });
  it(`should throw an error if a layer object doesn't exist`, () => {
    const defineFn = () =>
      animation.define([
        {
          selector: 'layer-1 >> .triangle',
          at: 1,
          styles: {},
        },
      ]);
    expect(defineFn).toThrowError('Animation: Missing layer object(s): layer-1 >> .triangle');
  });
  it('should throw an error if the animation duration is negative', () => {
    const defineFn = () =>
      animation.define([
        {
          selector: 'layer-1 >> .circle',
          timeframe: [5, 4],
          from: {
            'background': '#000',
          },
          to: {
            'background': '#fff',
          },
        },
      ]);
    expect(defineFn).toThrowError(
      `Animation: Incorrect time frame for selector 'layer-1 >> .circle'. Start time is greater than end time`,
    );
  });
  it('should throw an error if the animation duration is zero', () => {
    const defineFn = () =>
      animation.define([
        {
          selector: 'layer-1 >> .circle',
          timeframe: [5, 5],
          from: {
            'background': '#000',
          },
          to: {
            'background': '#fff',
          },
        },
      ]);
    expect(defineFn).toThrowError(
      `Animation: Duration for selector 'layer-1 >> .circle' is zero. Use 'at' time selector instead`,
    );
  });
  it('should throw an error if there is a mismatch between the number of "from" and "to" styles', () => {
    const defineFn = () =>
      animation.define([
        {
          selector: 'layer-1 >> .circle',
          timeframe: [0, 1],
          from: {
            'background': '#000',
            'opacity': '0.5',
          },
          to: {
            'background': '#fff',
          },
        },
      ]);
    expect(defineFn).toThrowError(
      `Animation: There is a mismatch between the number of "from" and "to" styles for selector 'layer-1 >> .circle'`,
    );
  });
  it('should throw an error if there is a mismatch between the "from" and "to" styles properties', () => {
    const defineFn = () =>
      animation.define([
        {
          selector: 'layer-1 >> .circle',
          timeframe: [0, 1],
          from: {
            'background': '#000',
            'opacity': '0.5',
          },
          to: {
            'background': '#fff',
            'transform': 'scale(2)',
          },
        },
      ]);
    expect(defineFn).toThrowError(
      `Animation: "from" style 'transform' is missing for selector 'layer-1 >> .circle'`,
    );
  });
  it('should return animation duration', () => {
    animation.define([
      {
        selector: 'layer-2 >> .square',
        timeframe: [3, 7],
        from: {},
        to: {},
      },
      {
        selector: 'layer-1 >> .circle',
        timeframe: [0, 5],
        from: {},
        to: {},
      },
    ]);
    expect(animation.duration).toEqual(7000);
  });
  it('should return animation duration (single rule)', () => {
    animation.define([
      {
        selector: 'layer-2 >> .square',
        at: 3,
        styles: {},
      },
    ]);
    expect(animation.duration).toEqual(3000);
  });
  it('should add an initialize a plugin', () => {
    const mockPlugin = {
      init: () => {},
      destroy: () => {},
    };
    const initSpy = spyOn(mockPlugin, 'init');
    animation.addPlugin(mockPlugin);
    expect(initSpy).toHaveBeenCalled();
  });
  it('should dispose the animation', () => {
    const mockPlugin = {
      init: () => {},
      destroy: () => {},
    };
    const destroySpy = spyOn(mockPlugin, 'destroy');
    animation.addPlugin(mockPlugin);
    animation.dispose();
    expect(destroySpy).toHaveBeenCalled();
    expect(animation.duration).toEqual(0);
    expect(animation.progress()).toEqual(0);
    expect(animation.isPlaying()).toEqual(false);
  });
  it('should move the animation forward in time', () => {
    animation.define(DEFINITION);
    animation.forward(2000);
    const circle = layerObjects.get('.circle');
    expect(circle?.style.opacity).toEqual('0.5');
    expect(circle?.style.transform).toEqual('translateX(50%)');
    const square = layerObjects.get('.square');
    expect(square?.style.fontSize).toEqual('17.5px');
    expect(square?.style.color).toEqual('rgb(64, 64, 64)');
  });
  it('should move the animation back in time', () => {
    animation.define(DEFINITION);
    animation.forward(5000);
    animation.back(2000);
    const circle = layerObjects.get('.circle');
    expect(circle?.style.opacity).toEqual('0.75');
    expect(circle?.style.transform).toEqual('translateX(75%)');
    const square = layerObjects.get('.square');
    expect(square?.style.fontSize).toEqual('15px');
    expect(square?.style.color).toEqual('rgb(128, 128, 128)');
  });
  it('should seek', () => {
    animation.define(DEFINITION);
    animation.seek(4 / 5); // 4th second; 0.8
    const circle = layerObjects.get('.circle');
    expect(circle?.style.opacity).toEqual('1');
    expect(circle?.style.transform).toEqual('translateX(100%)');
    const square = layerObjects.get('.square');
    expect(square?.style.fontSize).toEqual('12.5px');
    expect(square?.style.color).toEqual('rgb(191, 191, 191)');
  });
  it('should reset the animation', () => {
    animation.define(DEFINITION);
    animation.seek(1);
    animation.reset();
    expect(animation.progress()).toEqual(0);
    const circle = layerObjects.get('.circle');
    // i.e. CSS styles are in use
    expect(circle?.style.opacity).toEqual('');
    expect(circle?.style.transform).toEqual('');
    const square = layerObjects.get('.square');
    expect(square?.style.fontSize).toEqual('');
    expect(square?.style.color).toEqual('');
  });
  it('should animate layers', () => {
    animation.define([
      {
        selector: 'layer-1',
        timeframe: [0, 1],
        from: {
          'padding': '0',
        },
        to: {
          'padding': '32px',
        },
      },
    ]);
    animation.seek(0.5);
    const layer1 = layerObjects.get('layer-1');
    expect(layer1?.style.padding).toEqual('16px');
  });
  it('should animate all objects that are matching a selector', () => {
    animation.define([
      {
        selector: 'layer-3 >> .triangle',
        timeframe: [0, 1],
        from: {
          'transform': 'rotate(0)',
        },
        to: {
          'transform': 'rotate(360deg)',
        },
      },
    ]);
    animation.seek(0.5);
    const layer3 = layerObjects.get('layer-3');
    const triangles = layer3.querySelectorAll('.triangle');
    for (let i = 0; i < triangles.length; i++) {
      expect(triangles[i].style.transform).toEqual('rotate(180deg)');
    }
  });
  it('should animate a single static rule', () => {
    animation.define([
      {
        selector: 'layer-2 >> .square',
        at: 1.5,
        styles: {
          'top': '100px',
        },
      },
    ]);
    animation.seek(1);
    const square = layerObjects.get('.square');
    expect(square?.style.top).toEqual('100px');
  });
  it('should track animation progress', () => {
    animation.define(DEFINITION);
    animation.seek(0.5);
    expect(animation.progress()).toEqual(0.5);
  });
});
//# sourceMappingURL=animation.spec.js.map
