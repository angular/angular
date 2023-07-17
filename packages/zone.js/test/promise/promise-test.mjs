import promisesAplusTests from 'promises-aplus-tests';
import adapter from './promise-adapter.mjs';

promisesAplusTests(adapter, {reporter: 'dot'}, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    process.exit(0);
  }
});
