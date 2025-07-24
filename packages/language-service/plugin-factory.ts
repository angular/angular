/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: use a type-only import to prevent TypeScript from being bundled in.
import type ts from 'typescript';

import {NgLanguageService, PluginConfig} from './api';

interface PluginModule extends ts.server.PluginModule {
  create(createInfo: ts.server.PluginCreateInfo): NgLanguageService;
  onConfigurationChanged?(config: PluginConfig): void;
}

export const factory: ts.server.PluginModuleFactory = (tsModule): PluginModule => {
  let plugin: PluginModule;

  return {
    create(info: ts.server.PluginCreateInfo): NgLanguageService {
      // Use a module name based import path to allow it to be marked external.
      plugin = require(`@angular/language-service/bundles/language-service.js`)(tsModule);
      return plugin.create(info);
    },
    getExternalFiles(project: ts.server.Project): string[] {
      return plugin?.getExternalFiles?.(project, tsModule.typescript.ProgramUpdateLevel.Full) ?? [];
    },
    onConfigurationChanged(config: PluginConfig): void {
      plugin?.onConfigurationChanged?.(config);
    },
  };
};
