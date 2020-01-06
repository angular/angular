import {readFileSync} from 'fs';
import {generateExampleModule} from './generate-example-module';

/**
 * CLI entry-point for building the example module. Usage:
 * bazel-bin.js {sourceFileManifest} {outputFilePath} {baseDirPath}
 */
if (require.main === module) {
  const [sourceFileManifest, outputFile, baseDir] = process.argv.slice(2);
  const sourceFiles = readFileSync(sourceFileManifest, 'utf8')
    .split(' ')
    .map(filePath => filePath.trim())
    .filter(s => s.endsWith('.ts'));

  generateExampleModule(sourceFiles, outputFile, baseDir);
}
