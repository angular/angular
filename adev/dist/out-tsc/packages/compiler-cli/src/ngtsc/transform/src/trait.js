/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export var TraitState;
(function (TraitState) {
  /**
   * Pending traits are freshly created and have never been analyzed.
   */
  TraitState[(TraitState['Pending'] = 0)] = 'Pending';
  /**
   * Analyzed traits have successfully been analyzed, but are pending resolution.
   */
  TraitState[(TraitState['Analyzed'] = 1)] = 'Analyzed';
  /**
   * Resolved traits have successfully been analyzed and resolved and are ready for compilation.
   */
  TraitState[(TraitState['Resolved'] = 2)] = 'Resolved';
  /**
   * Skipped traits are no longer considered for compilation.
   */
  TraitState[(TraitState['Skipped'] = 3)] = 'Skipped';
})(TraitState || (TraitState = {}));
/**
 * The value side of `Trait` exposes a helper to create a `Trait` in a pending state (by delegating
 * to `TraitImpl`).
 */
export const Trait = {
  pending: (handler, detected) => TraitImpl.pending(handler, detected),
};
/**
 * An implementation of the `Trait` type which transitions safely between the various
 * `TraitState`s.
 */
class TraitImpl {
  state = TraitState.Pending;
  handler;
  detected;
  analysis = null;
  symbol = null;
  resolution = null;
  analysisDiagnostics = null;
  resolveDiagnostics = null;
  typeCheckDiagnostics = null;
  constructor(handler, detected) {
    this.handler = handler;
    this.detected = detected;
  }
  toAnalyzed(analysis, diagnostics, symbol) {
    // Only pending traits can be analyzed.
    this.assertTransitionLegal(TraitState.Pending, TraitState.Analyzed);
    this.analysis = analysis;
    this.analysisDiagnostics = diagnostics;
    this.symbol = symbol;
    this.state = TraitState.Analyzed;
    return this;
  }
  toResolved(resolution, diagnostics) {
    // Only analyzed traits can be resolved.
    this.assertTransitionLegal(TraitState.Analyzed, TraitState.Resolved);
    if (this.analysis === null) {
      throw new Error(`Cannot transition an Analyzed trait with a null analysis to Resolved`);
    }
    this.resolution = resolution;
    this.state = TraitState.Resolved;
    this.resolveDiagnostics = diagnostics;
    this.typeCheckDiagnostics = null;
    return this;
  }
  toSkipped() {
    // Only pending traits can be skipped.
    this.assertTransitionLegal(TraitState.Pending, TraitState.Skipped);
    this.state = TraitState.Skipped;
    return this;
  }
  /**
   * Verifies that the trait is currently in one of the `allowedState`s.
   *
   * If correctly used, the `Trait` type and transition methods prevent illegal transitions from
   * occurring. However, if a reference to the `TraitImpl` instance typed with the previous
   * interface is retained after calling one of its transition methods, it will allow for illegal
   * transitions to take place. Hence, this assertion provides a little extra runtime protection.
   */
  assertTransitionLegal(allowedState, transitionTo) {
    if (!(this.state === allowedState)) {
      throw new Error(
        `Assertion failure: cannot transition from ${TraitState[this.state]} to ${TraitState[transitionTo]}.`,
      );
    }
  }
  /**
   * Construct a new `TraitImpl` in the pending state.
   */
  static pending(handler, detected) {
    return new TraitImpl(handler, detected);
  }
}
//# sourceMappingURL=trait.js.map
