/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {mergeApplicationConfig, ApplicationConfig} from '@angular/core';
import {provideServerRendering} from '@angular/platform-server';
import {appConfig} from './app.config';
import {
  ReferenceScrollHandler,
  ReferenceScrollHandlerNoop,
} from './features/references/services/reference-scroll-handler.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {provide: ReferenceScrollHandler, useClass: ReferenceScrollHandlerNoop},
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
