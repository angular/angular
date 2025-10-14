/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../../errors';
import {ReflectionCapabilities} from '../../reflection/reflection_capabilities';
import {Host, Inject, Optional, Self, SkipSelf} from '../metadata';
import {Attribute} from '../metadata_attr';
let _reflect = null;
export function getReflect() {
  return (_reflect = _reflect || new ReflectionCapabilities());
}
export function reflectDependencies(type) {
  return convertDependencies(getReflect().parameters(type));
}
export function convertDependencies(deps) {
  return deps.map((dep) => reflectDependency(dep));
}
function reflectDependency(dep) {
  const meta = {
    token: null,
    attribute: null,
    host: false,
    optional: false,
    self: false,
    skipSelf: false,
  };
  if (Array.isArray(dep) && dep.length > 0) {
    for (let j = 0; j < dep.length; j++) {
      const param = dep[j];
      if (param === undefined) {
        // param may be undefined if type of dep is not set by ngtsc
        continue;
      }
      const proto = Object.getPrototypeOf(param);
      if (param instanceof Optional || proto.ngMetadataName === 'Optional') {
        meta.optional = true;
      } else if (param instanceof SkipSelf || proto.ngMetadataName === 'SkipSelf') {
        meta.skipSelf = true;
      } else if (param instanceof Self || proto.ngMetadataName === 'Self') {
        meta.self = true;
      } else if (param instanceof Host || proto.ngMetadataName === 'Host') {
        meta.host = true;
      } else if (param instanceof Inject) {
        meta.token = param.token;
      } else if (param instanceof Attribute) {
        if (param.attributeName === undefined) {
          throw new RuntimeError(
            204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */,
            ngDevMode && `Attribute name must be defined.`,
          );
        }
        meta.attribute = param.attributeName;
      } else {
        meta.token = param;
      }
    }
  } else if (dep === undefined || (Array.isArray(dep) && dep.length === 0)) {
    meta.token = null;
  } else {
    meta.token = dep;
  }
  return meta;
}
//# sourceMappingURL=util.js.map
