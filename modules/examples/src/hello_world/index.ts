import {HelloCmp} from './index_common';
import {bootstrap} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

export function main() {
  // For Dart users: Initializing the reflector is only required for the Dart version of the
  // application. When using Dart, the reflection information is not embedded by default in the
  // source code to keep the size of the generated file small. Importing ReflectionCapabilities and
  // initializing the reflector is required to use the reflection information from Dart mirrors.
  // Dart mirrors are not intended to be use in production code.
  // Angular 2 provides a transformer which generates static code rather than rely on reflection.
  // For an example, run `pub serve` on the Dart application and inspect this file in your browser.
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  // Bootstrapping only requires specifying a root component.
  // The boundary between the Angular application and the rest of the page is
  // the shadowDom of this root component.
  // The selector of the component passed in is used to find where to insert the
  // application.
  // You can use the light dom of the <hello-app> tag as temporary content (for
  // example 'Loading...') before the application is ready.
  bootstrap(HelloCmp);
}
