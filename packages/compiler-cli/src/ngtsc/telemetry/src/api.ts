/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class Telemetry {
  global = new TelemetryScope();
  injectables = new InjectableTelemetry();
  ngModule = new NgModuleTelemetry();
  directives = new DirectiveTelemetry();
  components = new ComponentTelemetry();
  pipes = new PipeTelemetry();

  merge(other: Telemetry): void {
    this.global.merge(other.global);
    this.injectables.merge(other.injectables);
    this.ngModule.merge(other.ngModule);
    this.directives.merge(other.directives);
    this.components.merge(other.components);
    this.pipes.merge(other.pipes);
  }
}

export class TelemetryScope {
  /**
   * Total number of `signal()` usages.
   */
  signal = 0;

  /**
   * Total number of `computed()` usages.
   */
  computed = 0;

  /**
   * Total number of `effect()` usages.
   */
  effect = 0;

  /**
   * The total number of `inject()` usages.
   */
  inject = 0;

  merge(other: TelemetryScope): void {
    this.signal += other.signal;
    this.computed += other.computed;
    this.effect += other.effect;
    this.inject += other.inject;
  }
}

export class InjectableTelemetry extends TelemetryScope {
  /**
   * The total number of classes of this kind within the application.
   */
  amount = 0;

  /**
   * The total number of injected constructor parameters.
   */
  ctorInjections = 0;

  override merge(other: InjectableTelemetry): void {
    super.merge(other);
    this.amount += other.amount;
    this.ctorInjections += other.ctorInjections;
  }
}

export class NgModuleTelemetry extends InjectableTelemetry {
  override merge(other: NgModuleTelemetry): void {
    super.merge(other);
  }
}

export class DirectiveTelemetry extends InjectableTelemetry {
  /**
   * The total number of standalone directives.
   */
  standalone = 0;

  override merge(other: DirectiveTelemetry): void {
    super.merge(other);
    this.standalone += other.standalone;
  }
}

export class ComponentTelemetry extends DirectiveTelemetry {
  /**
   * Total number of components with external templates.
   */
  inlineTemplate = 0;

  /**
   * Total number of inline styles used by all components.
   */
  inlineStyles = 0;

  /**
   * Total number of external styles used by all components.
   */
  externalStyles = 0;

  /**
   * Total number of components not using encapsulation.
   */
  noEncapsulation = 0;

  /**
   * Total number of components using ShadowDOM view encapsulation.
   */
  shadowDomEncapsulation = 0;

  /**
   * The total number of components using OnPush in the application.
   */
  onPush = 0;

  /**
   * Total number of `async` pipe usages.
   */
  asyncPipe = 0;

  override merge(other: ComponentTelemetry): void {
    super.merge(other);
    this.inlineTemplate += other.inlineTemplate;
    this.inlineStyles += other.inlineStyles;
    this.externalStyles += other.externalStyles;
    this.noEncapsulation += other.noEncapsulation;
    this.shadowDomEncapsulation += other.shadowDomEncapsulation;
    this.onPush += other.onPush;
    this.asyncPipe += other.asyncPipe;
  }
}

export class PipeTelemetry extends InjectableTelemetry {
  /**
   * The total number of standalone directives.
   */
  standalone = 0;

  override merge(other: PipeTelemetry): void {
    super.merge(other);
    this.standalone += other.standalone;
  }
}
