/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {shim} from './utils';

describe('ShadowCss, ng-deep', () => {
  it('should handle /deep/', () => {
    const css = shim('x /deep/ y {}', 'contenta');
    expect(css).toEqualCss('x[contenta] y {}');
  });

  it('should handle >>>', () => {
    const css = shim('x >>> y {}', 'contenta');
    expect(css).toEqualCss('x[contenta] y {}');
  });

  it('should handle ::ng-deep', () => {
    let css = '::ng-deep y {}';
    expect(shim(css, 'contenta')).toEqualCss('y {}');
    css = 'x ::ng-deep y {}';
    expect(shim(css, 'contenta')).toEqualCss('x[contenta] y {}');
    css = ':host > ::ng-deep .x {}';
    expect(shim(css, 'contenta', 'h')).toEqualCss('[h] > .x {}');
    css = ':host ::ng-deep > .x {}';
    expect(shim(css, 'contenta', 'h')).toEqualCss('[h] > .x {}');
    css = ':host > ::ng-deep > .x {}';
    expect(shim(css, 'contenta', 'h')).toEqualCss('[h] > > .x {}');
  });

  // TODO(crisbeto): this is temporary until we land #69885.
  it('should strip ::ng-deep from nested selectors', () => {
    const css = `
      .parent {
        ::ng-deep .child {
          color: red;
        }

        .wrapper {
          &::ng-deep .inner {
            color: blue;
          }

          &:hover ::ng-deep .inner-hover {
            color: green;
          }

          .deep {
            ::ng-deep .deepest {
              color: yellow;
            }
          }
        }
      }

      @media screen and (max-width: 600px) {
        .media-parent {
          ::ng-deep .media-child {
            color: purple;
          }
        }
      }
    `;
    expect(shim(css, 'contenta')).toEqualCss(`
      .parent[contenta] {
        .child {
          color: red;
        }

        .wrapper {
          & .inner {
            color: blue;
          }

          &:hover .inner-hover {
            color: green;
          }

          .deep {
            .deepest {
              color: yellow;
            }
          }
        }
      }

      @media screen and (max-width: 600px) {
        .media-parent[contenta] {
          .media-child {
            color: purple;
          }
        }
      }
    `);
  });
});
