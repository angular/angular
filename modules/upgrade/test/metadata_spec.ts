import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
} from 'angular2/test_lib';

import {Component, View} from 'angular2/angular2';
import {getComponentSelector} from 'upgrade/src/metadata';

export function main() {
  describe('upgrade metadata', () => {
    it('should extract component selector',
       () => { expect(getComponentSelector(ElementNameComponent)).toEqual('elementNameDashed'); });


    describe('errors', () => {
      it('should throw on missing selector', () => {
        expect(() => getComponentSelector(AttributeNameComponent))
            .toThrowErrorWith(
                "Only selectors matching element names are supported, got: [attr-name]");
      });

      it('should throw on non element names', () => {
        expect(() => getComponentSelector(NoAnnotationComponent))
            .toThrowErrorWith("Missing @Component metadata on type: NoAnnotationComponent");
      });

    });
  });
}

@Component({selector: 'element-name-dashed'})
@View({template: ``})
class ElementNameComponent {
}

@Component({selector: '[attr-name]'})
@View({template: ``})
class AttributeNameComponent {
}

class NoAnnotationComponent {}
