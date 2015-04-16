Zone.nestedRun = 0;

Zone.vmTurnAware = {
  '$run': function (parentRun) {
    return function () {
      var ret;
      var oldZone = zone;

      Zone.nestedRun++;

      // When this method is called for the first time, we are executing either a macro or a micro
      // task and we need to call beforeTurn.
      // parentRun() will execute the macro and micro task + any other pending microtasks by calling
      // this method recursively. We should not call beforeTurn for any of the recursive calls.
      if (Zone.nestedRun == 1 && this.beforeTurn) {
        window.zone = this;
        this.beforeTurn();
        window.zone = oldZone;
      }

      try {
        // Execute the task + any pending microtasks
        ret = parentRun.apply(this, arguments);
      } finally {
        Zone.nestedRun--;

        if (Zone.nestedRun == 0 && this.afterTurn) {
          window.zone = this;
          this.afterTurn();
          window.zone = oldZone;

          if (Zone.microtaskQueue.length > 0) {
            // Drain the microtask queue, if any microtasks enqueued in afterTurn.
            // The execution will be wrapped inside a beforeTurn...afterTurn despite they are
            // executed in the same VM turn.
            var microtask = Zone.microtaskQueue.shift();
            microtask();
          }
        }
      }

      return ret;
    }
  },

  // Hook called at the start of a VM turn
  beforeTurn: null,

  // Hook called at the end of a VM turn
  afterTurn: null
};

