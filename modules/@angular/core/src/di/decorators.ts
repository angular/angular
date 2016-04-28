import {
  InjectMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata
} from './metadata';
import {makeDecorator, makeParamDecorator} from '../util/decorators';

/**
 * Factory for creating {@link InjectMetadata}.
 */
export interface InjectMetadataFactory {
  (token: any): any;
  new (token: any): InjectMetadata;
}

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export interface OptionalMetadataFactory {
  (): any;
  new (): OptionalMetadata;
}

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export interface InjectableMetadataFactory {
  (): any;
  new (): InjectableMetadata;
}

/**
 * Factory for creating {@link SelfMetadata}.
 */
export interface SelfMetadataFactory {
  (): any;
  new (): SelfMetadata;
}

/**
 * Factory for creating {@link HostMetadata}.
 */
export interface HostMetadataFactory {
  (): any;
  new (): HostMetadata;
}

/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export interface SkipSelfMetadataFactory {
  (): any;
  new (): SkipSelfMetadata;
}

/**
 * Factory for creating {@link InjectMetadata}.
 */
export var Inject: InjectMetadataFactory = makeParamDecorator(InjectMetadata);

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export var Optional: OptionalMetadataFactory = makeParamDecorator(OptionalMetadata);

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export var Injectable: InjectableMetadataFactory =
    <InjectableMetadataFactory>makeDecorator(InjectableMetadata);

/**
 * Factory for creating {@link SelfMetadata}.
 */
export var Self: SelfMetadataFactory = makeParamDecorator(SelfMetadata);

/**
 * Factory for creating {@link HostMetadata}.
 */
export var Host: HostMetadataFactory = makeParamDecorator(HostMetadata);

/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export var SkipSelf: SkipSelfMetadataFactory = makeParamDecorator(SkipSelfMetadata);