import {join, dirname} from 'path';
import {glob} from 'fast-glob';
import {
  FileAndContentRecord,
  PackageJson,
  TutorialConfig,
  TutorialMetadata,
} from '../../interfaces';
import {getFileContents} from './utils';

/** Generate the metadata.json content for a provided tutorial config. */
export async function generateMetadata(
  path: string,
  config: TutorialConfig,
  files: FileAndContentRecord,
): Promise<TutorialMetadata> {
  const tutorialFiles: FileAndContentRecord = {};
  const {dependencies, devDependencies} = JSON.parse(<string>files['package.json']) as PackageJson;

  config.openFiles?.forEach((file) => (tutorialFiles[file] = files[file]));

  return {
    type: config.type,
    openFiles: config.openFiles || [],
    allFiles: Object.keys(files),
    tutorialFiles,
    answerFiles: await getAnswerFiles(path, config, files),
    hiddenFiles: config.openFiles
      ? Object.keys(files).filter((filename) => !config.openFiles!.includes(filename))
      : [],
    dependencies: {
      ...dependencies,
      ...devDependencies,
    },
  };
}

/** Generate the answer files for the metadata.json. */
async function getAnswerFiles(
  path: string,
  config: TutorialConfig,
  files: FileAndContentRecord,
): Promise<FileAndContentRecord> {
  const answerFiles: FileAndContentRecord = {};
  const answerPrefix = 'answer/';

  if (config.answerSrc) {
    const answersDir = join(path, config.answerSrc);
    const answerFilePaths = await glob('**/*', {
      cwd: answersDir,
      onlyFiles: true,
      absolute: true,
    });
    answerFilePaths.forEach((absolutePath) => {
      // We use the absolute file in order to read the content, but the key
      // needs to be a relative path within the project.
      const parentDir = dirname(answersDir) + '/';
      const pathStart = absolutePath.indexOf(parentDir);
      if (pathStart === -1) {
        throw new Error('Invalid state: could not find start of answers path');
      }
      answerFiles[absolutePath.slice(pathStart + parentDir.length)] = getFileContents(absolutePath);
    });
  } else {
    Object.keys(files).forEach((file) => {
      if (file.includes(answerPrefix)) {
        answerFiles[file.replace(answerPrefix, '')] = files[file];
      }
    });
  }

  return answerFiles;
}
