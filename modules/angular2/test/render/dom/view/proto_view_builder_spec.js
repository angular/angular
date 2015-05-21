import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  beforeEachBindings,
  it,
  xit
} from 'angular2/test_lib';

import {ElementBinderBuilder} from 'angular2/src/render/dom/view/proto_view_builder';
import {Parser} from 'angular2/src/change_detection/parser/parser';
import {Lexer} from 'angular2/src/change_detection/parser/lexer';

export function main() {

  describe('ElementBinderBuilder', () => {

    describe('bindProperty', () => {

      it('should return a setter for a property', () => {
        var ast = new Parser(new Lexer(), null)
            .parseAction('foo.bar', 'location');
        expect(() => {
          new ElementBinderBuilder(null, null, null).bindProperty(null, ast);
        }).toThrowError(
            new RegExp('Error processing property null in expression foo.bar in location\:'));
      });

    });

  });

}
