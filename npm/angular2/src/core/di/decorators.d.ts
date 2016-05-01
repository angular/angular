import { InjectMetadata, OptionalMetadata, InjectableMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata } from './metadata';
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
export declare var Inject: InjectMetadataFactory;
/**
 * Factory for creating {@link OptionalMetadata}.
 */
export declare var Optional: OptionalMetadataFactory;
/**
 * Factory for creating {@link InjectableMetadata}.
 */
export declare var Injectable: InjectableMetadataFactory;
/**
 * Factory for creating {@link SelfMetadata}.
 */
export declare var Self: SelfMetadataFactory;
/**
 * Factory for creating {@link HostMetadata}.
 */
export declare var Host: HostMetadataFactory;
/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export declare var SkipSelf: SkipSelfMetadataFactory;
