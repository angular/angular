import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {Component, View, Directive} from 'angular2/angular2';

export function main() {
  describe('es5 decorators', () => {
    it('should declare directive class', () => {
      var MyDirective = Directive({}).Class({constructor: function() { this.works = true; }});
      expect(new MyDirective().works).toEqual(true);
    });

    it('should declare Component class', () => {
      var MyComponent =
          Component({}).View({}).View({}).Class({constructor: function() { this.works = true; }});
      expect(new MyComponent().works).toEqual(true);
    });
  });
}
