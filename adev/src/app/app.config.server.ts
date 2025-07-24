/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {mergeApplicationConfig, ApplicationConfig} from '@angular/core';
import {provideServerRendering, withRoutes, RenderMode} from '@angular/ssr';
import {appConfig} from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes([{path: '**', renderMode: RenderMode.Prerender}]))],
};

export const config: ApplicationConfig = mergeApplicationConfig(appConfig, serverConfig);
