var log = require('karma/lib/logger').create('launcher');
var baseDecoratorFactory = require('karma/lib/launchers/base').decoratorFactory;
var retryDecoratorFactory = require('karma/lib/launchers/retry').decoratorFactory;
var processDecoratorFactory = require('karma/lib/launchers/process').decoratorFactory;

// TODO: use DI here?
function createBaseBrowserDecorator(id, emitter, timer) {
  var baseDecorator = baseDecoratorFactory(id, emitter);
  var retryDecorator = retryDecoratorFactory(timer);
  var processDecorator = processDecoratorFactory(timer);
  return function(launcher) {
    baseDecorator(launcher);
    retryDecorator(launcher);
    processDecorator(launcher);
    emitter.on('exit', function() {
      launcher.kill();
    });
  };
}

module.exports = function(karmaLauncher, emitter, options) {
  // TODO: use DI here?
  var baseBrowserDecorator = createBaseBrowserDecorator(
    'launcher'+Date.now(),
    emitter,
    global
  );
  return new karmaLauncher(baseBrowserDecorator, options);
}
