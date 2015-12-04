'use strict';/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var metadata_1 = require('./di/metadata');
exports.InjectMetadata = metadata_1.InjectMetadata;
exports.OptionalMetadata = metadata_1.OptionalMetadata;
exports.InjectableMetadata = metadata_1.InjectableMetadata;
exports.SelfMetadata = metadata_1.SelfMetadata;
exports.HostMetadata = metadata_1.HostMetadata;
exports.SkipSelfMetadata = metadata_1.SkipSelfMetadata;
exports.DependencyMetadata = metadata_1.DependencyMetadata;
// we have to reexport * because Dart and TS export two different sets of types
__export(require('./di/decorators'));
var forward_ref_1 = require('./di/forward_ref');
exports.forwardRef = forward_ref_1.forwardRef;
exports.resolveForwardRef = forward_ref_1.resolveForwardRef;
var injector_1 = require('./di/injector');
exports.Injector = injector_1.Injector;
var provider_1 = require('./di/provider');
exports.Binding = provider_1.Binding;
exports.ProviderBuilder = provider_1.ProviderBuilder;
exports.ResolvedFactory = provider_1.ResolvedFactory;
exports.Dependency = provider_1.Dependency;
exports.bind = provider_1.bind;
exports.Provider = provider_1.Provider;
exports.provide = provider_1.provide;
var key_1 = require('./di/key');
exports.Key = key_1.Key;
exports.TypeLiteral = key_1.TypeLiteral;
var exceptions_1 = require('./di/exceptions');
exports.NoProviderError = exceptions_1.NoProviderError;
exports.AbstractProviderError = exceptions_1.AbstractProviderError;
exports.CyclicDependencyError = exceptions_1.CyclicDependencyError;
exports.InstantiationError = exceptions_1.InstantiationError;
exports.InvalidProviderError = exceptions_1.InvalidProviderError;
exports.NoAnnotationError = exceptions_1.NoAnnotationError;
exports.OutOfBoundsError = exceptions_1.OutOfBoundsError;
var opaque_token_1 = require('./di/opaque_token');
exports.OpaqueToken = opaque_token_1.OpaqueToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHOzs7O0FBRUgseUJBUU8sZUFBZSxDQUFDO0FBUHJCLG1EQUFjO0FBQ2QsdURBQWdCO0FBQ2hCLDJEQUFrQjtBQUNsQiwrQ0FBWTtBQUNaLCtDQUFZO0FBQ1osdURBQWdCO0FBQ2hCLDJEQUNxQjtBQUV2QiwrRUFBK0U7QUFDL0UsaUJBQWMsaUJBQWlCLENBQUMsRUFBQTtBQUVoQyw0QkFBMEQsa0JBQWtCLENBQUM7QUFBckUsOENBQVU7QUFBRSw0REFBeUQ7QUFDN0UseUJBQXVCLGVBQWUsQ0FBQztBQUEvQix1Q0FBK0I7QUFDdkMseUJBV08sZUFBZSxDQUFDO0FBVnJCLHFDQUFPO0FBQ1AscURBQWU7QUFFZixxREFBZTtBQUNmLDJDQUFVO0FBQ1YsK0JBQUk7QUFFSix1Q0FBUTtBQUVSLHFDQUNxQjtBQUN2QixvQkFBK0IsVUFBVSxDQUFDO0FBQWxDLHdCQUFHO0FBQUUsd0NBQTZCO0FBQzFDLDJCQVFPLGlCQUFpQixDQUFDO0FBUHZCLHVEQUFlO0FBQ2YsbUVBQXFCO0FBQ3JCLG1FQUFxQjtBQUNyQiw2REFBa0I7QUFDbEIsaUVBQW9CO0FBQ3BCLDJEQUFpQjtBQUNqQix5REFDdUI7QUFDekIsNkJBQTBCLG1CQUFtQixDQUFDO0FBQXRDLGlEQUFzQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgYGRpYCBtb2R1bGUgcHJvdmlkZXMgZGVwZW5kZW5jeSBpbmplY3Rpb24gY29udGFpbmVyIHNlcnZpY2VzLlxuICovXG5cbmV4cG9ydCB7XG4gIEluamVjdE1ldGFkYXRhLFxuICBPcHRpb25hbE1ldGFkYXRhLFxuICBJbmplY3RhYmxlTWV0YWRhdGEsXG4gIFNlbGZNZXRhZGF0YSxcbiAgSG9zdE1ldGFkYXRhLFxuICBTa2lwU2VsZk1ldGFkYXRhLFxuICBEZXBlbmRlbmN5TWV0YWRhdGFcbn0gZnJvbSAnLi9kaS9tZXRhZGF0YSc7XG5cbi8vIHdlIGhhdmUgdG8gcmVleHBvcnQgKiBiZWNhdXNlIERhcnQgYW5kIFRTIGV4cG9ydCB0d28gZGlmZmVyZW50IHNldHMgb2YgdHlwZXNcbmV4cG9ydCAqIGZyb20gJy4vZGkvZGVjb3JhdG9ycyc7XG5cbmV4cG9ydCB7Zm9yd2FyZFJlZiwgcmVzb2x2ZUZvcndhcmRSZWYsIEZvcndhcmRSZWZGbn0gZnJvbSAnLi9kaS9mb3J3YXJkX3JlZic7XG5leHBvcnQge0luamVjdG9yfSBmcm9tICcuL2RpL2luamVjdG9yJztcbmV4cG9ydCB7XG4gIEJpbmRpbmcsXG4gIFByb3ZpZGVyQnVpbGRlcixcbiAgUmVzb2x2ZWRCaW5kaW5nLFxuICBSZXNvbHZlZEZhY3RvcnksXG4gIERlcGVuZGVuY3ksXG4gIGJpbmQsXG5cbiAgUHJvdmlkZXIsXG4gIFJlc29sdmVkUHJvdmlkZXIsXG4gIHByb3ZpZGVcbn0gZnJvbSAnLi9kaS9wcm92aWRlcic7XG5leHBvcnQge0tleSwgVHlwZUxpdGVyYWx9IGZyb20gJy4vZGkva2V5JztcbmV4cG9ydCB7XG4gIE5vUHJvdmlkZXJFcnJvcixcbiAgQWJzdHJhY3RQcm92aWRlckVycm9yLFxuICBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsXG4gIEluc3RhbnRpYXRpb25FcnJvcixcbiAgSW52YWxpZFByb3ZpZGVyRXJyb3IsXG4gIE5vQW5ub3RhdGlvbkVycm9yLFxuICBPdXRPZkJvdW5kc0Vycm9yXG59IGZyb20gJy4vZGkvZXhjZXB0aW9ucyc7XG5leHBvcnQge09wYXF1ZVRva2VufSBmcm9tICcuL2RpL29wYXF1ZV90b2tlbic7XG4iXX0=