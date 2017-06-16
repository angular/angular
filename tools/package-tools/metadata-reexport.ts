import {writeFileSync} from 'fs';
import {join} from 'path';

/** Creates a metadata file that re-exports the metadata bundle inside of the typings. */
export function createMetadataReexportFile(packageDir: string, packageName: string) {
  const metadataReExport =
    `{"__symbolic":"module","version":3,"metadata":{},"exports":[{"from":"./typings/index"}]}`;
  writeFileSync(join(packageDir, `${packageName}.metadata.json`), metadataReExport, 'utf-8');
}
