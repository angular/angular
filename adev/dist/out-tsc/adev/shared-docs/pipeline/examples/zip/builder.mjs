/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {join} from 'path';
import {readFile} from 'fs/promises';
import {copyFolder, createFolder} from '../shared/file-system.mjs';
import {glob} from 'tinyglobby';
import {appendCopyrightToFile} from '../shared/copyright.mjs';
import {EXCLUDE_FILES, CONFIG_FILENAME} from './defaults.mjs';
import {zip, strToU8} from 'fflate';
import {regionParser} from '../../shared/regions/region-parser.mjs';
export async function generateZipExample(exampleDir, workingDir, templateDir) {
  const config = await readFile(join(exampleDir, CONFIG_FILENAME), 'utf-8');
  const stackblitzConfig = JSON.parse(config);
  await createFolder(workingDir);
  // Copy template files to TEMP folder
  await copyFolder(templateDir, workingDir);
  // Copy example files to TEMP folder
  await copyFolder(exampleDir, workingDir);
  const includedPaths = await getIncludedPaths(workingDir, stackblitzConfig);
  const filesObj = {};
  for (const path of includedPaths) {
    const file = await getFileAndContent(workingDir, path);
    filesObj[file.path] = typeof file.content === 'string' ? strToU8(file.content) : file.content;
  }
  return new Promise((resolve, reject) => {
    zip(filesObj, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
async function getIncludedPaths(workingDir, config) {
  const defaultIncludes = [
    '**/*.ts',
    '**/*.js',
    '**/*.css',
    '**/*.html',
    '**/*.md',
    '**/*.json',
    '**/*.svg',
  ];
  return glob(defaultIncludes, {
    cwd: workingDir,
    onlyFiles: true,
    dot: true,
    ignore: config.ignore,
  });
}
async function getFileAndContent(workingDir, path) {
  let content = await readFile(join(workingDir, path), 'utf-8');
  content = appendCopyrightToFile(path, content);
  content = extractRegions(path, content);
  return {content, path};
}
async function createPostData(exampleDir, config, exampleFilePaths) {
  const postData = {};
  for (const filePath of exampleFilePaths) {
    if (EXCLUDE_FILES.some((excludedFile) => filePath.endsWith(excludedFile))) {
      continue;
    }
    let content = await readFile(join(exampleDir, filePath), 'utf-8');
    content = appendCopyrightToFile(filePath, content);
    content = extractRegions(filePath, content);
    postData[`project[files][${filePath}]`] = content;
  }
  return postData;
}
function extractRegions(path, contents) {
  const fileType = path?.split('.').pop();
  const regionParserResult = regionParser(contents, fileType);
  return regionParserResult.contents;
}
//# sourceMappingURL=builder.mjs.map
