/* clang-format off */

@Component({
  //// Quoted static attributes
  host: {
    'class': 'one two',
    'my-attr': 'my-value',
    "doubleQuotes": "value",
    'backticksForValue': `my-attr-${value}`,
  },

  //// Unquoted static attributes
  host: {
    class: 'one two',
    myAttr: "my-value",
    style: `color: red;`,
  },

  //// Attribute bindings
  host: {
    '[attr.one]': '123 + "hello"',
    '[attr.two]': '"something" + counter / 2',
  },

  //// Class bindings
  host: {
    '[class.one]': 'value',
    '[class.two]': 'foo || bar',
  },

  //// Property bindings
  host: {
    '[one]': 'value',
    '[two]': 'foo || bar',
    '[@three]': 'animation',
  },

  //// Event listeners
  host: {
    '(click)': 'handleClick(123, $event)',
    '(window:keydown)': 'globalKey()',
    '(document:keydown)': 'globalKey()',
    '(@animation.start)': 'handleStart()',
    '(@animation.end)': 'handleEnd()',
  },

  //// Quotes inside the value
  host: {
    '(click)': 'handleClick("hello `${name}`")',
  },

  //// Expression inside object literal
  host: {
    ...before,
    '(click)': 'handleClick("hello `${name}`")',
    'class': 'hello',
    ...after,
  },

  //// Variable initializer
  host: HOST_BINDINGS,

  //// Variable values
  host: {
    '(click)': CLICK_LISTENER + OTHER_STUFF,
    'class': (MY_CLASS + ' ' + MY_OTHER_CLASS) + ` foo-${bar + 123}`,
  },

  //// One of each
  host: {
    'class': 'one two',
    myAttr: "my-value",
    '[attr.greeting]': '"hello " + name',
    ...extras,
    '[class.is-visible]': 'isVisible()',
    '[id]': '_id',
    '(click)': 'handleClick($event)',
  },
})
export class TMComponent{}
