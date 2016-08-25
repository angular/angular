/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('Compiler', () => {
    it('should generate the correct output when constructors have the same name', () => {
      function ComponentFactory(selector: string, template: string) {
        @Component({selector, template})
        class MyComponent {
        }
        return MyComponent;
      }
      const HeroComponent = ComponentFactory('my-hero', 'my hero');
      const VillianComponent = ComponentFactory('a-villian', 'a villian');
      const MainComponent = ComponentFactory(
          'my-app', 'I was saved by <my-hero></my-hero> from <a-villian></a-villian>.');

      TestBed.configureTestingModule(
          {declarations: [HeroComponent, VillianComponent, MainComponent]});
      const fixture = TestBed.createComponent(MainComponent);
      expect(fixture.debugElement.nativeElement)
          .toHaveText('I was saved by my hero from a villian.');
    });
  });
}