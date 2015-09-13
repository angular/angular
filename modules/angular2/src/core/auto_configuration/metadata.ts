import {CONST, stringify} from "angular2/src/core/facade/lang";

/**
 * A configuration metadata that specifies a configuration object with it's priority.
 *
 * ```
 * @Configuration
 * class SomeConfigurationClass {
 *   constructor() {}
 * }
 * ```
 */

@CONST()
export class ConfigurationMetadata {
  constructor() {}
  toString(): string { return `@Configuration()`; }
}

/**
 * A Autoconfiged metadata that specifies a component that should be configured and bootstrapped
 * automatically.
 *
 * ```
 * @Autoconfigured
 * @Component
 * class SomeComponent {
 *   constructor() {}
 * }
 * ```
 */

@CONST()
export class AutoconfiguredMetadata {
  constructor() {}
  toString(): string { return `@Autoconfigured()`; }
}
