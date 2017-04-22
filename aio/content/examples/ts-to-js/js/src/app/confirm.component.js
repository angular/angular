(function(app) {

  // #docregion
  app.ConfirmComponent = ConfirmComponent;

  ConfirmComponent.annotations = [
    new ng.core.Component({
      selector: 'app-confirm',
      templateUrl: 'app/confirm.component.html',
      inputs: [
        'okMsg',
        'notOkMsg: cancelMsg'
      ],
      outputs: [
        'ok',
        'notOk: cancel'
      ]
    })
  ];

  function ConfirmComponent() {
    this.ok    = new ng.core.EventEmitter();
    this.notOk = new ng.core.EventEmitter();
  }

  ConfirmComponent.prototype.onOkClick = function() {
    this.ok.emit(true);
  }

  ConfirmComponent.prototype.onNotOkClick = function() {
    this.notOk.emit(true);
  }
  // #enddocregion

})(window.app = window.app || {});

/////// DSL version ////////

(function(app) {

  var old = app.ConfirmComponent;

  // #docregion dsl
  app.ConfirmComponent = ng.core.Component({
    selector: 'app-confirm-dsl',
    templateUrl: 'app/confirm.component.html',
    inputs: [
      'okMsg',
      'notOkMsg: cancelMsg'
    ],
    outputs: [
      'ok',
      'notOk: cancel'
    ]
  })
  .Class({
    constructor: function ConfirmComponent() {
      this.ok    = new ng.core.EventEmitter();
      this.notOk = new ng.core.EventEmitter();
    },

    onOkClick: function() {
      this.ok.emit(true);
    },

    onNotOkClick: function() {
      this.notOk.emit(true);
    }
  });
  // #enddocregion dsl

  app.ConfirmDslComponent = app.ConfirmComponent;
  app.ConfirmComponent = old;

})(window.app = window.app || {});
