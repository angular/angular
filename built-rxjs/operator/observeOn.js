var observeOn_support_1 = require('./observeOn-support');
function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return this.lift(new observeOn_support_1.ObserveOnOperator(scheduler, delay));
}
exports.observeOn = observeOn;
//# sourceMappingURL=observeOn.js.map