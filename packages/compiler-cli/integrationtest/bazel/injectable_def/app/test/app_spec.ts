/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {enableProdMode} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import {BasicAppModuleNgFactory} from 'app_built/src/basic.ngfactory';
import {HierarchyAppModuleNgFactory} from 'app_built/src/hierarchy.ngfactory';
import {RootAppModuleNgFactory} from 'app_built/src/root.ngfactory';
import {SelfAppModuleNgFactory} from 'app_built/src/self.ngfactory';
import {TokenAppModuleNgFactory} from 'app_built/src/token.ngfactory';

enableProdMode();

describe('ngInjectableDef Bazel Integration', () => {
  it('works in AOT', done => {
    renderModuleFactory(BasicAppModuleNgFactory, {
      document: '<id-app></id-app>',
      url: '/',
    }).then(html => {
      expect(html).toMatch(/>0:0<\//);
      done();
    });
  });

  it('@Self() works in component hierarchies', done => {
    renderModuleFactory(HierarchyAppModuleNgFactory, {
      document: '<hierarchy-app></hierarchy-app>',
      url: '/',
    }).then(html => {
      expect(html).toMatch(/>false<\//);
      done();
    });
  });

  it('@Optional() Self() resolves to @Injectable() scoped service', done => {
    renderModuleFactory(SelfAppModuleNgFactory, {
      document: '<self-app></self-app>',
      url: '/',
    }).then(html => {
      expect(html).toMatch(/>true<\//);
      done();
    });
  });

  it('InjectionToken ngInjectableDef works', done => {
    renderModuleFactory(TokenAppModuleNgFactory, {
      document: '<token-app></token-app>',
      url: '/',
    }).then(html => {
      expect(html).toMatch(/>fromToken<\//);
      done();
    });
  });

  it('APP_ROOT_SCOPE works', done => {
    renderModuleFactory(RootAppModuleNgFactory, {
      document: '<root-app></root-app>',
      url: '/',
    }).then(html => {
      expect(html).toMatch(/>true:false<\//);
      done();
    });
  });
});
