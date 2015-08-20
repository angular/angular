import {StringMap} from "angular2/src/core/facade/collection";

// no deserialization is necessary in TS.
// This is only here to match dart interface
export function deserializeGenericEvent(serializedEvent: StringMap<string, any>):
    StringMap<string, any> {
  return serializedEvent;
}
