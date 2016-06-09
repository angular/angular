import {BaseException} from '../src/facade/exceptions';
import {assertionsEnabled, isArray, isBlank, isString} from '../src/facade/lang';

export function assertArrayOfStrings(identifier: string, value: any) {
  if (!assertionsEnabled() || isBlank(value)) {
    return;
  }
  if (!isArray(value)) {
    throw new BaseException(`Expected '${identifier}' to be an array of strings.`);
  }
  for (var i = 0; i < value.length; i += 1) {
    if (!isString(value[i])) {
      throw new BaseException(`Expected '${identifier}' to be an array of strings.`);
    }
  }
}
