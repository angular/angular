import {writeFileSync} from 'fs';
import {buildConfig} from './build-config';
import {join} from 'path';

/** Create a typing file that links to the bundled definitions of NGC. */
export function createTypingsReexportFile(outDir: string, from: string, fileName: string) {
  writeFileSync(join(outDir, `${fileName}.d.ts`),
    `${buildConfig.licenseBanner}\nexport * from '${from}';\n`,
    'utf-8');
}
