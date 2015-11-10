/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
library angular2.src.core.di;

export "di/metadata.dart"
    show
        InjectMetadata,
        OptionalMetadata,
        InjectableMetadata,
        SelfMetadata,
        HostMetadata,
        SkipSelfMetadata,
        DependencyMetadata;
// we have to reexport * because Dart and TS export two different sets of types
export "di/decorators.dart";
export "di/forward_ref.dart" show forwardRef, resolveForwardRef, ForwardRefFn;
export "di/injector.dart" show Injector;
export "di/provider.dart"
    show
        Binding,
        ProviderBuilder,
        ResolvedBinding,
        ResolvedFactory,
        Dependency,
        bind,
        Provider,
        ResolvedProvider,
        provide;
export "di/key.dart" show Key, TypeLiteral;
export "di/exceptions.dart"
    show
        NoProviderError,
        AbstractProviderError,
        CyclicDependencyError,
        InstantiationError,
        InvalidProviderError,
        NoAnnotationError,
        OutOfBoundsError;
export "di/opaque_token.dart" show OpaqueToken;
