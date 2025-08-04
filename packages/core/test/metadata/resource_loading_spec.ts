/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../src/core';
import {
  clearResolutionOfComponentResourcesQueue,
  isComponentResourceResolutionQueueEmpty,
  resolveComponentResources,
} from '../../src/metadata/resource_loading';
import {ComponentType} from '../../src/render3/interfaces/definition';
import {compileComponent} from '../../src/render3/jit/directive';

describe('resource_loading', () => {
  afterEach(clearResolutionOfComponentResourcesQueue);

  describe('error handling', () => {
    it('should throw an error when compiling component that has unresolved templateUrl', () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      compileComponent(MyComponent, {templateUrl: 'someUrl'});
      expect(() => MyComponent.ɵcmp).toThrowError(
        `
Component 'MyComponent' is not resolved:
 - templateUrl: someUrl
Did you run and wait for 'resolveComponentResources()'?`.trim(),
      );
    });

    it('should throw an error when compiling component that has unresolved styleUrls', () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      compileComponent(MyComponent, {styleUrls: ['someUrl1', 'someUrl2']});
      expect(() => MyComponent.ɵcmp).toThrowError(
        `
Component 'MyComponent' is not resolved:
 - styleUrls: ["someUrl1","someUrl2"]
Did you run and wait for 'resolveComponentResources()'?`.trim(),
      );
    });

    it('should throw an error when compiling component that has unresolved templateUrl and styleUrls', () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      compileComponent(MyComponent, {templateUrl: 'someUrl', styleUrls: ['someUrl1', 'someUrl2']});
      expect(() => MyComponent.ɵcmp).toThrowError(
        `
Component 'MyComponent' is not resolved:
 - templateUrl: someUrl
 - styleUrls: ["someUrl1","someUrl2"]
Did you run and wait for 'resolveComponentResources()'?`.trim(),
      );
    });
  });

  describe('resolution', () => {
    const URLS: {[url: string]: Promise<string>} = {
      'test://content': Promise.resolve('content'),
      'test://style': Promise.resolve('style'),
      'test://style1': Promise.resolve('style1'),
      'test://style2': Promise.resolve('style2'),
    };
    let resourceFetchCount: number;
    function testResolver(url: string): Promise<string> {
      resourceFetchCount++;
      return URLS[url] || Promise.reject('NOT_FOUND: ' + url);
    }
    beforeEach(() => (resourceFetchCount = 0));

    it('should resolve template', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {templateUrl: 'test://content'};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(testResolver);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.template).toBe('content');
      expect(resourceFetchCount).toBe(1);
    });

    it('should resolve styleUrls', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {template: '', styleUrls: ['test://style1', 'test://style2']};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(testResolver);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.styleUrls).toBe(undefined);
      expect(metadata.styles).toEqual(['style1', 'style2']);
      expect(resourceFetchCount).toBe(2);
    });

    it('should cache multiple resolution to same URL', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {template: '', styleUrls: ['test://style1', 'test://style1']};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(testResolver);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.styleUrls).toBe(undefined);
      expect(metadata.styles).toEqual(['style1', 'style1']);
      expect(resourceFetchCount).toBe(1);
    });

    it('should keep order even if the resolution is out of order', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {
        template: '',
        styles: ['existing'],
        styleUrls: ['test://style1', 'test://style2'],
      };
      compileComponent(MyComponent, metadata);
      const resolvers: any[] = [];
      const resolved = resolveComponentResources(
        (url) => new Promise((resolve, response) => resolvers.push(url, resolve)),
      );
      // Out of order resolution
      expect(resolvers[0]).toEqual('test://style1');
      expect(resolvers[2]).toEqual('test://style2');
      resolvers[3]('second');
      resolvers[1]('first');
      await resolved;
      expect(metadata.styleUrls).toBe(undefined);
      expect(metadata.styles).toEqual(['existing', 'first', 'second']);
    });

    it('should not add components without external resources to resolution queue', () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const MyComponent2: ComponentType<any> = class MyComponent {} as any;

      compileComponent(MyComponent, {template: ''});
      expect(isComponentResourceResolutionQueueEmpty()).toBe(true);

      compileComponent(MyComponent2, {templateUrl: 'test://template'});
      expect(isComponentResourceResolutionQueueEmpty()).toBe(false);
    });

    it('should resolve styles passed in as a string', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {template: '', styles: 'existing'};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(testResolver);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.styleUrls).toBe(undefined);
      expect(metadata.styles).toEqual('existing');
      expect(resourceFetchCount).toBe(0);
    });

    it('should resolve styleUrl', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {template: '', styleUrl: 'test://style'};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(testResolver);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.styleUrl).toBe(undefined);
      expect(metadata.styles).toEqual(['style']);
      expect(resourceFetchCount).toBe(1);
    });

    it('should resolve both styles passed in as a string together with styleUrl', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {template: '', styleUrl: 'test://style', styles: 'existing'};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(testResolver);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.styleUrls).toBe(undefined);
      expect(metadata.styles).toEqual(['existing', 'style']);
      expect(resourceFetchCount).toBe(1);
    });

    it('should throw if both styleUrls and styleUrl are passed in', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {
        template: '',
        styleUrl: 'test://style1',
        styleUrls: ['test://style2'],
      };
      compileComponent(MyComponent, metadata);

      expect(() => resolveComponentResources(testResolver)).toThrowError(
        /@Component cannot define both `styleUrl` and `styleUrls`/,
      );
    });
  });

  describe('fetch', () => {
    function fetch(url: string): Promise<Response> {
      return Promise.resolve({
        text() {
          return 'response for ' + url;
        },
      } as any as Response);
    }

    it('should work with fetch', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {templateUrl: 'test://content'};
      compileComponent(MyComponent, metadata);
      await resolveComponentResources(fetch);
      expect(MyComponent.ɵcmp).toBeDefined();
      expect(metadata.template).toBe('response for test://content');
    });

    it('should fail when fetch is resolving to a 404', async () => {
      const MyComponent: ComponentType<any> = class MyComponent {} as any;
      const metadata: Component = {templateUrl: 'test://content'};
      compileComponent(MyComponent, metadata);

      await expectAsync(
        resolveComponentResources(async () => {
          return {
            async text() {
              return 'File not found';
            },
            status: 404,
          };
        }),
      ).toBeRejectedWithError(/Could not load resource.*404/);
    });
  });
});
