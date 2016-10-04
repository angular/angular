/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var HelloWorldComponent = ng.core.Component({
  selector: 'hello-world',
  //template: 'hello world!!!'
  templateUrl: 'hello-world.html'
}).Class({
  constructor: function() {}
});



ng.platformBrowserDynamic.bootstrap(HelloWorldComponent);
