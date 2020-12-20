/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init';
import {DebugElement} from '@angular/core';
import {AnimateCmp} from '../src/animate';
import {createComponent} from './util';

// TODO(matsko): make this green again...
xdescribe('template codegen output', () => {
  function findTargetElement(elm: DebugElement): DebugElement {
    // the open-close-container is a child of the main container
    // if the template changes then please update the location below
    return elm.children[4];
  }

  it('should apply the animate states to the element', (done) => {
    const compFixture = createComponent(AnimateCmp);
    const debugElement = compFixture.debugElement;

    const targetDebugElement = findTargetElement(<DebugElement>debugElement);

    compFixture.componentInstance.setAsOpen();
    compFixture.detectChanges();

    setTimeout(() => {
      expect(targetDebugElement.styles['height']).toEqual(null);
      expect(targetDebugElement.styles['borderColor']).toEqual('green');
      expect(targetDebugElement.styles['color']).toEqual('green');

      compFixture.componentInstance.setAsClosed();
      compFixture.detectChanges();

      setTimeout(() => {
        expect(targetDebugElement.styles['height']).toEqual('0px');
        expect(targetDebugElement.styles['borderColor']).toEqual('maroon');
        expect(targetDebugElement.styles['color']).toEqual('maroon');
        done();
      }, 0);
    }, 0);
  });

  it('should apply the default animate state to the element', (done) => {
    const compFixture = createComponent(AnimateCmp);
    const debugElement = compFixture.debugElement;

    const targetDebugElement = findTargetElement(<DebugElement>debugElement);

    compFixture.componentInstance.setAsSomethingElse();
    compFixture.detectChanges();

    setTimeout(() => {
      expect(targetDebugElement.styles['height']).toEqual(null);
      expect(targetDebugElement.styles['borderColor']).toEqual('black');
      expect(targetDebugElement.styles['color']).toEqual('black');

      compFixture.componentInstance.setAsClosed();
      compFixture.detectChanges();

      setTimeout(() => {
        expect(targetDebugElement.styles['height']).not.toEqual(null);
        expect(targetDebugElement.styles['borderColor']).not.toEqual('grey');
        expect(targetDebugElement.styles['color']).not.toEqual('grey');
        done();
      }, 0);
    }, 0);
  });
});
