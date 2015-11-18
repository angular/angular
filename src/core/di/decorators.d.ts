import { InjectMetadata, OptionalMetadata, InjectableMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata } from './metadata';
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
 * Factory for creating {@link HostMetadata}.
 */
export interface HostFactory {
    (): any;
    new (): HostMetadata;
}
/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export interface SkipSelfFactory {
    (): any;
    new (): SkipSelfMetadata;
}
/**
 * Factory for creating {@link InjectMetadata}.
 */
export declare var Inject: InjectFactory;
/**
 * Factory for creating {@link OptionalMetadata}.
 */
export declare var Optional: OptionalFactory;
/**
 * Factory for creating {@link InjectableMetadata}.
 */
export declare var Injectable: InjectableFactory;
/**
 * Factory for creating {@link SelfMetadata}.
 */
export declare var Self: SelfFactory;
/**
 * Factory for creating {@link HostMetadata}.
 */
export declare var Host: HostFactory;
/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
export declare var SkipSelf: SkipSelfFactory;
