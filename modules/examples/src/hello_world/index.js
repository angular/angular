import *  as app from './index_common';
import {reflector} from 'reflection/reflection';
import {ReflectionCapabilities} from 'reflection/reflection_capabilities';

export function main() {
  // Initializing the reflector is only required for the Dart version of the application.
  // When using Dart, the reflection information is not embedded by default in the source code
  // to keep the size of the generated file small. Importing ReflectionCapabilities and initializing
  // the reflector is required to use the reflection information from Dart mirrors.
  // Dart mirrors are not intended to be use in production code where the transformers generate a
  // more optimal static configuration, see index_static.js for an example.
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  app.main();
}
