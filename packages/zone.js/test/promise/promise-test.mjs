import promisesAplusTests from 'promises-aplus-tests';
import adapter from './promise-adapter.mjs';

promisesAplusTests(adapter, {reporter: 'dot', timeout: 500}, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    process.exit(0);
  }
});
