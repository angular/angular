/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as chars from '../chars';
import {Lexer, Token, TokenType} from '../expression_parser/lexer';
import * as html from '../ml_parser/ast';
import {ParseError, ParseSourceSpan} from '../parse_util';
import {BindingParser} from '../template_parser/binding_parser';

import * as t from './r3_ast';

/** Pattern for a timing value in a trigger. */
const TIME_PATTERN = /^\d+\.?\d*(ms|s)?$/;

/** Pattern for a separator between keywords in a trigger expression. */
const SEPARATOR_PATTERN = /^\s$/;

/** Pairs of characters that form syntax that is comma-delimited. */
const COMMA_DELIMITED_SYNTAX = new Map([
  [chars.$LBRACE, chars.$RBRACE], // Object literals
  [chars.$LBRACKET, chars.$RBRACKET], // Array literals
  [chars.$LPAREN, chars.$RPAREN], // Function calls
]);

/** Possible types of `on` triggers. */
enum OnTriggerType {
  IDLE = 'idle',
  TIMER = 'timer',
  INTERACTION = 'interaction',
  IMMEDIATE = 'immediate',
  HOVER = 'hover',
  VIEWPORT = 'viewport',
  NEVER = 'never',
}

/** Function that validates the structure of a reference-based trigger. */
type ReferenceTriggerValidator = (type: OnTriggerType, parameters: string[]) => void;

/** Parses a `when` deferred trigger. */
export function parseNeverTrigger(
  {expression, sourceSpan}: html.BlockParameter,
  triggers: t.DeferredBlockTriggers,
  errors: ParseError[],
): void {
  const neverIndex = expression.indexOf('never');
  const neverSourceSpan = new ParseSourceSpan(
    sourceSpan.start.moveBy(neverIndex),
    sourceSpan.start.moveBy(neverIndex + 'never'.length),
  );
  const prefetchSpan = getPrefetchSpan(expression, sourceSpan);
  const hydrateSpan = getHydrateSpan(expression, sourceSpan);

  // This is here just to be safe, we shouldn't enter this function
  // in the first place if a block doesn't have the "on" keyword.
  if (neverIndex === -1) {
    errors.push(new ParseError(sourceSpan, `Could not find "never" keyword in expression`));
  } else {
    trackTrigger(
      'never',
      triggers,
      errors,
      new t.NeverDeferredTrigger(neverSourceSpan, sourceSpan, prefetchSpan, null, hydrateSpan),
    );
  }
}

/** Parses a `when` deferred trigger. */
export function parseWhenTrigger(
  {expression, sourceSpan}: html.BlockParameter,
  bindingParser: BindingParser,
  triggers: t.DeferredBlockTriggers,
  errors: ParseError[],
): void {
  const whenIndex = expression.indexOf('when');
  const whenSourceSpan = new ParseSourceSpan(
    sourceSpan.start.moveBy(whenIndex),
    sourceSpan.start.moveBy(whenIndex + 'when'.length),
  );
  const prefetchSpan = getPrefetchSpan(expression, sourceSpan);
  const hydrateSpan = getHydrateSpan(expression, sourceSpan);

  // This is here just to be safe, we shouldn't enter this function
  // in the first place if a block doesn't have the "when" keyword.
  if (whenIndex === -1) {
    errors.push(new ParseError(sourceSpan, `Could not find "when" keyword in expression`));
  } else {
    const start = getTriggerParametersStart(expression, whenIndex + 1);
    const parsed = bindingParser.parseBinding(
      expression.slice(start),
      false,
      sourceSpan,
      sourceSpan.start.offset + start,
    );
    trackTrigger(
      'when',
      triggers,
      errors,
      new t.BoundDeferredTrigger(parsed, sourceSpan, prefetchSpan, whenSourceSpan, hydrateSpan),
    );
  }
}

/** Parses an `on` trigger */
export function parseOnTrigger(
  {expression, sourceSpan}: html.BlockParameter,
  triggers: t.DeferredBlockTriggers,
  errors: ParseError[],
  placeholder: t.DeferredBlockPlaceholder | null,
): void {
  const onIndex = expression.indexOf('on');
  const onSourceSpan = new ParseSourceSpan(
    sourceSpan.start.moveBy(onIndex),
    sourceSpan.start.moveBy(onIndex + 'on'.length),
  );
  const prefetchSpan = getPrefetchSpan(expression, sourceSpan);
  const hydrateSpan = getHydrateSpan(expression, sourceSpan);

  // This is here just to be safe, we shouldn't enter this function
  // in the first place if a block doesn't have the "on" keyword.
  if (onIndex === -1) {
    errors.push(new ParseError(sourceSpan, `Could not find "on" keyword in expression`));
  } else {
    const start = getTriggerParametersStart(expression, onIndex + 1);
    const parser = new OnTriggerParser(
      expression,
      start,
      sourceSpan,
      triggers,
      errors,
      expression.startsWith('hydrate')
        ? validateHydrateReferenceBasedTrigger
        : validatePlainReferenceBasedTrigger,
      placeholder,
      prefetchSpan,
      onSourceSpan,
      hydrateSpan,
    );
    parser.parse();
  }
}

function getPrefetchSpan(expression: string, sourceSpan: ParseSourceSpan) {
  if (!expression.startsWith('prefetch')) {
    return null;
  }
  return new ParseSourceSpan(sourceSpan.start, sourceSpan.start.moveBy('prefetch'.length));
}

function getHydrateSpan(expression: string, sourceSpan: ParseSourceSpan) {
  if (!expression.startsWith('hydrate')) {
    return null;
  }
  return new ParseSourceSpan(sourceSpan.start, sourceSpan.start.moveBy('hydrate'.length));
}

class OnTriggerParser {
  private index = 0;
  private tokens: Token[];

  constructor(
    private expression: string,
    private start: number,
    private span: ParseSourceSpan,
    private triggers: t.DeferredBlockTriggers,
    private errors: ParseError[],
    private validator: ReferenceTriggerValidator,
    private placeholder: t.DeferredBlockPlaceholder | null,
    private prefetchSpan: ParseSourceSpan | null,
    private onSourceSpan: ParseSourceSpan,
    private hydrateSpan: ParseSourceSpan | null,
  ) {
    this.tokens = new Lexer().tokenize(expression.slice(start));
  }

  parse(): void {
    while (this.tokens.length > 0 && this.index < this.tokens.length) {
      const token = this.token();

      if (!token.isIdentifier()) {
        this.unexpectedToken(token);
        break;
      }

      // An identifier immediately followed by a comma or the end of
      // the expression cannot have parameters so we can exit early.
      if (this.isFollowedByOrLast(chars.$COMMA)) {
        this.consumeTrigger(token, []);
        this.advance();
      } else if (this.isFollowedByOrLast(chars.$LPAREN)) {
        this.advance(); // Advance to the opening paren.
        const prevErrors = this.errors.length;
        const parameters = this.consumeParameters();
        if (this.errors.length !== prevErrors) {
          break;
        }
        this.consumeTrigger(token, parameters);
        this.advance(); // Advance past the closing paren.
      } else if (this.index < this.tokens.length - 1) {
        this.unexpectedToken(this.tokens[this.index + 1]);
      }

      this.advance();
    }
  }

  private advance() {
    this.index++;
  }

  private isFollowedByOrLast(char: number): boolean {
    if (this.index === this.tokens.length - 1) {
      return true;
    }

    return this.tokens[this.index + 1].isCharacter(char);
  }

  private token(): Token {
    return this.tokens[Math.min(this.index, this.tokens.length - 1)];
  }

  private consumeTrigger(identifier: Token, parameters: string[]) {
    const triggerNameStartSpan = this.span.start.moveBy(
      this.start + identifier.index - this.tokens[0].index,
    );
    const nameSpan = new ParseSourceSpan(
      triggerNameStartSpan,
      triggerNameStartSpan.moveBy(identifier.strValue.length),
    );
    const endSpan = triggerNameStartSpan.moveBy(this.token().end - identifier.index);

    // Put the prefetch and on spans with the first trigger
    // This should maybe be refactored to have something like an outer OnGroup AST
    // Since triggers can be grouped with commas "on hover(x), interaction(y)"
    const isFirstTrigger = identifier.index === 0;
    const onSourceSpan = isFirstTrigger ? this.onSourceSpan : null;
    const prefetchSourceSpan = isFirstTrigger ? this.prefetchSpan : null;
    const hydrateSourceSpan = isFirstTrigger ? this.hydrateSpan : null;
    const sourceSpan = new ParseSourceSpan(
      isFirstTrigger ? this.span.start : triggerNameStartSpan,
      endSpan,
    );

    try {
      switch (identifier.toString()) {
        case OnTriggerType.IDLE:
          this.trackTrigger(
            'idle',
            createIdleTrigger(
              parameters,
              nameSpan,
              sourceSpan,
              prefetchSourceSpan,
              onSourceSpan,
              hydrateSourceSpan,
            ),
          );
          break;

        case OnTriggerType.TIMER:
          this.trackTrigger(
            'timer',
            createTimerTrigger(
              parameters,
              nameSpan,
              sourceSpan,
              this.prefetchSpan,
              this.onSourceSpan,
              this.hydrateSpan,
            ),
          );
          break;

        case OnTriggerType.INTERACTION:
          this.trackTrigger(
            'interaction',
            createInteractionTrigger(
              parameters,
              nameSpan,
              sourceSpan,
              this.prefetchSpan,
              this.onSourceSpan,
              this.hydrateSpan,
              this.validator,
            ),
          );
          break;

        case OnTriggerType.IMMEDIATE:
          this.trackTrigger(
            'immediate',
            createImmediateTrigger(
              parameters,
              nameSpan,
              sourceSpan,
              this.prefetchSpan,
              this.onSourceSpan,
              this.hydrateSpan,
            ),
          );
          break;

        case OnTriggerType.HOVER:
          this.trackTrigger(
            'hover',
            createHoverTrigger(
              parameters,
              nameSpan,
              sourceSpan,
              this.prefetchSpan,
              this.onSourceSpan,
              this.hydrateSpan,
              this.placeholder,
              this.validator,
            ),
          );
          break;

        case OnTriggerType.VIEWPORT:
          this.trackTrigger(
            'viewport',
            createViewportTrigger(
              parameters,
              nameSpan,
              sourceSpan,
              this.prefetchSpan,
              this.onSourceSpan,
              this.hydrateSpan,
              this.validator,
            ),
          );
          break;

        default:
          throw new Error(`Unrecognized trigger type "${identifier}"`);
      }
    } catch (e) {
      this.error(identifier, (e as Error).message);
    }
  }

  private consumeParameters(): string[] {
    const parameters: string[] = [];

    if (!this.token().isCharacter(chars.$LPAREN)) {
      this.unexpectedToken(this.token());
      return parameters;
    }

    this.advance();

    const commaDelimStack: number[] = [];
    let current = '';

    while (this.index < this.tokens.length) {
      const token = this.token();

      // Stop parsing if we've hit the end character and we're outside of a comma-delimited syntax.
      // Note that we don't need to account for strings here since the lexer already parsed them
      // into string tokens.
      if (token.isCharacter(chars.$RPAREN) && commaDelimStack.length === 0) {
        if (current.length) {
          parameters.push(current);
        }
        break;
      }

      // In the `on` microsyntax "top-level" commas (e.g. ones outside of an parameters) separate
      // the different triggers (e.g. `on idle,timer(500)`). This is problematic, because the
      // function-like syntax also implies that multiple parameters can be passed into the
      // individual trigger (e.g. `on foo(a, b)`). To avoid tripping up the parser with commas that
      // are part of other sorts of syntax (object literals, arrays), we treat anything inside
      // a comma-delimited syntax block as plain text.
      if (token.type === TokenType.Character && COMMA_DELIMITED_SYNTAX.has(token.numValue)) {
        commaDelimStack.push(COMMA_DELIMITED_SYNTAX.get(token.numValue)!);
      }

      if (
        commaDelimStack.length > 0 &&
        token.isCharacter(commaDelimStack[commaDelimStack.length - 1])
      ) {
        commaDelimStack.pop();
      }

      // If we hit a comma outside of a comma-delimited syntax, it means
      // that we're at the top level and we're starting a new parameter.
      if (commaDelimStack.length === 0 && token.isCharacter(chars.$COMMA) && current.length > 0) {
        parameters.push(current);
        current = '';
        this.advance();
        continue;
      }

      // Otherwise treat the token as a plain text character in the current parameter.
      current += this.tokenText();
      this.advance();
    }

    if (!this.token().isCharacter(chars.$RPAREN) || commaDelimStack.length > 0) {
      this.error(this.token(), 'Unexpected end of expression');
    }

    if (
      this.index < this.tokens.length - 1 &&
      !this.tokens[this.index + 1].isCharacter(chars.$COMMA)
    ) {
      this.unexpectedToken(this.tokens[this.index + 1]);
    }

    return parameters;
  }

  private tokenText(): string {
    // Tokens have a toString already which we could use, but for string tokens it omits the quotes.
    // Eventually we could expose this information on the token directly.
    return this.expression.slice(this.start + this.token().index, this.start + this.token().end);
  }

  private trackTrigger(name: keyof t.DeferredBlockTriggers, trigger: t.DeferredTrigger): void {
    trackTrigger(name, this.triggers, this.errors, trigger);
  }

  private error(token: Token, message: string): void {
    const newStart = this.span.start.moveBy(this.start + token.index);
    const newEnd = newStart.moveBy(token.end - token.index);
    this.errors.push(new ParseError(new ParseSourceSpan(newStart, newEnd), message));
  }

  private unexpectedToken(token: Token) {
    this.error(token, `Unexpected token "${token}"`);
  }
}

/** Adds a trigger to a map of triggers. */
function trackTrigger(
  name: keyof t.DeferredBlockTriggers,
  allTriggers: t.DeferredBlockTriggers,
  errors: ParseError[],
  trigger: t.DeferredTrigger,
) {
  if (allTriggers[name]) {
    errors.push(new ParseError(trigger.sourceSpan, `Duplicate "${name}" trigger is not allowed`));
  } else {
    allTriggers[name] = trigger as any;
  }
}

function createIdleTrigger(
  parameters: string[],
  nameSpan: ParseSourceSpan,
  sourceSpan: ParseSourceSpan,
  prefetchSpan: ParseSourceSpan | null,
  onSourceSpan: ParseSourceSpan | null,
  hydrateSpan: ParseSourceSpan | null,
): t.IdleDeferredTrigger {
  if (parameters.length > 0) {
    throw new Error(`"${OnTriggerType.IDLE}" trigger cannot have parameters`);
  }

  return new t.IdleDeferredTrigger(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
}

function createTimerTrigger(
  parameters: string[],
  nameSpan: ParseSourceSpan,
  sourceSpan: ParseSourceSpan,
  prefetchSpan: ParseSourceSpan | null,
  onSourceSpan: ParseSourceSpan | null,
  hydrateSpan: ParseSourceSpan | null,
) {
  if (parameters.length !== 1) {
    throw new Error(`"${OnTriggerType.TIMER}" trigger must have exactly one parameter`);
  }

  const delay = parseDeferredTime(parameters[0]);

  if (delay === null) {
    throw new Error(`Could not parse time value of trigger "${OnTriggerType.TIMER}"`);
  }

  return new t.TimerDeferredTrigger(
    delay,
    nameSpan,
    sourceSpan,
    prefetchSpan,
    onSourceSpan,
    hydrateSpan,
  );
}

function createImmediateTrigger(
  parameters: string[],
  nameSpan: ParseSourceSpan,
  sourceSpan: ParseSourceSpan,
  prefetchSpan: ParseSourceSpan | null,
  onSourceSpan: ParseSourceSpan | null,
  hydrateSpan: ParseSourceSpan | null,
): t.ImmediateDeferredTrigger {
  if (parameters.length > 0) {
    throw new Error(`"${OnTriggerType.IMMEDIATE}" trigger cannot have parameters`);
  }

  return new t.ImmediateDeferredTrigger(
    nameSpan,
    sourceSpan,
    prefetchSpan,
    onSourceSpan,
    hydrateSpan,
  );
}

function createHoverTrigger(
  parameters: string[],
  nameSpan: ParseSourceSpan,
  sourceSpan: ParseSourceSpan,
  prefetchSpan: ParseSourceSpan | null,
  onSourceSpan: ParseSourceSpan | null,
  hydrateSpan: ParseSourceSpan | null,
  placeholder: t.DeferredBlockPlaceholder | null,
  validator: ReferenceTriggerValidator,
): t.HoverDeferredTrigger {
  validator(OnTriggerType.HOVER, parameters);
  return new t.HoverDeferredTrigger(
    parameters[0] ?? null,
    nameSpan,
    sourceSpan,
    prefetchSpan,
    onSourceSpan,
    hydrateSpan,
  );
}

function createInteractionTrigger(
  parameters: string[],
  nameSpan: ParseSourceSpan,
  sourceSpan: ParseSourceSpan,
  prefetchSpan: ParseSourceSpan | null,
  onSourceSpan: ParseSourceSpan | null,
  hydrateSpan: ParseSourceSpan | null,
  validator: ReferenceTriggerValidator,
): t.InteractionDeferredTrigger {
  validator(OnTriggerType.INTERACTION, parameters);
  return new t.InteractionDeferredTrigger(
    parameters[0] ?? null,
    nameSpan,
    sourceSpan,
    prefetchSpan,
    onSourceSpan,
    hydrateSpan,
  );
}

function createViewportTrigger(
  parameters: string[],
  nameSpan: ParseSourceSpan,
  sourceSpan: ParseSourceSpan,
  prefetchSpan: ParseSourceSpan | null,
  onSourceSpan: ParseSourceSpan | null,
  hydrateSpan: ParseSourceSpan | null,
  validator: ReferenceTriggerValidator,
): t.ViewportDeferredTrigger {
  validator(OnTriggerType.VIEWPORT, parameters);
  return new t.ViewportDeferredTrigger(
    parameters[0] ?? null,
    nameSpan,
    sourceSpan,
    prefetchSpan,
    onSourceSpan,
    hydrateSpan,
  );
}

/**
 * Checks whether the structure of a non-hydrate reference-based trigger is valid.
 * @param type Type of the trigger being validated.
 * @param parameters Parameters of the trigger.
 */
function validatePlainReferenceBasedTrigger(type: OnTriggerType, parameters: string[]) {
  if (parameters.length > 1) {
    throw new Error(`"${type}" trigger can only have zero or one parameters`);
  }
}

/**
 * Checks whether the structure of a hydrate trigger is valid.
 * @param type Type of the trigger being validated.
 * @param parameters Parameters of the trigger.
 */
function validateHydrateReferenceBasedTrigger(type: OnTriggerType, parameters: string[]) {
  if (parameters.length > 0) {
    throw new Error(`Hydration trigger "${type}" cannot have parameters`);
  }
}

/** Gets the index within an expression at which the trigger parameters start. */
export function getTriggerParametersStart(value: string, startPosition = 0): number {
  let hasFoundSeparator = false;

  for (let i = startPosition; i < value.length; i++) {
    if (SEPARATOR_PATTERN.test(value[i])) {
      hasFoundSeparator = true;
    } else if (hasFoundSeparator) {
      return i;
    }
  }

  return -1;
}

/**
 * Parses a time expression from a deferred trigger to
 * milliseconds. Returns null if it cannot be parsed.
 */
export function parseDeferredTime(value: string): number | null {
  const match = value.match(TIME_PATTERN);

  if (!match) {
    return null;
  }

  const [time, units] = match;
  return parseFloat(time) * (units === 's' ? 1000 : 1);
}
