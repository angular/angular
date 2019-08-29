### Unit tests for Angular CDK/Material

Currently, all changes to Ivy are validated against the test suite of the
`angular/components` repository. Known failing tests are skipped based on
the blocklist in `tools/material-ci/test-blocklist.ts`.

Whenever the root cause of a known failure is identified, the `notes` field
for the corresponding tests should be updated. Whenever a failure is resolved,
the corresponding tests should be removed from the blocklist.

### Debugging

Information on debugging can be found [here](../../docs/DEBUG_MATERIAL_IVY.md).

### Excluding new tests

In case there are any tests in the components test suite that fail due to
recent changes in the framework and you want to exclude the tests temporarily,
a new entry can be added to the `test-blocklist.ts` file.

Each property in the blocklist object corresponds to a test in the components
repository. The name of the property **must** match the exact test name. Additionally
it's **recommended** that every entry has a field with a note on why the test is disabled.

```ts
export const testBlocklist: any = {
  'MatSlider should be able to drag thumb': {
    error: 'Cannot register event "dragstart".',
    notes: 'Breaking change where HammerJS module needs to be imported.'
  }
}
```