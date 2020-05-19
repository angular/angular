/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';

import {DirectStylePlayer} from '../../../src/render/css_keyframes/direct_style_player';

import {assertStyle, createElement} from './shared';

const CSS_KEYFRAME_RULE_TYPE = 7;

describe('DirectStylePlayer tests', () => {
  if (isNode) return;

  it('should apply the styling to the given element when the animation starts and remove when destroyed',
     () => {
       const element = createElement();
       const player = new DirectStylePlayer(element, {opacity: 0.5});

       assertStyle(element, 'opacity', '');

       player.play();
       assertStyle(element, 'opacity', '0.5');

       player.finish();
       assertStyle(element, 'opacity', '0.5');

       player.destroy();
       assertStyle(element, 'opacity', '');
     });

  it('should finish the animation after one tick', fakeAsync(() => {
       const element = createElement();
       const player = new DirectStylePlayer(element, {opacity: 0.5});

       let done = false;
       player.onDone(() => done = true);

       expect(done).toBeFalsy();

       player.play();
       expect(done).toBeFalsy();

       flushMicrotasks();
       expect(done).toBeTruthy();
     }));

  it('should restore existing element styles once the animation is destroyed', fakeAsync(() => {
       const element = createElement();
       element.style['width'] = '100px';
       element.style['height'] = '200px';

       const player = new DirectStylePlayer(element, {width: '500px', opacity: 0.5});

       assertStyle(element, 'width', '100px');
       assertStyle(element, 'height', '200px');
       assertStyle(element, 'opacity', '');

       player.init();
       assertStyle(element, 'width', '100px');
       assertStyle(element, 'height', '200px');
       assertStyle(element, 'opacity', '');

       player.play();
       assertStyle(element, 'width', '500px');
       assertStyle(element, 'height', '200px');
       assertStyle(element, 'opacity', '0.5');

       player.destroy();
       assertStyle(element, 'width', '100px');
       assertStyle(element, 'height', '200px');
       assertStyle(element, 'opacity', '');
     }));
});
