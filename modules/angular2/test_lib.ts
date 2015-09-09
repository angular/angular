// Test library and utilities for internal use.
export * from './test';
export * from './src/test_lib/utils';
export * from './src/test_lib/fake_async';
export {ComponentRef, HostViewRef} from './src/core/compiler';

// This interface is referenced by TestComponents, however we can't export it directly from router
// because router pulls in dart:html & dart:js and we import test_lib in standalone VM tests
// so we re-create the interface here.
export interface InjectableReference {}
