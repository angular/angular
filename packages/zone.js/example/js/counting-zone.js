/*
 * See example/counting.html
 */

Zone['countingZoneSpec'] = {
  name: 'counterZone',
  // setTimeout
  onScheduleTask: function(delegate, current, target, task) {
    this.data.count += 1;
    delegate.scheduleTask(target, task);
  },

  // fires when...
  // - clearTimeout
  // - setTimeout finishes
  onInvokeTask: function(delegate, current, target, task, applyThis, applyArgs) {
    delegate.invokeTask(target, task, applyThis, applyArgs);
    this.data.count -= 1;
  },

  onHasTask: function(delegate, current, target, hasTask) {
    if (this.data.count === 0 && !this.data.flushed) {
      this.data.flushed = true;
      target.run(this.onFlush);
    }
  },

  counter: function() {
    return this.data.count;
  },

  data: {count: 0, flushed: false},

  onFlush: function() {}
};
