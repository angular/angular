import assert from 'node:assert';

(async () => {
  // Verify that TypeScript is not installed.
  await assert.rejects(
    () => import('typescript'),
    ({code, message}) => {
      assert.strictEqual(code, 'ERR_MODULE_NOT_FOUND');
      assert.match(message, new RegExp(`Cannot find package 'typescript'`));

      return true;
    },
  );

  // This validates that the linker has no dependency on TypeScript.
  await import('@angular/compiler-cli/linker');
  await import('@angular/compiler-cli/linker/babel');
})();
