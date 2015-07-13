import {
  InjectMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  VisibilityMetadata,
  AncestorMetadata,
  UnboundedMetadata
} from './metadata';
import {makeDecorator, makeParamDecorator, TypeDecorator} from '../util/decorators';

/**
 * Factory for creating {@link InjectMetadata}.
 */
export interface InjectFactory {
  (token: any): any;
  new (token: any): InjectMetadata;
}

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export interface OptionalFactory {
  (): any;
  new (): OptionalMetadata;
}

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export interface InjectableFactory {
  (): any;
  new (): InjectableMetadata;
}

/**
 * Factory for creating {@link SelfMetadata}.
 */
export interface SelfFactory {
  (): any;
  new (): SelfMetadata;
}

/**
 * Factory for creating {@link AncestorMetadata}.
 */
export interface AncestorFactory {
  (visibility?: {self: boolean}): any;
  new (visibility?: {self: boolean}): AncestorMetadata;
}

/**
 * Factory for creating {@link UnboundedMetadata}.
 */
export interface UnboundedFactory {
  (visibility?: {self: boolean}): any;
  new (visibility?: {self: boolean}): UnboundedMetadata;
}

/**
 * Factory for creating {@link InjectMetadata}.
 */
export var Inject: InjectFactory = makeParamDecorator(InjectMetadata);

/**
 * Factory for creating {@link OptionalMetadata}.
 */
export var Optional: OptionalFactory = makeParamDecorator(OptionalMetadata);

/**
 * Factory for creating {@link InjectableMetadata}.
 */
export var Injectable: InjectableFactory = <InjectableFactory>makeDecorator(InjectableMetadata);

/**
 * Factory for creating {@link SelfMetadata}.
 */
export var Self: SelfFactory = makeParamDecorator(SelfMetadata);

/**
 * Factory for creating {@link AncestorMetadata}.
 */
export var Ancestor: AncestorFactory = makeParamDecorator(AncestorMetadata);

/**
 * Factory for creating {@link UnboundedMetadata}.
 */
export var Unbounded: UnboundedFactory = makeParamDecorator(UnboundedMetadata);