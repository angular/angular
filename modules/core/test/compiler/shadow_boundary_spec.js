import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'test_lib/test_lib';
import {ShadowBoundary} from 'core/compiler/shadow_boundary';
import {DOM} from 'facade/dom';

export function main() {
  describe('ShadowBoundary', () => {
    forShadowBoundary(
      'ShadowRoot',
      () => DOM.createShadowRoot(DOM.createElement('div')),
      (root) => new ShadowBoundary(root)
    );

    forShadowBoundary(
      'Element',
      () => DOM.createElement('div'),
      (root) => new ShadowBoundary(root)
    );
  });
}

function forShadowBoundary(name: string, rootFactory: Function, boundaryFactory: Function) {
  describe(name, () => {
    var boundary: ShadowBoundary;
    var root;

    beforeEach(() => {
      root = rootFactory();
      boundary = boundaryFactory(root);
    })

    it('should insert style elements in order', () => {
      var s1 = DOM.createStyleElement('.style1{}');
      var s2 = DOM.createStyleElement('.style2{}');
      var s3 = DOM.createStyleElement('.style3{}');

      boundary.insertStyles([s1, s2]);
      boundary.insertStyles([s3]);

      expect(root).toHaveText('.style1{}.style2{}.style3{}');
    });

    it('should prepend style elements before other style elements (prepend, then append)', () => {
      var s1 = DOM.createStyleElement('.style1{}');
      var s2 = DOM.createStyleElement('.style2{}');
      var s3 = DOM.createStyleElement('.style3{}');

      boundary.insertStyles([s1, s2], true);
      boundary.insertStyles([s3]);

      expect(root).toHaveText('.style1{}.style2{}.style3{}');
    });

    it('should prepend style elements before other style elements (append, then prepend)', () => {
      var s1 = DOM.createStyleElement('.style1{}');
      var s2 = DOM.createStyleElement('.style2{}');
      var s3 = DOM.createStyleElement('.style3{}');

      boundary.insertStyles([s1, s2]);
      boundary.insertStyles([s3], true);

      expect(root).toHaveText('.style3{}.style1{}.style2{}');
    });

    it('should insert style elements before other content', () => {
      DOM.setInnerHTML(root, '<div>adiv</div>');
      var s1 = DOM.createStyleElement('.style1{}');
      boundary.insertStyles([s1]);
      expect(root).toHaveText(".style1{}adiv");
    });

    it('should not insert the same style element twice', () => {
      var s1 = DOM.createStyleElement('.style1{}');
      boundary.insertStyles([s1]);
      boundary.insertStyles([s1]);
      expect(root).toHaveText(".style1{}");
    });
  });
}
