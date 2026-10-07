import * as path from 'path';
import * as fs from 'fs/promises';

export async function run(): Promise<void> {
  console.log('Starting E2E tests...');
  const testsRoot = path.resolve(__dirname);
  const entries = await fs.readdir(testsRoot);
  const files = entries.filter((f) => f.endsWith('.js') && f !== 'index.js');

  console.log(`Found ${files.length} test files to run...`);

  // Run tests sequentially and wait for them if they are async
  for (const file of files) {
    const testPath = path.join(testsRoot, file);
    console.log(`Running test: ${file}`);
    const testModule = require(testPath);
    if (testModule.run) {
      await testModule.run();
    }
  }
}
