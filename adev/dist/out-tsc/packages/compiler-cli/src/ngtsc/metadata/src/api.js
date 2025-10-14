/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Disambiguates different kinds of compiler metadata objects.
 */
export var MetaKind;
(function (MetaKind) {
  MetaKind[(MetaKind['Directive'] = 0)] = 'Directive';
  MetaKind[(MetaKind['Pipe'] = 1)] = 'Pipe';
  MetaKind[(MetaKind['NgModule'] = 2)] = 'NgModule';
})(MetaKind || (MetaKind = {}));
/**
 * Possible ways that a directive can be matched.
 */
export var MatchSource;
(function (MatchSource) {
  /** The directive was matched by its selector. */
  MatchSource[(MatchSource['Selector'] = 0)] = 'Selector';
  /** The directive was applied as a host directive. */
  MatchSource[(MatchSource['HostDirective'] = 1)] = 'HostDirective';
})(MatchSource || (MatchSource = {}));
//# sourceMappingURL=api.js.map
