/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The list of error codes used in runtime code of the `forms` package.
 * Reserved error code range: 1900-1999.
 */
export const enum SignalFormsErrorCode {
  // Signal Forms errors (1900-1999)
  PATH_NOT_IN_FIELD_TREE = 1900,
  PATH_RESOLUTION_FAILED = 1901,
  ORPHAN_FIELD_PROPERTY = 1902,
  ORPHAN_FIELD_ARRAY = 1903,
  ORPHAN_FIELD_NOT_FOUND = 1904,
  ROOT_FIELD_NO_PARENT = 1905,
  PARENT_NOT_ARRAY = 1906,
  ABSTRACT_CONTROL_IN_FORM = 1907,
  PATH_OUTSIDE_SCHEMA = 1908,
  UNKNOWN_BUILDER_TYPE = 1909,
  UNKNOWN_STATUS = 1910,
  COMPAT_NO_CHILDREN = 1911,
  MANAGED_METADATA_LAZY_CREATION = 1912,
  BINDING_ALREADY_REGISTERED = 1913,
  INVALID_FIELD_DIRECTIVE_HOST = 1914,
}
