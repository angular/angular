/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function(global: any) {
  writeScriptTag('/vendor/zone.js');
  writeScriptTag('/vendor/system.js');
  writeScriptTag('/vendor/Reflect.js');
  writeScriptTag('/_common/system-config.js');
  if (location.pathname.indexOf('/upgrade/') != -1) {
    writeScriptTag('/vendor/angular.js');
  }

  function writeScriptTag(scriptUrl: string, onload: string = '') {
    document.write('<script src="' + scriptUrl + '" onload="' + onload + '"></script>');
  }
}(window));
