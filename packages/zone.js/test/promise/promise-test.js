const promisesAplusTests = require('promises-aplus-tests');
const adapter = require('./promise-adapter');
promisesAplusTests(adapter, {reporter: 'dot'}, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    process.exit(0);
  }
});
