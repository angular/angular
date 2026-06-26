/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵɵforeignComponent,
  ɵɵforeignContent,
  ɵɵforeignContentFn,
} from '../../src/render3/instructions/foreign_component';
import {foreignImport} from '../../src/render3/foreign_import';
import {destroyLView} from '../../src/render3/node_manipulation';
import {ViewFixture} from './view_fixture';
import {ɵɵdomTemplate} from '../../src/render3/instructions/template';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart} from '../../src/render3/instructions/element';
import {ɵɵtext} from '../../src/render3/instructions/text';
import {ɵɵadvance} from '../../src/render3/instructions/advance';
import {ɵɵtextInterpolate2} from '../../src/render3/instructions/text_interpolation';
import {inject, InjectionToken} from '../../src/di';
import {ɵɵdefineDirective} from '../../src/render3/definition';
import {ɵɵProvidersFeature} from '../../src/render3/features/providers_feature';
import {createLView} from '../../src/render3/view/construction';
import {renderView} from '../../src/render3/instructions/render';
import {LView, LViewFlags, PARENT, RENDERER, T_HOST} from '../../src/render3/interfaces/view';

describe('ɵɵforeignComponent', () => {
  afterEach(ViewFixture.cleanUp);

  it("should render a foreign component's native elements", () => {
    const foreignComp = foreignImport(
      () => {
        const el = document.createElement('div');
        el.id = 'foreign-el';
        el.textContent = 'Foreign Content';
        return [[el]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const fixture = new ViewFixture({
      decls: 1,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵforeignComponent(0, 0);
      },
    });

    expect(fixture.host.innerHTML).toContain('<div id="foreign-el">Foreign Content</div>');
  });

  it('should pass props to a foreign component', () => {
    const render = jasmine.createSpy('render').and.returnValue([[]]);
    const foreignComp = foreignImport<{name: string}>(render, noopOnDestroy, eagerContentAdapter);

    new ViewFixture({
      decls: 1,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵforeignComponent(0, 0, {name: 'Angular'});
      },
    });

    expect(render).toHaveBeenCalledOnceWith({name: 'Angular'});
  });

  it('should call the dispose function when the containing view is destroyed', () => {
    const dispose = jasmine.createSpy();
    const foreignComp = foreignImport(
      () => {
        return [[], dispose];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const fixture = new ViewFixture({
      decls: 1,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵforeignComponent(0, 0);
      },
    });

    expect(dispose).toHaveBeenCalledTimes(0);

    destroyLView(fixture.tView, fixture.lView);

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('should render foreign view between sibling elements', () => {
    const foreignComp = foreignImport(
      () => {
        const el = document.createElement('div');
        el.textContent = 'Foreign Content';
        return [[el]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const fixture = new ViewFixture({
      decls: 3,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵelement(0, 'p');
        ɵɵforeignComponent(1, 0);
        ɵɵelement(2, 'span');
      },
    });

    expect(fixture.host.innerHTML).toContain(
      '' +
        '<p></p>' +
        '<!--foreign-view-head-->' +
        '<div>Foreign Content</div>' +
        '<!--foreign-view-tail-->' +
        '<!--foreign-component-->' +
        '<span></span>',
    );
  });

  it('should render foreign view as a child of a parent element', () => {
    const foreignComp = foreignImport(
      () => {
        const el = document.createElement('span');
        el.textContent = 'Foreign Content';
        return [[el]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const fixture = new ViewFixture({
      decls: 2,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵelementStart(0, 'div');
        ɵɵforeignComponent(1, 0);
        ɵɵelementEnd();
      },
    });

    expect(fixture.host.innerHTML).toContain(
      '' +
        '<div>' +
        '<!--foreign-view-head-->' +
        '<span>Foreign Content</span>' +
        '<!--foreign-view-tail-->' +
        '<!--foreign-component-->' +
        '</div>',
    );
  });

  it('should execute the RENDER function inside the template injection context', () => {
    const TEST_TOKEN = new InjectionToken<string>('test-token');

    const foreignComp = foreignImport(
      () => {
        const value = inject(TEST_TOKEN, {optional: true}) ?? 'null';
        const el = document.createElement('div');
        el.id = 'foreign-el';
        el.textContent = value;
        return [[el]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    class ProviderDirective {
      static ɵfac = () => new ProviderDirective();
      static ɵdir = ɵɵdefineDirective({
        type: ProviderDirective,
        selectors: [['', 'provider-dir', '']],
        features: [ɵɵProvidersFeature([{provide: TEST_TOKEN, useValue: 'templated-value'}])],
      });
    }

    const fixture = new ViewFixture({
      decls: 2,
      vars: 0,
      consts: [['provider-dir', ''], foreignComp],
      directives: [ProviderDirective],
      create: () => {
        ɵɵelementStart(0, 'div', 0);
        ɵɵforeignComponent(1, 1);
        ɵɵelementEnd();
      },
    });

    expect(fixture.host.innerHTML).toContain('<div id="foreign-el">templated-value</div>');
  });

  it('should support reusing the same template between multiple view instances', () => {
    const foreignComp1 = foreignImport(
      () => {
        return [[document.createTextNode('foreign content')]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const createFn = () => {
      ɵɵelementStart(0, 'div');
      ɵɵforeignComponent(1, 0);
      ɵɵelementEnd();
    };
    const expectedHtml =
      '' +
      '<div>' +
      '<!--foreign-view-head-->foreign content<!--foreign-view-tail-->' +
      '<!--foreign-component-->' +
      '</div>';

    const fixture = new ViewFixture({
      decls: 2,
      vars: 0,
      consts: [foreignComp1],
      create: createFn,
    });
    expect(fixture.host.innerHTML).toContain(expectedHtml);

    // Create second instance reusing the TView
    const host2 = renderSecondInstance(fixture);
    expect(fixture.host.innerHTML).toContain(expectedHtml);
    expect(host2.innerHTML).toContain(expectedHtml);
  });

  it('should support passing ɵɵforeignContent to props', () => {
    const foreignComp = foreignImport<{
      icon: Node[];
      description: Node[];
      children: Node[];
    }>(
      (props) => {
        const div = document.createElement('div');
        div.id = 'container';

        const iconContainer = document.createElement('div');
        iconContainer.id = 'icon-container';
        for (const child of props.icon) {
          iconContainer.appendChild(child);
        }
        div.appendChild(iconContainer);

        const descContainer = document.createElement('div');
        descContainer.id = 'desc-container';
        for (const child of props.description) {
          descContainer.appendChild(child);
        }
        div.appendChild(descContainer);

        const mainChildren = document.createElement('div');
        mainChildren.id = 'children-container';
        for (const child of props.children) {
          mainChildren.appendChild(child);
        }
        div.appendChild(mainChildren);

        return [[div]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const iconTemplate = (rf: number, ctx: any) => {
      if (rf & 1) {
        ɵɵelementStart(0, 'span');
        ɵɵtext(1, 'Icon Content');
        ɵɵelementEnd();
      }
    };

    const descriptionTemplate = (rf: number, ctx: any) => {
      if (rf & 1) {
        ɵɵelementStart(0, 'p');
        ɵɵtext(1, 'Description Content');
        ɵɵelementEnd();
      }
    };

    const childrenTemplate = (rf: number, ctx: any) => {
      if (rf & 1) {
        ɵɵelementStart(0, 'span');
        ɵɵtext(1, 'Main Children Content');
        ɵɵelementEnd();
      }
    };

    const fixture = new ViewFixture({
      decls: 4,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵdomTemplate(0, iconTemplate, 2, 0);
        ɵɵdomTemplate(1, descriptionTemplate, 2, 0);
        ɵɵdomTemplate(2, childrenTemplate, 2, 0);
        ɵɵforeignComponent(3, 0, {
          icon: ɵɵforeignContent(0, 0),
          description: ɵɵforeignContent(1, 0),
          children: ɵɵforeignContent(2, 0),
        });
      },
    });

    expect(fixture.host.innerHTML).toContain(
      '' +
        '<div id="container">' +
        '<div id="icon-container"><span>Icon Content</span></div>' +
        '<div id="desc-container"><p>Description Content</p></div>' +
        '<div id="children-container"><span>Main Children Content</span></div>' +
        '</div>',
    );
  });

  it('should support passing ɵɵforeignContentFn to props', () => {
    const foreignComp = foreignImport<{
      renderItem: (item: string, idx: number) => Node[];
    }>(
      (props) => {
        const div = document.createElement('div');
        div.id = 'container';

        const nodes1 = props.renderItem('First', 0);
        const nodes2 = props.renderItem('Second', 1);

        for (const node of nodes1) {
          div.appendChild(node);
        }
        for (const node of nodes2) {
          div.appendChild(node);
        }

        return [[div]];
      },
      noopOnDestroy,
      eagerContentAdapter,
    );

    const itemTemplate = (rf: number, ctx: any) => {
      if (rf & 1) {
        ɵɵelementStart(0, 'span');
        ɵɵtext(1);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        const item = ctx[0];
        const index = ctx[1];
        ɵɵadvance(1);
        ɵɵtextInterpolate2('#', index, ': ', item);
      }
    };

    const fixture = new ViewFixture({
      decls: 2,
      vars: 0,
      consts: [foreignComp],
      create: () => {
        ɵɵdomTemplate(0, itemTemplate, 2, 2);
        ɵɵforeignComponent(1, 0, {
          renderItem: ɵɵforeignContentFn(0, 0),
        });
      },
    });

    fixture.update(() => {});

    expect(fixture.host.innerHTML).toContain(
      '<div id="container"><span>#0: First</span><span>#1: Second</span></div>',
    );
  });
});

function noopOnDestroy() {}

function eagerContentAdapter(producer: () => Node[]): Node[] {
  return producer();
}

function renderSecondInstance(fixture: ViewFixture): HTMLElement {
  const hostLView = fixture.lView[PARENT] as LView;
  const hostTNode = fixture.lView[T_HOST];
  const hostRenderer = hostLView[RENDERER];
  const host = hostRenderer.createElement('host-element') as HTMLElement;

  const lView = createLView(
    hostLView,
    fixture.tView,
    {},
    LViewFlags.CheckAlways,
    host,
    hostTNode,
    null,
    null,
    null,
    null,
    null,
  );

  renderView(fixture.tView, lView, {});
  return host;
}
