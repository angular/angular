/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import {NgLanguageService, PluginConfig} from './api';

interface PluginModule extends ts.server.PluginModule {
  create(createInfo: ts.server.PluginCreateInfo): NgLanguageService;
  onConfigurationChanged?(config: PluginConfig): void;
}

const factory: ts.server.PluginModuleFactory = (tsModule): PluginModule => {
  let plugin: PluginModule;

  return {
    create(info: ts.server.PluginCreateInfo): NgLanguageService {
      const config: PluginConfig = info.config;
      const bundleName = config.ivy ? 'ivy.js' : 'language-service.js';
      plugin = require(`./bundles/${bundleName}`)(tsModule);
      return plugin.create(info);
    },
    getExternalFiles(project: ts.server.Project): string[] {
      return plugin?.getExternalFiles?.(project) ?? [];
    },
    onConfigurationChanged(config: PluginConfig): void {
      plugin?.onConfigurationChanged?.(config);
    },
  };
};

/**
 * Tsserver expects `@angular/language-service` to provide a factory function
 * as the default export of the package. See
 * https://github.com/microsoft/TypeScript/blob/f4d0ea6539edb6d8f70b626132d6f9ac1ac4281a/src/server/project.ts#L1611
 */
export = factory;
