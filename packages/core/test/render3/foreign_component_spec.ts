/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵforeignComponent} from '../../src/render3/instructions/foreign_component';
import {foreignImport} from '../../src/render3/foreign_import';
import {destroyLView} from '../../src/render3/node_manipulation';
import {ViewFixture} from './view_fixture';

describe('ɵɵforeignComponent', () => {
  afterEach(ViewFixture.cleanUp);

  it("should render a foreign component's native elements", () => {
    const foreignComp = foreignImport(() => {
      const el = document.createElement('div');
      el.id = 'foreign-el';
      el.textContent = 'Foreign Content';
      return [[el]];
    });

    const fixture = new ViewFixture({
      decls: 1,
      vars: 0,
      create: () => {
        ɵɵforeignComponent(0, foreignComp);
      },
    });

    expect(fixture.host.innerHTML).toContain('<div id="foreign-el">Foreign Content</div>');
  });

  it('should pass props to a foreign component', () => {
    let passedProps: any = null;
    const foreignComp = foreignImport<{name: string}>((props) => {
      passedProps = props;
      return [[]];
    });

    new ViewFixture({
      decls: 1,
      vars: 0,
      create: () => {
        ɵɵforeignComponent(0, foreignComp, {name: 'Angular'});
      },
    });

    expect(passedProps).toEqual({name: 'Angular'});
  });

  it('should call the dispose function when the containing view is destroyed', () => {
    let disposeCalled = false;
    const foreignComp = foreignImport(() => {
      return [
        [],
        () => {
          disposeCalled = true;
        },
      ];
    });

    const fixture = new ViewFixture({
      decls: 1,
      vars: 0,
      create: () => {
        ɵɵforeignComponent(0, foreignComp);
      },
    });

    expect(disposeCalled).toBeFalse();

    destroyLView(fixture.tView, fixture.lView);

    expect(disposeCalled).toBeTrue();
  });
});
