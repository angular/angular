/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, AnimationMetadata, style} from '@angular/animations';

import {AnimationStyleNormalizer, NoopAnimationStyleNormalizer} from '../../src/dsl/style_normalization/animation_style_normalizer';
import {AnimationDriver} from '../../src/render/animation_driver';
import {getBodyNode} from '../../src/render/shared';
import {TimelineAnimationEngine} from '../../src/render/timeline_animation_engine';
import {MockAnimationDriver, MockAnimationPlayer} from '../../testing/src/mock_animation_driver';

(function() {
const defaultDriver = new MockAnimationDriver();

function makeEngine(body: any, driver?: AnimationDriver, normalizer?: AnimationStyleNormalizer) {
  return new TimelineAnimationEngine(
      body, driver || defaultDriver, normalizer || new NoopAnimationStyleNormalizer());
}

// these tests are only mean't to be run within the DOM
if (isNode) return;

describe('TimelineAnimationEngine', () => {
  let element: any;

  beforeEach(() => {
    MockAnimationDriver.log = [];
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => document.body.removeChild(element));

  it('should animate a timeline', () => {
    const engine = makeEngine(getBodyNode());
    const steps = [style({height: 100}), animate(1000, style({height: 0}))];
    expect(MockAnimationDriver.log.length).toEqual(0);
    invokeAnimation(engine, element, steps);
    expect(MockAnimationDriver.log.length).toEqual(1);
  });

  it('should not destroy timeline-based animations after they have finished', () => {
    const engine = makeEngine(getBodyNode());

    const log: string[] = [];
    function capture(value: string) {
      return () => {
        log.push(value);
      };
    }

    const steps = [style({height: 0}), animate(1000, style({height: 500}))];

    const player = invokeAnimation(engine, element, steps);
    player.onDone(capture('done'));
    player.onDestroy(capture('destroy'));
    expect(log).toEqual([]);

    player.finish();
    expect(log).toEqual(['done']);

    player.destroy();
    expect(log).toEqual(['done', 'destroy']);
  });

  it('should normalize the style values that are animateTransitioned within an a timeline animation',
     () => {
       const engine = makeEngine(getBodyNode(), defaultDriver, new SuffixNormalizer('-normalized'));

       const steps = [
         style({width: '333px'}),
         animate(1000, style({width: '999px'})),
       ];

       const player = invokeAnimation(engine, element, steps) as MockAnimationPlayer;
       expect(player.keyframes).toEqual([
         {'width-normalized': '333px-normalized', offset: 0},
         {'width-normalized': '999px-normalized', offset: 1}
       ]);
     });

  it('should normalize `*` values', () => {
    const driver = new SuperMockDriver();
    const engine = makeEngine(getBodyNode(), driver);

    const steps = [
      style({width: '*'}),
      animate(1000, style({width: '999px'})),
    ];

    const player = invokeAnimation(engine, element, steps) as MockAnimationPlayer;
    expect(player.keyframes).toEqual([{width: '*star*', offset: 0}, {width: '999px', offset: 1}]);
  });
});
})();

function invokeAnimation(
    engine: TimelineAnimationEngine, element: any, steps: AnimationMetadata|AnimationMetadata[],
    id: string = 'id') {
  engine.register(id, steps);
  return engine.create(id, element);
}

class SuffixNormalizer extends AnimationStyleNormalizer {
  constructor(private _suffix: string) {
    super();
  }

  override normalizePropertyName(propertyName: string, errors: string[]): string {
    return propertyName + this._suffix;
  }

  override normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: string[]): string {
    return value + this._suffix;
  }
}

class SuperMockDriver extends MockAnimationDriver {
  override computeStyle(element: any, prop: string, defaultValue?: string): string {
    return '*star*';
  }
}
