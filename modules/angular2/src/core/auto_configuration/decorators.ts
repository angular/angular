import {
  ConfigurationMetadata,
  AutoconfiguredMetadata,
} from './metadata';
import {makeDecorator, TypeDecorator} from '../util/decorators';

/**
 * Factory for creating {@link ConfigurationMetadata}.
 */
export interface ConfigurationFactory {
  (): any;
  new (): ConfigurationMetadata;
}

/**
 * Factory for creating {@link AutoconfiguredMetadata}.
 */
export interface AutoconfiguredFactory {
  (): any;
  new (): AutoconfiguredMetadata;
}

/**
 * Factory for creating {@link ConfigurationMetadata}.
 */
export var Configuration: ConfigurationFactory =
    <ConfigurationFactory>makeDecorator(ConfigurationMetadata);

/**
 * Factory for creating {@link AutoconfiguredMetadata}.
 */
export var Autoconfigured: AutoconfiguredFactory =
    <AutoconfiguredFactory>makeDecorator(AutoconfiguredMetadata);
