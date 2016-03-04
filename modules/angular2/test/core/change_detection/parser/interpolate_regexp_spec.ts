import {
  ddescribe,
  describe,
  it,
  xit,
  iit,
  expect,
  beforeEachProviders,
  inject
} from 'angular2/testing_internal';
import {provide} from 'angular2/core';
import {
  INTERPOLATE_REGEXP,
  DEFAULT_INTERPOLATE_REGEXP,
  Parser
} from 'angular2/src/core/change_detection/change_detection';
import {COMPILER_PROVIDERS} from 'angular2/src/compiler/compiler';

export function main() {
  describe('INTERPOLATE_REGEXP', () => {

    beforeEachProviders(() => [
      COMPILER_PROVIDERS,
      provide(INTERPOLATE_REGEXP, {useValue: /<<([\s\S]*?)>>/g}),
    ]);

    it('should parse with customized interpolate regexp', inject([Parser], (p: Parser) => {
         var ast: any = p.parseInterpolation('<<a>>', null).ast;
         expect(ast.strings).toEqual(['', '']);
         expect(ast.expressions.length).toEqual(1);
         expect(ast.expressions[0].name).toEqual('a');
       }));
  });
}
