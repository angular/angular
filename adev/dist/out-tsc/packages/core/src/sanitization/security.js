/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
 * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
 * handled.
 *
 * See DomSanitizer for more details on security in Angular applications.
 *
 * @publicApi
 */
export var SecurityContext;
(function (SecurityContext) {
  SecurityContext[(SecurityContext['NONE'] = 0)] = 'NONE';
  SecurityContext[(SecurityContext['HTML'] = 1)] = 'HTML';
  SecurityContext[(SecurityContext['STYLE'] = 2)] = 'STYLE';
  SecurityContext[(SecurityContext['SCRIPT'] = 3)] = 'SCRIPT';
  SecurityContext[(SecurityContext['URL'] = 4)] = 'URL';
  SecurityContext[(SecurityContext['RESOURCE_URL'] = 5)] = 'RESOURCE_URL';
})(SecurityContext || (SecurityContext = {}));
//# sourceMappingURL=security.js.map
