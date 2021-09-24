/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Note: Before changing any exports here, consult with the Angular tooling team
// as the CLI heavily relies on exports declared here.

import {NodeJSFileSystem, setFileSystem} from '@angular/compiler-cli/private/localize';
setFileSystem(new NodeJSFileSystem());

export {DiagnosticHandlingStrategy, Diagnostics} from './src/diagnostics';
export {checkDuplicateMessages} from './src/extract/duplicates';
export {MessageExtractor} from './src/extract/extraction';
export {ArbTranslationSerializer} from './src/extract/translation_files/arb_translation_serializer';
export {SimpleJsonTranslationSerializer} from './src/extract/translation_files/json_translation_serializer';
export {LegacyMessageIdMigrationSerializer} from './src/extract/translation_files/legacy_message_id_migration_serializer';
export {Xliff1TranslationSerializer} from './src/extract/translation_files/xliff1_translation_serializer';
export {Xliff2TranslationSerializer} from './src/extract/translation_files/xliff2_translation_serializer';
export {XmbTranslationSerializer} from './src/extract/translation_files/xmb_translation_serializer';
export {buildLocalizeReplacement, isGlobalIdentifier, translate, unwrapExpressionsFromTemplateLiteral, unwrapMessagePartsFromLocalizeCall, unwrapMessagePartsFromTemplateLiteral, unwrapSubstitutionsFromLocalizeCall} from './src/source_file_utils';
export {makeEs2015TranslatePlugin} from './src/translate/source_files/es2015_translate_plugin';
export {makeEs5TranslatePlugin} from './src/translate/source_files/es5_translate_plugin';
export {makeLocalePlugin} from './src/translate/source_files/locale_plugin';
export {ArbTranslationParser} from './src/translate/translation_files/translation_parsers/arb_translation_parser';
export {SimpleJsonTranslationParser} from './src/translate/translation_files/translation_parsers/simple_json_translation_parser';
export {Xliff1TranslationParser} from './src/translate/translation_files/translation_parsers/xliff1_translation_parser';
export {Xliff2TranslationParser} from './src/translate/translation_files/translation_parsers/xliff2_translation_parser';
export {XtbTranslationParser} from './src/translate/translation_files/translation_parsers/xtb_translation_parser';
