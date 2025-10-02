import Jasmine from 'jasmine';
import {TerminalReporter} from 'jasmine-reporters';

export async function run(
  _testsRoot: string,
  cb: (error: any, exitCode?: number) => void,
): Promise<void> {
  const jasmine = new Jasmine({projectBaseDir: __dirname});
  jasmine.loadConfig({
    spec_files: ['*_spec.js'],
  });

  jasmine.addReporter(new TerminalReporter());
  jasmine.exitOnCompletion = false;
  const result = await jasmine.execute();

  if (result.overallStatus === 'passed') {
    console.log('All specs have passed');
    cb(null, 0);
  } else {
    console.log('At least one spec has failed');
    cb(result.incompleteReason, 1);
  }
}
