/// <reference path="../typings/node/node.d.ts"/>
// Must be imported first.
import 'reflect-metadata';
import {main} from './linker';

// CLI entry point
if (require.main === module) {
  let args = require('minimist')(process.argv.slice(2));
  args.componentSources = args._;
  try {
    main(args);
  } catch (e) {
    console.log('FATAL', e, e.stack);
    process.exit(1);
  }
}
