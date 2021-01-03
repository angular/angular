/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../lib/common/error-rewrite';

// import 'core-js/features/set';
// import 'core-js/features/map';
// List all tests here:
import './common_tests';
import './browser/browser.spec';
import './browser/define-property.spec';
import './browser/element.spec';
import './browser/FileReader.spec';
// import './browser/geolocation.spec.manual';
import './browser/HTMLImports.spec';
import './browser/MutationObserver.spec';
import './browser/registerElement.spec';
import './browser/requestAnimationFrame.spec';
import './browser/WebSocket.spec';
import './browser/XMLHttpRequest.spec';
import './browser/MediaQuery.spec';
import './browser/Notification.spec';
import './browser/Worker.spec';
import './mocha-patch.spec';
import './jasmine-patch.spec';
import './browser/messageport.spec';
import './extra/cordova.spec';
import './browser/queue-microtask.spec';
