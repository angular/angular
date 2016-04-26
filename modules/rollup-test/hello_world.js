var HelloWorldComponent = ng.core.Component({
  selector: 'hello-world',
  template: 'hello world!!!'
}).Class({
  constructor: function() {}
});



ng.platformBrowser.bootstrap(HelloWorldComponent);
