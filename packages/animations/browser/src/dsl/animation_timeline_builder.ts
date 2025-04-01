/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AnimateChildOptions,
  AnimateTimings,
  AnimationMetadataType,
  AnimationOptions,
  AnimationQueryOptions,
  AUTO_STYLE,
  ɵPRE_STYLE as PRE_STYLE,
  ɵStyleDataMap,
} from '../../../src/animations';

import {invalidQuery} from '../error_helpers';
import {AnimationDriver} from '../render/animation_driver';
import {interpolateParams, resolveTiming, resolveTimingValue, visitDslNode} from '../util';

import {
  AnimateAst,
  AnimateChildAst,
  AnimateRefAst,
  Ast,
  AstVisitor,
  DynamicTimingAst,
  GroupAst,
  KeyframesAst,
  QueryAst,
  ReferenceAst,
  SequenceAst,
  StaggerAst,
  StateAst,
  StyleAst,
  TimingAst,
  TransitionAst,
  TriggerAst,
} from './animation_ast';
import {
  AnimationTimelineInstruction,
  createTimelineInstruction,
} from './animation_timeline_instruction';
import {ElementInstructionMap} from './element_instruction_map';

const ONE_FRAME_IN_MILLISECONDS = 1;
const ENTER_TOKEN = ':enter';
const ENTER_TOKEN_REGEX = /* @__PURE__ */ new RegExp(ENTER_TOKEN, 'g');
const LEAVE_TOKEN = ':leave';
const LEAVE_TOKEN_REGEX = /* @__PURE__ */ new RegExp(LEAVE_TOKEN, 'g');

/*
 * The code within this file aims to generate web-animations-compatible keyframes from Angular's
 * animation DSL code.
 *
 * The code below will be converted from:
 *
 * ```ts
 * sequence([
 *   style({ opacity: 0 }),
 *   animate(1000, style({ opacity: 0 }))
 * ])
 * ```
 *
 * To:
 * ```ts
 * keyframes = [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 1 }]
 * duration = 1000
 * delay = 0
 * easing = ''
 * ```
 *
 * For this operation to cover the combination of animation verbs (style, animate, group, etc...) a
 * combination of AST traversal and merge-sort-like algorithms are used.
 *
 * [AST Traversal]
 * Each of the animation verbs, when executed, will return an string-map object representing what
 * type of action it is (style, animate, group, etc...) and the data associated with it. This means
 * that when functional composition mix of these functions is evaluated (like in the example above)
 * then it will end up producing a tree of objects representing the animation itself.
 *
 * When this animation object tree is processed by the visitor code below it will visit each of the
 * verb statements within the visitor. And during each visit it will build the context of the
 * animation keyframes by interacting with the `TimelineBuilder`.
 *
 * [TimelineBuilder]
 * This class is responsible for tracking the styles and building a series of keyframe objects for a
 * timeline between a start and end time. The builder starts off with an initial timeline and each
 * time the AST comes across a `group()`, `keyframes()` or a combination of the two within a
 * `sequence()` then it will generate a sub timeline for each step as well as a new one after
 * they are complete.
 *
 * As the AST is traversed, the timing state on each of the timelines will be incremented. If a sub
 * timeline was created (based on one of the cases above) then the parent timeline will attempt to
 * merge the styles used within the sub timelines into itself (only with group() this will happen).
 * This happens with a merge operation (much like how the merge works in mergeSort) and it will only
 * copy the most recently used styles from the sub timelines into the parent timeline. This ensures
 * that if the styles are used later on in another phase of the animation then they will be the most
 * up-to-date values.
 *
 * [How Missing Styles Are Updated]
 * Each timeline has a `backFill` property which is responsible for filling in new styles into
 * already processed keyframes if a new style shows up later within the animation sequence.
 *
 * ```ts
 * sequence([
 *   style({ width: 0 }),
 *   animate(1000, style({ width: 100 })),
 *   animate(1000, style({ width: 200 })),
 *   animate(1000, style({ width: 300 }))
 *   animate(1000, style({ width: 400, height: 400 })) // notice how `height` doesn't exist anywhere
 * else
 * ])
 * ```
 *
 * What is happening here is that the `height` value is added later in the sequence, but is missing
 * from all previous animation steps. Therefore when a keyframe is created it would also be missing
 * from all previous keyframes up until where it is first used. For the timeline keyframe generation
 * to properly fill in the style it will place the previous value (the value from the parent
 * timeline) or a default value of `*` into the backFill map.
 *
 * When a sub-timeline is created it will have its own backFill property. This is done so that
 * styles present within the sub-timeline do not accidentally seep into the previous/future timeline
 * keyframes
 *
 * [Validation]
 * The code in this file is not responsible for validation. That functionality happens with within
 * the `AnimationValidatorVisitor` code.
 */
export function buildAnimationTimelines(
  driver: AnimationDriver,
  rootElement: any,
  ast: Ast<AnimationMetadataType>,
  enterClassName: string,
  leaveClassName: string,
  startingStyles: ɵStyleDataMap = new Map(),
  finalStyles: ɵStyleDataMap = new Map(),
  options: AnimationOptions,
  subInstructions?: ElementInstructionMap,
  errors: Error[] = [],
): AnimationTimelineInstruction[] {
  return new AnimationTimelineBuilderVisitor().buildKeyframes(
    driver,
    rootElement,
    ast,
    enterClassName,
    leaveClassName,
    startingStyles,
    finalStyles,
    options,
    subInstructions,
    errors,
  );
}

export class AnimationTimelineBuilderVisitor implements AstVisitor {
  buildKeyframes(
    driver: AnimationDriver,
    rootElement: any,
    ast: Ast<AnimationMetadataType>,
    enterClassName: string,
    leaveClassName: string,
    startingStyles: ɵStyleDataMap,
    finalStyles: ɵStyleDataMap,
    options: AnimationOptions,
    subInstructions?: ElementInstructionMap,
    errors: Error[] = [],
  ): AnimationTimelineInstruction[] {
    subInstructions = subInstructions || new ElementInstructionMap();
    const context = new AnimationTimelineContext(
      driver,
      rootElement,
      subInstructions,
      enterClassName,
      leaveClassName,
      errors,
      [],
    );
    context.options = options;
    const delay = options.delay ? resolveTimingValue(options.delay) : 0;
    context.currentTimeline.delayNextStep(delay);
    context.currentTimeline.setStyles([startingStyles], null, context.errors, options);

    visitDslNode(this, ast, context);

    // this checks to see if an actual animation happened
    const timelines = context.timelines.filter((timeline) => timeline.containsAnimation());

    // note: we just want to apply the final styles for the rootElement, so we do not
    //       just apply the styles to the last timeline but the last timeline which
    //       element is the root one (basically `*`-styles are replaced with the actual
    //       state style values only for the root element)
    if (timelines.length && finalStyles.size) {
      let lastRootTimeline: TimelineBuilder | undefined;
      for (let i = timelines.length - 1; i >= 0; i--) {
        const timeline = timelines[i];
        if (timeline.element === rootElement) {
          lastRootTimeline = timeline;
          break;
        }
      }
      if (lastRootTimeline && !lastRootTimeline.allowOnlyTimelineStyles()) {
        lastRootTimeline.setStyles([finalStyles], null, context.errors, options);
      }
    }
    return timelines.length
      ? timelines.map((timeline) => timeline.buildKeyframes())
      : [createTimelineInstruction(rootElement, [], [], [], 0, delay, '', false)];
  }

  visitTrigger(ast: TriggerAst, context: AnimationTimelineContext): any {
    // these values are not visited in this AST
  }

  visitState(ast: StateAst, context: AnimationTimelineContext): any {
    // these values are not visited in this AST
  }

  visitTransition(ast: TransitionAst, context: AnimationTimelineContext): any {
    // these values are not visited in this AST
  }

  visitAnimateChild(ast: AnimateChildAst, context: AnimationTimelineContext): any {
    const elementInstructions = context.subInstructions.get(context.element);
    if (elementInstructions) {
      const innerContext = context.createSubContext(ast.options);
      const startTime = context.currentTimeline.currentTime;
      const endTime = this._visitSubInstructions(
        elementInstructions,
        innerContext,
        innerContext.options as AnimateChildOptions,
      );
      if (startTime != endTime) {
        // we do this on the upper context because we created a sub context for
        // the sub child animations
        context.transformIntoNewTimeline(endTime);
      }
    }
    context.previousNode = ast;
  }

  visitAnimateRef(ast: AnimateRefAst, context: AnimationTimelineContext): any {
    const innerContext = context.createSubContext(ast.options);
    innerContext.transformIntoNewTimeline();
    this._applyAnimationRefDelays([ast.options, ast.animation.options], context, innerContext);
    this.visitReference(ast.animation, innerContext);
    context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
    context.previousNode = ast;
  }

  private _applyAnimationRefDelays(
    animationsRefsOptions: (AnimationOptions | null)[],
    context: AnimationTimelineContext,
    innerContext: AnimationTimelineContext,
  ) {
    for (const animationRefOptions of animationsRefsOptions) {
      const animationDelay = animationRefOptions?.delay;
      if (animationDelay) {
        const animationDelayValue =
          typeof animationDelay === 'number'
            ? animationDelay
            : resolveTimingValue(
                interpolateParams(
                  animationDelay,
                  animationRefOptions?.params ?? {},
                  context.errors,
                ),
              );
        innerContext.delayNextStep(animationDelayValue);
      }
    }
  }

  private _visitSubInstructions(
    instructions: AnimationTimelineInstruction[],
    context: AnimationTimelineContext,
    options: AnimateChildOptions,
  ): number {
    const startTime = context.currentTimeline.currentTime;
    let furthestTime = startTime;

    // this is a special-case for when a user wants to skip a sub
    // animation from being fired entirely.
    const duration = options.duration != null ? resolveTimingValue(options.duration) : null;
    const delay = options.delay != null ? resolveTimingValue(options.delay) : null;
    if (duration !== 0) {
      instructions.forEach((instruction) => {
        const instructionTimings = context.appendInstructionToTimeline(
          instruction,
          duration,
          delay,
        );
        furthestTime = Math.max(
          furthestTime,
          instructionTimings.duration + instructionTimings.delay,
        );
      });
    }

    return furthestTime;
  }

  visitReference(ast: ReferenceAst, context: AnimationTimelineContext) {
    context.updateOptions(ast.options, true);
    visitDslNode(this, ast.animation, context);
    context.previousNode = ast;
  }

  visitSequence(ast: SequenceAst, context: AnimationTimelineContext) {
    const subContextCount = context.subContextCount;
    let ctx = context;
    const options = ast.options;

    if (options && (options.params || options.delay)) {
      ctx = context.createSubContext(options);
      ctx.transformIntoNewTimeline();

      if (options.delay != null) {
        if (ctx.previousNode.type == AnimationMetadataType.Style) {
          ctx.currentTimeline.snapshotCurrentStyles();
          ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }

        const delay = resolveTimingValue(options.delay);
        ctx.delayNextStep(delay);
      }
    }

    if (ast.steps.length) {
      ast.steps.forEach((s) => visitDslNode(this, s, ctx));

      // this is here just in case the inner steps only contain or end with a style() call
      ctx.currentTimeline.applyStylesToKeyframe();

      // this means that some animation function within the sequence
      // ended up creating a sub timeline (which means the current
      // timeline cannot overlap with the contents of the sequence)
      if (ctx.subContextCount > subContextCount) {
        ctx.transformIntoNewTimeline();
      }
    }

    context.previousNode = ast;
  }

  visitGroup(ast: GroupAst, context: AnimationTimelineContext) {
    const innerTimelines: TimelineBuilder[] = [];
    let furthestTime = context.currentTimeline.currentTime;
    const delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;

    ast.steps.forEach((s) => {
      const innerContext = context.createSubContext(ast.options);
      if (delay) {
        innerContext.delayNextStep(delay);
      }

      visitDslNode(this, s, innerContext);
      furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
      innerTimelines.push(innerContext.currentTimeline);
    });

    // this operation is run after the AST loop because otherwise
    // if the parent timeline's collected styles were updated then
    // it would pass in invalid data into the new-to-be forked items
    innerTimelines.forEach((timeline) =>
      context.currentTimeline.mergeTimelineCollectedStyles(timeline),
    );
    context.transformIntoNewTimeline(furthestTime);
    context.previousNode = ast;
  }

  private _visitTiming(ast: TimingAst, context: AnimationTimelineContext): AnimateTimings {
    if ((ast as DynamicTimingAst).dynamic) {
      const strValue = (ast as DynamicTimingAst).strValue;
      const timingValue = context.params
        ? interpolateParams(strValue, context.params, context.errors)
        : strValue;
      return resolveTiming(timingValue, context.errors);
    } else {
      return {duration: ast.duration, delay: ast.delay, easing: ast.easing};
    }
  }

  visitAnimate(ast: AnimateAst, context: AnimationTimelineContext) {
    const timings = (context.currentAnimateTimings = this._visitTiming(ast.timings, context));
    const timeline = context.currentTimeline;
    if (timings.delay) {
      context.incrementTime(timings.delay);
      timeline.snapshotCurrentStyles();
    }

    const style = ast.style;
    if (style.type == AnimationMetadataType.Keyframes) {
      this.visitKeyframes(style, context);
    } else {
      context.incrementTime(timings.duration);
      this.visitStyle(style as StyleAst, context);
      timeline.applyStylesToKeyframe();
    }

    context.currentAnimateTimings = null;
    context.previousNode = ast;
  }

  visitStyle(ast: StyleAst, context: AnimationTimelineContext) {
    const timeline = context.currentTimeline;
    const timings = context.currentAnimateTimings!;

    // this is a special case for when a style() call
    // directly follows  an animate() call (but not inside of an animate() call)
    if (!timings && timeline.hasCurrentStyleProperties()) {
      timeline.forwardFrame();
    }

    const easing = (timings && timings.easing) || ast.easing;
    if (ast.isEmptyStep) {
      timeline.applyEmptyStep(easing);
    } else {
      timeline.setStyles(ast.styles, easing, context.errors, context.options);
    }

    context.previousNode = ast;
  }

  visitKeyframes(ast: KeyframesAst, context: AnimationTimelineContext) {
    const currentAnimateTimings = context.currentAnimateTimings!;
    const startTime = context.currentTimeline!.duration;
    const duration = currentAnimateTimings.duration;
    const innerContext = context.createSubContext();
    const innerTimeline = innerContext.currentTimeline;
    innerTimeline.easing = currentAnimateTimings.easing;

    ast.styles.forEach((step) => {
      const offset: number = step.offset || 0;
      innerTimeline.forwardTime(offset * duration);
      innerTimeline.setStyles(step.styles, step.easing, context.errors, context.options);
      innerTimeline.applyStylesToKeyframe();
    });

    // this will ensure that the parent timeline gets all the styles from
    // the child even if the new timeline below is not used
    context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);

    // we do this because the window between this timeline and the sub timeline
    // should ensure that the styles within are exactly the same as they were before
    context.transformIntoNewTimeline(startTime + duration);
    context.previousNode = ast;
  }

  visitQuery(ast: QueryAst, context: AnimationTimelineContext) {
    // in the event that the first step before this is a style step we need
    // to ensure the styles are applied before the children are animated
    const startTime = context.currentTimeline.currentTime;
    const options = (ast.options || {}) as AnimationQueryOptions;
    const delay = options.delay ? resolveTimingValue(options.delay) : 0;

    if (
      delay &&
      (context.previousNode.type === AnimationMetadataType.Style ||
        (startTime == 0 && context.currentTimeline.hasCurrentStyleProperties()))
    ) {
      context.currentTimeline.snapshotCurrentStyles();
      context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
    }

    let furthestTime = startTime;
    const elms = context.invokeQuery(
      ast.selector,
      ast.originalSelector,
      ast.limit,
      ast.includeSelf,
      options.optional ? true : false,
      context.errors,
    );

    context.currentQueryTotal = elms.length;
    let sameElementTimeline: TimelineBuilder | null = null;
    elms.forEach((element, i) => {
      context.currentQueryIndex = i;
      const innerContext = context.createSubContext(ast.options, element);
      if (delay) {
        innerContext.delayNextStep(delay);
      }

      if (element === context.element) {
        sameElementTimeline = innerContext.currentTimeline;
      }

      visitDslNode(this, ast.animation, innerContext);

      // this is here just incase the inner steps only contain or end
      // with a style() call (which is here to signal that this is a preparatory
      // call to style an element before it is animated again)
      innerContext.currentTimeline.applyStylesToKeyframe();

      const endTime = innerContext.currentTimeline.currentTime;
      furthestTime = Math.max(furthestTime, endTime);
    });

    context.currentQueryIndex = 0;
    context.currentQueryTotal = 0;
    context.transformIntoNewTimeline(furthestTime);

    if (sameElementTimeline) {
      context.currentTimeline.mergeTimelineCollectedStyles(sameElementTimeline);
      context.currentTimeline.snapshotCurrentStyles();
    }

    context.previousNode = ast;
  }

  visitStagger(ast: StaggerAst, context: AnimationTimelineContext) {
    const parentContext = context.parentContext!;
    const tl = context.currentTimeline;
    const timings = ast.timings;
    const duration = Math.abs(timings.duration);
    const maxTime = duration * (context.currentQueryTotal - 1);
    let delay = duration * context.currentQueryIndex;

    let staggerTransformer = timings.duration < 0 ? 'reverse' : timings.easing;
    switch (staggerTransformer) {
      case 'reverse':
        delay = maxTime - delay;
        break;
      case 'full':
        delay = parentContext.currentStaggerTime;
        break;
    }

    const timeline = context.currentTimeline;
    if (delay) {
      timeline.delayNextStep(delay);
    }

    const startingTime = timeline.currentTime;
    visitDslNode(this, ast.animation, context);
    context.previousNode = ast;

    // time = duration + delay
    // the reason why this computation is so complex is because
    // the inner timeline may either have a delay value or a stretched
    // keyframe depending on if a subtimeline is not used or is used.
    parentContext.currentStaggerTime =
      tl.currentTime - startingTime + (tl.startTime - parentContext.currentTimeline.startTime);
  }
}

export declare type StyleAtTime = {
  time: number;
  value: string | number;
};

const DEFAULT_NOOP_PREVIOUS_NODE = <Ast<AnimationMetadataType>>{};
export class AnimationTimelineContext {
  public parentContext: AnimationTimelineContext | null = null;
  public currentTimeline: TimelineBuilder;
  public currentAnimateTimings: AnimateTimings | null = null;
  public previousNode: Ast<AnimationMetadataType> = DEFAULT_NOOP_PREVIOUS_NODE;
  public subContextCount = 0;
  public options: AnimationOptions = {};
  public currentQueryIndex: number = 0;
  public currentQueryTotal: number = 0;
  public currentStaggerTime: number = 0;

  constructor(
    private _driver: AnimationDriver,
    public element: any,
    public subInstructions: ElementInstructionMap,
    private _enterClassName: string,
    private _leaveClassName: string,
    public errors: Error[],
    public timelines: TimelineBuilder[],
    initialTimeline?: TimelineBuilder,
  ) {
    this.currentTimeline = initialTimeline || new TimelineBuilder(this._driver, element, 0);
    timelines.push(this.currentTimeline);
  }

  get params() {
    return this.options.params;
  }

  updateOptions(options: AnimationOptions | null, skipIfExists?: boolean) {
    if (!options) return;

    const newOptions = options as any;
    let optionsToUpdate = this.options;

    // NOTE: this will get patched up when other animation methods support duration overrides
    if (newOptions.duration != null) {
      (optionsToUpdate as any).duration = resolveTimingValue(newOptions.duration);
    }

    if (newOptions.delay != null) {
      optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
    }

    const newParams = newOptions.params;
    if (newParams) {
      let paramsToUpdate: {[name: string]: any} = optionsToUpdate.params!;
      if (!paramsToUpdate) {
        paramsToUpdate = this.options.params = {};
      }

      Object.keys(newParams).forEach((name) => {
        if (!skipIfExists || !paramsToUpdate.hasOwnProperty(name)) {
          paramsToUpdate[name] = interpolateParams(newParams[name], paramsToUpdate, this.errors);
        }
      });
    }
  }

  private _copyOptions() {
    const options: AnimationOptions = {};
    if (this.options) {
      const oldParams = this.options.params;
      if (oldParams) {
        const params: {[name: string]: any} = (options['params'] = {});
        Object.keys(oldParams).forEach((name) => {
          params[name] = oldParams[name];
        });
      }
    }
    return options;
  }

  createSubContext(
    options: AnimationOptions | null = null,
    element?: any,
    newTime?: number,
  ): AnimationTimelineContext {
    const target = element || this.element;
    const context = new AnimationTimelineContext(
      this._driver,
      target,
      this.subInstructions,
      this._enterClassName,
      this._leaveClassName,
      this.errors,
      this.timelines,
      this.currentTimeline.fork(target, newTime || 0),
    );
    context.previousNode = this.previousNode;
    context.currentAnimateTimings = this.currentAnimateTimings;

    context.options = this._copyOptions();
    context.updateOptions(options);

    context.currentQueryIndex = this.currentQueryIndex;
    context.currentQueryTotal = this.currentQueryTotal;
    context.parentContext = this;
    this.subContextCount++;
    return context;
  }

  transformIntoNewTimeline(newTime?: number) {
    this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
    this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
    this.timelines.push(this.currentTimeline);
    return this.currentTimeline;
  }

  appendInstructionToTimeline(
    instruction: AnimationTimelineInstruction,
    duration: number | null,
    delay: number | null,
  ): AnimateTimings {
    const updatedTimings: AnimateTimings = {
      duration: duration != null ? duration : instruction.duration,
      delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
      easing: '',
    };
    const builder = new SubTimelineBuilder(
      this._driver,
      instruction.element,
      instruction.keyframes,
      instruction.preStyleProps,
      instruction.postStyleProps,
      updatedTimings,
      instruction.stretchStartingKeyframe,
    );
    this.timelines.push(builder);
    return updatedTimings;
  }

  incrementTime(time: number) {
    this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
  }

  delayNextStep(delay: number) {
    // negative delays are not yet supported
    if (delay > 0) {
      this.currentTimeline.delayNextStep(delay);
    }
  }

  invokeQuery(
    selector: string,
    originalSelector: string,
    limit: number,
    includeSelf: boolean,
    optional: boolean,
    errors: Error[],
  ): any[] {
    let results: any[] = [];
    if (includeSelf) {
      results.push(this.element);
    }
    if (selector.length > 0) {
      // only if :self is used then the selector can be empty
      selector = selector.replace(ENTER_TOKEN_REGEX, '.' + this._enterClassName);
      selector = selector.replace(LEAVE_TOKEN_REGEX, '.' + this._leaveClassName);
      const multi = limit != 1;
      let elements = this._driver.query(this.element, selector, multi);
      if (limit !== 0) {
        elements =
          limit < 0
            ? elements.slice(elements.length + limit, elements.length)
            : elements.slice(0, limit);
      }
      results.push(...elements);
    }

    if (!optional && results.length == 0) {
      errors.push(invalidQuery(originalSelector));
    }
    return results;
  }
}

export class TimelineBuilder {
  public duration: number = 0;
  public easing: string | null = null;
  private _previousKeyframe: ɵStyleDataMap = new Map();
  private _currentKeyframe: ɵStyleDataMap = new Map();
  private _keyframes = new Map<number, ɵStyleDataMap>();
  private _styleSummary = new Map<string, StyleAtTime>();
  private _localTimelineStyles: ɵStyleDataMap = new Map();
  private _globalTimelineStyles: ɵStyleDataMap;
  private _pendingStyles: ɵStyleDataMap = new Map();
  private _backFill: ɵStyleDataMap = new Map();
  private _currentEmptyStepKeyframe: ɵStyleDataMap | null = null;

  constructor(
    private _driver: AnimationDriver,
    public element: any,
    public startTime: number,
    private _elementTimelineStylesLookup?: Map<any, ɵStyleDataMap>,
  ) {
    if (!this._elementTimelineStylesLookup) {
      this._elementTimelineStylesLookup = new Map<any, ɵStyleDataMap>();
    }

    this._globalTimelineStyles = this._elementTimelineStylesLookup.get(element)!;
    if (!this._globalTimelineStyles) {
      this._globalTimelineStyles = this._localTimelineStyles;
      this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
    }
    this._loadKeyframe();
  }

  containsAnimation(): boolean {
    switch (this._keyframes.size) {
      case 0:
        return false;
      case 1:
        return this.hasCurrentStyleProperties();
      default:
        return true;
    }
  }

  hasCurrentStyleProperties(): boolean {
    return this._currentKeyframe.size > 0;
  }

  get currentTime() {
    return this.startTime + this.duration;
  }

  delayNextStep(delay: number) {
    // in the event that a style() step is placed right before a stagger()
    // and that style() step is the very first style() value in the animation
    // then we need to make a copy of the keyframe [0, copy, 1] so that the delay
    // properly applies the style() values to work with the stagger...
    const hasPreStyleStep = this._keyframes.size === 1 && this._pendingStyles.size;

    if (this.duration || hasPreStyleStep) {
      this.forwardTime(this.currentTime + delay);
      if (hasPreStyleStep) {
        this.snapshotCurrentStyles();
      }
    } else {
      this.startTime += delay;
    }
  }

  fork(element: any, currentTime?: number): TimelineBuilder {
    this.applyStylesToKeyframe();
    return new TimelineBuilder(
      this._driver,
      element,
      currentTime || this.currentTime,
      this._elementTimelineStylesLookup,
    );
  }

  private _loadKeyframe() {
    if (this._currentKeyframe) {
      this._previousKeyframe = this._currentKeyframe;
    }
    this._currentKeyframe = this._keyframes.get(this.duration)!;
    if (!this._currentKeyframe) {
      this._currentKeyframe = new Map();
      this._keyframes.set(this.duration, this._currentKeyframe);
    }
  }

  forwardFrame() {
    this.duration += ONE_FRAME_IN_MILLISECONDS;
    this._loadKeyframe();
  }

  forwardTime(time: number) {
    this.applyStylesToKeyframe();
    this.duration = time;
    this._loadKeyframe();
  }

  private _updateStyle(prop: string, value: string | number) {
    this._localTimelineStyles.set(prop, value);
    this._globalTimelineStyles.set(prop, value);
    this._styleSummary.set(prop, {time: this.currentTime, value});
  }

  allowOnlyTimelineStyles() {
    return this._currentEmptyStepKeyframe !== this._currentKeyframe;
  }

  applyEmptyStep(easing: string | null) {
    if (easing) {
      this._previousKeyframe.set('easing', easing);
    }

    // special case for animate(duration):
    // all missing styles are filled with a `*` value then
    // if any destination styles are filled in later on the same
    // keyframe then they will override the overridden styles
    // We use `_globalTimelineStyles` here because there may be
    // styles in previous keyframes that are not present in this timeline
    for (let [prop, value] of this._globalTimelineStyles) {
      this._backFill.set(prop, value || AUTO_STYLE);
      this._currentKeyframe.set(prop, AUTO_STYLE);
    }
    this._currentEmptyStepKeyframe = this._currentKeyframe;
  }

  setStyles(
    input: Array<ɵStyleDataMap | string>,
    easing: string | null,
    errors: Error[],
    options?: AnimationOptions,
  ) {
    if (easing) {
      this._previousKeyframe.set('easing', easing);
    }
    const params = (options && options.params) || {};
    const styles = flattenStyles(input, this._globalTimelineStyles);
    for (let [prop, value] of styles) {
      const val = interpolateParams(value, params, errors);
      this._pendingStyles.set(prop, val);
      if (!this._localTimelineStyles.has(prop)) {
        this._backFill.set(prop, this._globalTimelineStyles.get(prop) ?? AUTO_STYLE);
      }
      this._updateStyle(prop, val);
    }
  }

  applyStylesToKeyframe() {
    if (this._pendingStyles.size == 0) return;

    this._pendingStyles.forEach((val, prop) => {
      this._currentKeyframe.set(prop, val);
    });
    this._pendingStyles.clear();

    this._localTimelineStyles.forEach((val, prop) => {
      if (!this._currentKeyframe.has(prop)) {
        this._currentKeyframe.set(prop, val);
      }
    });
  }

  snapshotCurrentStyles() {
    for (let [prop, val] of this._localTimelineStyles) {
      this._pendingStyles.set(prop, val);
      this._updateStyle(prop, val);
    }
  }

  getFinalKeyframe() {
    return this._keyframes.get(this.duration);
  }

  get properties() {
    const properties: string[] = [];
    for (let prop in this._currentKeyframe) {
      properties.push(prop);
    }
    return properties;
  }

  mergeTimelineCollectedStyles(timeline: TimelineBuilder) {
    timeline._styleSummary.forEach((details1, prop) => {
      const details0 = this._styleSummary.get(prop);
      if (!details0 || details1.time > details0.time) {
        this._updateStyle(prop, details1.value);
      }
    });
  }

  buildKeyframes(): AnimationTimelineInstruction {
    this.applyStylesToKeyframe();
    const preStyleProps = new Set<string>();
    const postStyleProps = new Set<string>();
    const isEmpty = this._keyframes.size === 1 && this.duration === 0;

    let finalKeyframes: Array<ɵStyleDataMap> = [];
    this._keyframes.forEach((keyframe, time) => {
      const finalKeyframe = new Map([...this._backFill, ...keyframe]);
      finalKeyframe.forEach((value, prop) => {
        if (value === PRE_STYLE) {
          preStyleProps.add(prop);
        } else if (value === AUTO_STYLE) {
          postStyleProps.add(prop);
        }
      });
      if (!isEmpty) {
        finalKeyframe.set('offset', time / this.duration);
      }
      finalKeyframes.push(finalKeyframe);
    });

    const preProps: string[] = [...preStyleProps.values()];
    const postProps: string[] = [...postStyleProps.values()];

    // special case for a 0-second animation (which is designed just to place styles onscreen)
    if (isEmpty) {
      const kf0 = finalKeyframes[0];
      const kf1 = new Map(kf0);
      kf0.set('offset', 0);
      kf1.set('offset', 1);
      finalKeyframes = [kf0, kf1];
    }

    return createTimelineInstruction(
      this.element,
      finalKeyframes,
      preProps,
      postProps,
      this.duration,
      this.startTime,
      this.easing,
      false,
    );
  }
}

class SubTimelineBuilder extends TimelineBuilder {
  public timings: AnimateTimings;

  constructor(
    driver: AnimationDriver,
    element: any,
    public keyframes: Array<ɵStyleDataMap>,
    public preStyleProps: string[],
    public postStyleProps: string[],
    timings: AnimateTimings,
    private _stretchStartingKeyframe: boolean = false,
  ) {
    super(driver, element, timings.delay);
    this.timings = {duration: timings.duration, delay: timings.delay, easing: timings.easing};
  }

  override containsAnimation(): boolean {
    return this.keyframes.length > 1;
  }

  override buildKeyframes(): AnimationTimelineInstruction {
    let keyframes = this.keyframes;
    let {delay, duration, easing} = this.timings;
    if (this._stretchStartingKeyframe && delay) {
      const newKeyframes: Array<ɵStyleDataMap> = [];
      const totalTime = duration + delay;
      const startingGap = delay / totalTime;

      // the original starting keyframe now starts once the delay is done
      const newFirstKeyframe = new Map(keyframes[0]);
      newFirstKeyframe.set('offset', 0);
      newKeyframes.push(newFirstKeyframe);

      const oldFirstKeyframe = new Map(keyframes[0]);
      oldFirstKeyframe.set('offset', roundOffset(startingGap));
      newKeyframes.push(oldFirstKeyframe);

      /*
        When the keyframe is stretched then it means that the delay before the animation
        starts is gone. Instead the first keyframe is placed at the start of the animation
        and it is then copied to where it starts when the original delay is over. This basically
        means nothing animates during that delay, but the styles are still rendered. For this
        to work the original offset values that exist in the original keyframes must be "warped"
        so that they can take the new keyframe + delay into account.

        delay=1000, duration=1000, keyframes = 0 .5 1

        turns into

        delay=0, duration=2000, keyframes = 0 .33 .66 1
       */

      // offsets between 1 ... n -1 are all warped by the keyframe stretch
      const limit = keyframes.length - 1;
      for (let i = 1; i <= limit; i++) {
        let kf = new Map(keyframes[i]);
        const oldOffset = kf.get('offset') as number;
        const timeAtKeyframe = delay + oldOffset * duration;
        kf.set('offset', roundOffset(timeAtKeyframe / totalTime));
        newKeyframes.push(kf);
      }

      // the new starting keyframe should be added at the start
      duration = totalTime;
      delay = 0;
      easing = '';

      keyframes = newKeyframes;
    }

    return createTimelineInstruction(
      this.element,
      keyframes,
      this.preStyleProps,
      this.postStyleProps,
      duration,
      delay,
      easing,
      true,
    );
  }
}

function roundOffset(offset: number, decimalPoints = 3): number {
  const mult = Math.pow(10, decimalPoints - 1);
  return Math.round(offset * mult) / mult;
}

function flattenStyles(input: Array<ɵStyleDataMap | string>, allStyles: ɵStyleDataMap) {
  const styles: ɵStyleDataMap = new Map();
  let allProperties: string[] | IterableIterator<string>;
  input.forEach((token) => {
    if (token === '*') {
      allProperties ??= allStyles.keys();
      for (let prop of allProperties) {
        styles.set(prop, AUTO_STYLE);
      }
    } else {
      for (let [prop, val] of token as ɵStyleDataMap) {
        styles.set(prop, val);
      }
    }
  });
  return styles;
}
