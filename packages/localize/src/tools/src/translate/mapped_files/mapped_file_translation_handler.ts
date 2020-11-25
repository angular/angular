/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {DiagnosticHandlingStrategy, Diagnostics} from '../../diagnostics';
import {OutputPathFn} from '../output_path';
import {TranslationBundle, TranslationHandler} from '../translator';

/**
 * Translate a file by replacing it with a mapped copy, writing it to the appropriate output
 * path.
 */
export class MappedFileTranslationHandler implements TranslationHandler {
  private missingTranslation: DiagnosticHandlingStrategy;
  private mappings: FileMapping[];
  constructor(private fs: FileSystem, options: MappedFileOptions) {
    this.missingTranslation = options.missingTranslation;
    this.mappings = options.mappings;
  }

  /**
   * Returns true if the `relativeFilePath` matches one of the `mappings`.
   */
  canTranslate(relativeFilePath: string, _contents: Buffer): boolean {
    return this.mappings.some(mapping => mapping.matcher.matchesPath(relativeFilePath));
  }

  /**
   * For each translation, write the mapped file to the appropriate output path, or the source file
   * if there is no translated file at the mapped path.
   * When computing the mapped path, the string `{{LOCALE}}` will be replaced with the name of the
   * locale being translated.
   */
  translate(
      diagnostics: Diagnostics, _sourceRoot: string, relativeFilePath: string, contents: Buffer,
      outputPathFn: OutputPathFn, translations: TranslationBundle[], sourceLocale?: string): void {
    const mapping = this.mappings.find(mapping => mapping.matcher.matchesPath(relativeFilePath))!;
    const mappedPath = this.fs.resolve(mapping.mapper.mapPath(relativeFilePath));
    for (const translation of translations) {
      try {
        const translatedPath =
            mappedPath.replace('{{LOCALE}}', translation.locale) as AbsoluteFsPath;
        const translationExists = this.fs.exists(translatedPath);
        if (!translationExists) {
          const message = `There is no translation of file "${relativeFilePath}" for locale "${
                              translation.locale}".\n` +
              `Looked in "${translatedPath}".`;
          if (this.missingTranslation === 'error') {
            diagnostics.error(message);
          } else if (this.missingTranslation === 'warning') {
            diagnostics.warn(message);
          }
        }
        const mappedContents =
            translationExists ? this.fs.readFileBuffer(translatedPath) : contents;
        this.safeWriteFile(
            this.fs.resolve(outputPathFn(translation.locale, relativeFilePath)), mappedContents);
      } catch (e) {
        diagnostics.error(e.message);
      }
    }

    if (sourceLocale !== undefined) {
      try {
        this.safeWriteFile(this.fs.resolve(outputPathFn(sourceLocale, relativeFilePath)), contents);
      } catch (e) {
        diagnostics.error(e.message);
      }
    }
  }

  private safeWriteFile(path: AbsoluteFsPath, contents: string|Uint8Array): void {
    this.fs.ensureDir(this.fs.dirname(path));
    this.fs.writeFile(path, contents);
  }
}

export interface MappedFileOptions {
  mappings: FileMapping[];
  missingTranslation: DiagnosticHandlingStrategy;
}


/**
 * The interface used to configure the `MappedFileTranslationHandler`.
 */
export interface FileMapping {
  matcher: PathMatcher;
  mapper: PathMapper;
}

/**
 * Implement this interface to create a helper that can match paths to be mapped.
 */
export interface PathMatcher {
  /**
   * Try to match a path.
   * @param sourcePath a path to the untranslated file, relative to the source root.
   * @returns true if the source path is matched by this `PathMatcher`.
   */
  matchesPath(sourcePath: string): boolean;
}

/**
 * Implement this interface to create a helper that can map paths.
 */
export interface PathMapper {
  /**
   * Map an untranslated file path to a translated file path.
   * @param sourcePath a path to the untranslated file, relative to the source root.
   * @returns a path that should be either absolute or relative to the current working directory.
   */
  mapPath(sourcePath: string): string;
}
