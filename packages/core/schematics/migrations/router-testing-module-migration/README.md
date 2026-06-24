# RouterTestingModule Migration

This migration automatically converts deprecated `RouterTestingModule` usages to the recommended modern APIs.

## What it does

- Replaces `RouterTestingModule.withRoutes([...])` with `RouterModule.forRoot([...])` for NgModule tests
- Replaces `RouterTestingModule` with `RouterModule.forRoot([])` when no routes are provided
- For standalone tests (detected by presence of `providers`), moves to `provideRouter([...])` instead
- Updates import statements to use `@angular/router` instead of `@angular/router/testing`
- Preserves other imports and test configuration

## Files

- `router_testing_module_migration.ts` - Main migration logic using TsurgeFunnelMigration
- `index.ts` - Entry point for the schematic
- `../../test/router_testing_to_provide_router_spec.ts` - Comprehensive test suite
- `MIGRATION_NOTES.md` - Detailed documentation with examples
- `BUILD.bazel` - Bazel build configuration

## Running the migration

The migration runs automatically as part of `ng update @angular/core` for v21.0.0+.

To run manually:

```bash
ng update @angular/core --migrate-only router-testing-to-provide-router
```

## Related

- Issue: angular/angular#54853
- Deprecation: angular/angular#54466
