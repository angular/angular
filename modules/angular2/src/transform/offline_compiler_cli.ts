require('reflect-metadata');
import {compile} from './offline_compiler';

// CLI entry point
if (require.main === module) {
  let args = require('minimist')(process.argv.slice(2));
  args.componentSources = args._;
  try {
    compile(args);
  } catch (e) {
    console.log('FATAL', e, e.stack);
    process.exit(1);
  }
}
