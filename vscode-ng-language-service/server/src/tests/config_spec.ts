/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  clearWorkspaceConfigurationCache,
  flattenConfiguration,
  getWorkspaceConfigurationCached,
} from '../config';

describe('flattenConfiguration', () => {
  it('should flatten a simple nested object', () => {
    const config = {
      enabled: 'all',
      suppressWhenArgumentMatchesName: true,
    };
    const result = flattenConfiguration(config, 'typescript.inlayHints.parameterNames');
    expect(result).toEqual({
      'typescript.inlayHints.parameterNames.enabled': 'all',
      'typescript.inlayHints.parameterNames.suppressWhenArgumentMatchesName': true,
    });
  });

  it('should flatten deeply nested objects', () => {
    const config = {
      parameterNames: {
        enabled: 'all',
        suppressWhenArgumentMatchesName: true,
      },
      variableTypes: {
        enabled: true,
      },
    };
    const result = flattenConfiguration(config, 'typescript.inlayHints');
    expect(result).toEqual({
      'typescript.inlayHints.parameterNames.enabled': 'all',
      'typescript.inlayHints.parameterNames.suppressWhenArgumentMatchesName': true,
      'typescript.inlayHints.variableTypes.enabled': true,
    });
  });

  it('should handle arrays as leaf values', () => {
    const config = {
      items: ['a', 'b', 'c'],
    };
    const result = flattenConfiguration(config, 'prefix');
    expect(result).toEqual({
      'prefix.items': ['a', 'b', 'c'],
    });
  });

  it('should handle null values', () => {
    const config = {
      value: null,
    };
    const result = flattenConfiguration(config, 'prefix');
    expect(result).toEqual({
      'prefix.value': null,
    });
  });

  it('should handle empty objects', () => {
    const config = {};
    const result = flattenConfiguration(config, 'prefix');
    expect(result).toEqual({});
  });

  it('should handle mixed value types', () => {
    const config = {
      stringVal: 'test',
      numberVal: 42,
      boolVal: false,
      nested: {
        deep: 'value',
      },
    };
    const result = flattenConfiguration(config, 'config');
    expect(result).toEqual({
      'config.stringVal': 'test',
      'config.numberVal': 42,
      'config.boolVal': false,
      'config.nested.deep': 'value',
    });
  });

  it('should memoize workspace configuration requests for identical items', async () => {
    const getConfiguration = jasmine.createSpy().and.resolveTo([{}, {}]);
    const connection = {
      workspace: {
        getConfiguration,
      },
    } as any;

    const items = [{section: 'angular.inlayHints'}, {section: 'editor.inlayHints'}];
    await getWorkspaceConfigurationCached(connection, items);
    await getWorkspaceConfigurationCached(connection, items);

    expect(getConfiguration).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cached workspace configuration entries', async () => {
    const getConfiguration = jasmine.createSpy().and.resolveTo([{}]);
    const connection = {
      workspace: {
        getConfiguration,
      },
    } as any;

    const items = [{section: 'angular.inlayHints', scopeUri: 'file:///workspace/app.component.ts'}];
    await getWorkspaceConfigurationCached(connection, items);
    clearWorkspaceConfigurationCache(connection);
    await getWorkspaceConfigurationCached(connection, items);

    expect(getConfiguration).toHaveBeenCalledTimes(2);
  });
});
