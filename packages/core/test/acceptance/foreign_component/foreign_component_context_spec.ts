/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ForeignComponent} from '../../../src/interface/foreign_component';
import {foreignImport} from '../../../src/render3/foreign_import';
import {provideForeignRootContext} from '../../../src/render3/foreign_context';

/** A minimal framework for testing purposes. */
const microFramework = {
  context: undefined as string | undefined,

  pushContext(context: string | undefined): string | undefined {
    const previousContext = microFramework.context;
    microFramework.context = context;
    return previousContext;
  },

  popContext(context: string | undefined) {
    microFramework.context = context;
  },
};

interface Content {
  render(): Node[];
}

function microImport<TProps>(
  component: (props: TProps) => Node[],
): ForeignComponent<TProps, string | undefined> {
  return foreignImport(
    (props, context) => {
      const previousContext = microFramework.pushContext(context);
      try {
        return [component(props)];
      } finally {
        microFramework.popContext(previousContext);
      }
    },
    () => {}, // No cleanup necessary.
    (producer) => ({render: producer}),
    () => microFramework.context,
  );
}

function Provider(props: {context: string; children: Content}): Node[] {
  const previousContext = microFramework.pushContext(props.context);
  try {
    return props.children.render();
  } finally {
    microFramework.popContext(previousContext);
  }
}

function Consumer(): Node[] {
  return [document.createTextNode(microFramework.context ?? '<no context>')];
}

describe('foreign component context', () => {
  it('should be undefined when not provided', async () => {
    @Component({
      selector: 'no-ctx-cmp',
      template: `<Consumer />`,
      // @ts-ignore
      foreignImports: [microImport(Consumer)],
    })
    class NoCtxApp {}

    const fixture = TestBed.createComponent(NoCtxApp);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('<no context>');
  });

  it('should receive root context when provided', async () => {
    @Component({
      selector: 'test-cmp',
      // @ts-ignore
      foreignImports: [microImport(Consumer)],
      providers: [provideForeignRootContext(() => 'Hello, world!')],
      template: `<Consumer />`,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Hello, world!');
  });

  it('should pass parent context to static children', async () => {
    @Component({
      selector: 'test-app',
      template: `
        <Provider context="Parent context">
          <Consumer />
        </Provider>
      `,
      // @ts-ignore
      foreignImports: [microImport(Provider), microImport(Consumer)],
    })
    class TestApp {}

    const fixture = TestBed.createComponent(TestApp);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Parent context');
  });

  it('should pass parent context to dynamic children', async () => {
    function DynamicProvider(props: {context: string; children: () => Content}): Node[] {
      const previousContext = microFramework.pushContext(props.context);
      try {
        return props.children().render();
      } finally {
        microFramework.popContext(previousContext);
      }
    }

    @Component({
      selector: 'test-app',
      template: `
        <DynamicProvider context="Parent context">
          @content (children; let _) {
            <Consumer />
          }
        </DynamicProvider>
      `,
      // @ts-ignore
      foreignImports: [microImport(DynamicProvider), microImport(Consumer)],
    })
    class TestApp {}

    const fixture = TestBed.createComponent(TestApp);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Parent context');
  });

  it('should receive context from nearest ancestor', async () => {
    @Component({
      selector: 'test-app',
      template: `
        <Provider context="Outer context">
          <Provider context="Inner context">
            <Consumer />
          </Provider>
        </Provider>
      `,
      // @ts-ignore
      foreignImports: [microImport(Provider), microImport(Consumer)],
    })
    class TestApp {}

    const fixture = TestBed.createComponent(TestApp);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Inner context');
  });
});
