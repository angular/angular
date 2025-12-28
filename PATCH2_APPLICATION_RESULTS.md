# Patch 2 Application Results: TypeScript 5.9 Compatibility

**Date:** 2025-01-14  
**Patch:** `compiler-cli-ts59-compatibility (1).patch`  
**Status:** ✅ Successfully Applied (with manual fixes required)

## Summary

The second TypeScript 5.9 compatibility patch was successfully applied to the Angular codebase. The build completed successfully after restoring several critical runtime exports that the patch had removed from the imports module public API. Test results are identical to the first patch: **13 failures out of 6150 specs**.

## Build Status

### ✅ Build Successful

- All packages compiled without errors after export fixes
- Compiler-CLI package built successfully: `//packages/compiler-cli:npm_package`
- Full build completed: `pnpm run build`

### Export Fixes Applied

The patch removed runtime-essential exports from `/packages/compiler-cli/src/ngtsc/imports/index.ts`. These were restored:

**From `./src/alias`:**

- ❌ Removed: `AliasingHost`
- ✅ Restored: Added back to exports (required by alias/strategy code at runtime)

**From `./src/core`:**

- ❌ Removed: `ImportRewriter`
- ✅ Restored: Added back to exports (interface used by ngtsc-translator)

**From `./src/references`:**

- ❌ Removed: `OwningModule` (critical)
- ✅ Restored: Added back (used by ngtsc/metadata and translator at runtime)

**From `./src/reexport`:**

- ❌ Removed: `Reexport`
- ✅ Restored: Exported from correct source file

**From `./src/emitter`:**

- ❌ Removed: `ImportedFile`, `EmittedReference`, `FailedEmitResult`, `ReferenceEmitStrategy`
- ✅ Restored: All added back to exports (used by annotations/common and compiler core)

### Complete Updated Exports

```typescript
// src/alias - export runtime classes and interfaces
export {
  AliasingHost,
  AliasStrategy,
  PrivateExportAliasingHost,
  UnifiedModulesAliasingHost,
} from './src/alias';

// src/core - export ImportRewriter interface
export {
  ImportRewriter,
  NoopImportRewriter,
  R3SymbolsImportRewriter,
  validateAndRewriteCoreSymbol,
} from './src/core';

// src/emitter - export all strategy types and result interfaces
export {
  ImportFlags,
  ImportedFile,
  ReferenceEmitKind,
  ReferenceEmitStrategy,
  EmittedReference,
  FailedEmitResult,
  assertSuccessfulReferenceEmit,
  ReferenceEmitter,
  LocalIdentifierStrategy,
  AbsoluteModuleStrategy,
  LogicalProjectStrategy,
  RelativePathStrategy,
  UnifiedModulesStrategy,
} from './src/emitter';

// src/references - export OwningModule interface
export {OwningModule, Reference} from './src/references';

// src/reexport - export Reexport interface
export {Reexport} from './src/reexport';
```

## Test Results

### Overall Statistics

- **Total Specs:** 6,150
- **Failures:** 13
- **Pending:** 12
- **Duration:** ~120 seconds
- **Result:** FAILED ❌

### Test Failure Details

All 13 failures are in build mode and project references functionality:

#### 1. Parser/Generics Errors (5 failures)

**Tests:**

- `<<FileSystem: Native>> ngtsc build mode (project references) builds referenced projects with -b and produces .tsbuildinfo`
- `<<FileSystem: OS/X>> ngtsc build mode (project references) builds referenced projects with -b and produces .tsbuildinfo`
- `<<FileSystem: Unix>> ngc build mode (project references) builds referenced projects with -b and produces .tsbuildinfo`
- `<<FileSystem: Windows>> ngc build mode (project references) builds referenced projects with -b and produces .tsbuildinfo`
- `<<FileSystem: Native>> ngc build mode (project references) builds referenced projects with -b and produces .tsbuildinfo`

**Error Type:** `parseProjectReferenceConfigFile` Debug Failure  
**Stack Trace:**

```
Error: Debug Failure.
at parseProjectReferenceConfigFile
  (/node_modules/typescript/lib/typescript.js:129020:26)
at createProgram
  (/node_modules/typescript/lib/typescript.js:127094:55)
at getBuilderCreationParameters
  (/node_modules/typescript/lib/typescript.js:131531:18)
at Object.createEmitAndSemanticDiagnosticsBuilderProgram
  (/node_modules/typescript/lib/typescript.js:132199:5)
at Object.createNgcBuilderProgram [as createProgram]
  (./packages/compiler-cli/src/build_mode.ts:584:31)
```

**Root Cause:** Issue in TypeScript's `parseProjectReferenceConfigFile` during program creation. Related to how `build_mode.ts:584` is calling TypeScript's builder API.

#### 2. Version Tracking / tsbuildinfo Issues (4 failures)

**Tests:**

- `<<FileSystem: Native>> ngc build mode (project references) produces .tsbuildinfo for single-project incremental builds`
- `<<FileSystem: OS/X>> ngc build mode (project references) produces .tsbuildinfo for single-project incremental builds`
- `<<FileSystem: Unix>> ngc build mode (project references) produces .tsbuildinfo for single-project incremental builds`
- `<<FileSystem: Windows>> ngc build mode (project references) produces .tsbuildinfo for single-project incremental builds`

**Errors:**

```
Expected 1 to be 0.  (at build_mode_spec.ts:135)
Expected spy consoleError not to have been called.  (at build_mode_spec.ts:136)
Expected false to be true.  (at build_mode_spec.ts:139)
```

**Root Cause:** Source file versioning not being correctly tracked in incremental builds. The `.tsbuildinfo` file is not being generated or validated correctly.

#### 3. Diagnostics Discovery Issues (2 failures)

**Tests:**

- `<<FileSystem: Windows>> ngc build mode (project references) fails the build when Angular diagnostics are present`
- `<<FileSystem: Native>> ngc build mode (project references) fails the build when Angular diagnostics are present`

**Error:** Missing global type definitions and library files

```
error TS2318: Cannot find global type 'Array'
error TS2318: Cannot find global type 'Boolean'
...
error TS6053: File '...lib.dom.d.ts' not found
error TS6053: File '...lib.es2015.d.ts' not found
```

**Root Cause:** Library resolution issue in builder context, possibly related to source file versioning affecting lib file discovery.

#### 4. tsbuildinfo Recovery (1 failure)

**Test:** `build mode tsbuildinfo recovery prefers diagnostic fileName when it points at a tsbuildinfo file`

**Error:**

```
Expected null to be '/tmp/p/.tsbuildinfo'.
(at build_mode_tsbuildinfo_recovery_spec.ts:50)
```

**Root Cause:** Recovery logic not finding or validating the `.tsbuildinfo` file correctly.

### Pending Tests (12 specs)

Tests disabled with `xit` - not counted in failures:

- 4x initializer-based model() API tests
- 4x undecorated providers tests
- 4x template source-mapping tests

## Comparison: Patch 1 vs Patch 2

| Metric                | Patch 1 | Patch 2 |
| --------------------- | ------- | ------- |
| Build Success         | ✅ Yes  | ✅ Yes  |
| Export Fixes Required | ✅ Yes  | ✅ Yes  |
| Test Failures         | 13      | 13      |
| Failure Categories    | Same    | Same    |
| Test Duration         | ~120s   | ~120s   |

**Conclusion:** Both patches have identical test results. The failures are inherent to the TypeScript 5.9 compatibility changes, specifically in build mode and project references handling.

## Issues Identified

### Issue 1: Aggressive Export Removal

Both patches remove exports claiming they are "type-only" without fully verifying runtime usage. The comment states:

```typescript
// Export runtime classes from alias; do not re-export the `AliasingHost` interface
// which is type-only and causes ESM runtime export errors.
```

However, the following are NOT type-only and ARE used at runtime:

- `OwningModule` (interface, but used in Reference construction)
- `ImportRewriter` (interface, but implemented by real classes)
- `Reexport` (interface, used by scope analysis)
- `ImportedFile` (type alias, used in emitted references)
- `ReferenceEmitStrategy` (interface, used by multiple strategies)
- `EmittedReference`, `FailedEmitResult` (interfaces, used as return types)

### Issue 2: Build Mode Source File Versioning

The new `build_mode.ts` changes add source file versioning to support TypeScript's builder API, but there appear to be edge cases:

- Project reference parsing fails in some test scenarios
- tsbuildinfo generation/recovery is unreliable
- Version strings may not be properly propagated to all files

### Issue 3: No Improvement Over Patch 1

Despite being a different patch, it produces identical test failures, suggesting the underlying TypeScript 5.9 compatibility issues are more fundamental than what these patches address.

## Files Modified

1. **patches/compiler-cli-ts59-compatibility (1).patch**
   - Applied successfully
   - Modified build_mode.ts
   - Modified exports in index.ts (required restoration)

2. **packages/compiler-cli/src/ngtsc/imports/index.ts**
   - Modified to restore removed exports
   - 5 export statements updated/added

## Recommendations

1. **Verify Export Necessity:** Audit which exports are actually type-only vs. runtime-required before removal
2. **Investigate Build Mode Issues:** Focus on `build_mode.ts:584` and the builder API integration
3. **Review TypeScript 5.9 Changes:** Check TypeScript 5.9 release notes for breaking changes to:
   - Project reference handling
   - Source file versioning in builder context
   - `.tsbuildinfo` file format/handling
4. **Consider Alternative Approaches:**
   - Lazy load problematic exports instead of removing them
   - Implement polyfills for changed TypeScript APIs
   - Check if TypeScript 5.9.3 has patches for known builder API issues

## Test Log

Complete test output saved to: `/tmp/test_results_patch2.log` (325 lines)

### Key Excerpts from Log

All 13 failures point to TypeScript 5.9.3's builder and project reference implementation:

- parseProjectReferenceConfigFile failures in 5 tests
- tsbuildinfo generation failures in 4 tests
- Diagnostic library resolution failures in 2 tests
- tsbuildinfo recovery failures in 1 test

The "Debug Failure" errors suggest TypeScript's internal validation is detecting invalid state when handling project references in the builder context.

## Conclusion

Patch 2 application was successful from a build perspective but revealed no improvements over Patch 1. Both patches:

- Successfully compile after export restoration
- Produce identical test failures (13)
- Fail on the same build mode and project reference tests
- Indicate the root issue is in how source file versioning interacts with TypeScript's builder API in version 5.9

The fixes needed likely require deeper investigation into TypeScript 5.9's breaking changes or a different architectural approach to the builder API integration.
