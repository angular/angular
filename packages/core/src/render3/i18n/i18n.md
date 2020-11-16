# I18N translation support

Templates can be marked as requiring translation support via `i18n` and `i18n-...` attributes on elements.
Translation support involves mapping component template contents to **i18n messages**, which may contain interpolations, DOM elements and sub-templates.

This document describes how this support is implemented in Angular templates.


## Example of i18n message

The following component definition illustrates how i18n works in Angular:

```typescript
@Component({
  template: `
    <div i18n-title title="Hello {{name}}!" i18n>
      {{count}} is rendered as:
      <b *ngIf="exp">
        { count, plural,
            =0 {no <b title="none">emails</b>!}
            =1 {one <i>email</i>}
            other {{{count}} <span title="{{count}}">emails</span>}
        }
      </b>.
    </div>
  `
})
class MyComponent {
}
```

NOTE:
- There are only two kinds of i18n messages:
  1. In the text of an attribute (e.g. `title` of `<div i18n-title title="Hello {{name}}!">`, indicated by the presence of the `i18n-title` attribute).
  2. In the body of an element (e.g. `<div i18n>` indicated by the presence of the `i18n` attribute).
- The body of an element marked with `i18n` can contain internal DOM structure (e.g. other DOM elements).
- The internal structure of such an element may even contain Angular sub-templates (e.g. `ng-container` or `*ngFor` directives).


## Implementation overview

- i18n messages must preserve the DOM structure in elements marked with `i18n` because those DOM structures may have components and directives.
- **Parsed i18n messages** must live in `TView.data`. This is because in case of SSR we need to be able to execute multiple locales in the same VM.
  (If parsed i18n messages are only at the top level we could not have more than one locale.)
  The plan is to cache `TView.data` per locale, hence different instructions would get cached into different `TView.data` associated with a given locale.
  - NOTE: in SSR `goog.getMsg` will return an object literal of all of the locale translations.


### Generated code

Given the example component above, the Angular template compiler generates the following Ivy rendering instructions.

```typescript
// These i18n messages need to be retrieved from a "localization service", described later.
const MSG_title = 'Hello �0�!';
const MSG_div_attr = ['title', MSG_title];
const MSG_div = `�0� is rendered as: �*3:1��#1:1�{�0:1�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0:1� <span title="�0:1�">emails</span>}
}�/#1:1��/*3:1�.`;

function MyComponent_NgIf_Template_0(rf: RenderFlags, ctx: any) {
  if (rf & RenderFlags.Create) {
    i18nStart(0, MSG_div, 1);
      element(1, 'b');
    i18nEnd();
  }
  if (rf & RenderFlags.Update) {
    i18nExp(ctx.count);   // referenced by `�0:1�`
    i18nApply(0);
  }
}

class MyComponent {
  static ɵcmp = defineComponent({
    ...,
    template: function(rf: RenderFlags, ctx: MyComponent) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
          i18nAttributes(1, MSG_div_attr);
          i18nStart(2, MSG_div);
            template(3, MyComponent_NgIf_Template_0, ...);
          i18nEnd();
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        i18nExp(ctx.name);  // referenced by `�0�` in `MSG_title`
        i18nApply(1);             // Updates the `i18n-title` binding
        i18nExp(ctx.count); // referenced by `�0�` in `MSG_div`
        i18nApply(2);             // Updates the `<div i18n>...</div>`
      }
    }
  });
}
```

### i18n markers (�...�)

Each i18n message contains **i18n markers** (denoted by `�...�`) which tell the renderer how to map the translated text onto the renderer instructions.
The [�](https://www.fileformat.info/info/unicode/char/fffd/index.htm) character was chosen because it is extremely unlikely to collide with existing text, and because it is generated, the developer should never encounter it.
Each i18n marker contains an `index` (and optionally a `block`) which provide binding information for the marker.

The i18n markers are:

- `�{index}(:{block})�`: *Binding placeholder*: Marks a location where an interpolated expression will be rendered.
  - `index`: the index of the binding within this i18n message block.
  - `block` (*optional*): the index of the sub-template block, in which this placeholder was declared.

- `�#{index}(:{block})� ... �/#{index}(:{block})�`: *Element block*: Marks the beginning and end of a DOM element that is embedded in the original translation string.
  - `index`: the index of the element, as defined in the template instructions (e.g. `elementStart(index, ...)`).
  - `block` (*optional*): the index of the sub-template block, in which this element was declared.

- `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template block*: Marks a sub-template block that is translated separately in its own angular template function.
  - `index`: the index of the `template` instruction, as defined in the template instructions (e.g. `template(index, ...)`).
  - `block`: the index of the parent sub-template block, in which this child sub-template block was declared.

No other i18n marker format is supported.

The i18n markers in the example above can be interpreted as follows:

```typescript
const MSG_title = 'Hello �0�!';
const MSG_div_attr = ['title', MSG_title];
const MSG_div = `�0� is rendered as: �*3:1��#1:1�{�0:1�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0:1� <span title="�0:1�">emails</span>}
}�/#1:1��/*3:1�.`;
```

- `�0�`: the `{{name}}` interpolated expression with index 0.
- `�*3:1�`: the start of the `*ngIf` template with index 3, effectively defining sub-template block 1.
- `�/*3:1�`: the end of the `*ngIf` template with index 3 (sub-template block 1).
- `�#1:1�`: the start of the `<b>` element with index 1, found inside sub-template block 1.
- `�/#1:1�`: the end of the `</b>` element with index 1, found inside sub-template block 1.
- `�0:1�`: the binding expression `count` (both as the parameter `count` for the `plural` ICU and as the `{{count}}` interpolation) with index 0, found inside sub-template block 1.

NOTE:

- Each closing i18n marker has the same information as its opening i18n marker.
  This is so that the parser can verify that opening and closing i18n markers are properly nested.
  Failure to properly nest the i18n markers implies that the translator changed the order of translation incorrectly and should be a runtime error.
- The optional `block` index is added to i18n markers contained within sub-template blocks.
  This is because blocks must be properly nested and it is an error for the translator to move an i18n marker outside of its block. This will result in runtime error.
- i18n markers are unique within the translation string in which they are found.


### Rendering i18n messages

i18n messages are rendered by concatenating each piece of the string using an accumulator.
The pieces to be concatenated may be a substring from the i18n message or an index to a binding.
This is best explained through pseudo code:

```typescript
function render18nString(i18nStringParts: string|number) {
  const accumulator:string[] = [];
  i18nStringParts.forEach(part => accumulate(part));
  return accumulatorFlush(sanitizer);

 /**
   * Collect intermediate interpolation values.
   */
  function accumulate(value: string|number): void {
    if (typeof value == 'number') {
      // if the value is a number then look it up in previous `i18nBind` location.
      value = lviewData[bindIndex + value];
    }
    accumulator.push(stringify(value));
  }

  /**
   * Flush final interpolation value.
   */
  function accumulatorFlush(sanitizer: null|((text: string)=>string) = null): string {
    let interpolation = accumulator.join('');
    if (sanitizer != null) {
      interpolation = sanitizer(interpolation);
    }
    accumulator.length = 0;
    return interpolation;
  }
}
```

## i18n Attributes

Rendering i18n attributes is straightforward:

```html
<div i18n-title title="Hello {{name}}!">
```

The template compiler will generate the following statements inside the `RenderFlags.Create` block.

```typescript
const MSG_title = 'Hello �0�!';
const MSG_div_attr = ['title', MSG_title];
elementStart(0, 'div');
i18nAttributes(1, MSG_div_attr);
```

The `i18nAttributes()` instruction checks the `TView.data` cache at position `1` and if empty will create `I18nUpdateOpCodes` like so:

```typescript
const i18nUpdateOpCodes = <I18nUpdateOpCodes>[
  // The following OpCodes represent: `<div i18n-title title="Hello �0�!">`
  // If `changeMask & 0b1`
  //        has changed then execute update OpCodes.
  //        has NOT changed then skip `7` values and start processing next OpCodes.
  0b1, 7,
  // Concatenate `newValue = 'Hello ' + lView[bindIndex-1] + '!';`.
  'Hello ',   // accumulate('Hello ');
  -1,         // accumulate(-1);
  '!',        // accumulate('!');
  // Update attribute: `elementAttribute(0, 'title', accumulatorFlush(null));`
  // NOTE: `null` means don't sanitize
  0 << SHIFT_REF | Attr, 'title', null,
]
```

NOTE:
- The `i18nAttributes()` instruction updates the attributes of the "previous" element.
- Each attribute to be translated is provided as a pair of elements in the array passed to the `i18nAttributes()` instruction (e.g. `['title', MSG_title, 'src', MSG_src, ...]`).
- Even attributes that don't have bindings must go through `i18nAttributes()` so that they correctly work with i18n in a server environment.


## i18n Elements

Rendering i18n elements is more complicated but follows the same philosophy as attributes, with additional i18n markers.

```html
<div i18n>
  {{count}} is rendered as:
  <b *ngIf="exp">
    { count, plural,
        =0 {no <b title="none">emails</b>!}
        =1 {one <i>email</i>}
        other {{{count}} <span title="{{count}}">emails</span>}
    }
  </b>.
</div>
```

The template compiler generates the following i18n message:

```typescript
// This message is retrieved from a "localization service" described later
const MSG_div = `�0� is rendered as: �*3:1��#1:1�{�0:1�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0:1� <span title="�0:1�">emails</span>}
}�/#1:1��/*3:1�.`;
```

### Sub-template blocks

Most i18n translated elements do not have sub-templates (e.g. `*ngIf`), but where they do the i18n message describes a **sub-template block** defined by `�*{index}:{block}�` and `�/*{index}:{block}�` markers.
The sub-template block is extracted from the translation so it is as if there are two separate translated strings for parent and sub-template.

Consider the following nested template:

```html
<div i18n>
  List:
  <ul *ngIf="...">
    <li *ngFor="...">item</li>
  </ul>
  Summary:
  <span *ngIf=""></span>
</div>
```

The template compiler will generate the following translated string and instructions:

```typescript
// The string split across lines to allow addition of comments. The generated code does not have comments.
const MSG_div =
  'List: ' +
  '�*2:1�' +        // template(2, MyComponent_NgIf_Template_0, ...);
    '�#1:1�' +      // elementStart(1, 'ul');
      '�*2:2�' +    // template(2, MyComponent_NgIf_NgFor_Template_1, ...);
        '�#1:2�' +  // element(1, 'li');
          'item' +
        '�/#1:2�' +
      '�/*2:2�' +
    '�/#1:1�' +
  '�/*2:1�' +
  'Summary: ' +
  '�*3:3�' +       // template(3, MyComponent_NgIf_Template_2, ...);
    '�#1:3�' +     // element(1, 'span');
    '�/#1:3�' +
  '�/*3:3�';

// �*2:2� ... �/*2:2� (`*ngFor` template, instruction index 2, inside the `*ngIf` template, sub-template block 1)
function MyComponent_NgIf_NgFor_Template_1(rf: RenderFlags, ctx: any) {
  if (rf & RenderFlags.Create) {
    i18nStart(0, MSG_div, 2); // 2nd `*` content: `�#1:2�item�/#1:2�`
      element(1, 'li');
    i18nEnd();
  }
  ...
}

// �*2:1� ... �/*2:1�
function MyComponent_NgIf_Template_0(rf: RenderFlags, ctx: any) {
  if (rf & RenderFlags.Create) {
    i18nStart(0, MSG_div, 1); // 1st `*` content: `�#1:1��*2:2��/*2:2��/#1:1�`
      elementStart(1, 'ul');
        template(2, MyComponent_NgIf_NgFor_Template_1, ...);
      elementEnd();
    i18nEnd();
  }
  ...
}

// �*3:3� ... �/*3:3�
function MyComponent_NgIf_Template_2(rf: RenderFlags, ctx: any) {
  if (rf & RenderFlags.Create) {
    i18nStart(0, MSG_div, 3); // 3rd `*` content: `�#1:3��/#1:3�`
      element(1, 'span');
    i18nEnd();
  }
  ...
}

class MyComponent {
  static ɵcmp = defineComponent({
    ...,
    template: function(rf: RenderFlags, ctx: MyComponent) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div'); // Outer content: `List : �*2:1��/*2:1�Summary: �*3:3��/*3:3�`
          i18nStart(1, MSG_div);
            template(2, MyComponent_NgIf_Template_0, ...);
            template(3, MyComponent_NgIf_Template_2, ...);
          i18nEnd();
        elementEnd();
      }
      ...
    }
  });
}
```

### `i18nStart`

It is the job of the instruction `i18nStart` to parse the i18n message and to provide the appropriate text to each of the following instructions.

Note:
- Inside a block that is marked with `i18n` the DOM element instructions are retained, but the text instructions have been stripped.

```typescript
i18nStart(
    2,           // storage of the parsed message instructions
    MSG_div,     // The i18n message to parse which has been translated
                 // Optional sub-template block index. Empty implies `0` (most common)
);
...
i18nEnd();       // The instruction which is responsible for inserting text nodes into
                 // the render tree based on translation.
```

The `i18nStart` generates these instructions which are cached in the `TView` and then processed by `i18nEnd`.

```typescript
const tI18n = <TI18n>{
  vars: 2,                               // Number of slots to allocate in EXPANDO.
  expandoStartIndex: 100,                // Assume in this example EXPANDO starts at 100
  create: <I18nMutateOpCodes>[           // Processed by `i18nEnd`
    // Equivalent to:
    //   // Assume expandoIndex = 100;
    //   const node = lView[expandoIndex++] = document.createTextNode('');
    //   lView[2].insertBefore(node, lView[3]);
    "", 2 << SHIFT_PARENT | 3 << SHIFT_REF | InsertBefore,
    // Equivalent to:
    //   // Assume expandoIndex = 101;
    //   const node = lView[expandoIndex++] = document.createTextNode('.');
    //   lView[0].appendChild(node);
    '.', 2 << SHIFT_PARENT | AppendChild,
  ],
  update: <I18nUpdateOpCodes>[          // Processed by `i18nApply`
    // Header which consists of change mask and block size.
    // If `changeMask & 0b1`
    //        has changed then execute update OpCodes.
    //        has NOT changed then skip `3` values and start processing next OpCodes.
    0b1, 3,
    -1,                 // accumulate(-1);
    'is rendered as: ', // accumulate('is rendered as: ');
    // Flush the concatenated string to text node at position 100.
    100 << SHIFT_REF | Text, // lView[100].textContent = accumulatorFlush();
  ],
  icus: null,
}
```

NOTE:
 - position `2` has `i18nStart` and so it is not a real DOM element, but it should act as if it was a DOM element.

### `i18nStart` in sub-template blocks

```typescript
i18nStart(
    0,           // storage of the parsed message instructions
    MSG_div,     // The message to parse which has been translated
    1            // Optional sub-template (block) index.
);
```

Notice that in sub-template the `i18nStart` instruction takes `1` as the last argument.
This means that the instruction has to extract out 1st sub-block from the root-template translation.

Starting with
```typescript
const MSG_div = `�0� is rendered as: �*3:1��#1:1�{�0:1�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0:1� <span title="�0:1�">emails</span>}
}�/#1:1��/*3:1�.`;
```

The `i18nStart` instruction traverses `MSG_div` and looks for 1st sub-template block marked with `�*3:1�`.
Notice that the `�*3:1�` contains index to the DOM element `3`.
The rest of the code should work same as described above.

This case is more complex because it contains an ICU.
ICUs are pre-parsed and then stored in the `TVIEW.data` as follows.

```typescript
const tI18n = <TI18n>{
  vars: 3 + Math.max(4, 3, 3),           // Number of slots to allocate in EXPANDO. (Max of all ICUs + fixed)
  expandoStartIndex: 200,                // Assume in this example EXPANDO starts at 200
  create: <I18nMutateOpCodes>[
    // Equivalent to:
    //   // Assume expandoIndex = 200;
    //   const node = lView[expandoIndex++] = document.createComment('');
    //   lView[1].appendChild(node);
    ICU_MARKER, '', 1 << SHIFT_PARENT | AppendChild,
  ],
  update: <I18nUpdateOpCodes>[
    // The following OpCodes represent: `<b>{count, plural, ... }</b>">`
    // If `changeMask & 0b1`
    //        has changed then execute update OpCodes.
    //        has NOT changed then skip `2` values and start processing next OpCodes.
    0b1, 2,
    -1,       // accumulate(-1);
    // Switch ICU: `icuSwitchCase(lView[200 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/, accumulatorFlush());`
    200 << SHIFT_REF | 0 << SHIFT_ICU | IcuSwitch,

    // NOTE: the bit mask here is the logical OR of all of the masks in the ICU.
    0b1, 1,
    // Update ICU: `icuUpdateCase(lView[200 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/);`
    // SHIFT_REF: points to: `i18nStart(0, MSG_div, 1);`
    // SHIFT_ICU: is an index into which ICU is being updated. In our example we only have
    //            one ICU so it is 0-th ICU to update.
    200 << SHIFT_REF | 0 << SHIFT_ICU | IcuUpdate,
  ],
  icus: [
    <TIcu>{
      cases: [0, 1, 'other'],
      vars: [4, 3, 3],
      expandoStartIndex: 203,                // Assume in this example EXPANDO starts at 203
      childIcus: [],
      create: [
        // Case: `0`: `{no <b title="none">emails</b>!}`
        <I18nMutateOpCodes>[
          //   // assume expandoIndex == 203
          //   const node = lView[expandoIndex++] = document.createTextNode('no ');
          //   lView[1].appendChild(node);
          'no ', 1 << SHIFT_PARENT | AppendChild,
          // Equivalent to:
          //   // assume expandoIndex == 204
          //   const node = lView[expandoIndex++] = document.createElement('b');
          //   lView[1].appendChild(node);
          ELEMENT_MARKER, 'b', 1 << SHIFT_PARENT | AppendChild,
          //   const node = lView[204];
          //   node.setAttribute('title', 'none');
          204 << SHIFT_REF | Select, 'title', 'none'
          //   // assume expandoIndex == 205
          //   const node = lView[expandoIndex++] = document.createTextNode('email');
          //   lView[1].appendChild(node);
          'email', 204 << SHIFT_PARENT | AppendChild,
        ]
        // Case: `1`: `{one <i>email</i>}`
        <I18nMutateOpCodes>[
          //   // assume expandoIndex == 203
          //   const node = lView[expandoIndex++] = document.createTextNode('no ');
          //   lView[1].appendChild(node, lView[2]);
          'one ', 1 << SHIFT_PARENT | AppendChild,
          // Equivalent to:
          //   // assume expandoIndex == 204
          //   const node = lView[expandoIndex++] = document.createElement('b');
          //   lView[1].appendChild(node);
          ELEMENT_MARKER, 'i', 1 << SHIFT_PARENT | AppendChild,
          //   // assume expandoIndex == 205
          //   const node = lView[expandoIndex++] = document.createTextNode('email');
          //   lView[1].appendChild(node);
          'email', 204 << SHIFT_PARENT | AppendChild,
        ]
        // Case: `"other"`: `{�0� <span title="�0�">emails</span>}`
        <I18nMutateOpCodes>[
          //   // assume expandoIndex == 203
          //   const node = lView[expandoIndex++] = document.createTextNode('');
          //   lView[1].appendChild(node);
          '', 1 << SHIFT_PARENT | AppendChild,
          // Equivalent to:
          //   // assume expandoIndex == 204
          //   const node = lView[expandoIndex++] = document.createComment('span');
          //   lView[1].appendChild(node);
          ELEMENT_MARKER, 'span', 1 << SHIFT_PARENT | AppendChild,
          //   // assume expandoIndex == 205
          //   const node = lView[expandoIndex++] = document.createTextNode('emails');
          //   lView[1].appendChild(node);
          'emails', 204 << SHIFT_PARENT | AppendChild,
        ]
      ],
      remove: [
        // Case: `0`: `{no <b title="none">emails</b>!}`
        <I18nMutateOpCodes>[
          //   lView[1].remove(lView[203]);
          1 << SHIFT_PARENT | 203 << SHIFT_REF | Remove,
          //   lView[1].remove(lView[204]);
          1 << SHIFT_PARENT | 204 << SHIFT_REF | Remove,
        ]
        // Case: `1`: `{one <i>email</i>}`
        <I18nMutateOpCodes>[
          //   lView[1].remove(lView[203]);
          1 << SHIFT_PARENT | 203 << SHIFT_REF | Remove,
          //   lView[1].remove(lView[204]);
          1 << SHIFT_PARENT | 204 << SHIFT_REF | Remove,
        ]
        // Case: `"other"`: `{�0� <span title="�0�">emails</span>}`
        <I18nMutateOpCodes>[
          //   lView[1].remove(lView[203]);
          1 << SHIFT_PARENT | 203 << SHIFT_REF | Remove,
          //   lView[1].remove(lView[204]);
          1 << SHIFT_PARENT | 204 << SHIFT_REF | Remove,
        ]
      ],
      update: [
        // Case: `0`: `{no <b title="none">emails</b>!}`
        <I18nUpdateOpCodes>[
          // no bindings
        ]
        // Case: `1`: `{one <i>email</i>}`
        <I18nUpdateOpCodes>[
          // no bindings
        ]
        // Case: `"other"`: `{�0� <span title="�0�">emails</span>}`
        <I18nUpdateOpCodes>[
          // If `changeMask & 0b1`
          //        has changed then execute update OpCodes.
          //        has NOT changed then skip `5` values and start processing next OpCodes.
          0b1, 5,
          -1,   // accumulate(-1);
          ' ',  // accumulate(' ');
          // Update attribute: `lviewData[203].textValue = accumulatorFlush();`
          203 << SHIFT_REF | Text,
          // If `changeMask & 0b1`
          //        has changed then execute update OpCodes.
          //        has NOT changed then skip `4` values and start processing next OpCodes.
          0b1, 4,
          // Concatenate `newValue = '' + lView[bindIndex -1];`.
          -1,   // accumulate(-1);
          // Update attribute: `lView[204].setAttribute(204, 'title', 0b1, 2,(null));`
          // NOTE: `null` implies no sanitization.
          204 << SHIFT_REF | Attr, 'title', null
        ]
      ]
    }
  ]
}
```

## Sanitization

Any text coming from translators is considered safe and has no sanitization applied to it.
(This is why create blocks don't need sanitization)
Any text coming from user (interpolation of bindings to attributes) are consider unsafe and may need to be passed through sanitizer if the attribute is considered dangerous.
For this reason the update OpCodes of attributes take sanitization function as part of the attribute update.
If the sanitization function is present then we pass the interpolated value to the sanitization function before assigning the result to the attribute.
During the parsing of the translated text the parser determines if the attribute is potentially dangerous and if it contains user interpolation, if so it adds an appropriate sanitization function.

## Computing the expando positions

Assume we have translation like so: `<div i18n>Hello {{name}}!</div>`.
The above calls generates the following template instruction code:

```typescript
// This message will be retrieved from some localization service described later
const MSG_div = 'Hello �0�!';

template: function(rf: RenderFlags, ctx: MyComponent) {
  if (rf & RenderFlags.Create) {
    elementStart(0, 'div');
      i18nStart(1, MSG_div);
      i18nEnd();
    elementEnd();
  }
  if (rf & RenderFlags.Update) {
    i18nExp(ctx.count);
    i18nApply(1);
  }
}
```

This requires that the `i18nStart` instruction generates the OpCodes for creation as well as update.
The OpCodes require that offsets for the EXPANDO index for the reference.
The question is how do we compute this:

```typescript
const tI18n = <TI18n>{
  vars: 1,
  expandoStartIndex: 100, // Retrieved from `tView.blueprint.length` at i18nStart invocation.
  create: <I18nMutateOpCodes>[
    // let expandoIndex = this.expandoStartIndex;   // Initialize

    // const node = document.createTextNode('');
    // if (first_execution_for_tview) {
    //   ngDevMode && assertEquals(tView.blueprint.length, expandoIndex);
    //   tView.blueprint.push(null);
    //   ngDevMode && assertEquals(lView.length, expandoIndex);
    //   lView.push(node);
    // } else {
    //   lView[expandoIndex] = node; // save expandoIndex == 100;
    // }
    // lView[0].appendChild(node);
    // expandoIndex++;
    "", 0 << SHIFT_PARENT | AppendChild,
  ],
  update: <I18nUpdateOpCodes>[
    0b1, 3,
    'Hello ', -1, '!',
    // The `100` position refers to empty text node created above.
    100 << SHIFT_REF | Text,
  ],
}
```

## ICU in attributes bindings

Given an i18n component:
```typescript
@Component({
  template: `
  <div i18n-title
       title="You have { count, plural,
                =0 {no emails}
                =1 {one email}
                other {{{count}} emails}
            }.">
    </div>
  `
})
class MyComponent {
}
```

The compiler generates:
```typescript
// These messages need to be retrieved from some localization service described later
const MSG_title = `You have {�0�, plural,
                =0 {no emails}
                =1 {one email}
                other {�0� emails}
            }.`;
const MSG_div_attr = ['title', MSG_title, optionalSanitizerFn];

class MyComponent {
  static ɵcmp = defineComponent({
    ...,
    template: function(rf: RenderFlags, ctx: MyComponent) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
          i18nAttributes(1, MSG_div_attr);
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        i18nExp(ctx.count); // referenced by `�0�`
        i18nApply(1);             // Updates the `i18n-title` binding
      }
    }
  });
}
```

The rules for attribute ICUs should be the same as for normal ICUs.
For this reason we would like to reuse as much code as possible for parsing and processing of the ICU for simplicity and consistency.

```typescript
const tI18n = <TI18n>{
  vars: 0,                               // Number of slots to allocate in EXPANDO. (Max of all ICUs + fixed)
  expandoStartIndex: 200,                // Assume in this example EXPANDO starts at 200
  create: <I18nMutateOpCodes>[
    // attributes have no create block
  ],
  update: <I18nUpdateOpCodes>[
    // If `changeMask & 0b1`
    //        has changed then execute update OpCodes.
    //        has NOT changed then skip `2` values and start processing next OpCodes.
    0b1, 2,
    -1,       // accumulate(-1)
    // Switch ICU: `icuSwitchCase(lView[200 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/, accumulatorFlush());`
    200 << SHIFT_REF | 0 << SHIFT_ICU | IcuSwitch,

    // NOTE: the bit mask here is the logical OR of all of the masks in the ICU.
    0b1, 4,
    'You have ',  // accumulate('You have ');

    // Update ICU: `icuUpdateCase(lView[200 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/);`
    // SHIFT_REF: points to: `i18nStart(0, MSG_div, 1);`
    // SHIFT_ICU: is an index into which ICU is being updated. In our example we only have
    //            one ICU so it is 0-th ICU to update.
    200 << SHIFT_REF | 0 << SHIFT_ICU | IcuUpdate,

    '.',  // accumulate('.');

    // Update attribute: `elementAttribute(1, 'title', accumulatorFlush(null));`
    // NOTE: `null` means don't sanitize
    1 << SHIFT_REF | Attr, 'title', null,
  ],
  icus: [
    <TIcu>{
      cases: [0, 1, 'other'],
      vars: [0, 0, 0],
      expandoStartIndex: 200,                // Assume in this example EXPANDO starts at 200
      childIcus: [],
      create: [
        // Case: `0`: `{no emails}`
        <I18nMutateOpCodes>[ ]
        // Case: `1`: `{one email}`
        <I18nMutateOpCodes>[ ]
        // Case: `"other"`: `{�0� emails}`
        <I18nMutateOpCodes>[ ]
      ],
      remove: [
        // Case: `0`: `{no emails}`
        <I18nMutateOpCodes>[ ]
        // Case: `1`: `{one email}`
        <I18nMutateOpCodes>[ ]
        // Case: `"other"`: `{�0� emails}`
        <I18nMutateOpCodes>[ ]
      ],
      update: [
        // Case: `0`: `{no emails}`
        <I18nMutateOpCodes>[
          // If `changeMask & -1` // always true
          //        has changed then execute update OpCodes.
          //        has NOT changed then skip `1` values and start processing next OpCodes.
          -1, 1,
          'no emails',  // accumulate('no emails');
        ]
        // Case: `1`: `{one email}`
        <I18nMutateOpCodes>[
          // If `changeMask & -1` // always true
          //        has changed then execute update OpCodes.
          //        has NOT changed then skip `1` values and start processing next OpCodes.
          -1, 1,
          'one email',  // accumulate('no emails');
        ]
        // Case: `"other"`: `{�0� emails}`
        <I18nMutateOpCodes>[
          // If `changeMask & -1` // always true
          //        has changed then execute update OpCodes.
          //        has NOT changed then skip `1` values and start processing next OpCodes.
          -1, 2,
          -1,        // accumulate(lView[bindIndex-1]);
          'emails',  // accumulate('no emails');
         ]
      ]
    }
  ]
}
```


## ICU Parsing

ICUs need to be parsed, and they may contain HTML.
First part of ICU parsing is breaking down the ICU into cases.

Given
```
{�0�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0� <span title="�0�">emails</span>}
}
```
The above needs to be parsed into:
```TypeScript
const icu = {
  type: 'plural',             // or 'select'
  expressionBindingIndex: 0,  // from �0�,
  cases: [
    'no <b title="none">emails</b>!',
    'one <i>email</i>',
    '�0� <span title="�0�">emails</span>',
  ]
}
```

Once the ICU is parsed into its components it needs to be translated into OpCodes. The translation from the `case` to OpCode depends on whether the ICU is located in DOM or in attribute.
Attributes OpCode generation is simple since it only requires breaking the string at placeholder boundaries and generating a single attribute update OpCode with interpolation.
(See ICUs and Attributes for discussion of how ICUs get updated with attributes)
The DOM mode is more complicated as it may involve creation of new DOM elements.

1. Create a temporary `<div>` element.
2. `innerHTML` the `case` into the `<div>` element.
3. Walk the `<div>`:
   1. If Text node create OpCode to create/destroy the text node.
      - If Text node with placeholders then also create update OpCode for updating the interpolation.
   2. If Element node create OpCode to create/destroy the element node.
   3. If Element has attributes create OpCode to create the attributes.
      - If attribute has placeholders than create update instructions for the attribute.

The above should generate create, remove, and update OpCodes for each of the case.

NOTE: The updates to attributes with placeholders require that we go through sanitization.



## Translation without top level element

Placing `i18n` attribute on an existing elements is easy because the element defines parent and the translated element can be inserted synchronously.
For virtual elements such as `<ng-container>` or `<ng-template>` this is more complicated because there is no common root element to insert into.
In such a case the `i18nStart` acts as the element to insert into.
This is similar to `<ng-container>` behavior.

Example:

```html
<ng-template i18n>Translated text</ng-template>
```

Would generate:
```typescript
const MSG_text = 'Translated text';

function MyComponent_Template_0(rf: RenderFlags, ctx: any) {
  if (rf & RenderFlags.Create) {
    i18nStart(0, MSG_text, 1);
    i18nEnd();
  }
  ...
}
```

Which would get parsed into:
```typescript
const tI18n = <TI18n>{
  vars: 2,                               // Number of slots to allocate in EXPANDO.
  expandoStartIndex: 100,                // Assume in this example EXPANDO starts at 100
  create: <I18nMutateOpCodes>[           // Processed by `i18nEnd`
    // Equivalent to:
    //   const node = lView[expandoIndex++] = document.createTextNode('');
    //   lView[0].insertBefore(node, lView[3]);
    "Translated text", 0 << SHIFT_PARENT | AppendChild,
  ],
  update: <I18nUpdateOpCodes>[ ],
  icus: null,
}
```

RESOLVE:
- One way we could solve it is by `i18nStart` would store an object in `LView` at its position which would implement `RNode` but which would handle the corner case of inserting into a synthetic parent.
- Another way this could be implemented is for `i18nStore` to leave a marker in the `LView` which would tell the OpCode processor that it is dealing with a synthetic parent.

## Nested ICUs

ICU can have other ICUs embedded in them.

Given:
```typescript
@Component({
  template: `
    {count, plural,
      =0 {zero}
      other {{{count}} {animal, select,
                        cat {cats}
                        dog {dogs}
                        other {animals}
                      }!
      }
    }
  `
})
class MyComponent {
  count: number;
  animal: string;
}
```

Will generate:
```typescript
const MSG_nested = `
    {�0�, plural,
      =0 {zero}
      other {�0� {�1�, select,
                        cat {cats}
                        dog {dogs}
                        other {animals}
                      }!
      }
    }
  `;

class MyComponent {
  count: number;
  animal: string;
  static ɵcmp = defineComponent({
    ...,
    template: function(rf: RenderFlags, ctx: MyComponent) {
      if (rf & RenderFlags.Create) {
        i18nStart(0, MSG_nested);
        i18nEnd();
      }
      if (rf & RenderFlags.Update) {
        i18nExp(ctx.count);  // referenced by `�0�`
        i18nExp(ctx.animal); // referenced by `�1�`
        i18nApply(0);
      }
    }
  });
}
```

The way to think about is that the sub-ICU is replaced with comment node and then the rest of the system works as normal.
The main ICU writes out the comment node which acts like an anchor for the sub-ICU.
The sub-ICU uses the comment node as a parent and writes its data there.

NOTE:
- Because more than one ICU is active at the time the system needs to take that into account when allocating the expando instructions.

The internal data structure will be:
```typescript
const tI18n = <TI18n>{
  vars: 2,                               // Number of slots to allocate in EXPANDO.
  expandoStartIndex: 100,                // Assume in this example EXPANDO starts at 100
  create: <I18nMutateOpCodes>[           // Processed by `i18nEnd`
  ],
  update: <I18nUpdateOpCodes>[          // Processed by `i18nApply`
    // The following OpCodes represent: `<b>{count, plural, ... }</b>">`
    // If `changeMask & 0b1`
    //        has changed then execute update OpCodes.
    //        has NOT changed then skip `2` values and start processing next OpCodes.
    0b1, 2,
    -1,       // accumulate(-1);
    // Switch ICU: `icuSwitchCase(lView[100 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/, accumulatorFlush());`
    100 << SHIFT_REF | 0 << SHIFT_ICU | IcuSwitch,

    // NOTE: the bit mask here is the logical OR of all of the masks in the ICU.
    0b1, 1,
    // Update ICU: `icuUpdateCase(lView[100 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/);`
    // SHIFT_REF: points to: `i18nStart(0, MSG_div, 1);`
    // SHIFT_ICU: is an index into which ICU is being updated. In our example we only have
    //            one ICU so it is 0-th ICU to update.
    100 << SHIFT_REF | 0 << SHIFT_ICU | IcuUpdate,
  ],
  icus: [
    <TIcu>{                                  // {�0�, plural, =0 {zero} other {�0� <!--subICU-->}}
      cases: [0, 'other'],
      childIcus: [[1]],                      // pointer to child ICUs. Needed to properly clean up.
      vars: [1, 2],
      expandoStartIndex: 100,                // Assume in this example EXPANDO starts at 100
      create: [
        <I18nMutateOpCodes>[                         // Case: `0`: `{zero}`
          'zero ', 1 << SHIFT_PARENT | AppendChild,  // Expando location: 100
        ],
        <I18nMutateOpCodes>[                         // Case: `other`: `{�0� <!--subICU-->}`
          '', 1 << SHIFT_PARENT | AppendChild,       // Expando location: 100
          ICU_MARKER, '', 0 << SHIFT_PARENT | AppendChild,    // Expando location: 101
        ],
      ],
      remove: [
        <I18nMutateOpCodes>[                         // Case: `0`: `{zero}`
          1 << SHIFT_PARENT | 100 << SHIFT_REF | Remove,
        ],
        <I18nMutateOpCodes>[                         // Case: `other`: `{�0� <!--subICU-->}`
          1 << SHIFT_PARENT | 100 << SHIFT_REF | Remove,
          1 << SHIFT_PARENT | 101 << SHIFT_REF | Remove,
        ],
      ],
      update: [
        <I18nMutateOpCodes>[                         // Case: `0`: `{zero}`
        ],
        <I18nMutateOpCodes>[                         // Case: `other`: `{�0� <!--subICU-->}`
          0b1, 3,
          -2, ' ', 100 << SHIFT_REF | Text,           // Case: `�0� `
          0b10, 5,
          -1,
          // Switch ICU: `icuSwitchCase(lView[101 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/, accumulatorFlush());`
          101 << SHIFT_REF | 0 << SHIFT_ICU | IcuSwitch,

          // NOTE: the bit mask here is the logical OR of all of the masks int the ICU.
          0b10, 1,
          // Update ICU: `icuUpdateCase(lView[101 /*SHIFT_REF*/], 0 /*SHIFT_ICU*/);`
          101 << SHIFT_REF | 0 << SHIFT_ICU | IcuUpdate,
        ],
      ]
    },
    <TIcu>{                                  // {�1�, select, cat {cats} dog {dogs} other {animals} }
      cases: ['cat', 'dog', 'other'],
      vars: [1, 1, 1],
      expandoStartIndex: 102,                // Assume in this example EXPANDO starts at 102. (parent ICU 100 + max(1, 2))
      childIcus: [],
      create: [
        <I18nMutateOpCodes>[                            // Case: `cat`: `{cats}`
          'cats', 101 << SHIFT_PARENT | AppendChild,    // Expando location: 102; 101 is location of comment/anchor
        ],
        <I18nMutateOpCodes>[                            // Case: `doc`: `docs`
          'cats', 101 << SHIFT_PARENT | AppendChild,    // Expando location: 102; 101 is location of comment/anchor
        ],
        <I18nMutateOpCodes>[                            // Case: `other`: `animals`
          'animals', 101 << SHIFT_PARENT | AppendChild, // Expando location: 102; 101 is location of comment/anchor
        ],
      ]
      remove: [
        <I18nMutateOpCodes>[                            // Case: `cat`: `{cats}`
          101 << SHIFT_PARENT | 102 << SHIFT_REF | Remove,
        ],
        <I18nMutateOpCodes>[                            // Case: `doc`: `docs`
          101 << SHIFT_PARENT | 102 << SHIFT_REF | Remove,
        ],
        <I18nMutateOpCodes>[                            // Case: `other`: `animals`
          101 << SHIFT_PARENT | 102 << SHIFT_REF | Remove,
        ],
      ],
      update: [
        <I18nMutateOpCodes>[                            // Case: `cat`: `{cats}`
        ],
        <I18nMutateOpCodes>[                            // Case: `doc`: `docs`
        ],
        <I18nMutateOpCodes>[                            // Case: `other`: `animals`
        ],
      ]
    }
  ],
}
```

# Translation Message Retrieval

The generated code needs work with:
- Closure: This requires that the translation string is retrieved using `goog.getMsg`.
- Non-closure: This requires the use of Angular service to retrieve the translation string.
- Server Side: All translations need to be retrieved so that one server VM can respond to all locales.

The solution is to take advantage of compile time constants (e.g. `CLOSURE`) like so:

```typescript
import '@angular/localize/init';

let MSG_hello;
if (CLOSURE) {
  /**
   * @desc extracted description goes here.
   */
  const MSG_hello_ = goog.getMsg('Hello World!');
  MSG_hello = MSG_hello_;
} else {
  // This would work in non-closure mode, and can work for both browser and SSR use case.
  MSG_hello = $localize`Hello World!`;
}
const MSG_div_attr = ['title', MSG_hello];

class MyComponent {
  static ɵcmp = defineComponent({
    ...,
    template: function(rf: RenderFlags, ctx: MyComponent) {
      if (rf & RenderFlags.Create) {
        i18nAttributes(1, MSG_hello);
        i18nEnd();
      }
    }
  });
}
```

NOTE:
- The compile time constant (`CLOSURE`) is important because when the generated code is shipped to NPM it must contain all formats, because at the time of packaging it is not known how the final application will be bundled.
- Alternatively because we already ship different source code for closure we could generated different code for closure folder.


## `goog.getMsg()`

An important goal is to interpolate seamlessly with [`goog.getMsg()`](https://github.com/google/closure-library/blob/db35cf1524b36a50d021fb6cf47271687cc2ea33/closure/goog/base.js#L1970-L1998).
When `goog.getMsg` gets a translation it treats `{$some_text}` special by generating `<ph>..</ph>` tags in `.xmb` file.
```typescript
/**
 * @desc Greeting.
 */
const MSG = goog.getMsg('Hello {$name}!', {
  name: 'world'
});
```
This will result in:
```xml
<msg id="1234567890" desc="Greeting.">Hello <ph name="NAME"><ex>-</ex>-</ph>!</msg>
```

Notice the `<ph>` placeholders.
`<ph>` is useful for translators because it can contain an example as well as description.
In case of `goog.getMsg` there is no way to encode the example, and the description defaults to capitalized version of the `{$}`.
In the example above `{$name}` is encoded in `<ph>` as `NAME`.
What is necessary is to generate `goog.getMsg` which uses `{$placeholder}` but is mapped to Angular's `�0�` placeholder.
This is achieved as follows.

```typescript
/**
 * @desc Greeting.
 */
const MSG = goog.getMsg('Hello {$name}!', {
  name: '�0�'
});
```
The resulting string will be `"Hello �0�!"` which can be used by Angular's runtime.

Here is a more complete example.

Given this Angular's template:
```HTML
<div i18n-title title="Hello {{name}}!" i18n="Some description.">
  {{count}} is rendered as:
  <b *ngIf="true">
    { count, plural,
    =0 {no <b title="none">emails</b>!}
    =1 {one <i>email</i>}
    other {{{count}} <span title="{{count}}">emails</span>}
    }
  </b>.
</div>
```

The compiler will generate:
```typescript
/**
 * @desc Some description.
 */
let MSG_div = goog.getMsg(`{$COUNT} is rendered as: {$START_BOLD_TEXT_1}{{$COUNT}, plural,
      =0 {no {$START_BOLD_TEXT}emails{$CLOSE_BOLD_TEXT}!}
      =1 {one {$START_ITALIC_TEXT}email{$CLOSE_ITALIC_TEXT}}
      other {{$COUNT} {$START_TAG_SPAN}emails{$CLOSE_TAG_SPAN}}
    }{$END_BOLD_TEXT_1}`, {
  COUNT: '�0�',
  START_BOLD_TEXT_1: '�*3:1��#1:1�',
  END_BOLD_TEXT_1: '�/#1:1��/*3:1�',
  START_BOLD_TEXT: '<b title="none">',
  CLOSE_BOLD_TEXT: '</b>',
  START_ITALIC_TEXT: '<i>',
  CLOSE_ITALIC_TEXT: '</i>',
  START_TAG_SPAN: '<span title="�0:1�">',
  CLOSE_TAG_SPAN: '</span>'
});
```

The result of the above will be a string which `i18nStart` can process:
```
�0� is rendered as: �*3:1��#1:1�{�0:1�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0:1� <span title="�0:1�">emails</span>}
}�/#1:1��/*3:1�.
```

### Backwards compatibility with ViewEngine

In order to upgrade from ViewEngine to Ivy runtime it is necessary to make sure that the translation IDs match between the two systems.
There are two issues which need to be solved:
1. The ViewEngine implementation splits a single `i18n` block into multiple messages when ICUs are embedded in the translation.
2. The ViewEngine does its own message extraction and uses a different hashing algorithm from `goog.getMsg`.

To generate code where the extracted i18n messages have the same ids, the `ngtsc` can be placed into a special compatibility mode which will generate `goog.getMsg` in a special altered format as described next.

Given this Angular's template:
```HTML
<div i18n-title title="Hello {{name}}!" i18n="Some description.">
  {{count}} is rendered as:
  <b *ngIf="true">
    { count, plural,
    =0 {no <b title="none">emails</b>!}
    =1 {one <i>email</i>}
    other {{{count}} <span title="{{count}}">emails</span>}
    }
  </b>.
</div>
```

The ViewEngine implementation will generate following XMB file.
```XML
<msg id="2919330615509803611"><source>app/app.component.html:1,10</source>
  <ph name="INTERPOLATION"><ex>-</ex>-</ph>
  is rendered as:
  <ph name="START_BOLD_TEXT_1"><ex>-</ex>-</ph>
  <ph name="ICU"><ex>-</ex>-</ph>
  <ph name="CLOSE_BOLD_TEXT"><ex>-</ex>-</ph>
  .
</msg>
<msg id="3639715378617754400"><source>app/app.component.html:4,8</source>
  {VAR_PLURAL, plural,
    =0 {no <ph name="START_BOLD_TEXT"><ex>-</ex>-</ph>
          emails  <ph name="CLOSE_BOLD_TEXT"><ex>-</ex>-</ph>
          !
        }
    =1 {one <ph name="START_ITALIC_TEXT"><ex>-</ex>-</ph>
         email <ph name="CLOSE_ITALIC_TEXT"><ex>-</ex>-</ph>
       }
    other {<ph name="INTERPOLATION"><ex>-</ex>-</ph>
            <ph name="START_TAG_SPAN"><ex>-</ex>-</ph>
            emails
            <ph name="CLOSE_TAG_SPAN"><ex>-</ex>-</ph>
          }
  }
</msg>
```

With the compatibility mode the compiler will generate following code which will match the IDs and structure of the ViewEngine:
```typescript
/**
 * @desc [BACKUP_MESSAGE_ID:3639715378617754400] ICU extracted form: Some description.
 */
const MSG_div_icu = goog.getMsg(`{VAR_PLURAL, plural,
    =0 {no {$START_BOLD_TEXT}emails{$CLOSE_BOLD_TEXT}!}
    =1 {one {$START_ITALIC_TEXT}email{$CLOSE_ITALIC_TEXT}}
    other {{$count} {$START_TAG_SPAN}emails{$CLOSE_TAG_SPAN}}
  }`, {
    START_BOLD_TEXT: '<b title="none">',
    CLOSE_BOLD_TEXT: '</b>',
    START_ITALIC_TEXT: '<i>',
    CLOSE_ITALIC_TEXT: '</i>',
    COUNT: '�0:1�',
    START_TAG_SPAN: '<span title="�0:1�">',
    CLOSE_TAG_SPAN: '</span>'
  }
);

/**
 * @desc [BACKUP_MESSAGE_ID:2919330615509803611] Some description.
 */
const MSG_div_raw = goog.getMsg('{$COUNT_1} is rendered as: {$START_BOLD_TEXT_1}{$ICU}{$END_BOLD_TEXT_1}', {
  ICU: MSG_div_icu,
  COUNT: '�0:1�',
  START_BOLD_TEXT_1: '�*3:1��#1�',
  END_BOLD_TEXT_1: '�/#1:1��/*3:1�',
});
const MSG_div = i18nPostprocess(MSG_div_raw, {VAR_PLURAL: '�0:1�'});
```
NOTE:
- The compiler generates `[BACKUP_MESSAGE_ID:2919330615509803611]` which forces the `goog.getMsg` to use a specific message ID.
- The compiler splits a single translation on ICU boundaries so that same number of messages are generated as with ViewEngine.
- The two messages are reassembled into a single message.

Resulting in same string which Angular can process:
```
�0� is rendered as: �*3:1��#1:1�{�0:1�, plural,
  =0 {no <b title="none">emails</b>!}
  =1 {one <i>email</i>}
  other {�0:1� <span title="�0:1�">emails</span>}
}�/#1:1��/*3:1�.
```

### Placeholders with multiple values

While extracting messages via `ng extract-i18n`, the tool performs an optimization and reuses the same placeholders for elements/interpolations in case placeholder content is identical.
For example the following template:
```html
<b>My text 1</b><b>My text 2</b>
```
is transformed into:
```html
{$START_TAG_BOLD}My text 1{$CLOSE_TAG_BOLD}{$START_TAG_BOLD}My text 2{$CLOSE_TAG_BOLD}
```
In IVY we need to have specific element instruction indices for open and close tags, so the result string (that can be consumed by `i18nStart`) produced, should look like this:
```html
�#1�My text 1�/#1��#2�My text 1�/#2�
```
In order to resolve this, we need to supply all values that a given placeholder represents and invoke post processing function to transform intermediate string into its final version.
In this case the `goog.getMsg` invocation will look like this:
```typescript
/**
 * @desc [BACKUP_MESSAGE_ID:2919330615509803611] Some description.
 */
const MSG_div_raw = goog.getMsg('{$START_TAG_BOLD}My text 1{$CLOSE_TAG_BOLD}{$START_TAG_BOLD}My text 2{$CLOSE_TAG_BOLD}', {
  START_TAG_BOLD: '[�#1�|�#2�]',
  CLOSE_TAG_BOLD: '[�/#2�|�/#1�]'
});
const MSG_div = i18nPostprocess(MSG_div_raw);
```

### `i18nPostprocess` function

Due to backwards-compatibility requirements and some limitations of `goog.getMsg`, in some cases we need to run post process to convert intermediate string into its final version that can be consumed by Ivy runtime code (something that `i18nStart` can understand), specifically:
- we replace all `VAR_PLURAL` and `VAR_SELECT` with respective values. This is required because the ICU format does not allow placeholders in the ICU header location, a variable such as `VAR_PLURAL` must be used.
- in some cases, ICUs may share the same placeholder name (like `ICU_1`). For this scenario we inject a special markers (`�I18N_EXP_ICU�) into a string and resolve this within the post processing function
- this function also resolves the case when one placeholder is used to represent multiple elements (see example above)

