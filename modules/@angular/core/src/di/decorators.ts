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
 * @stable
 */
export interface InjectMetadataFactory {
  (token: any): any;
  new (token: any): InjectMetadata;
}

/**
 * Factory for creating {@link OptionalMetadata}.
 * @stable
 */
export interface OptionalMetadataFactory {
  (): any;
  new (): OptionalMetadata;
}

/**
 * Factory for creating {@link InjectableMetadata}.
 * @stable
 */
export interface InjectableMetadataFactory {
  (): any;
  new (): InjectableMetadata;
}

/**
 * Factory for creating {@link SelfMetadata}.
 * @stable
 */
export interface SelfMetadataFactory {
  (): any;
  new (): SelfMetadata;
}

/**
 * Factory for creating {@link HostMetadata}.
 * @stable
 */
export interface HostMetadataFactory {
  (): any;
  new (): HostMetadata;
}

/**
 * Factory for creating {@link SkipSelfMetadata}.
 * @stable
 */
export interface SkipSelfMetadataFactory {
  (): any;
  new (): SkipSelfMetadata;
}

/**
 * Factory for creating {@link InjectMetadata}.
 * @stable
 */
export var Inject: InjectMetadataFactory = makeParamDecorator(InjectMetadata);

/**
 * Factory for creating {@link OptionalMetadata}.
 * @stable
 */
export var Optional: OptionalMetadataFactory = makeParamDecorator(OptionalMetadata);

/**
 * Factory for creating {@link InjectableMetadata}.
 * @stable
 */
export var Injectable: InjectableMetadataFactory =
    <InjectableMetadataFactory>makeDecorator(InjectableMetadata);

/**
 * Factory for creating {@link SelfMetadata}.
 * @stable
 */
export var Self: SelfMetadataFactory = makeParamDecorator(SelfMetadata);

/**
 * Factory for creating {@link HostMetadata}.
 * @stable
 */
export var Host: HostMetadataFactory = makeParamDecorator(HostMetadata);

/**
 * Factory for creating {@link SkipSelfMetadata}.
 * @stable
 */
export var SkipSelf: SkipSelfMetadataFactory = makeParamDecorator(SkipSelfMetadata);
