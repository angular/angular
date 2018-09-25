# Runtime I18N for templates
Internationalization without ivy works by replacing text/html at compile time.
With ivy we need to transform the template at runtime, moving/removing elements and updating text without breaking the other template instructions.
This is needed so that compiled template can be shipped to NPM and the developer of application can add additional translation locales.

## Constraints
- directives & components depend on the original template, you can't add/use new directives in translations. 
  If translation removes a directive, the directive will still be instantiated. 
  (Translator can't change the behavior of the application only its visual representation.)
- Only bindings that were used in the original template can be used in translation.
- DOM elements (components or not) can be moved around or removed, but they cannot change the
original nesting order (ie: `<p><b>...</b></p>` cannot become `<b><p>...</p></b>`)

## Principle
I18n at runtime works in 3 phases.

### Get the translation
The first step is to extract the translation for the template that you want to translate. 
The extraction is performed using use closure's `goog.getMsg()` or with Angular service (not implemented yet).
Following examples assume that some service has already returned the translated form.

A message can contain three types of placeholders:
- elements, with an opening and a closing tag: `const MSG_1 = '{$START_A}trad{$END_A}';`
- expressions (bindings in interpolations): `const MSG_1 = 'start {$EXP_1} end';`
- ICU expressions: `const ICU_1 = 'text {VAR_PLURAL, plural, =0 {zero} =1 {one} other {multiple}}';`

### Prepare the message
An extracted message needs to be processed by `i18nMapping` instruction.
The `i18nMapping` breaks down the string into a set of instructions that will be cached in the `TView`.
This caching allows the code to only pay the cost once per application startup.
The instructions are a list of commands that are used to translate a template. 
Bitwise operations are used to store both the type of the instruction and the value. 
The position of the instruction in the array is also important because it represents the position of the placeholder/text in the
translated template.

For example given the following template:
```html
<div i18n>
  <p>text</p>
</div>
```

The template function would be:
```typescript
elementStart(0, 'div'); // Parent element with the i18n attribute
{ // Start of translated section 1
  element(1, 'p');  // START_P
} // End of translated section 1
elementEnd();
```
NOTE: 
- Notice that all of the text nodes have been removed in favor of i18n to fill it in.
- Notice that the elements are retained because:
  - i18n is only allowed to move them but not create new ones.
  - They may represent directives/components which are being triggered.
  - There may be attribute/property bindings which need to refer back to the elements.

If the original message was `{$START_P}text{$END_P}`
If the translation is: `start {$START_P} middle {$END_P} end` then the translation can be achieved with these instructions:
- insert text `start ` as a child of `<div>`,
- insert text ` middle ` as a child of `<p>`,
- insert text ` end` after `<p>`.

It would be represented by the following array:
```typescript
const instructions = [
  1 | I18nInstructions.Select,       // Select element at position 1 (<p>)
  I18nInstructions.InsertBeforeText, // Insert a child text node ...
  "start ",                          //                          ... with the following text.
  I18nInstructions.AppendChildText,  // Append a child text node ...
  " middle ",                        //                          ... with the following text.
  0 | I18nInstructions.Select,       // Select element at position 0 (<div>)
  I18nInstructions.AppendChildText,  // Append a child text node ...
  " end"                             //                          ... with the following text.
];
```

Since we can only encode numbers with bitwise operations, the text instructions are actually 2 instructions that count for one: 
The first one is "text" and the second one is the actual content of the text node that we need to create.
For elements we can encode the insert position (here index 1) with the instruction "element".
The position of the instruction is important and represents the index in the translated template.

The other types of instructions are:
- detach node at index x from the DOM: `x | I18nInstructions.RemoveNode`
- create ICU expression at index x: `x | I18nInstructions.ICU`

#### Ng-containers

// TODO: Add example here, as it in not clear why this is needed.
// TODO: Change this text into passive voice. (Try to remove `we` and `you`.)


`I18nInstructions.Select` can be used to select `<ng-container>`s. 
It's a special kind of container that can be used to apply directives or to create i18n blocks without using a real DOM parent. 
For example the following template:

```html
<div>
  start
  <ng-container i18n>
    <p>text</p>
  </ng-container>
  end
</div>
```

Will create the following DOM:
```html
<div>
  start
  <p>text</p>
  <!-- ng-container -->
  end
</div>
```

The ng-container isn't represented by a DOM element, but by a comment node instead.
The content `<p>text</p>` that we want to translate has the first `div` for parent.
This means that we don't want to translate all children of `div` but just a part of it.
When we read the instructions to translate the template we usually append the nodes one after
another, but it wouldn't work in this case because the translated DOM would then be:
```html
 <div>
   start
   end
   <p>text</p>
   <!-- ng-container -->
 </div>
 ```

We need to take into account the children following the translation so that we append them at the end, after the translated part. 
To do that we use instruction of type `Any`. 
We don't really care in this case if the node is some text, an element or an expression, we just need an instructions that says move it at the end, after the translation.

#### Embedded templates
A template can contain embedded templates, for example if a template directive is present, a child template function is used to generate the content of that element.

Give the following template:
```html
<ul i18n>
  <li *ngFor="let item of items">value: {{item}}</li>
</ul>
```

The following template function is generated:
```typescript
template: (rf: RenderFlags, myApp: MyApp) => {
  if (rf & RenderFlags.Create) {
    elementStart(0, 'ul');
    { // Start of translated section 1
      template(1, liTemplate, 2, 1, null, ['ngForOf', '']); // START_LI
    } // End of translated section 1
    elementEnd();
  }
}

// ...

function liTemplate(rf1: RenderFlags, row: NgForOfContext<string>) {
  if (rf1 & RenderFlags.Create) {
    // This is a container so the whole template is a translated section
    elementStart(0, 'li'); // START_LI
    { text(1); } // EXP_1
    elementEnd();
  }
}
```

If the original message is: `{$START_LI}value: {$EXP_1}{$END_LI}`.
The parent `template(...)` instruction uses a child template function named `liTemplate`. 
In this case we have to translate two templates.
The complication is that the indexes of the texts/placeholders always start at 0 in each template.
To translate these templates, the `i18nMapping` needs to generate a set of instructions for each template.
Starting with a single message the `i18nMapping` needs to generate two sets of instructions.
For this reason it is important to track where child templates are attached.

Translating the example above with the message
`start {$START_LI}valeur: {$EXP_1}{$END_LI} end`, the following sets of instructions are generated:
```typescript
const instructions = [
  // Instructions for the root template
  [
    1 | I18nInstructions.Select,
    I18nInstructions.InsertBeforeText,
    "start ",
    0 | I18nInstructions.Select,
    I18nInstructions.AppendChildText,
    " end"
  ],
  // Instructions for the embedded template
  [
    1 | I18nInstructions.Select, 
    I18nInstructions.InsertBeforeText,
    "valeur: ",
  ]
];
```

Because we need to generate a set of instructions for each template, the function `i18nMapping` always returns an array of arrays.
The instructions are generated in the order of appearance of the different template roots.
Similarly most parameters of the function are an array to take into account each template root.

#### ICU expressions

// TODO: introduce `icu` first and than bring in `i18nMapping` later.
The `i18nMapping` function is used to generate the instructions for ICU expressions even if you use
them without translations. Inside of an i18n block the `i18nApply` function will create the ICU node
element. Outside of an i18n block we will use the `icu()` instruction directly in the template
function.

An ICU expression is surrounded by single brackets and is composed of three parts separated by commas:
`{VAR_PLURAL, plural, =0 {zero} =1 {one} other {multiple}}`.
The first part represents the main binding whose value is used to determine the current case of the ICU expression.
The second part determines the type of the ICU expression. 
We only support "plural" and "select".
The third part is the list of cases. 
Each case is composed of a key (whose value needs to match the value of the main binding to be selected) and a value (surrounded by single brackets).

An ICU expression case has the following constraints:
- it can only contain text, html and bindings.
- it cannot contain components or directives, they will be treated as simple html.
- a translated ICU expression cannot use bindings that weren't used in the original ICU expression
- it can contain embedded ICU expressions.
  The child ICU expression must be have its HTML balanced.
  (i.e. an element cannot start in the parent ICU and end in the embedded ICU)
- there must always be an "other" case that will be used when no other case matches.

The two types of ICU expressions that we support are "plural" and "select".
"Plural" ICU expressions match a number to a key. 
They require locale data to determine which case is selected because each locale uses [different pluralization rules](http://cldr.unicode.org/index/cldr-spec/plural-rules).
"Select" ICU expressions match a text to a key and do not require locale data for that.

##### Creation
In i18n translations we only need to update the DOM at creation, the only thing that can change at update are the bindings. 
With ICU expression it is more complicated because the value of the main binding determines which case is selected, and each case can contain both html and bindings. 
This is why we use specific methods to create/update an ICU expression.

The function `icuMapping` is called by `i18nMapping` and uses `innerHTML` to create the DOM elements for each case which becomes a template. 
We consider the HTML in the ICU as safe because it comes from the developer/translator (not from user) and therefore do not apply any sanitization to it.
We cache a the template DOM elements in `TView` so that it can be used by all templates of a given type.
The template is cloned before it is inserted into render DOM.
`icuMapping` will also generate a set of instructions that will be used to update the bindings.

Since the DOM nodes of the ICU are fully dynamic, the ICU expression is represented by a comment node, similarly to containers. 
The first node is linked by the `child` property on the ICU `TNode` and the following nodes can be found with `next`. 
For example if we have the following template:
```html
<div>
  {count, plural, =0 {<b title="zero">zero</b>} other {<span>result:</span><i>multiple</i>}}
</div>
```

When the value of `count` is >0, it should create the following DOM:
```html
<div>
  <span>
    result:
  </span>
  <i>multiple</i>
  <!-- ICU -->
</div>
```

// TODO: add example of what the generated template will look like.

If the ICU comment node is inserted at index 1, inside of the div (index 0). 
Then the dynamic nodes for the ICU are created: 
- the first child `span` is linked to the ICU comment with the property `child`
- and the `i` node is linked to `span` with the property `next`.
```
DIV (0) | span (dynamic) --> i (dynamic) | ICU comment (1)
            ^                                  |
            |__________________________________|
``` 

The nodes can be inserted or removed with the method `addRemoveCaseFromICU` that uses the function `walkTNodeTree`. 
It inserts the dynamic nodes just before the ICU comment node and it removes them by following the pointers (child --> next, next, ...).

##### Update
// TODO: rewrite in passive voice.

As explained above, an ICU expression is fully dynamic and can change during the update phase if the
main binding changes. It uses 2 functions during update: `icuBindingX` (with X being a number
between 1 and 8) and `icuBindingApply`.

The first one checks all of the bindings used by the ICU expression to determine if any of them has
changed. Because we want this step to be as fast as possible, we check all bindings at once, even
if the current selected case might not use that particular binding. It is more optimized to check
all bindings quickly and then to determine if the current case should be updated than to determine
which bindings the current cases uses and to only check those.

If a change was detected then the function `icuBindingApply` will determine what needs to be
updated: if the main binding has changed, then we need to determine the new case that will be
selected. If a new case is selected then we remove the ICU DOM nodes and we insert of copy of the
cached DOM nodes.
Sometimes even if the main binding changes, the same case gets selected (for example the
case "other" which is the default when no value matches). When this happens, we only need to update
the bindings (but we can keep the existing DOM nodes).

To update the bindings, we follow the pre-generated instructions that were created by `icuMapping`.
Those instructions are different from the ones used by i18n translations. We don't need
instructions that explain how to create/move/remove the DOM nodes, we only need instructions to
update the bindings on the pre-generated DOM. To generate those instructions, we parse the DOM once,
checking every text nodes and attributes for bindings. We also need to add instructions for
sanitization because the nodes are fully dynamic.

For example, with the following ICU expression:
`{count, plural, =0 {<b title="{$zero}">zero</b> of {$count}} other {multiple}}` the pre-generated
DOM for the first case would be:
```html
<div>
  <b title="{$zero}">zero</b>
  of {$count}
</div>
```

// TODO: add example of what the generated template will look like.

The instructions would be:
- get `firstChild` of the wrapper (the div that we use to generate the DOM with `innerHTML`)
- on that first child `b` update the attribute `title` with the binding `zero`
- get `nextSibling` of `b`
- update text node with the text "of " and the value of the binding `count`

It would be represented by the following array:
```typescript
const instructions = [
  IcuInstructions.FIRST_CHILD,
  IcuInstructions.START_INTERPOLATION,
  "title", // <-- name of the attribute to update
  null, // <-- no sanitization function (could be sanitize url or src, depending on the attribute)
  1, // <-- binding index for "zero"
  IcuInstructions.END_INTERPOLATION,
  IcuInstructions.NEXT_SIBLING,
  IcuInstructions.START_INTERPOLATION,
  "of ",
  0, // <-- binding index for "count"
  IcuInstructions.END_INTERPOLATION,
  IcuInstructions.PARENT_NODE
];
```

##### Embedded ICU expressions
An ICU expression's case can contain an embedded ICU expression. This is problem when want to
pre-generate the DOM elements because each embedded ICU expression has multiple cases that can
change depending on the value of their main bindings. For example with the ICU expression:
`{count, plural, =0 {zero} other {{$count} {animal, select, cat {cats} dog {dogs} other {animals}}!}}`
we have two ICU expressions: `{count, plural, =0 {zero} other {{$count} {$ICU2}!}}` and
`{animal, select, cat {cats} dog {dogs} other {animals}}`. The DOM for the case "other" of the first
ICU expression is:
```html
{$count} {animal, select, cat {cats} dog {dogs} other {animals}}
```

In order to pre-generate the DOM elements, we replace the embedded ICU expression by a comment node:
`<!--__ICU-X__-->` (with X being the index of its mapping in `TView`), and then we add the following
instructions to replace the comment node by the DOM for the current case of the embedded ICU
expression:
```typescript
const instructions = [
  IcuInstructions.EMBEDDED_ICU,
  1 // <-- index of the mapping for that embedded ICU expression in `TView`
];
```

During update, when we read the instructions, we will get the mapping for the embedded ICU
instruction, replace the comment node by the DOM of the current selected case and read its
instructions to update its bindings (if any).

##### With or without i18n
It is possible to use ICU expressions without i18n, the difference being in the template
instructions: when you use i18n then the ICU node will be created by `i18nApply` at the end of the
creation phase. When you use it without i18n then the ICU node will be created by the `icu()`
instruction.

With i18n:
```typescript
const MSG_DIV_1 = `start ({$EXP_1}) {EXP_2, select, app {hello} other {name is {$EXP_2}}} end`;

template: (rf: RenderFlags, ctx: MyApp) => {
  if (rf & RenderFlags.Create) {
    i18nMapping(0, MSG_DIV_1, null, [{'EXP_1': 1}], ['EXP_2']);
    elementStart(0, 'div');
    {
      // Start of translated section 1
      text(1);  // EXP_1
      // End of translated section 1
    }
    elementEnd();
    i18nApply(1, 0, 0);
  }
  if (rf & RenderFlags.Update) {
    textBinding(1, bind(ctx.name));
    icuBinding1(ctx.name);
    icuBindingApply(0);
  }
}
```

Without i18n:
```typescript
const ICU_1 = `{EXP_2, select, app {hello} other {name is {$EXP_2}}}`;

template: (rf: RenderFlags, myApp: MyApp) => {
  if (rf & RenderFlags.Create) {
    i18nMapping(0, ICU_1, null, null, ['EXP_2']);
    elementStart(0, 'div');
    {
      text(1);  // EXP_1
      icu(2, 0);
      text(3, ' end')
    }
    elementEnd();
  }
  if (rf & RenderFlags.Update) {
    textBinding(1, interpolation1('start (', ctx.name, ') '));
    icuBinding1(ctx.name);
    icuBindingApply(0);
  }
}
```

# Runtime I18n for attributes
You can use i18n to translate attributes. We use the function `i18nAttrMapping` to generate a set
of instructions that will be used to update the content of an attribute and then in the update
phase we use `i18nInterpolationX` (with X being a number from 1 to 8) instead of `interpolationX`.
`i18nInterpolationX` is very similar to `interpolationX`: it checks if the value of an expression
has changed and replaces it by its value in the translation, or returns NO_CHANGE.
The difference is that we get the prefix/suffixes/intermediate strings from the instructions
generated by `i18nAttrMapping` instead. Those instructions also contain the position of the bindings
in the final message (translations can move bindings around).

To generate the instructions we split the translations between text and bindings, and replace the
bindings by their indexes. For example if the original message was `{$EXP_1} text {$EXP_2}` and the
translation is `start {$EXP_2} middle {$EXP_1} end`, the instructions will be:
```typescript
const instructions = [
  'start ',
  1, // index of EXP_2
  ' middle ',
  0, // index of EXP_1
  ' end'
];
```

The even indexes are strings, and the odd indexes are the bindings.