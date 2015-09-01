import {StringMap} from 'angular2/src/core/facade/collection';
import {global} from 'angular2/src/core/facade/lang';

// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = global;
/**
 * Defines lifecycle method {@link metadata/LifeCycleEvent#OnChanges `LifeCycleEvent.OnChanges`}
 * called after all of component's bound properties are updated.
 */
export interface OnChanges { onChanges(changes: StringMap<string, any>): void; }

/**
 * Defines lifecycle method {@link metadata/LifeCycleEvent#OnInit `LifeCycleEvent.OnInit`}
 * called when a directive is being checked the first time.
 */
export interface OnInit { onInit(): void; }

/**
 * Defines lifecycle method {@link metadata/LifeCycleEvent#DoCheck `LifeCycleEvent.DoCheck`}
 * called when a directive is being checked.
 */
export interface DoCheck { doCheck(): boolean; }

/**
 * Defines lifecycle method {@link metadata/LifeCycleEvent#OnDestroy `LifeCycleEvent.OnDestroy`}
 * called when a directive is being destroyed.
 */
export interface OnDestroy { onDestroy(): void; }

/**
 * Defines lifecycle method
 * {@link metadata/LifeCycleEvent#AfterContentInit `LifeCycleEvent.afterContentInit`}
 * called when the bindings of all its content children have been checked the first time.
 */
export interface AfterContentInit { afterContentInit(): void; }

/**
 * Defines lifecycle method
 * {@link metadata/LifeCycleEvent#AfterContentChecked `LifeCycleEvent.afterContentChecked`}
 * called when the bindings of all its content children have been checked.
 */
export interface AfterContentChecked { afterContentChecked(): void; }

/**
 * Defines lifecycle method
 * {@link metadata/LifeCycleEvent#AfterViewInit `LifeCycleEvent.afterViewInit`}
 * called when the bindings of all its view children have been checked the first time.
 */
export interface AfterViewInit { afterViewInit(): void; }

/**
 * Defines lifecycle method
 * {@link metadata/LifeCycleEvent#AfterViewChecked `LifeCycleEvent.afterViewChecked`}
 * called when the bindings of all its view children have been checked.
 */
export interface AfterViewChecked { afterViewChecked(): void; }
