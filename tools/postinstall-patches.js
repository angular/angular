const {set, cd, sed} = require('shelljs');
const path = require('path');

console.log('===== about to run the postinstall.js script     =====');
// fail on first error
set('-e');
// print commands as being executed
set('-v');
// jump to project root
cd(path.join(__dirname, '../'));

// https://github.com/ReactiveX/rxjs/pull/3302
// make node_modules/rxjs compilable with Typescript 2.7
// remove when we update to rxjs v6
console.log('\n# patch: reactivex/rxjs#3302 make node_modules/rxjs compilable with Typescript 2.7')
sed('-i', "('response' in xhr)", "('response' in (xhr as any))", "node_modules/rxjs/src/observable/dom/AjaxObservable.ts")


console.log('===== finished running the postinstall.js script =====');
