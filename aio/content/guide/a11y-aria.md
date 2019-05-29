# ARIA and Angular

<div class="alert is-helpful">

**AUTHORS NOTE:**

I understand that the latest recommendation is to prefer HTML and Angular Components, and not rely heavily on ARIA.

This extended section on ARIA is from an older PR and is not necessarily part of the new guide. I've kept the content here, and the related example code, so that we can use parts of it if we decide to keep them.

So far, this page isn't even in the nav, it just has a link from the main page.

</div>

{@a aria-overview}

## Accessible Rich Internet Applications (ARIA)

The Accessible Rich Internet Applications (ARIA) Suite provides ways
to increase the accessibility of
web content and web applications, especially applications
developed in JavaScript. ARIA is a set of special
accessibility attributes that can be added to HTML markup.
These attributes can be used to do things like
provide labels for use by screen readers, help users understand and
navigate through groups of selectable items like checkboxes, and more.
ARIA is supported by most popular browsers and screen readers.

ARIA is a part of the Web Accessibility Initiative
of the World Wide Web Consortium (W3C).
The technical specification is available at
[https://www.w3.org/TR/wai-aria/](https://www.w3.org/TR/wai-aria/).

This page provides examples of techniques. You can download this
<live-example>Live Example</live-example> application.


ARIA attributes are added to standard HTML elements such as
`<div>` and `<form>`. An HTML element can include both
ARIA attributes and the
standard HTML attributes.
The prefix `aria-` makes it easy to spot an ARIA attribute.
For example, to provide an ARIA label for a menu button:


```html
  <button aria-label="menu"
    class="menuclass">
  </button>
```

In this example, the HTML `<button>` element defines
an interactive button control.
The `aria-label` attribute is used to provide a label which
can be detected only by screen readers or other accessibility
software. The label "menu" is not to  be displayed on screen,
but it is heard by users who have screen reader software.
(The `class` attribute is
a standard HTML attribute.)


<figure class='image-display'>
  <img src="generated/images/guide/a11y/menu-button.png" alt="Menu button with no visible label"></img>
</figure>



### ARIA attributes for labels

Menu buttons do not
typically have a visible label spelling out the word "MENU".
They rely on the user's ability to visually recognize a
well-known menu icon.
For menu buttons and other controls that do not usually
have visible labels (such as Search text boxes), it is
particularly important to provide an ARIA label.

ARIA provides two attributes for labeling user interface elements:

- `aria-label` &mdash; Contains text that describes an element.
- `aria-labelledby` &mdash; Points to another element that
provides the label for the current element.

Examples of how to use both these attributes are shown later in this page.


<div class="l-sub-section">



Unlike menu buttons, many elements do provide labels
that are visible onscreen.
For example, a text input box typically has a label next to it,
like "First Name:". In cases like this, you don't need the
ARIA label attributes. Use the HTML
`<label>` element instead.


</div>



For more details and examples of how to provide standard HTML labels
and ARIA labels, see
[Accessible form control labels](#form-control-labels) later in this page.

For complete details about `aria-label` and `aria-labelledby`,
see [States and Properties](https://www.w3.org/TR/wai-aria/states_and_properties)
in the W3C WAI-ARIA Recommendation.

### ARIA attributes for groups of controls

Closely following labels in terms of usefulness and importance
are the ARIA attributes for navigating sets of objects, such as groups
of radio buttons or items in a dropdown list.
In the absence of visual cues, it is difficult or impossible to accurately
interact with a grouped set of controls using individual labels alone.
The user needs additional context about the relationship between
the objects in the group.
The hierarchy of the items,
the order of presentation,
and the cursor's current position in the group are needed.

Here's a summary of some of the ARIA attributes that indicate relationships
in groups of controls:

- `aria-activedescendant` &mdash; Tells which child of a composite
widget is currently active. For example, in a group of radio buttons,
tells which radio button the cursor is pointing to.
- `aria-controls` &mdash; Indicates that this element has control over one or
more other elements.
- `aria-owns` &mdash; Indicates a parent-child relationship between
the current element and another element. Useful when the DOM hierarchy
does not provide this information.
- `aria-posinset` &mdash; Tells where the current element falls in the
list or tree that it is part of (for example, first item, or third item).
- `aria-setsize` &mdash; The number of items in a set of list items
or tree items. Useful when the elements are not all present in the DOM.
an element in a structure (for example, items in a list).

Examples of how to use some of these attributes are shown later in this page.
For complete details about these ARIA attributes,
see [States and Properties](https://www.w3.org/TR/wai-aria/states_and_properties)
in the W3C WAI-ARIA Recommendation.

{@a form-control-labels}

## Accessible form control labels


Assistive technologies can't rely on the visual appearance of
the form or its components.
Screen readers and other assistive technologies
rely on web pages to provide enough clues so that the
correct assistance can be offered to the user.

One piece of information that screen readers require is the
name of the component.
Many HTML elements already include text that can be used
by screen readers, such as the text in a paragraph or
the alternative text for an image.
For other controls that do not already provide text,
it is important to provide labels.
A label is a word, or a few words,
that make the purpose of a component clear.

This section describes a few different ways to implement labels
for accessibility:

- Explicit visible label using HTML `<label>` with the `for` and `id` attributes
- Implicit visible label using HTML `<label>`
- Implicit, invisible ARIA label using the `aria-label` attribute
- Explicit, invisible ARIA label using `aria-labelledby`
- Label for a group of radio buttons or checkboxes using `<legend>`


### Explicit labels

In explicit labeling, the label for a control is separated from the control itself.
The label is specified in an HTML `<label>` element,
and the control is specified in another HTML element, such as
`<input>`.
The two elements are connected using the `id` attribute of the control.
The `for` attribute of the `<label>` element refers to the `id` of the control.

The following example shows an explicit label for a text input field.
The `for` attribute in the `<label>` element
and the `id` attribute in the `<input>` element are both set to the same value,
`inputexplicit`.


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-input-explicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



### Implicit labels

The HTML `<label>` element can be used to implicitly associate a label
with a form control.
Use this technique when you don't know the `id` of the
form field you want to label, or when the field does
not have an `id`.

The `<label>` element is placed
so that it surrounds the HTML markup
for the control.
For example:


```html
  <label>First name:
    <input type="text" name="firstname">
  </label>
```

This example applies a label to an `input` element.
This same technique could be used with
any native HTML form control.

The `<label>` element is used in a one-to-one relationship
with a form control. You can't use it to provide multiple labels
for a single form control, or to
associate a single label with multiple form controls.

There are conventions with regard to the position of
the label text (that is, text like "First name:" in the previous example).
For `<input>`,
`<textarea>` and `<select>` controls, the label text precedes the element.
For `<checkbox>` and `<radiobutton>` controls, the
label text comes after the element.

The rest of this section shows examples of how to use
the `<label>` element with several different types of native HTML form controls
in Angular components.


#### Inputs and textareas

To label an `<input>` control:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-input-implicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



To label a `<textarea>` control, which is a multi-line text input control:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-textarea-implicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



#### Checkboxes and radio buttons

Checkboxes and radio buttons occur in groups.
In addition to providing
a label for each checkbox and radio button,
provide a label for the group as a whole.
The group label is applied using the HTML elements
`<fieldset>` and `<legend>`.

The outermost element is `<fieldset>`, which serves to
group related elements into a set.
The `<legend>` element is nested inside the `<fieldset>`,
and it contains the label for the set.
The `<fieldset>` also contains a series of `<input>` elements, one for each
checkbox or radio button,
and each of these elements has its own `<label>`.


To label a group of checkboxes:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-checkboxes-implicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



To label a group of radio buttons:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-radiobuttons-implicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



#### Drop-down lists

A drop-down list is an expandable control that presents a list
of choices.
In addition to providing
a label for each choice in the list,
provide a label for the list as a whole.
The group label is applied using the `<label>`  HTML element.

The outermost element is `<label>`, which gives the label text
for the list as a whole.
Nested inside the `<label>` element is the
`<select>` element, which serves to
group related elements into a list.
The `<select>` contains a series of `<option>` elements, one for each
choice in the list.
The `<option>` element contains display text
that is shown when the dropdown list is expanded.
That text
serves as a label, so the individual list choices don't need
any special label element.


To label a dropdown list:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-select-implicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



### Hidden labels

Even if a control does not have a visible label
for sighted users, it can have
a hidden (invisible) label that can still be detected by
assistive technologies such as screen readers.

Sometimes, there is good reason to omit a visible label.
For example, Search fields don't
typically have a label.
If a label is not customarily used for a particular control,
adding a label
could reduce the usability and streamlined appearance of the UI
for most users.

On the other hand, there are reasons to avoid hiding labels.
The `<label>` element does more than just provide a visible
label. When you link a `<label>` to a native form control,
clicking on the label selects the
form control.
This assists users with motor disabilities by providing a
larger clickable area, which
enhances another important area of accessibility.

To create a hidden label for use by assistive technology:

- Use an explicit label, and hide the label with CSS.
Either place the label
outside the visible area of the page, or shrink it to such a small
size that it can't be seen.
- Use `aria-label` or `aria-labelledby`. These are ARIA properties that
set labels for use by
assistive technologies such as screen readers.
This alternative is simpler, because you don't
have to write CSS styles,
and you don't have to make design decisions about
how to hide the text. The ARIA properties are already
designed for exactly this situation.


<div class="l-sub-section">



Do not simply hide labels by using the `display: none`
or `visibility: hidden` CSS properties.
Elements that are hidden in this way are also hidden from
assistive technologies. They should be used only for
content that is truly meant to be hidden
from all users.


</div>



<div class="callout is-important">



<header>
  ARIA terminology confusion alert
</header>



We refer to the `aria-...` attributes as ARIA States or ARIA Properties.
ARIA Properties are not true HTML element properties, but decorating attributes
referring to properties.
Thus, in Angular, when we refer to an ARIA Property, in
the code you **must** use an Angular attribute binding.
This is simply a terminology clash.


</div>



Following is an example that shows how to use `aria-label`.
The `aria-label` attribute is placed inside the `<input>` element,
along with the other attributes of `<input>`.
In this example, the text of the label is `Search:`.


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-hidden-label-aria" header="src/app/form-controls/form-controls.component.html">

</code-example>



Following is an example that shows how to use `aria-labelledby`.
This technique is similar to the explicit labeling technique discussed
earlier in this page. The label text is in a separate element
from the input control.
In this example, a `<span>` element is used for the label,
`Filter:`.
The `id` attribute of the `<span>` element is set to
a unique identifying string, `explicit-aria-label`.
In the `<input>` element,
the `aria-labelledby` attribute
points to `explicit-aria-label`.


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-hidden-label-aria-labelledby" header="src/app/form-controls/form-controls.component.html">

</code-example>



Following is an example of a CSS style named
`visually-hidden` that can be used to hide `<label>`
elements.


<code-example path="a11y/src/assets/a11y.css" region="cb-a11y-form-controls-visually-hidden-style" header="src/assets/a11y.css">

</code-example>



When a `<label>` element uses this style, the label is not shown on screen,
but screen readers can detect it.
Set the style in the `class` attribute of the `<label>` element.
Link the label to the appropriate input control
by matching up the `for` attribute of the label
to the `id` attribute of the input control,
as shown in the following example.


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-hidden-label-explicit" header="src/app/form-controls/form-controls.component.html">

</code-example>



By using developer's accessibility tools,
you can compare the runtime behavior of an inaccessible, unlabeled text box
to the same text box
labeled with `aria-label`.
To see what's happening behind the scenes on a web form,
the following illustrations make use of
the accessibility tools in the development version of Chrome.

The following illustration shows the developer information for the unlabeled
version of the text box.
Notice that there is no `<label>` element, and the `aria-` attributes
are "Not specified."
The text box provides some
minimal default information that screen reader software can use
when reading the field aloud.
The only clue for a screen reader is
the default text in the `placeholder` attribute of the text box.


<figure class='image-display'>
  <img src="generated/images/guide/a11y/invisible-label-input-not-labeled.png" alt="Input with invisible label not labeled correctly"></img>
</figure>



A user who relies on a screen reader hears: **Enter a value**.

This isn't very helpful to the user, who is left wondering what
kind of value is expected.
It is even less helpful if
the page contains more than one input with the same placeholder text.

The following example shows the same text box with an invisible
label implemented with `aria-label`.
The placeholder text is not used, because it is
overridden by the ARIA label.


<figure class='image-display'>
  <img src="generated/images/guide/a11y/invisible-label-input-labeled.png" alt="Input with invisible label labeled correctly"></img>
</figure>



A user who relies on a screen reader now hears: **Filter**.

Thanks to the `Filter:` label, the person interacting with this screen
receives more information about what type of input is expected.


### Labeling custom form controls

When implementing custom form controls, you can't rely on native HTML elements to provide
accessibility.
The explicit labeling technique discussed earlier in this page
(the one that relies on matching `for` and `id` attributes)
only works with native HTML elements such as `input` and `textarea`.

For a custom form control, you can instead use `aria-labelledby` to
assign a role to tell assistive devices how to interpret the custom control.

The following example recreates the native HTML `<input>` element
as a custom control named `<a11y-custom-control>`.
The custom control is implemented with a series of `<div>` elements.

This example component is not
production ready. It only implements enough basics of functionality
to illustrate the use of `aria-labelledby` in a custom component.


<div class="l-sub-section">



It is not recommended that you actually recreate the `<input>`
element in this way.
This is intended only as an example to show the use of `aria-labelledby`
in a custom control.


</div>



<code-tabs>

  <code-pane header="a11y-custom-control.component.html" path="a11y/src/app/shared/custom-control.component.html">

  </code-pane>

  <code-pane header="a11y-custom-control.component.ts" path="a11y/src/app/shared/custom-control.component.ts">

  </code-pane>

  <code-pane header="a11y-custom-control.component.css" path="a11y/src/app/shared/custom-control.component.css">

  </code-pane>

</code-tabs>



This example contains the `<ng-content>` element, which shows where
`Content
Projection` is being used to load content into the component
template.
In this example, `<ng-content>` is placed in a `<label>` element.
The text for the label is provided when the component
is used in an HTML form, as shown in the next example:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-custom-control-usage" header="src/app/form-controls/form-controls.component.html">

</code-example>



The rendered output is shown below. For clarity, the style attributes
added by Angular
for the component style are omitted.


```html
<a11y-custom-control class="ng-pristine ng-valid ng-untouched">
  <div class="form-group">
    <label id="60e9545d-8c5c-4c55-f171-e266c50479e9">
      Write in this labeled div:
    </label>
    <div aria-multiline="true" class="form-control edit-box" contenteditable=""
          role="textbox" aria-labelledby="60e9545d-8c5c-4c55-f171-e266c50479e9"></div>
  </div>
</custom-control>
```



The `role` attribute in the innermost `<div>` element
is part of ARIA.
It is used to
tell assistive technologies that the semantic role of
an HTML element has changed.
The HTML `<div>` element was not originally designed to serve
as a text box. In this example, it is used as one,
so the attribute assignment `role="textbox"` is needed.
ARIA roles are discussed in more detail throughout the rest of this page.

The `aria-labelledby` attribute refers to the automatically-generated `id` attribute
of the `<label>` element to associate the label with the custom text box.


<div class="l-sub-section">



Even when using `aria-labelledby` with an HTML `<label>` element,
clicking the label does not focus the input,
as it does when used with native
HTML form control elements.
Therefore, using `aria-labelledby` is slightly inferior to using the native
HTML approach.


</div>



The `aria-multiline="true"` property lets assistive technologies know
that the text box accepts more than one line of input.

The next section shows how to use Content Projection in Angular
to simplify the task of labeling custom components in a
reusable way.


### Labeling options with Content Projection

Because Angular components are reusable, you
can design a component that can decorate any input field:


<code-tabs>

  <code-pane header="a11y-input-wrapper.component.html" path="a11y/src/app/form-controls/input-wrapper.component.html">

  </code-pane>

  <code-pane header="a11y-input-wrapper.component.ts" path="a11y/src/app/form-controls/input-wrapper.component.ts">

  </code-pane>

  <code-pane header="a11y-input-wrapper.component.css" path="a11y/src/app/form-controls/input-wrapper.component.css">

  </code-pane>

</code-tabs>



The next example shows how to use the component:


<code-example path="a11y/src/app/form-controls/form-controls.component.html" region="cb-a11y-form-controls-custom-control-wrapped-usage" header="src/app/form-controls/form-controls.component.html">

</code-example>



This example uses Content Projection with multiple projection slots
to project the `<input>` and `<label>` content into the example component's
template.
This preserves direct access to the `<label>` content and the `<input>`.

Compared to the previous example component, this contains
less extra code. The resulting `<input>` control is fully accessible.


### Section summary

This section looked at how to give accessible labels
to native HTML form controls and custom form controls.
It compared implicit labeling and explicit labeling.
It discussed native HTML labeling elements as well as
ARIA accessibility properties.

Even when a control doesn't need a visual label,
it still needs a label for accessibility, such as use by screen readers.
This section looked at ways to hide labels from view
while maintaining accessibility.

Finally, the last examples showed
how to use
Angular components and content projection to ensure the accessibility of custom elements.

{@a managing-focus}

## Managing focus

Focus means which part of the screen is currently active.
If a form control has the focus, that control receives any input
from the user. Only elements that can accept user input
can have focus. Elements like paragraphs and divs are not
focusable.

Focus is usually indicated visually. For example, when a text
box has focus, its outline typically changes color or becomes bold.
The style that is used to indicate focus varies depending on the
website designer's preferences, guided by commonly accepted design
best practices.

The user can move the focus by pointing and clicking with
a mouse or other peripheral device, or by
using the keyboard to move from field to field.
The key most often used to move the focus forward is the Tab key
(and Shift+Tab to move backward).

In every interactive web page, the focus moves from one
interactive control to another in a predetermined sequence
that is often referred to as the tab order.
The default tab order is determined by the order of native
HTML elements in the DOM.
For example, if the HTML code for a page contains three
`<input>` text boxes one after the other, pressing the Tab key
moves the focus from one text box to the next in the order
in which they appear in the HTML.

You can change the default tab order with the `tabindex` HTML
attribute. This is useful when you want to impose a certain
order of focus, but you don't want to move elements around
in the HTML source to do it.
`tabindex` can be applied to any element, and it can be assigned
any integer value, including 0 and negative numbers.
These last two options
have special meaning which are demonstrated later in this section.

Custom interactive components created with Angular
are not included in the default tab order. When you create
custom components, you must add the capability
to accept focus. An example of how to do this is shown
later in this section.

There are two types of focus to consider:

- Keyboard focus is the area of the page affected by the next keyboard action.
- Reading focus is the area of the page that
the screen reader will read from next.


<div class="l-sub-section">



This section deals with keyboard focus. By correctly managing
keyboard focus, the reading focus is usually also correct.


</div>



### Visual indication of current focus

The `outline` style property is typically used
to define a border that web browsers draw around the currently
focused element.


<figure class='image-display'>
  <img src="generated/images/guide/a11y/standard-focus-outline.png" alt="Standard browser focus outline box"></img>
</figure>



A distinctive outline clearly indicates the current
keyboard focus. This is an
essential part of usability, especially for someone who navigates without a mouse,
because it is the only visual
indication of the current keyboard focus.
Especially for users navigating a website with keyboard input alone,
it is essential that the current focus is always clear.


<div class="callout is-important">



<header>
  The focus outline is a key accessibility feature
</header>



Do not remove the outline box with the style commands `outline: 0` or
`outline: none`. Doing so makes your site unusable for any
sighted user who uses the keyboard or another assistive technology
instead of a mouse.


</div>



If you change the outline style, replace it with another style that
is clearly visible when the
interactive element receives focus.

For example, the following style removes the default focus outline
with `outline: 0`, then changes the outline of the currently focused
element to red:


<code-example path="a11y/src/assets/a11y.css" region="cb-a11y-managing-focus-custom-outline" header="src/assets/a11y.css">

</code-example>



Here's how that looks:


<figure class='image-display'>
  <img src="generated/images/guide/a11y/custom-focus-outline.png" alt="Standard browser focus outline box"></img>
</figure>



### Focus flow

Unless it is modified through scripting, the normal flow of focus
moves up or down by one element at a time
in the order in which the elements
appear in the HTML DOM tree.
The position of the element on screen does not affect the focus order.

Page layouts in your applications should support a logical
focus order on every page.
When HTML has a logical
structure, all users are helped to navigate the pages correctly.
As with labels, in most cases, the focus flow that is provided
by native HTML functionality is the best solution.
A high degree of accessibility is built in, because accessibility
software is designed with the well-known behavior of HTML in mind.
Do not change the focus order with custom script unless it is
unavoidable.

Where you place the elements
with CSS does not affect the focus order.
This is the `Separation of Content and Presentation`.

The next example demonstrates this separation of content
and presentation.
It shows two columns of text boxes, asking users about work
experience in various different countries around the world.
Each pair
of text boxes asks for two pieces of information about the user's
experience in one of the countries: the city and month.

<figure class='image-display'>
  <img src="generated/images/guide/a11y/focus-flow-clean.png" alt="Collection of inputs based on country list separated into columns per information type"></img>
</figure>

Note that the country name is used in both related input labels
(The USA, The Netherlands, and so on).
This is helpful for users who rely on screen readers.
If a user can't see that the two text boxes are positioned next to
each other, the user won't be able to deduce the relationship between the
two text boxes.
To make sure the purpose of each text box is clear,
it is worth repeating some text in both labels.
This makes the relationship between the two text boxes obvious.

If the text boxes are specified one column below the other in
the DOM, the focus flow is as follows:

<figure class='image-display'>
  <img src="generated/images/guide/a11y/focus-flow-bad.png" alt="Incorrect focus flow grouping taborder into columns"></img>
</figure>

This would work, but it's not the most understandable
order. Most likely,
the user would instead want to think about one country at a time,
and fill in both the city and month fields for that country
one after the other.

The following flow of focus is much more logical and in line with user
expectations:


<figure class='image-display'>
  <img src="generated/images/guide/a11y/focus-flow-good.png" alt="Correctly flowing focus by country"></img>
</figure>



To achieve this tab order, manage the focus flow with HTML alone,
 and change the visual presentation with
CSS. The desired flow is created without scripting.

Following is the HTML for the new focus flow:


<code-example path="a11y/src/app/managing-focus/managing-focus.component.html" region="cb-a11y-managing-focus-flow" header="src/app/managing-focus/managing-focus.component.html">

</code-example>



### Skiplinks

For a sighted person who uses a mouse,
it is very easy to skip sections of web pages.
Such a user can immediately see and interact
with a specific section of interest,
moving freely between widely separated parts of a web page.

To help users who rely on assistive technology
achieve a similar level of navigational freedom within a web page,
you can provide quick in-page links
called skiplinks or Skip Navigation links.
These links provide a way to skip past the list of navigation choices
and get right to the main part of the web page.

When a web page loads, the screen reader reads aloud
any navigation links that are present.
If the page is familiar to the user,
or the user is not interested in hearing
a recitation
of every available link,
it is a great time-saver to have the skiplink as a navigational shortcut.

A skiplink is hidden until the user presses the keyboard
combination that moves focus to the skiplink.
A common key for this purpose is the Tab key.
To see a working example, open the [WebAIM.org](http://webaim.org)
website and immediately press the Tab key.


<figure class='image-display'>
  <img src="generated/images/guide/a11y/skiplink-webaim.png" alt="Skip link on the Web Accessibility In Mind website"></img>
</figure>



A previously hidden link appears that offers to skip
to the main content of the site with a single click.
Press the spacebar to navigate the link, and the main page
of the website is displayed.

The following example shows how to code a similar skiplink.
Use a `<nav>` element and set its `role` attribute to `navigation`
and its `class` attribute to `skiplink`.
Then define the links inside the `<nav>`.
In this example, several links are defined, pointing to
several different bookmarks in the web page;
for example, `#focusoutline`.
Each skiplink provides a shortcut to one of these bookmarks.
It is assumed that the bookmarks have already been defined in
the appropriate HTML elements, such as section headers.


<code-example path="a11y/src/app/managing-focus/managing-focus.component.html" region="cb-a11y-managing-focus-skiplinks-links" header="src/app/managing-focus/managing-focus.component.html">

</code-example>



The links are built with a function leveraging
the `Angular Router`. See
[Routing & Navigation](guide/router)
in the Angular Guide or the
[Routing Tutorial](tutorial/toh-pt5)
for a more detailed explanation.

The  links are rendered as `internal links`:


```html
  <a href="/managing-focus#focusoutline">Go directly to focus outline</a>
```



Here's how the first skiplink in that example looks on screen.
The appearance of this example is arbitrary; you can style
the skiplink in any way you like.


<figure class='image-display'>
  <img src="generated/images/guide/a11y/skiplinks.png" alt="Correctly flowing focus by country"></img>
</figure>



As mentioned earlier, only interactive elements like buttons
and fields can accept focus.
However, the destination of a skiplink might be an element that is not interactive;
for example, an `<h1>` header.
In this case, make the element focusable
by setting the `tabindex` attribute to `-1`.
This is necessary to make sure the skiplink works in all browsers.

When `tabindex=-1`, the element is not included in the normal tab order.
A user pressing the Tab key to move through the page never lands
on this type of element. The setting of `-1`
makes it possible for the element to get focus in response to internal
links, clicks, or script.

The following example shows how to set `tabindex` to allow an element
to accept focus so it can be used as the target of a skiplink:


<code-example path="a11y/src/app/managing-focus/managing-focus.component.html" region="cb-a11y-managing-focus-skiplinks-destination" header="src/app/managing-focus/managing-focus.component.html">

</code-example>



Finally, the following styles can be used to show only focused links:


<code-example path="a11y/src/assets/a11y.css" region="cb-a11y-managing-focus-skiplinks-style" header="src/assets/a11y.css">

</code-example>



So far, this page has looked at how browsers handle focus,
how to change the tab order, and how to use skiplinks to
provide navigation shortcuts for keyboard users.
The next thing to discuss is
how to manage focus
in custom Angular components.


### Interactive components should accept focus

Unlike native interactive HTML elements, `custom interactive components` created with Angular
are not included in the tab order by default.
A native HTML `<button>` element can accept focus,
but a button control built as a
custom element from non-interactive HTML elements can't accept focus
unless you take steps to enable it.


<div class="l-sub-section">



Re-implementing a  native HTML element as a custom element is **NOT** recommended.
The code below is intended only as an example.
It is not meant to be used in production.


</div>



The World Wide Web Consortium (W3C) publishes
recommendations about which keyboard events should be
implemented by each type of widget.
For example, a `button` should accept focus, react to the
mouse `click` event and react to the keyboard `enter` and `space` events.

For more information, see the W3C's recommended best practices,
[WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/).

The following example shows the code for a custom button element:


<code-tabs>

  <code-pane header="a11y-custom-button.component.ts" path="a11y/src/app/shared/custom-button.component.ts">

  </code-pane>

  <code-pane header="a11y-custom-button.component.html" path="a11y/src/app/shared/custom-button.component.html">

  </code-pane>

</code-tabs>



This manipulates the `Host` element of the component so it can
be used like the standard `button` element:


<code-example path="a11y/src/app/managing-focus/managing-focus.component.html" region="cb-a11y-custom-button-usage" header="src/app/managing-focus/managing-focus.component.html">

</code-example>



Here is the generated HTML for that custom button:


```html
  <a11y-custom-button class="btn btn-primary" role="button" tabindex="0">
    Do something...
  </custom-button>
```

The `role` and `tabindex` attributes play an important part in
this element.

The `role` attribute sets the ARIA role, which defines
what type of object this is.
In this example, the role is `button`.
This tells assistive technologies that the custom element is
a button, regardless of the original design of the HTML element.
Addtional examples of how to use roles are coming up later in this page.

The `tabindex` attribute sets the button's place in the tab order.
In this example, it is set to `0`, which puts the element
in the default flow of`keyboard navigation` focus
rather than setting an explicit order number.
(Forcing the tab order by setting
`tabindex` to `1` or greater is usually not recommended.)

The next step is to add keyboard events to make the button fully
accessible, as shown in the next section.


### Internal focus management for components

Programmatically setting focus within an app can introduce accessibility issues by interrupting
or enforcing a particular flow. If you do set focus for the user, you must ensure that
you do so in an accessible way.

The following example shows how to do this. It creates a
`button` that shows an `alert`, sets focus on the `alert`,
and then allows the user to close the error message with a `close button`.


<code-tabs>

  <code-pane header="a11y-error-demo.component.html" path="a11y/src/app/managing-focus/error-demo.component.html">

  </code-pane>

  <code-pane header="a11y-error-demo.component.ts" path="a11y/src/app/managing-focus/error-demo.component.ts">

  </code-pane>

</code-tabs>



This example sets focus on an `alert` that starts out hidden.
Because `hidden` and `disabled` elements cannot accept focus,
the element must be made visible before it can be part of the
keyboard navigation order.
To give the browser time to apply this change, the focus is set using
a `timeout` function.

A `local template variable` is used to easily set focus right inside the
template code.

The ARIA role is set to `alert`. The `aria-hidden` property is used
to flip the visibility of the error block on and off.


### Section summary

This section looked at the importance of the tab order and keyboard navigation.
The examples showed how to use native HTML elements and build custom component templates
that provide accessible web page navigation using focus management.
Finally, the section showed how to make sure your custom components
can accept focus and how to
programmatically manage focus.

{@a component-roles}

## Roles for custom component widgets

When creating a custom component widget, you can extend or change the behavior of an HTML element.
To ensure accessibility, map the new component's behavior to an appropriate
ARIA role.
In ARIA, the `role` attribute defines what general type of object
the component is. ARIA defines many possible roles, grouped into
categories. The roles you most commonly need to know about
when writing custom components
are the widget roles: button, checkbox, alert, scrollbar, and so on.
The landmark roles, which let you set destinations for links,
are also useful.

For details, see the "Widget Roles" and "Landmark Roles" sections of the W3C's
[Roles Model](https://www.w3.org/TR/wai-aria/roles).


### How to apply an ARIA Role in Angular

To set the role of an element, set the value of the `role` attribute.
For example:


```html
  <h2 role="alert">I am an alert.</h2>
```



<div class="l-sub-section">



Applying an ARIA role overrides the implicit role of the native HTML element.


</div>



To see how to use an ARIA role in an Angular template, consider this example
that was introduced in the earlier section on labels:


<code-example path="a11y/src/app/shared/custom-control.component.html" header="src/app/shared/custom-control.component.html">

</code-example>



In Angular this new custom element
is referred to as the `Host Element` of the component, because this is the element
in the HTML that hosts the component's implementation.

You can manipulate the `Host Element` through the `Host Property` of the component definition.
For example, to apply the ARIA role of `button` to the host element:

<code-example path="a11y/src/app/shared/custom-button.component.ts" header="src/app/shared/custom-button.component.ts">

</code-example>



This is rendered into a DOM element as follows:


```html
  <a11y-custom-button class="btn btn-primary" role="button" tabindex="0">
    Do something...
  </custom-button>
```

Now the browser, and any attached assistive technologies, know that `a11y-custom-button` is a `button`.


### ARIA landmark roles

[Landmark Roles](https://www.w3.org/TR/wai-aria/roles#landmark_roles) are navigational markers.
They refer to regions of the page the user may want quick access to.
Screen readers are aware of these regions, which help to give the user a clearer picture of the page layout.

These roles require some knowledge of the application structure and general layout.

- application: a region defined as a web application, rather than a document
- banner: a region that shows the website header rather than page content
- complementary: a secondary part of the page, like a weather sidebar
- contentinfo: information about the parent document
- form: a collection of items that make up a form the user can fill in
- main: the main content area
- navigation: a collection of links to navigate the site (for an example,
see "Skiplinks" earlier in this page)
- search: the area where the user can enter search terms and find related information


<div class="callout is-important">



<header>
  Avoid role="application"
</header>



The `application` role is often misused, and rarely necessary in an Angular app. It directs
assistive technologies to change to a dual navigation/input mode, and captures keystrokes to do
so. Unless you're building an especially complex interaction flow (such as a rich text document
editor), and you're familiar with this role and its pitfalls, you should avoid its use.


</div>



HTML 5 provides native `semantic elements` that implicitly carry many of these roles.  We recommend that you use these whenever possible. For example,
for the `form` role, use the HTML `<form>` element.

The following example shows a high level HTML layout for a page
using HTML 5 semantic elements:


```html
  <header role="banner">
    <!--Site focused header information.-->
  </header>
  <nav role="navigation">
    <!--Main site navigation-->
  </nav>
  <main role="main">
    <!--Contains the main page content-->
    <form role="search">
      <!--Search form-->
    </form>
    <form role="form">
      <!--Normal form-->
    </form>
  </main>
  <aside role="complementary">
    <!--Supplementary site information-->
  </aside>
  <footer role="contentinfo">
    <!--Site information-->
  </footer>
```



For landmark elements, explicitly assign ARIA roles to
all elements, including native elements where a default
exists. In the example above, `<form role="form">`
might seem redundant, but it is necessary because
some browsers do not implement native semantic elements correctly.

When it is not possible to use HTML5's native
semantic elements (for example, if you have to support
HTML4), you can still create this structure using ARIA roles
in `<div>` elements:


```html
  <div role="banner">
    <!--Site focused header information.-->
  </div>
  <div role="navigation">
    <!--Main site navigation-->
  </div>
  <div role="main">
    <!--Contains the main page content-->
    <div role="search">
      <!--Search form-->
    </div>
    <div role="form">
      <!--Normal form-->
    </div>
  </div>
  <div role="complementary">
    <!--Supplementary site information-->
  </div>
  <div role="contentinfo">
    <!--Site information-->
  </div>
```



<div class="l-sub-section">



An earlier section of this page described `skiplinks`.
These `landmarks` make great skiplink
destinations.


</div>



### ARIA Roles: Widget roles

The following roles are useful for standalone widgets.
The names are mostly self-explanatory:

- alert (see an example under "Internal focus management for components" earlier
in this page)
- alertdialog
- button (see an example under
"Interactive components should accept focus")
- checkbox
- dialog
- gridcell
- link
- log
- marquee
- menuitem
- menuitemcheckbox
- menuitemradio
- option
- progressbar
- radio
- scrollbar
- slider
- spinbutton
- status
- tab
- tabpanel
- textbox (see examples in this page under "Labeling custom form controls")
- timer
- tooltip
- treeitem

There is also a set of roles for `composite widgets`, which are
widgets built from other widgets.

- combobox
- grid
- listbox
- menu
- menubar
- radiogroup
- tablist
- tree
- treegrid


<div class="l-sub-section">



Visit the `W3C` to read more about
[Widget Roles](https://www.w3.org/TR/wai-aria/roles#widget_roles) and their
[design patterns](https://www.w3.org/TR/wai-aria-practices/#aria_ex).


</div>



### Section summary

This section summarized the ARIA roles, which are used to
inform the browser what type of element a custom widget component is.
Examples showed how to override the role of a native HTML element
and how to apply a `role` to a `custom elements` by using the `Host` decorator.

{@a input-controls}

## More attributes for input controls

There are many other ARIA attributes for various purposes, which are
outside the scope of the examples presented in this page.
This section briefly touches on some of them.

### ARIA Attributes for Input Controls

ARIA defines a variety of attributes that
you can use
to help the user correctly enter input.
These attributes give extra information
that can be interpreted by screen readers and other assistive technologies.
There are many ARIA attributes for input controls,
but some of the more interesting ones are:

- `aria-multiline` tells whether a field
accepts more than one line of input (this was used
in the example in "Labeling custom form controls" earlier in this page)
- `aria-multiselectable` indicates whether the user can
select more than one item from the currently offered set of
choices (say, in a list box)
- `aria-valuemin` and `aria-valuemax` gives the lowest and highest
allowed values for an input control
that permits a range of values
- `aria-required` marks an element where the user must supply an input value
before submitting the form

For example, if `aria-multiline` is set to true for a text box,
screen readers take that information
and announce to the user that more than one line
of input is permitted.

### ARIA States for Controls

ARIA states for controls add useful information that screen readers
can use to change the course of action depending on the current
state of a control. The values of these attributes are likely to
change frequently
during interaction with users, as buttons are pressed, fields are filled
in, and so on.

- `aria-checked` for checkboxes and radio buttons, `aria-pressed` for
buttons, and `aria-selected` for other controls, tell whether
the control has been checked, pressed, or otherwise selected by the user
(or by default).
- `aria-expanded` tells whether an element like a dropdown list
is currently open or closed (collapsed).
- `aria-disabled`, `aria-hidden`, and `aria-readonly` provide several
ways to indicate that a control is not available for user interaction.

{@a developer-tools}

## Tools to help you build accessible web pages

To test whether applications are accessible,
you need to use some specialized testing tools built for the purpose.
We highly recommend using some of the following tools during your development process.


<div class="l-sub-section">



To help you try out tooling in a famliar space, there is a
section in the live example at the top
that you can use to test both failing and passing scenarios. Go to the `Developer Tools` section in the application
to find links for both playgrounds.


</div>



### The keyboard

One of the most powerful tools for testing accessibility is literally right at your fingertips.
For many people, the keyboard
is the only tool they use to interact with web pages.

The very first test you should do as a developer of accessible applications is
to navigate the application's pages using the keyboard alone.

If at any stage you are unable to access a part of the application
without reaching for the mouse, this is
a critical accessibility bug.

Keyboard navigation is typically done with the following keys:

- Tab key to move through the tab order, changing the focus from one focusable element to the next.
- Shift + Tab key combination to move the focus backwards through the tab order.
- Enter key to activate clickable links and buttons or submit form data.
- Space key is an alternative to click buttons and also to select or deselect option elements, like checkboxes.
- Arrow keys to navigate through controls such as menus and radio buttons.

No automated tool can make keyboard testing redundant.
Do not skip testing with the keyboard.


<div class="l-sub-section">



Try this out now in the `Developer Tools` playground areas.
The `fails` section presents an illogical
flow of focus. Once you see why this page is very hard to use with a keyboard alone, switch over to the fully accessible area to
feel the difference.


</div>



Once keyboard testing is done, look at the page structures, correct use of
HTML and ARIA, and so on.
This can be done by visually inspecting the HTML,
but automation is always helpful.


### Built-in browser inpectors

Some browsers contain accessibility inspectors you can use to display the
accessibility information of elements sourced from the
browser's [Accessibility Tree](https://www.w3.org/WAI/PF/aria-implementation/#intro_treetypes).


#### Chrome

One of the best accessibility inspectors you can use is currently hidden
as a Developer Tools Experiments feature in
the Google Chrome browser.

To enable the Chrome built-in accessibility inspector, follow these steps:

1. Type `chrome://flags/` in the navigation bar of the Chrome browser.
2. Scroll down to `Developer Tools experiments` and click Enable.
3. Restart Chrome.
4. Open up the Developer Tools from the browser's dropdown menu.
5. There is another dropdown menu inside the Developer Tools subpage.
Open this menu and select Settings.
6. Select Experiments from the list on the left.
7. Check the Accessibility Inspection box.
8. Restart Chrome again.

Now the Developer Tools screen has a new Accessibility tab:


<figure class='image-display'>
  <img src="generated/images/guide/a11y/Chrome-experimental-a11y-inspector.png" alt="Chrome Developer Tools accessibility inspector tab"> </img>
</figure>



Use the Accessibility tab to inspect any element in the web page
to see its accessibility information, including
the ARIA attributes and the text a screen reader
is likely to read back to the user:

<a href="generated/images/guide/a11y/Chrome-experimental-a11y-inspector-label.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/Chrome-experimental-a11y-inspector-label-700w.png" alt="Chrome accessibility inspector showing properly labeled input"></img>
  </figure>
</a>


What it doesn't show is as important as what is shown. Missing accessibility
settings, such as unspecified ARIA properties, are an important
sign that the accessibility of the page could be improved.

<a href="generated/images/guide/a11y/Chrome-experimental-a11y-inspector-unlabeled-input.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/Chrome-experimental-a11y-inspector-unlabeled-input-700w.png" alt="Chrome accessibility inspector showing incorrectly labeled input"></img>
  </figure>
</a>


#### OS X Safari

To activate accessibility inspection in Safari,
activate Web Inspector. Follow
the steps in the [Enabling Web Inspector](https://developer.apple.com/library/mac/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/GettingStarted/GettingStarted.html)
page.

After activating Web Inspectior, open it and
select any element in the web page to see its accessibility information:

<a href="generated/images/guide/a11y/Safari-a11y-inspector-label.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/Safari-a11y-inspector-label-700w.png" alt="Safari web inspector showing a labeled input"> </img>
  </figure>
</a>


Missing information is again important for accessibility development.
For example, this input does not have `label` information:

<a href="generated/images/guide/a11y/Safari-a11y-inspector-unlabeled input.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/Safari-a11y-inspector-unlabeled input-700w.png" alt="Safari web inspector showing an incorrectly labeled input"></img>
  </figure>
</a>


### Third-party tools

In addition to the built-in accessibility inspectors that some browsers provide,
third parties have published tools for accessibility testing.


<div class="l-sub-section">



Accessibility inspection tools are not foolproof.
They sometimes report false positives, and they don't always
find all the accessibility issues on a web page.
But if you have an understanding of accessibility practices,
these tools are very helpful in making accessibility issues
visible at development time.


</div>



#### WAVE

The WAVE web accessibility evaluation tool is a visual accessibility inspector provided by WebAIM,
a nonprofit organization based at Utah State University.

WAVE can be used in two ways: as an online tool or as a browser extension.

To use the WAVE online tool, go to [wave.webaim.org](http://wave.webaim.org).
Enter the URL of any published website.

WAVE can also be installed as a Chrome browser extension.
Download the extension at the
[WAVE Chrome Extension](http://wave.webaim.org/extension/) page.
After downloading and installing WAVE, activate it
from the Chrome
Extensions Toolbar.

When WAVE analyzes a web page, it lists the accessibility features found and
shows warnings for accessibility issues.
WAVE also adds "sticky note" comments right on the web page to show
which page elements have
accessibility information.

The following example shows the output of WAVE when it is used on
a web page with accessibility issues:

<a href="generated/images/guide/a11y/WAVE-Overall-Fails.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/WAVE-Overall-Fails-700w.png" alt="Using WAVE on a page with a11y issues"></img>
  </figure>
</a>


The summary block on the left side gives an overview of
accessibility features or failures on the page. The
Errors, Alerts, and Contrast Errors sections indicate that
the page has some accessibility problems. The Features,
Structural Elements, and HTML5 and ARIA sections indicate
features present on the web page that make the page
more accessible.

The entire page is also decorated with report icons.
Click an icon to see more
accessibility information about the element under the icon.

For more information, click the `flag` icon or expand the `<code>` tab:

<a href="generated/images/guide/a11y/WAVE-Details-Fails.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/WAVE-Details-Fails-700w.png" alt="Inspecting the details of WAVE's findings"> </img>
  </figure>
</a>


This shows exactly where the issues are, what they are, and even
suggestions about how to fix them.

An important issue that WAVE can detect is insufficient contrast.
For elements that are meant to be read, like `text`,
there must be sufficient contrast
between the foreground and background colors.
This makes a website usable for people who have a variety
of visual disabilites, such as macular degeneration
or diabetic retinopathy, that
do not yet require the use of a screen reader.

The following illustration shows an insufficient contrast warning from WAVE:

<a href="generated/images/guide/a11y/WAVE-Contrast-Fails.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/WAVE-Contrast-Fails-700w.png" alt="Detecting contrast issues with WAVE"></img>
  </figure>
</a>

#### aXe browser extension for Chrome and Firefox

The Accessibility Engine, or aXe,
is a powerful accessibility testing engine provided
by Deque Systems.

It integrates with browsers and automated testing tools to help
catch accessibility issues before release.

aXe has browser extensions for both Chrome and Firefox.
The following examples show the Firefox version.

Download and install aXe at
[The Accessibility Engine](http://www.deque.com/products/axe/).
Once aXe is installed and activated, you can find aXe integrated
into your browser's developer tools:

<a href="generated/images/guide/a11y/AXE-Overall-Analyze.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/AXE-Overall-Analyze-700w.png" alt="aXe integrated into browser development tools"> </img>
  </figure>
</a>

Click Analyze
to see
a list of the accessibility issues found by aXe:


<figure class='image-display'>
  <img src="generated/images/guide/a11y/AXE-Overall-Fails.png" alt="aXe a11y violations summary"></img>
</figure>



Click on any item in the list to see more details about the issue,
how to find the issue in your HTML, and guidelines to help you fix it:

<a href="generated/images/guide/a11y/AXE-Details-Fails.png" header="View larger image">
  <figure class='image-display'>
    <img src="generated/images/guide/a11y/AXE-Details-Fails-700w.png" alt="aXe a11y violation detail"> </img>
  </figure>
</a>

Keep fixing issues and running aXe again until the list of violations
is empty:


<figure class='image-display'>
  <img src="generated/images/guide/a11y/AXE-Overall-Pass.png" alt="aXe not a11y violations found"></img>
</figure>



aXe confirms that no accessibility violations were found, then advises
additional manual testing with assistive technologies. This is good advice.


### Screen readers

Just as you would not publish a new web page without first opening
it in a web browser, you should not publish an accessible web page
without first navigating it using a screen reader.

If you haven't used a screen reader before, the next few
sections help you get started.

Before trying to use a screen reader for the first time, be sure you are comfortable
navigating using only the keyboard, as discussed earlier in this page.


<div class="l-sub-section">



Screen readers do not all provide exactly the same user experience,
or implement all accessibility clues in the same way.
In addition, the performance of the screen reader can vary depending on the
web browser.
It is not necessary to try to make
your page perform perfectly in every reader/browser combination,
and it can waste a lot of time,
because the issue might be caused by an integration problem between the reader
and the browser, not by your page at all.
If your page can function well with the readers and browsers discussed here,
it is a good indication that the bulk of screen
reader users can use your website.


</div>



#### NVDA in Firefox

[NonVisual Desktop Access](http://www.nvaccess.org/), better known as NVDA,
is an open source screen reader for
Microsoft Windows.
For best results, use this screen reader with Mozilla Firefox.

For more information about NVDA, see:
- [Using NVDA to Evaluate Web Accessibility](http://webaim.org/articles/nvda/)
by WebAIM
- [Getting Started with NVDA](http://a11yproject.com/posts/getting-started-with-nvda)
by The A11y Project


#### JAWS in Internet Explorer

[Job Access With Speech](http://www.freedomscientific.com/Products/Blindness/JAWS),
better known as JAWS, is the
most popular screen reader.
If you are serious about accessibility testing,
be sure to test in JAWS, preferably on Internet Explorer version 10 or 11.

For an introduction to JAWS, see the WebAIM article
[Using JAWS to Evaluate Web Accessibility](http://webaim.org/articles/jaws/).


#### VoiceOver in Safari

Mac OS X includes an integrated screen reader called VoiceOver.
VoiceOver is best used with the integrated OS X web browser Safari.

For information about how to use VoiceOver, see:
- [Using VoiceOver to Evaluate Web Accessibility](http://webaim.org/articles/voiceover/) by WebAIM
- [Getting Started with OS X VoiceOver](http://a11yproject.com/posts/getting-started-with-voiceover) by
The A11y Project


### Section summary

This section looked at keyboard navigation as one of the most
important ingredients of accessibility testing.
It gave an overview of some built-in and third-party
browser tools for accessibility testing.
Finally, it introduced some of the most popular screen readers.

{@a more-info}

## More information

This page described some of the techniques
you can use to create accessible Angular applications.
A complete discussion of accessibility, HTML elements and attributes,
and the latest browser features to enhance accessibility
is beyond the scope of this page. There are many excellent
resources available with additional information.
Here are a few:

- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [HTML Techniques for Web Content Accessibility](https://www.w3.org/TR/WCAG10-HTML-TECHS/)
- [WAI-ARIA Overview](https://www.w3.org/WAI/intro/aria)
- [ARIA Specification](https://www.w3.org/TR/wai-aria/)
- [Accessibility page at Google Developers](https://developers.google.com/web/fundamentals/accessibility/)
