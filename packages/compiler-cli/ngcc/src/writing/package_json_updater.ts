/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath, FileSystem, dirname} from '../../../src/ngtsc/file_system';
import {JsonObject, JsonValue} from '../packages/entry_point';


export type PackageJsonChange = [string[], JsonValue];
export type WritePackageJsonChangesFn =
    (changes: PackageJsonChange[], packageJsonPath: AbsoluteFsPath, parsedJson?: JsonObject) =>
        void;

/**
 * A utility object that can be used to safely update values in a `package.json` file.
 *
 * Example usage:
 * ```ts
 * const updatePackageJson = packageJsonUpdater
 *     .createUpdate()
 *     .addChange(['name'], 'package-foo')
 *     .addChange(['scripts', 'foo'], 'echo FOOOO...')
 *     .addChange(['dependencies', 'bar'], '1.0.0')
 *     .writeChanges('/foo/package.json');
 *     // or
 *     // .writeChanges('/foo/package.json', inMemoryParsedJson);
 * ```
 */
export interface PackageJsonUpdater {
  /**
   * Create a `PackageJsonUpdate` object, which provides a fluent API for batching updates to a
   * `package.json` file. (Batching the updates is useful, because it avoid unnecessary I/O
   * operations.)
   */
  createUpdate(): PackageJsonUpdate;

  /**
   * Write a set of changes to the specified `package.json` file and (and optionally a pre-existing,
   * in-memory representation of it).
   *
   * @param changes The set of changes to apply.
   * @param packageJsonPath The path to the `package.json` file that needs to be updated.
   * @param parsedJson A pre-existing, in-memory representation of the `package.json` file that
   *                   needs to be updated as well.
   */
  writeChanges(
      changes: PackageJsonChange[], packageJsonPath: AbsoluteFsPath, parsedJson?: JsonObject): void;
}

/**
 * A utility class providing a fluent API for recording multiple changes to a `package.json` file
 * (and optionally its in-memory parsed representation).
 *
 * NOTE: This class should generally not be instantiated directly; instances are implicitly created
 *       via `PackageJsonUpdater#createUpdate()`.
 */
export class PackageJsonUpdate {
  private changes: PackageJsonChange[] = [];
  private applied = false;

  constructor(private writeChangesImpl: WritePackageJsonChangesFn) {}

  /**
   * Record a change to a `package.json` property. If the ancestor objects do not yet exist in the
   * `package.json` file, they will be created.
   *
   * @param propertyPath The path of a (possibly nested) property to update.
   * @param value The new value to set the property to.
   */
  addChange(propertyPath: string[], value: JsonValue): this {
    this.ensureNotApplied();
    this.changes.push([propertyPath, value]);
    return this;
  }

  /**
   * Write the recorded changes to the associated `package.json` file (and optionally a
   * pre-existing, in-memory representation of it).
   *
   * @param packageJsonPath The path to the `package.json` file that needs to be updated.
   * @param parsedJson A pre-existing, in-memory representation of the `package.json` file that
   *                   needs to be updated as well.
   */
  writeChanges(packageJsonPath: AbsoluteFsPath, parsedJson?: JsonObject): void {
    this.ensureNotApplied();
    this.writeChangesImpl(this.changes, packageJsonPath, parsedJson);
    this.applied = true;
  }

  private ensureNotApplied() {
    if (this.applied) {
      throw new Error('Trying to apply a `PackageJsonUpdate` that has already been applied.');
    }
  }
}

/** A `PackageJsonUpdater` that writes directly to the file-system. */
export class DirectPackageJsonUpdater implements PackageJsonUpdater {
  constructor(private fs: FileSystem) {}

  createUpdate(): PackageJsonUpdate {
    return new PackageJsonUpdate((...args) => this.writeChanges(...args));
  }

  writeChanges(
      changes: PackageJsonChange[], packageJsonPath: AbsoluteFsPath,
      preExistingParsedJson?: JsonObject): void {
    if (changes.length === 0) {
      throw new Error(`No changes to write to '${packageJsonPath}'.`);
    }

    // Read and parse the `package.json` content.
    // NOTE: We are not using `preExistingParsedJson` (even if specified) to avoid corrupting the
    //       content on disk in case `preExistingParsedJson` is outdated.
    const parsedJson =
        this.fs.exists(packageJsonPath) ? JSON.parse(this.fs.readFile(packageJsonPath)) : {};

    // Apply all changes to both the canonical representation (read from disk) and any pre-existing,
    // in-memory representation.
    for (const [propPath, value] of changes) {
      if (propPath.length === 0) {
        throw new Error(`Missing property path for writing value to '${packageJsonPath}'.`);
      }

      applyChange(parsedJson, propPath, value);

      if (preExistingParsedJson) {
        applyChange(preExistingParsedJson, propPath, value);
      }
    }

    // Ensure the containing directory exists (in case this is a synthesized `package.json` due to a
    // custom configuration) and write the updated content to disk.
    this.fs.ensureDir(dirname(packageJsonPath));
    this.fs.writeFile(packageJsonPath, `${JSON.stringify(parsedJson, null, 2)}\n`);
  }
}

// Helpers
export function applyChange(ctx: JsonObject, propPath: string[], value: JsonValue): void {
  const lastPropIdx = propPath.length - 1;
  const lastProp = propPath[lastPropIdx];

  for (let i = 0; i < lastPropIdx; i++) {
    const key = propPath[i];
    const newCtx = ctx.hasOwnProperty(key) ? ctx[key] : (ctx[key] = {});

    if ((typeof newCtx !== 'object') || (newCtx === null) || Array.isArray(newCtx)) {
      throw new Error(`Property path '${propPath.join('.')}' does not point to an object.`);
    }

    ctx = newCtx;
  }

  ctx[lastProp] = value;
}
