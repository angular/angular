/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initializeWebMCPPolyfill, cleanupWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  createEnvironmentInjector,
  EnvironmentInjector,
} from '../../src/core';
import {withExperimentalWebMcpComponentInspector} from '../../src/webmcp/component_inspector';
import {TestBed} from '../../testing';

// ---------------------------------------------------------------------------
// Fixture components
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-product-card',
  template: `<p>{{ product?.name }}</p>`,
})
class ProductCardComponent {
  @Input() product: {name: string; price: number} | null = null;
  @Input() isLoading = false;
  @Output() addToCart = new EventEmitter<void>();
}

@Component({
  selector: 'app-root',
  template: `<app-product-card [product]="item" [isLoading]="loading"></app-product-card>`,
  imports: [ProductCardComponent],
})
class AppRootComponent {
  item = {name: 'Keyboard', price: 129};
  loading = false;
}

// A leaf component with no children.
@Component({
  selector: 'app-leaf',
  template: `<span>{{ label }}</span>`,
})
class LeafComponent {
  @Input() label = '';
  @Output() clicked = new EventEmitter<void>();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parses the JSON text content returned by a tool invocation. */
function parseToolResult(rawJson: string): unknown {
  const envelope = JSON.parse(rawJson) as {content: Array<{type: string; text: string}>};
  return JSON.parse(envelope.content[0].text);
}

/** Gets the raw text (non-JSON) returned by a tool invocation. */
function getToolText(rawJson: string): string {
  const envelope = JSON.parse(rawJson) as {content: Array<{type: string; text: string}>};
  return envelope.content[0].text;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('withExperimentalWebMcpComponentInspector', () => {
  let fixtureContainer: HTMLDivElement;

  beforeEach(() => {
    initializeWebMCPPolyfill({installTestingShim: true});

    // Attach a container to document.body so that TestBed fixtures are
    // discoverable by document.querySelector from within tool execute functions.
    fixtureContainer = document.createElement('div');
    fixtureContainer.id = 'test-fixture-root';
    document.body.appendChild(fixtureContainer);
  });

  afterEach(() => {
    cleanupWebMCPPolyfill();
    document.body.removeChild(fixtureContainer);
    TestBed.resetTestingModule();
  });

  /** Creates a component, configures TestBed, and attaches the element to the shared DOM container. */
  async function createAndAttach<T>(componentType: any, providers: any[] = []): Promise<any> {
    TestBed.configureTestingModule({
      imports: [componentType],
      providers,
    });
    const fixture = TestBed.createComponent<T>(componentType);
    fixtureContainer.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    return fixture;
  }

  // --------------------------------------------------------------------------

  describe('tool registration', () => {
    it('should register angular.get_component_tree and angular.get_component_state', async () => {
      const envInjector = createEnvironmentInjector(
        [withExperimentalWebMcpComponentInspector()],
        TestBed.inject(EnvironmentInjector),
      );

      const toolNames = globalThis.navigator
        .modelContextTesting!.listTools()
        .map((t: {name: string}) => t.name);
      expect(toolNames).toContain('angular.get_component_tree');
      expect(toolNames).toContain('angular.get_component_state');

      envInjector.destroy();
    });

    it('should unregister tools when the injector is destroyed', () => {
      const envInjector = createEnvironmentInjector(
        [withExperimentalWebMcpComponentInspector()],
        TestBed.inject(EnvironmentInjector),
      );

      expect(
        globalThis.navigator.modelContextTesting!.listTools().map((t: {name: string}) => t.name),
      ).toContain('angular.get_component_tree');

      envInjector.destroy();

      expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);
    });

    it('should be a no-op in server-side rendering (ngServerMode)', () => {
      (globalThis as Record<string, unknown>)['ngServerMode'] = true;
      try {
        const envInjector = createEnvironmentInjector(
          [withExperimentalWebMcpComponentInspector()],
          TestBed.inject(EnvironmentInjector),
        );
        expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);
        envInjector.destroy();
      } finally {
        (globalThis as Record<string, unknown>)['ngServerMode'] = undefined;
      }
    });
  });

  // --------------------------------------------------------------------------

  describe('angular.get_component_tree', () => {
    it('should return component names and input/output names for rendered components', async () => {
      await createAndAttach(AppRootComponent, [withExperimentalWebMcpComponentInspector()]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_tree',
        JSON.stringify({rootSelector: '#test-fixture-root'}),
      );
      const allNodes = JSON.stringify(parseToolResult(raw!));

      expect(allNodes).toContain('ProductCardComponent');
      expect(allNodes).toContain('app-product-card');
      expect(allNodes).toContain('product');
      expect(allNodes).toContain('isLoading');
      expect(allNodes).toContain('addToCart');
    });

    it('should return the specific component when rootSelector points to a component host', async () => {
      await createAndAttach(AppRootComponent, [withExperimentalWebMcpComponentInspector()]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_tree',
        JSON.stringify({rootSelector: 'app-product-card'}),
      );
      const result = parseToolResult(raw!) as {componentName: string};
      expect(result.componentName).toBe('ProductCardComponent');
    });

    it('should return an error message when rootSelector matches nothing', async () => {
      await createAndAttach(AppRootComponent, [withExperimentalWebMcpComponentInspector()]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_tree',
        JSON.stringify({rootSelector: 'non-existent-element'}),
      );
      expect(getToolText(raw!)).toContain('No element found');
    });

    it('should respect maxDepth option by excluding deeper children', async () => {
      await createAndAttach(AppRootComponent, [
        withExperimentalWebMcpComponentInspector({maxDepth: 0}),
      ]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_tree',
        JSON.stringify({rootSelector: '#test-fixture-root'}),
      );
      const treeStr = JSON.stringify(parseToolResult(raw!));
      // With maxDepth 0, nested component nodes should not be included as children.
      expect(treeStr).not.toContain('"children":[{');
    });
  });

  // --------------------------------------------------------------------------

  describe('angular.get_component_state', () => {
    it('should return current @Input values and @Output names', async () => {
      await createAndAttach(AppRootComponent, [withExperimentalWebMcpComponentInspector()]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_state',
        JSON.stringify({selector: 'app-product-card'}),
      );
      const state = parseToolResult(raw!) as {
        componentName: string;
        inputValues: Record<string, unknown>;
        outputs: string[];
      };

      expect(state.componentName).toBe('ProductCardComponent');
      expect(state.outputs).toContain('addToCart');
      expect(state.inputValues['isLoading']).toBe(false);
      expect((state.inputValues['product'] as {name: string}).name).toBe('Keyboard');
    });

    it('should return an error message when selector matches no element', async () => {
      await createAndAttach(AppRootComponent, [withExperimentalWebMcpComponentInspector()]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_state',
        JSON.stringify({selector: 'app-missing'}),
      );
      expect(getToolText(raw!)).toContain('No element found');
    });

    it('should return an error when selector matches a non-Angular element', async () => {
      await createAndAttach(AppRootComponent, [withExperimentalWebMcpComponentInspector()]);

      const raw = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_state',
        JSON.stringify({selector: '#test-fixture-root'}),
      );
      expect(getToolText(raw!)).toContain('not an Angular component host');
    });

    it('should read live @Input values from the component instance', async () => {
      const fixture = await createAndAttach(AppRootComponent, [
        withExperimentalWebMcpComponentInspector(),
      ]);

      // Verify the initial state reflects what the parent bound.
      const raw1 = await globalThis.navigator.modelContextTesting!.executeTool(
        'angular.get_component_state',
        JSON.stringify({selector: 'app-product-card'}),
      );
      const state1 = parseToolResult(raw1!) as {
        inputValues: {product: {name: string; price: number}; isLoading: boolean};
      };
      expect(state1.inputValues['isLoading']).toBe(false);
      expect(state1.inputValues['product']['name']).toBe('Keyboard');
      expect(state1.inputValues['product']['price']).toBe(129);
    });
  });
});
