/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as animations from '@angular/animations';
import * as animationsBrowser from '@angular/animations/browser';
import * as animationsBrowserTesting from '@angular/animations/browser/testing';
import * as common from '@angular/common';
import * as commonHttp from '@angular/common/http';
import * as commonHttpTesting from '@angular/common/http/testing';
import * as commonTesting from '@angular/common/testing';
import * as compiler from '@angular/compiler';
import * as core from '@angular/core';
import * as coreTesting from '@angular/core/testing';
import * as elements from '@angular/elements';
import * as forms from '@angular/forms';
import * as platformBrowser from '@angular/platform-browser';
import * as platformBrowserDynamic from '@angular/platform-browser-dynamic';
import * as platformBrowserDynamicTesting from '@angular/platform-browser-dynamic/testing';
import * as platformBrowserAnimations from '@angular/platform-browser/animations';
import * as platformBrowserTesting from '@angular/platform-browser/testing';
import * as platformServer from '@angular/platform-server';
import * as platformServerInit from '@angular/platform-server/init';
import * as platformServerTesting from '@angular/platform-server/testing';
import * as router from '@angular/router';
import * as routerTesting from '@angular/router/testing';
import * as routerUpgrade from '@angular/router/upgrade';
import * as serviceWorker from '@angular/service-worker';
import * as upgrade from '@angular/upgrade';
import * as upgradeStatic from '@angular/upgrade/static';
import * as upgradeTesting from '@angular/upgrade/static/testing';

// TODO: temporarily disabled until ESM issue is resolved.
// import * as compilerCli from '@angular/compiler-cli';
// import * as localize from '@angular/localize';

export default {
  // TODO: temporarily disabled until ESM issue is resolved.
  // compilerCli,
  // localize,
  animations,
  animationsBrowser,
  animationsBrowserTesting,
  common,
  commonTesting,
  commonHttp,
  commonHttpTesting,
  compiler,
  core,
  coreTesting,
  elements,
  forms,
  platformBrowser,
  platformBrowserTesting,
  platformBrowserDynamic,
  platformBrowserDynamicTesting,
  platformBrowserAnimations,
  platformServer,
  platformServerInit,
  platformServerTesting,
  router,
  routerTesting,
  routerUpgrade,
  serviceWorker,
  upgrade,
  upgradeStatic,
  upgradeTesting,
};
