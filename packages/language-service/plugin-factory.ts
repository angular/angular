/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: use a type-only import to prevent TypeScript from being bundled in.
import type ts from 'typescript';

export const factory: ts.server.PluginModuleFactory = (tsModule) => {
  let plugin: ts.server.PluginModule;

  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      plugin ??= require(`@angular/language-service/bundles/language-service.js`)(tsModule);

      return plugin.create(info);
    },
    getExternalFiles(project: ts.server.Project): string[] {
      return plugin?.getExternalFiles?.(project, tsModule.typescript.ProgramUpdateLevel.Full) ?? [];
    },
    onConfigurationChanged(config: unknown): void {
      plugin?.onConfigurationChanged?.(config);
    },
  };
};
