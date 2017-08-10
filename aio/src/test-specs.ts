// Find all the tests.
const context = (<any>require).context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
