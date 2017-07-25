import {writeFileSync} from 'fs';
import {join} from 'path';

/** Creates a metadata file that re-exports the metadata bundle inside of the typings. */
export function createMetadataReexportFile(destDir: string, from: string, name: string) {
  const metadataReExport = `{
    "__symbolic":"module",
    "version":3,"metadata":{},
    "exports":[{"from":"${from}"}],
    "flatModuleIndexRedirect": true
  }`;
  writeFileSync(join(destDir, `${name}.metadata.json`), metadataReExport, 'utf-8');
}
