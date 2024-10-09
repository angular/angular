import {FileSystemTree} from '@webcontainer/api';
import {FileAndContentRecord, TutorialConfig} from '../../interfaces';
import {getFileSystemTree} from './webcontainers';

/** Generate the source-code.json content for a provided tutorial config. */
export async function generateSourceCode(
  config: TutorialConfig,
  files: FileAndContentRecord,
): Promise<FileSystemTree> {
  // TODO(josephperrott): figure out if filtering is needed for this.
  const allFiles = Object.keys(files);
  return getFileSystemTree(allFiles, files);
}
