/**
 * @fileoverview An object that represents a user action. Currently
 * used to collect latency statistics for the activity. In order to do
 * this:
 *
 *   1. Create an instance of this class whenever a user action begins
 *      to be handled.
 *
 *   2. During progress, call tick() in order to mark events whose
 *      times you want to record.
 *
 *   3. At the end of the flow of control, call done().
 *
 *   4. Whenever an asynchronous operation starts, call branch(). The
 *      flow of control branches there and continues concurrently. At
 *      the end of the asynchronous operation, call done() too.
 *
 * When done() is called for the constructor and each branch, a report
 * with the ticks is sent back to CSI or MFE, cf. stats.js.
 *
 * More generally, this class provides an Object representation for a
 * user action, and for the flow of the control of asynchronous
 * operations. More about these aspects in the designdoc:
 *
 *   <http://go/jsactiondesigndoc>
 *
 * For details on the port of jsaction.ActionFlow see here
 *   <http://goto/statsflowport>.
 */

import {ENABLE_GENERIC_EVENT_TRACKING} from './actionflow_defines';

import {Attribute} from './/attribute';
import {Char} from './/char';
import {EventInfoWrapper} from './/event_info';
import {Property} from './/property';

const DEBUG = false;

/** Special ActionFlow branch names defined by jsaction. */
export enum ActionFlowBranch {
  /**
   * The main branch, i.e. the branch the action flow instance starts
   * right at construction.
   */
  MAIN = 'main-actionflow-branch',
}

/** Special names used by jsaction. */
export enum ActionFlowTickName {
  /** The start time property of ActionFlow. TODO(mesch): Maybe a Property? */
  START = 'start',

  /** Click additional data. */
  CAD = 'cad',

  /**
   * Action data to track duplicate ticks. This is used as a key in
   * additionalData map and in the value of the CLICK_ADDITIONAL_DATA
   * URL parameter in the reporting request.
   */
  DUP = 'dup',
}

/**
 * All URL parameters used by jsaction. Many of them relate to click
 * tracking and impression logging.
 * Cf. <http://go/jsactiondesigndoc>
 */
export enum ActionFlowUrlParam {
  /** The type of the click is the name of the jsaction it was mapped to. */
  CLICK_TYPE = 'ct',

  /**
   * Click data contains the positional index of the clicked element
   * among its sibling as given by the jsinstance attribute value, if
   * any.
   */
  CLICK_DATA = 'cd',

  /**
   * Contains more structured data registered during the execution of
   * the jsaction handler and registered with the ActionFlow
   * instance. Among these data is information about impressions that
   * were generated during the handling of the jsaction.
   */
  CLICK_ADDITIONAL_DATA = 'cad',

  /**
   * The event ID of the response that generated the clicked element,
   * as obtained from the value of the jstrack attribute.
   */
  EVENT_ID = 'ei',

  /**
   * The visual element data for the clicked element, as obtained from
   * the ved attribute.
   */
  VISUAL_ELEMENT_CLICK = 'ved',

  /**
   * The visual element type of the clicked element, as obtained from the vet
   * attribute.
   */
  VISUAL_ELEMENT_TYPE = 'vet',
}

/** Events fired by ActionFlow instances. */
export enum ActionFlowEventType {
  /**
   * Fired when a flow is created. This event cannot be canceled, and so the
   * return type of the handler is inconsequential. Because the event is
   * triggered inside the ActionFlow constructor, handlers will be called
   * synchronously with the new ActionFlow instance. Also because the triggering
   * happens inside the constructor, the event is only fired on
   * ActionFlow.report.
   */
  CREATED = 'created',

  /**
   * Fired when the flow is done and before the DONE event is
   * fired. If a handler cancels the default action, then no DONE
   * event is fired, and the ActionFlow is not disposed of. This must
   * happen if a beforedone handler calls branch().
   */
  BEFOREDONE = 'beforedone',

  /**
   * Fired when the flow is done and no BEFOREDONE handler cancelled
   * the event.
   */
  DONE = 'done',

  /**
   * Fired when the flow is done if abandon() was called on the flow.
   * Neither BEFOREDONE nor DONE are fired for abandoned flows.
   */
  ABANDONED = 'abandoned',

  /**
   * Fired whenever an error occurs. Can be handled even in production
   * to obtain error reports from deployed code. Specifically, it's
   * called when the following conditions occur:
   *
   * - branch/done/tick/addActionData/action/impression are called
   *   after the flow finished, or
   *
   * - done called on a branch that is not pending.
   *
   * - an action flow client detects a suspected HUNG flow.
   */
  ERROR = 'error',
}

/**
 * Event detail object for all the events defined above. This object
 * contains the action flow instance that fired it. It's not the event
 * target, because the ActionFlow instances fires their events on
 * ActionFlow.report, where the application can actually listen for
 * them.
 * The event handlers can inquiry the source ActionFlow instance for
 * the actual details.
 * @unrestricted
 */
export interface ActionFlowEvent extends Event {
  /** If type is ERROR, contains the error condition. */
  error?: ActionFlowError;

  /**
   * If type is ERROR, optionally contains the branch where the error
   * condition occurred.
   */
  branch?: string;

  /**
   * If type is ERROR, optionally it contains the name of the tick that was
   * being recorded when the error occurred.
   */
  tick?: string;

  /**
   * If type is error, includes whether the flow had finished when the error
   * occurred.
   */
  finished?: boolean;

  /** The instance that fired this event. */
  flow: ActionFlow;
}

/**
 * @param type The type of event.
 * @param flow The instance that fires this event.
 */
export function createActionFlowEvent(
  type: ActionFlowEventType,
  flow: ActionFlow,
) {
  const actionFlowEvent = createEvent(type) as ActionFlowEvent;
  actionFlowEvent.flow = flow;
  return actionFlowEvent;
}

function createEvent(type: string): Event {
  if (typeof window.Event === 'function') {
    // Some older unsupported browsers seem to have the Event constructor but fail anyway
    // so we fallback if an error is thrown. See
    // cl/609024149/depot/.//actionflow.ts?version=r6#217
    try {
      // ES5 output cannot extend native Event.
      return new Event(type, {
        bubbles: false,
        cancelable: true,
      });
    } catch (e: unknown) {}
  }
  const event = document.createEvent('Event') as ActionFlowEvent;
  event.initEvent(type, /* bubbles= */ false, /* cancellable= */ true);
  return event;
}

/**
 * Creates either an EventTarget, an Element in IE11.
 */
export function createEventTarget(): EventTarget {
  try {
    if (typeof window.EventTarget === 'function') {
      return new EventTarget();
    }
  } catch (e: unknown) {}
  try {
    return document.createElement('div');
  } catch (e: unknown) {}
  // ActionFlow is not supported outside of browser environments.
  // If this branch of code is running, ActionFlow must be running in some
  // environment like Node.js. ActionFlow will likely fail at runtime in
  // these environments.
  return null as any; // tslint:disable-line:no-any
}

/** Errors reported by the action flow. */
export enum ActionFlowError {
  /** Method action() was called after the flow finished. */
  ACTION = 'action',

  /** Method branch() was called after the flow finished. */
  BRANCH = 'branch',

  /**
   * Method done() was called after the flow finished or on a branch
   * that was not pending.
   */
  DONE = 'done',

  /** Method addExtraData() was called after the flow finished. */
  EXTRA_DATA = 'extradata',

  /** A tick was added on the flow after the flow finished. */
  TICK = 'tick',

  /**
   * Flow didn't have done() called within a time threshold.
   *
   * NOTE: There is no detection of this error within the ActionFlow itself.
   * It's up to the ActionFlow client to implement detection and define the
   * time threshold.
   */
  HUNG = 'hung',
}

/** Options for ActionFlow.tick(). */
export interface ActionFlowTickOptions {
  /** The timestamp. */
  time?: number;

  /**
   * If true, do not report this tick to the server (e.g. csi or mfe).  The
   * tick can still be used in puppet tests.
   */
  doNotReportToServer?: boolean;

  /**
   * If true, do not use this tick when calculating 'max time' ticks, e.g.
   * pdt, plt.
   */
  doNotIncludeInMaxTime?: boolean;
}

/** A Factory that takes an `EventInfo` and returns an `ActionFlow`. */
export type FlowFactory = (eventInfoWrapper: EventInfoWrapper) => ActionFlow;

/** Default conversion logic for eventInfoWrapper -> ActionFlow. */
export function eventInfoWrapperToActionFlow(
  eventInfoWrapper: EventInfoWrapper,
) {
  return new ActionFlow(
    eventInfoWrapper.getAction(),
    eventInfoWrapper.getActionElement(),
    eventInfoWrapper.getEvent(),
    eventInfoWrapper.getTimestamp(),
    eventInfoWrapper.getEventType(),
    eventInfoWrapper.getTargetElement(),
  );
}

/** Setup logic for action flow */
export function wrapActionFlowHandler<T>(
  fn: (this: T, actionFlow: ActionFlow) => void,
  flowFactory = eventInfoWrapperToActionFlow,
) {
  return function (this: T, eventInfoWrapper: EventInfoWrapper) {
    const actionFlow = flowFactory(eventInfoWrapper);
    fn.call(this, actionFlow);
    actionFlow.done(ActionFlowBranch.MAIN);
  };
}

/**
 * Object wrapper around action flow that deals with overlapping action
 * flow instances and provides a nicer API than the procedural
 * API. The constructor implicitly records the start tick.
 * @unrestricted
 */
export class ActionFlow {
  /**
   * A registry of action flow instances. This makes it easy to find hung
   * ones.
   */
  static instances: ActionFlow[] = [];

  /**
   * The dispatcher of the events that report about ActionFlow
   * instances. ActionFlow instances trigger events at the end of their
   * life for the application to handle, and e.g. send CSI and click
   * tracking reports. See ActionFlowEvent for the event detail
   * data associated with such an event, and
   * ActionFlowEventType for the different events that are
   * fired.
   * If set to null, no reports will be sent.
   */
  static report: EventTarget | null = createEventTarget();

  eventTarget: EventTarget = createEventTarget();

  /**
   * The flow type. For an ActionFlow instance that tracks a jsaction,
   * this is the name of the jsaction including the jsnamespace. This
   * is cleaned so that CSI likes it as an action name. TODO(mesch):
   * However, this cleanup should be done at reporting time, and
   * actually by the report event handler that formats the CSI
   * request, not here.
   */
  private flowType_: string;

  /**
   * The flow type, without modification. Cf. flowType_, above.
   */
  private unobfuscatedFlowType_: string;

  /** The node at which the jsaction originated, if any. */
  private node_: Element | null;

  /** The event which triggered the jsaction, or a copy thereof, if any. */
  private event_: Event | null;

  /** The jsaction event type. */
  private readonly eventType_: string | null;

  /** The target of the event. */
  private target_: Element | null;

  /**
   * The collection of timers, as an array of pairs of [name,value].
   * There are two interfaces for timers: tick() records a timer as
   * differences from start; intervalStart()/intervalEnd() records a
   * timer as time difference between arbitrary points in time after
   * start.  The array is kept sorted by the tick times.
   */
  private readonly timers_: Array<[string, number, boolean?]> = [];

  /** A map from tick name to tick time (in absolute time). */
  private readonly ticks_: {[key: string]: number} = {};

  /** The start time, recorded in the constructor. */
  private start_: number;

  /** The maximum tick time in absolute time. */
  private maxTickTime_: number;

  /**
   * The opened branches and the number of times each branch was
   * opened (i.e. how many times should done() be called for each
   * particular branch).
   * We initialize the main branch as opened (as the constructor itself
   * is an implicit branch).
   */
  private readonly branches_ = new Map<string, number>();

  /**
   * The set of duplicate ticks. They are reported in extra data in the
   * ActionFlowTickName.DUP key.
   */
  private readonly duplicateTicks_: {[key: string]: boolean} = {};

  /**
   * A flag that indicates that a report was sent for this
   * flow. Used for diagnosis of errors due to calls after the flow
   * has finished.
   */
  private reportSent_ = false;

  /**
   * Collects the data for jsaction tracking related to this ActionFlow
   * instance that are extraced from the DOM context of the jsaction. Added
   * by action().
   */
  private readonly actionData_: {[key: string]: unknown} = {};

  /**
   * Collects additional data to be reported after action is done.
   * The object contains string key-value pairs. Added by
   * addExtraData().
   */
  private readonly extraData_: {[key: string]: string} = {};

  /**
   * Flag that indicates if the flow was abandoned. If it was, no report will
   * be sent when the flow completes.
   */
  private abandoned_ = false;

  /**
   * A flag that indicates if the action is from a wiz controller, false if it
   * is from a reactive controller or native event.
   */
  private isWiz_ = false;

  /** A unique identifier for this flow. */
  private readonly id_: number;

  /**
   * Whether the ActionFlow is disposed.
   */
  private disposed = false;

  /**
   * @param flowType For a ActionFlow that tracks a jsaction, this is the name
   *     of the jsaction, including the namespace. Otherwise it is whatever name
   *     the client application chooses to track its actions by.
   * @param opt_node The node.
   * @param opt_event The event.
   * @param opt_startTime The time at which the flow started, defaulting to the
   *     current time.
   * @param opt_eventType The jsaction event type, e.g. "click".
   * @param opt_target The event target
   */
  constructor(
    flowType: string,
    opt_node?: Element | null,
    opt_event?: Event | null,
    opt_startTime?: number,
    opt_eventType?: string | null,
    opt_target?: Element,
  ) {
    this.flowType_ = flowType.replace(FLOWNAME_CLEANUP_RE, FLOWNAME_SAFE_CHAR);

    this.unobfuscatedFlowType_ = flowType;

    this.node_ = opt_node || null;

    this.event_ = opt_event || null;

    this.eventType_ = opt_eventType || null;

    this.target_ = opt_target || null;

    if (
      !this.target_ &&
      opt_event &&
      opt_event.target &&
      (opt_event.target as Partial<Element>).nodeType === Node.ELEMENT_NODE
    ) {
      this.target_ = opt_event.target as Element;
    }

    this.start_ = opt_startTime || Date.now();

    this.maxTickTime_ = this.start_;

    this.branches_.set(ActionFlowBranch.MAIN, 1);

    // If event is a click (plain or modified), generically track the
    // action. Can possibly be extended to other event types.
    //
    // The handler of the action may modify the DOM context, which is
    // included in the tracking information. Hence, it's important to
    // track the action *before* the handler executes.
    //
    // The flow must be fully constructed before calling action(),
    // which relies at least on this.actionData_ being defined.
    if (
      ENABLE_GENERIC_EVENT_TRACKING &&
      opt_event &&
      opt_node &&
      opt_event['type'] === 'click'
    ) {
      this.action(opt_node);
    }

    // We store all pending flows to make it easier to find a hung
    // flow. This is effective only in debug.
    registerInstance(this);

    this.id_ = ++nextId;

    // NOTE(joshharrison): Dispatching this event must always be the last line
    // in the constructor so that listeners will receive an initialized flow.
    const evt = createActionFlowEvent(ActionFlowEventType.CREATED, this);
    if (ActionFlow.report != null) {
      ActionFlow.report.dispatchEvent(evt);
    }
  }

  /**
   * A bit to flip to enable really verbose action flow logging or not.
   * @param msg The message to log.
   */
  private log_(msg: string) {
    if (shouldLog(this.flowType_)) {
      if (window.console) {
        window.console.log(`${this.flowType_}(${this.id_}): ${msg}`);
      }
    }
  }

  /**
   * Returns a unique flow identifier.
   * @return The unique flow identifier.
   */
  id(): number {
    return this.id_;
  }

  /**
   * Mark this flow as abandoned. No report will be sent when the flow
   * completes.
   */
  abandon() {
    this.abandoned_ = true;
  }

  /** Mark this flow wraps a wiz event. */
  setWiz() {
    this.isWiz_ = true;
  }

  getWiz() {
    return this.isWiz_;
  }

  /** @return The starting tick. */
  getStartTick(): number {
    return this.start_;
  }

  /**
   * Returns the absolute value of a tick or undefined if the tick hasn't been
   * recorded.  Requesting the special 'start' tick returns the start timestamp.
   * If the tick was recorded multiple times the method will return the latest
   * value.
   * @param name The name of the tick.
   * @return The absolute value of the tick.
   */
  getTick(name: string): number | undefined {
    if (name === ActionFlowTickName.START) {
      return this.start_;
    }
    return this.ticks_[name];
  }

  /**
   * Returns a list of tick names for all ticks recorded in this ActionFlow.
   * May also include a 'start' name -- the 'start' tick contains the time
   * when the timer was created.
   * @return An array of tick names.
   */
  getTickNames(): string[] {
    const tickNames: string[] = [];
    tickNames.push(ActionFlowTickName.START);

    for (let i = 0; i < this.timers_.length; ++i) {
      tickNames.push(this.timers_[i][0]);
    }

    return tickNames;
  }

  /**
   * Returns the largest tick time of all the ticks recorded so far.
   * @return The max tick time in absolute time.
   */
  getMaxTickTime(): number {
    return this.maxTickTime_;
  }

  /**
   * Adopts externally recorded action ticks. Must be invoked immediately
   * after constructor.
   *
   * @param timers The timers object is used as an associative container, where
   *     each attribute is a key/value pair of tick-label/ tick-time. A tick
   *     labeled "start" is assumed to exist and will be used as the flow's
   *     start time.  All other ticks will be imported into the flow's timers.
   *     If the start tick is missing no ticks are adopted into the action flow.
   *
   * @param opt_branches The names and counts for all the opened branches.
   */
  adopt(
    timers: {[key: string]: number} | null,
    opt_branches?: {[key: string]: number},
  ) {
    if (!timers || timers[ActionFlowTickName.START] === undefined) {
      return;
    }
    this.start_ = timers[ActionFlowTickName.START];
    ActionFlow.merge(this, timers);

    if (opt_branches) {
      // Method adopt() must be invoked immediately after the
      // constructor, so the only open branch will be the constructor
      // one. We can just copy the adopted branches over without
      // worrying that we'll overwrite.
      for (const [branch, count] of Object.entries(opt_branches)) {
        this.branches_.set(branch, count);
      }
    }
  }

  /**
   * Checks if the ActionFlow instance is of a given type.
   * @param type Flow type.
   * @return Whether the type matches.
   */
  isOfType(type: string): boolean {
    return (
      this.flowType_ === type.replace(FLOWNAME_CLEANUP_RE, FLOWNAME_SAFE_CHAR)
    );
  }

  /**
   * Returns the type of the ActionFlow instance.
   * @return Flow type.
   */
  getType(): string {
    return this.flowType_;
  }

  /**
   * Sets the type of the ActionFlow instance. This can be used in cases where
   * we don't know the type of action at the time we create the ActionFlow, e.g.
   * when a second click produces a doubleclick action. This method should be
   * used sparingly, if at all.
   * @param flowType The flow type.
   */
  setType(flowType: string) {
    this.flowType_ = flowType.replace(FLOWNAME_CLEANUP_RE, FLOWNAME_SAFE_CHAR);
    this.unobfuscatedFlowType_ = flowType;
  }

  /**
   * Records one tick. The tick value is relative to the start tick that
   * was recorded in the constructor.
   * @param name The name of the tick.
   * @param opt_opts Options.
   */
  tick(name: string, opt_opts?: ActionFlowTickOptions | null) {
    if (this.reportSent_) {
      this.error_(ActionFlowError.TICK, undefined, name);
    }

    opt_opts = opt_opts ?? {};

    if (DEBUG && this.reportSent_) {
      this.log_(this.flowType_ + ': late tick ' + name);
    }

    // If we have already recorded this tick, note that.
    if (name in this.ticks_) {
      // The duplicate ticks will get reported in extra data in the dup key.
      this.duplicateTicks_[name] = true;
    }

    const time = opt_opts.time || Date.now();
    if (
      !opt_opts.doNotReportToServer &&
      !opt_opts.doNotIncludeInMaxTime &&
      time > this.maxTickTime_
    ) {
      // Only ticks that are reported to the server should affect max tick time.
      this.maxTickTime_ = time;
    }

    const t = time - this.start_;
    let i = this.timers_.length;

    while (i > 0 && this.timers_[i - 1][1] > t) {
      i--;
    }

    this.timers_.splice(i, 0, [name, t, opt_opts.doNotReportToServer]);
    this.ticks_[name] = time;
  }

  /**
   * Ends a linear, non-branched fragment of the flow of
   * control. Decrements the expect counter and sends report if there
   * are no more done() calls outstanding.
   *
   * Since the end of the flow is a time when you want to record a tick,
   * this also takes an optional tick name.
   *
   * @param branch The name of the branch that ends. Closes the flow opened by
   *     the branch() call with the same name. The implicit branch in the
   *     constructor has a reserved name (ActionFlowBranch.MAIN).
   * @param opt_tick Optional tick to record while we are at it.
   * @param opt_tickOpts An options object for the tick.
   */
  done(
    branch: string,
    opt_tick?: string,
    opt_tickOpts?: ActionFlowTickOptions,
  ) {
    let branchCount = this.branches_.get(branch);
    if (this.reportSent_ || branchCount === undefined) {
      // Either the flow has finished or the branch is not pending.
      this.error_(ActionFlowError.DONE, branch, opt_tick);
      return;
    }

    if (opt_tick) {
      this.tick(opt_tick, opt_tickOpts);
    }

    branchCount--;
    this.branches_.set(branch, branchCount);

    if (branchCount === 0) {
      // Branch is closed, remove it from the map.
      this.branches_.delete(branch);
    }

    if (DEBUG) {
      this.log_(` < done(${branch}:${opt_tick})`);
    }

    if (this.branches_.size === 0) {
      if (DEBUG) {
        this.log_(`    = report time ${branch}:`);
      }

      // Method report_() returns true if the DONE event was actually
      // fired. Then we can finalize the instance.
      if (this.report_()) {
        this.reportSent_ = true;
        this.finish_();
      }
    }
  }

  /**
   * Called when no more done() calls are outstanding and after the DONE
   * event was fired.
   */
  private finish_() {
    removeInstance(this);
    this.node_ = null;
    this.event_ = null;
    this.target_ = null;
    // Clears all event listeners.
    this.eventTarget = createEventTarget();
    this.disposed = true;
  }

  /** @return Whether the ActionFlow is disposed. */
  isDisposed() {
    return this.disposed;
  }

  /**
   * Branches this flow, creating a subflow.  done() must be called on the
   * subflow.
   *
   * Branch announces an asynchronous operation, and that a done() call
   * will arrive asynchronously at some later time. This allows a
   * ActionFlow to account for multiple concurrent asynchronous
   * operations to finish in arbitrary order.
   *
   * Since the begin of an asynchronous operation is a time when you
   * want to record a tick, this also takes an optional tick name.
   *
   * @param branch The name of the branch that is created. The corresponding
   *     done() should use the same name to signal that the branch has finished.
   * @param opt_tick Optional tick to record while we are at.
   * @param opt_tickOpts Tick configuration object. See tick() for more details.
   */
  branch(
    branch: string,
    opt_tick?: string,
    opt_tickOpts?: ActionFlowTickOptions,
  ) {
    if (this.reportSent_) {
      // Branch was called after the report was called. Trigger an error report.
      this.error_(ActionFlowError.BRANCH, branch, opt_tick);
    }

    if (DEBUG) {
      this.log_(`> branch(${branch}:${opt_tick})`);
    }

    if (opt_tick) {
      this.tick(opt_tick, opt_tickOpts);
    }

    let branchCount = this.branches_.get(branch) ?? 0;
    branchCount++;
    this.branches_.set(branch, branchCount);
  }

  /**
   * Returns the current timers. Mostly for testing, but may become the
   * primary interface to obtain timers, and relegate reporting to a
   * library function.  Note that the array is sorted by tick times.
   * @return Timers.
   */
  timers(): Array<[string, number, boolean?]> {
    return this.timers_;
  }

  /**
   * Returns the branchs registry. Mostly for testing.
   * @return Branches.
   */
  branches() {
    return this.branches_;
  }

  /**
   * First triggers a BEFOREDONE event on this ActionFlow instance. This
   * can be used for example to add additional ticks to a ActionFlow
   * instance right before sending the report, or even to create a fresh
   * branch, in which case the event handler must cancel the event.
   *
   * If the BEFOREDONE event was not cancelled, sends the DONE event on
   * the ActionFlow class. Usually this is handled by the reporting code
   * of the application, which sends one or more reports to the server.
   *
   * The Event instance is shared between BEFOREDONE and DONE.
   *
   * @return Whether the flow is really done and can be disposed.
   */
  private report_(): boolean {
    if (!ActionFlow.report) {
      return true;
    }

    if (this.abandoned_) {
      const evt = createActionFlowEvent(ActionFlowEventType.ABANDONED, this);
      this.eventTarget.dispatchEvent(evt);
      ActionFlow.report.dispatchEvent(evt);
      return true;
    }

    let sep = '';
    let dup = '';
    for (let k in this.duplicateTicks_) {
      if (this.duplicateTicks_.hasOwnProperty(k)) {
        dup = dup + sep + k;
        sep = '|';
      }
    }
    if (dup) {
      this.extraData_[ActionFlowTickName.DUP] = dup;
    }

    const evt = createActionFlowEvent(ActionFlowEventType.BEFOREDONE, this);

    // BEFOREDONE fires on both the instance and the class.
    if (
      !this.eventTarget.dispatchEvent(evt) ||
      !ActionFlow.report.dispatchEvent(evt)
    ) {
      return false;
    }

    // Must come after the BEFOREDONE event fires because event handlers
    // can add additional data.
    const cad = foldCadObject(this.extraData_);
    if (cad) {
      this.actionData_[ActionFlowUrlParam.CLICK_ADDITIONAL_DATA] = cad;
    }

    const doneEvt = createActionFlowEvent(ActionFlowEventType.DONE, this);
    return ActionFlow.report.dispatchEvent(doneEvt);
  }

  /**
   * Triggers an error report if:
   * - data is added to the flow after it finished (e.g via tick(),
   *   addExtraData(), etc)
   * - branch/done are called after the flow finished
   * - done is called on a branch that is not open
   * The error report will contain the timing data of the flow and the current
   * opened branches. If the error was triggered by an incorrect branch/done
   * call the name of the branch is passed in and included in the report as
   * well.
   *
   * @param error The type of error that triggered the report.
   * @param opt_branch If the error comes due to an incorrect call to
   *     branch/done, this is the name of the branch.
   * @param opt_tick If the call that triggered the error has a tick (i.e.
   *     tick()/branch()/done()) this is the name of the tick.
   */
  private error_(
    error: ActionFlowError,
    opt_branch?: string,
    opt_tick?: string,
  ) {
    if (!ActionFlow.report) {
      return;
    }
    const evt = createActionFlowEvent(ActionFlowEventType.ERROR, this);
    evt.error = error;
    evt.branch = opt_branch;
    evt.tick = opt_tick;
    evt.finished = this.reportSent_;
    ActionFlow.report.dispatchEvent(evt);
  }

  /**
   * Logs the tracking of jsactions, e.g. click event. It traverses the
   * DOM tree from the target element on which the action is initiated
   * upwards to the document.body, collects the values of the custom
   * attribute 'oi' attached on the nodes along the path, and then
   * concatenates them as a dotted string that is set to the URL
   * parameter 'oi' of the log request sent to MFE. When 'ved' custom
   * attribute is found in the DOM tree, it is set to the URL parameter
   * 'ved' of the log request.
   *
   * The log record will be created only if there is jstrack is
   * specified on the target element or up its DOM tree. If jstrack is
   * not "1", the value of jstrack is used as the log event ID.
   *
   * An example: for a DOM tree
   *   <div jstrack="1">
   *     ...
   *     <div oi="tag1">
   *       <div oi="tag2" jsaction="action2" jsinstance="x"></div>
   *     </div>
   *     ...
   *   </div>
   * MOE:begin_intracomment_strip
   * when action2 is triggered, the log request will be:
   * /maps/gen_204?oi=jsaction&ct=action2&cd=x&cad=tag1.tag2&...
   * MOE:end_intracomment_strip
   *
   * @param target The DOM element the action is acted on.
   */
  action(target: Element | null) {
    if (this.reportSent_) {
      this.error_(ActionFlowError.ACTION);
    }

    const ois: string[] = [];
    let jsinstance = null as string | null;
    let jstrack: string | null = null;
    let ved: string | null = null;
    let vet: string | null = null;

    visitDomNodesUpwards(target, (element) => {
      const oi = getOi(element);
      if (oi) {
        ois.unshift(oi);
        // Find the 1st node with the jsinstance attribute.
        if (!jsinstance) {
          jsinstance = element.getAttribute(Attribute.JSINSTANCE);
        }
      }
      // We should not try to find a ved outside of the scope of the EventId we
      // found. If jstrack is present and different from '1', it is assumed to
      // be an EventId. Imagine the following case:
      //
      // <div jstrack=eventid1 ved=ved1>
      //   <div jstrack=eventid2>
      //     <div ved=ved2>Imagine we do not touch this div.</div>
      //     <div jsaction=log.my_action>But we interact with this div.</div>
      //   </div>
      // </div>
      //
      // In that case, we would report (eventid2, ved1), which is wrong because
      // ved1 is relative to eventid1, not eventid2.
      // As soon as we have found eventid2, we should stop looking for a ved.
      if (!ved && (!jstrack || jstrack === '1')) {
        ved = element.getAttribute(Attribute.VED);
      }
      if (!vet) {
        vet = element.getAttribute(Attribute.VET);
      }
      if (!jstrack) {
        jstrack = element.getAttribute(Attribute.JSTRACK);
      }
    });

    if (vet) {
      this.actionData_[ActionFlowUrlParam.VISUAL_ELEMENT_TYPE] = vet;
    }

    // Record no other action data if we found no jstrack.
    if (!jstrack) {
      return;
    }

    this.actionData_[ActionFlowUrlParam.CLICK_TYPE] = this.flowType_;

    if (ois.length > 0) {
      this.addExtraData(Attribute.OI, ois.join(Char.OI_SEPARATOR));
    }

    if (jsinstance) {
      let clickData;
      if (jsinstance.charAt(0) === TEMPLATE_LAST_OUTPUT_MARKER) {
        clickData = Number(jsinstance.slice(1));
      } else {
        clickData = Number(jsinstance);
      }
      this.actionData_[ActionFlowUrlParam.CLICK_DATA] = clickData;
    }

    if (jstrack !== '1') {
      // Use jstrack as the log event ID.
      this.actionData_[ActionFlowUrlParam.EVENT_ID] = jstrack;
    }

    // A ved parameter only makes sense if we found a corresponding EventId in
    // the DOM. However, we always put it in the ActionData, so that we can
    // detect the issue and report it.
    if (ved) {
      this.actionData_[ActionFlowUrlParam.VISUAL_ELEMENT_CLICK] = ved;
    }
  }

  /**
   * Sets the event id action data field, if it is not already set.  This is
   * useful for ActionFlows that do not originate from a DOM tree that has a
   * specified event id.
   * @param ei The event id.
   */
  maybeSetEventId(ei: string) {
    if (!this.actionData_[ActionFlowUrlParam.EVENT_ID]) {
      this.actionData_[ActionFlowUrlParam.EVENT_ID] = ei;
    }
  }

  /**
   * Adds custom key-value pair to the action log record within
   * the cad parameter value.  When the log record
   * is sent, the pairs are converted to a string of the form:
   * "key1:value1,key2:value2,...".
   * The key-value pairs will be added to the cad parameter value
   * in no particular order.
   * @see foldCadObject
   *
   * @param key Key.
   * @param value Value.
   */
  addExtraData(key: string, value: string) {
    if (this.reportSent_) {
      this.error_(ActionFlowError.EXTRA_DATA);
    }

    // Replace all deliminators ':', ':', and '," used by CAD with
    // underscores. Also replace white space with underscore.
    this.extraData_[key] = value.toString().replace(/[:;,\s]/g, '_');
  }

  /**
   * Gets the extra data as set by addExtraData().
   *
   * @return The extra data object.
   */
  getExtraData(): {[key: string]: string} {
    return this.extraData_;
  }

  /**
   * Gets the data collected by the call to action() from the
   * constructor.
   *
   * @return The action data object.
   */
  getActionData(): {[key: string]: unknown} {
    return this.actionData_;
  }

  /**
   * Calls tick on provided flow object if it is defined.
   *
   * @param flow The ActionFlow object.
   * @param tick The tick name.
   * @param opt_time The timestamp.
   * @param opt_opts Options.
   */
  static tick(
    flow: ActionFlow | null | undefined,
    tick: string,
    opt_time?: number,
    opt_opts?: ActionFlowTickOptions | null,
  ) {
    if (flow) {
      const opts = opt_opts ?? {};
      opts.time = opts.time || opt_time;
      // Technically we do not need to specify doNotReportToServer or
      // doNotIncludeMaxTime here since the default is false, but
      // jscompiler otherwise generates an error in tick() above about
      // the property being read but never set unless we set it
      // somewhere. So we set it here to silence that error.
      opts.doNotReportToServer = !!opts.doNotReportToServer;
      opts.doNotIncludeInMaxTime = !!opts.doNotIncludeInMaxTime;
      flow.tick(tick, opts);
    }
  }

  /**
   * Calls branch on provided flow object if it is defined.
   *
   * @param flow The ActionFlow object.
   * @param branch The name of the branch that is created. The corresponding
   *     done() should use the same name to signal that the branch has finished.
   * @param opt_tick The tick name.
   * @param opt_tickOpts The options for the tick.
   */
  static branch(
    flow: ActionFlow | undefined,
    branch: string,
    opt_tick?: string,
    opt_tickOpts?: ActionFlowTickOptions,
  ) {
    if (flow) {
      flow.branch(branch, opt_tick, opt_tickOpts);
    }
  }

  /**
   * Calls done on provided flow object with optional tick if it is defined.
   *
   * @param flow The ActionFlow object.
   * @param branch The name of the branch that ends. Closes the flow opened by
   *     the branch() call with the same name. The implicit branch in the
   *     constructor has a reserved name (ActionFlowBranch.MAIN).
   * @param opt_tick The tick name.
   * @param opt_tickOpts The options for the tick.
   */
  static done(
    flow: ActionFlow | undefined,
    branch: string,
    opt_tick?: string,
    opt_tickOpts?: ActionFlowTickOptions,
  ) {
    if (flow) {
      flow.done(branch, opt_tick, opt_tickOpts);
    }
  }

  /**
   * Merges externally recorded flow ticks. The start time of the flow
   * is not changed ("start" tick is skipped.).
   *
   * @param flow The ActionFlow to tick.
   * @param timers Timers as an associative container where each attribute is a
   *     key/value pair of tick-label/ tick-time.  All other ticks except
   *     "start" tick will be imported into the flow's timers.
   */
  static merge(flow: ActionFlow, timers: {[key: string]: number} | null) {
    if (!timers) {
      return;
    }
    for (const [name, value] of Object.entries(timers)) {
      if (name !== ActionFlowTickName.START) {
        flow.tick(name, {time: value});
      }
    }
  }

  /**
   * Calls addExtraData on the given flow object if it is defined.
   *
   * @param flow The ActionFlow object.
   * @param key The key to add.
   * @param value The value for the given key.
   */
  static addExtraData(
    flow: ActionFlow | undefined,
    key: string,
    value: string,
  ) {
    if (flow) {
      flow.addExtraData(key, value);
    }
  }

  /**
   * Returns the flow type of the jsaction for which this flow was created.
   * @return The flow type.
   */
  flowType(): string {
    return this.unobfuscatedFlowType_;
  }

  /**
   * Returns the namespace of the jsaction.
   * @return The namespace. If the jsaction doesn't have a namespace, the empty
   *     string.
   */
  actionNamespace(): string {
    const type = this.unobfuscatedFlowType_;
    return type.substr(0, type.indexOf(Char.NAMESPACE_ACTION_SEPARATOR));
  }

  /**
   * Returns a actionflow tracked callback that will call the given function and
   * done() on the action flow. Calls branch() with the given branch name.  If
   * the optional ticks are supplied they will be called on branch() and done()
   * respectively.
   *
   * Example:
   * function myCallback() {
   * ...
   * };
   * ....
   * setTimeout(flow.callback(myCallback, 'branchfoo', 'tick0', 'tick1'), 0);
   *
   * @param fn The callback that we want to track with the current actionflow.
   * @param branchName The name of the branch to be opened before the callback
   *     is used. The branch will be closed when the tracked callback returned
   *     by this method is called.
   * @param opt_branchTick An optional tick to be called on branch.
   * @param opt_doneTick An optional tick to be called on done.
   * @return The tracked callback.
   */
  callback<THIS, ARGS extends unknown[], RET>(
    fn: (this: THIS, ...args: ARGS) => RET,
    branchName: string,
    opt_branchTick?: string,
    opt_doneTick?: string,
  ): (this: THIS, ...args: ARGS) => RET {
    this.branch(branchName, opt_branchTick);
    const flow = this;
    function wrapped(this: THIS, ...args: ARGS): RET {
      try {
        // JavaScript type cast is necessary to prevent unknown this
        // conformance failure.
        // prettier-ignore
        return fn.call(/** @type {!THIS} */ (this), ...args);
      } finally {
        flow.done(branchName, opt_doneTick);
      }
    }
    return wrapped;
  }

  /**
   * Returns the node associated with this ActionFlow.
   *
   * When a ActionFlow created, the node is always set. The node is set
   * to null when the ActionFlow report is sent and should not be accessed
   * after that.
   *
   * In opt, this returns null if the node is not set. In debug, we
   * fail immediately.
   *
   * @return The node.
   */
  node(): Element | null {
    return this.node_;
  }

  /**
   * Returns the event associated with this ActionFlow.
   *
   * When a ActionFlow created, the event (copy) is always
   * set. The event is set to null when the ActionFlow report is sent and
   * should not be accessed after that.
   *
   * In opt, this returns null if the event is not set. In debug, we
   * fail immediately.
   *
   * @return The event.
   */
  event(): Event | null {
    return this.event_;
  }

  /**
   * Returns the jsaction event type as specified in the jsaction attribute,
   * which may be different from the type obtained from the event.
   *
   * @return Event type.
   */
  eventType(): string | null {
    return this.eventType_;
  }

  /**
   * Returns the target of the event.
   *
   * This is provided as a separate function from event().target because in some
   * cases, the target becomes null on an Event after a JavaScript tick (such as
   * the load event).
   */
  target(): Element | null {
    return this.target_;
  }

  /**
   * Returns values of properties or attributes stored on the node or
   * undefined if the node is not set.
   * @param key The name of the property or attribute being asked for.
   * @return The value of the property or attribute.
   */
  value(key: string): unknown {
    if (!this.node_) {
      return undefined;
    }
    if (key in this.node_) {
      // @ts-ignore: Replace with strongly typed key.
      return this.node_[key];
    }
    // HACK(mesch): The getAttribute check protects against
    // gratuitous mocks.
    if (this.node_.getAttribute) {
      return this.node_.getAttribute(key);
    }
    return undefined;
  }

  /**
   * @return The queueing delay in milliseconds if the event has been queued in
   *     the EventContract, waiting for the javascript handler, 0 otherwise.
   */
  getDelay(ignoreDelayWhenHandlerIsImmediatelyAvailable = true): number {
    if (!this.event_) {
      return 0;
    }
    // Suppressing errors for ts-migration.
    //   TS2352: Conversion of type 'Event' to type '{ originalTimestamp: number
    //   | null; isHandlerAvailableImmediately: boolean | null; timeStamp:
    //   number; }' may be a mistake because neither type sufficiently overlaps
    //   with the other. If ...
    // @ts-ignore
    const event = this.event_ as {
      originalTimestamp?: number | null,
      isHandlerAvailableImmediately: boolean | null,
      timeStamp: number
    };

    if (
      event.originalTimestamp == null ||
      (ignoreDelayWhenHandlerIsImmediatelyAvailable &&
        event.isHandlerAvailableImmediately)
    ) {
      return 0;
    }
    const eventTimestamp = this.isWiz_
      ? testing.getTimestamp()
      : event.timeStamp;
    return eventTimestamp - event.originalTimestamp!;
  }

  /**
   * @return The time when the event was triggered relative to navigation start.
   */
  getOriginalTriggerTime(): number | null {
    if (!this.event_) {
      return null;
    }
    // Suppressing errors for ts-migration.
    //   TS2352: Conversion of type 'Event' to type '{ originalTimestamp: number
    //   | null; isHandlerAvailableImmediately: boolean | null; timeStamp:
    //   number; }' may be a mistake because neither type sufficiently overlaps
    //   with the other. If ...
    // @ts-ignore
    const event = this.event_ as {
      originalTimestamp?: number | null;
      timeStamp: number;
    };
    // If there is no originalTimestamp, fallback to the timestamp on the event.
    if (event.originalTimestamp == null) {
      return event.timeStamp;
    }
    // For Wiz, the original timestamp is relative to epoch so we must subtract
    // out navigation start.
    if (this.isWiz_) {
      const navigationStart =
        window.performance &&
        window.performance.timing &&
        window.performance.timing.navigationStart;
      return navigationStart ? event.originalTimestamp - navigationStart : null;
    }
    return event.originalTimestamp;
  }
}

/**
 * Registers a new instance in the instances registry.
 * @param instance The instance (of course, gjslint).
 */
function registerInstance(instance: ActionFlow) {
  ActionFlow.instances.push(instance);
}

/**
 * Removes an instance from the instances registry when it's
 * done.
 * @param instance The instance (of course, gjslint).
 */
function removeInstance(instance: ActionFlow) {
  const index = ActionFlow.instances.indexOf(instance);
  if (index === -1) {
    return;
  }

  ActionFlow.instances.splice(index, 1);
}

/**
 * Checks whether a particular value of flowType should be logged.
 * @param flowType The value of the flowType.
 * @return Whether we should log or not for this flow type.
 */
function shouldLog(flowType: string): boolean {
  // This is very inefficient, but it's debug time, so that's okay and we
  // prefer shorter simpler code.
  for (let i = 0; i < logForFlowTypes.length; i++) {
    const flow = logForFlowTypes[i];
    if (flow === '*' || flowType.indexOf(flow) === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Folds a key-value data object into a string to be used as "cad"
 * URL parameter value. Keys and values are separated by colons, and
 * key-value pairs are separated by commas. Both keys and values
 * are escaped with encodeURIComponent to prevent them from having
 * unescaped separator characters. Empty data object will produce
 * empty string.
 *
 * Example:
 *   "key1:value1,key2:value2"
 *
 * @param object Data object containing of key-value pairs. Both key and value
 *     must be strings.
 * @return The string representation of the object suitable for "cad" URL
 *     parameter value.
 */
function foldCadObject(object: {[key: string]: string}): string {
  const cadArray: string[] = [];
  for (const [key, value] of Object.entries(object)) {
    const escKey = encodeURIComponent(key);
    // Don't escape '|' to make it a practical character to use as a separator
    // within the value.
    const escValue = encodeURIComponent(value).replace(/%7C/g, '|');
    cadArray.push(escKey + Char.CAD_KEY_VALUE_SEPARATOR + escValue);
  }

  return cadArray.join(Char.CAD_SEPARATOR);
}

/**
 * Traverses the DOM tree from the start node upwards, and invokes the
 * callback provided on each node visited. Stops at document.body.
 *
 * @param start The node the traversal starts from.
 * @param visitFn The callback to be invoked on each visited node.
 */
function visitDomNodesUpwards(
  start: Node | null,
  visitFn: (p1: Element) => void,
) {
  for (
    let node = start;
    node && node.nodeType === Node.ELEMENT_NODE;
    node = node.parentNode
  ) {
    visitFn(node as Element);
  }
}

/**
 * Returns the value of the attribute 'oi' attached to the designated node.
 *
 * @param node The DOM node to be checked.
 * @return The value of the attribute 'oi'.
 */
function getOi(node: Element): string | null {
  // @ts-ignore: Add OI to Element type.
  if (!node[Property.OI] && node.getAttribute) {
    // @ts-ignore: Add OI to Element type.
    node[Property.OI] = node.getAttribute(Attribute.OI);
  }
  // @ts-ignore: Add OI to Element type.
  return node[Property.OI];
}

/** @return The current timestamp in milliseconds since epoch. */
function getTimestamp(): number {
  return window.performance.timing.navigationStart + window.performance.now();
}

/**
 * CSI (see http://go/csi )
 * uses [.,] as a separators, so don't allow them in the flow name. Also
 * don't allow chars that could cause param confusion.
 *
 * MOE:begin_intracomment_strip
 * http://go/stats_reporting.js
 * See maps/webmaps/javascript/stats/stats_reporting.js for code that uses
 * ActionFlow with CSI.
 * MOE:end_intracomment_strip
 */
const FLOWNAME_CLEANUP_RE = /[~.,?&-]/g;

/**
 * The character which we use to replace unsafe characters when
 * reporting to CSI.
 */
const FLOWNAME_SAFE_CHAR = '_';

/** The marker for the last processed output template element. */
const TEMPLATE_LAST_OUTPUT_MARKER = '*';

/** A counter used for generating unique identifiers. */
let nextId = 0;

/**
 * Specifies the flow type we want to show logging for. Only messages for this
 * flow will show up at the console.
 */
let logForFlowTypes: string[];

if (DEBUG) {
  logForFlowTypes = [
    /* e.g. 'application_link', '*' */
  ];
}

/** Exported for testing. */
export const testing = {
  getTimestamp,
  resetReport() {
    ActionFlow.report = createEventTarget();
  },
};
