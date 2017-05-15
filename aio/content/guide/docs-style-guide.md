@title
DOCS STYLE GUIDE

@intro
Style Guide for Angular Authors

@description



This guide covers design and layout patterns for documentation for Angular.  The patterns should be followed by Authors contributing to this documentation.

## Basic Layout

You will use the following layouts throughout your documentation to specify sections and sub-sections of content.


## Main Section Title

Main section title should preceeded by ##.  Content can start on the next line.

## Sub Section Title

The content in any sub-section is related to the main section content and _falls within_ the main section. Any sub-section title should preceeded by ###.  Content can start on the next line.

To-do: Cover noTOC in here

## Code Examples

To-do: Cleanup below & bring over more examples from marketing/test.html 

Below are a few examples of how you can add/customize code examples in a page.

### Code-Example Attributes

* path: a file in the content/examples folder
* title: seen in the header
* region: ??
* language: specify only for inline examples. Values can be javascript, html, css, typescript, json, any language that you will use in your Angular application.
* linenums: true, false, for example linenums:4 to speficy that the starting line is 4.  When not specified, line numbers are displayed when 10 more more lines of code  
* format: nocode, ??

### Including a code example from the _examples_ folder

One of the design goals for this documentation was that any code samples that appear within the documentation be 'testable'. In practice this means that a set of standalone testable examples exist somewhere in the same repository as the rest of the documentation. These examples will each typically consist of a collection of Typescript, HTML, Javascript and CSS files.

Clearly there also needs to be some mechanism for including fragments of these files into the Markdown generated HTML. By convention all of the 'testable' examples within this repository should be created within the content/examples folder.

#### Example:

<code-example language="html">
&lt;code-example path="toh-pt1/src/index.html" linenums="true" title="src/index.html"&gt;
&lt;/code-example&gt;
</code-example>

This will read the content/examples/toh-pt1/src/index.html file and include it with the heading 'src/index.html'. Note that the file will be properly escaped and color coded according to the extension on the file (html in this case).

<code-example path="toh-pt1/src/index.html" linenums="true" title="src/index.html"></code-example>

#### Example in a shell
<code-example language="html">
&lt;code-example language="sh" class="code-shell"&gt;
  npm start

&lt;/code-example&gt;&lt;/code-example&gt;

</code-example>

<code-example language="sh" class="code-shell">
  npm start

</code-example>

#### Example of no code
<code-example language="html">
&lt;code-example format="nocode"&gt;
  localhost:3000/hero/15

&lt;/code-example&gt;
</code-example>
<code-example format="nocode">
  localhost:3000/hero/15

</code-example>



There is Code-tabs and Code-pane that provides the same service but for multiple examples within a tabbed interface.

### Code-tabs Attributes

* linenums: display line numbers in the code in all tabs

### Code-pane Attributes

* path: a file in the content/examples folder
* title: seen in the header
* linenums: display line numbers in the code in this tab
* ??

#### Example:

This example uses the source code for a small application that bundles with Webpack techniques.  This will create three tabs, each with its own title and appropriately color coded.

<code-example language="html">
&lt;code-tabs linenums="false"&gt;
  &lt;code-pane title="src/index.html" path="webpack/src/index.html"&gt;
  &lt;/code-pane&gt;

  &lt;code-pane title="src/tsconfig.json" path="webpack/src/tsconfig.json" linenums="true"&gt;
  &lt;/code-pane&gt;

  &lt;code-pane title="src/main.ts" path="webpack/src/main.ts" linenums="true"&gt;
  &lt;/code-pane&gt;

  &lt;code-pane title="src/assets/css/styles.css" path="webpack/src/assets/css/styles.css"&gt;
  &lt;/code-pane&gt;

&lt;/code-tabs&gt;
</code-example>

This will create multiple tabs, each with its own title and appropriately color coded.

<code-tabs>

  <code-pane title="src/index.html" path="webpack/src/index.html">

  </code-pane>

  <code-pane title="src/tsconfig.json" path="webpack/src/tsconfig.1.json">

  </code-pane>
  
  <code-pane title="src/main.ts" path="webpack/src/main.ts">

  </code-pane>

  <code-pane title="src/assets/css/styles.css" path="webpack/src/assets/css/styles.css">

  </code-pane>

</code-tabs>

### Marking up an example file for use by code-example

At a minimum, marking up an example file simply consists of adding a single comment line to the top of the file containing the string #docregion. Following this a second string that is the 'name' of the region is also allowed but not required??. A file may have any number of #docregion comments with the only requirement being that the names of each region within a single file be unique. This also means that there can only be one blank docregion.

#### Example of a simple docregion:
<code-example language="html">
// #docregion hero-class-1
export class Hero {
  id: number;
  name: string;
}
// #enddocregion hero-class-1

&lt;code-example path="toh-pt1/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (hero-class-1)" region="hero-class-1"&gt;

&lt;/code-example&gt;
</code-example>

<code-example path="toh-pt1/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (hero-class-1)" region="hero-class-1">

</code-example>

#### Example of a nested docregion:
<code-example language="html">
// #docregion export-AppComponent
export class AppComponent {
  title = 'Tour of Heroes';
  heroes = HEROES;
  // #docregion selected-hero
  selectedHero: Hero;
  // #enddocregion selected-hero

  // #docregion on-select
  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
  // #enddocregion on-select
}
// #enddocregion export-AppComponent

&lt;code-example path="toh-pt2/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (hero-class-1)" region="selected-hero"&gt;

&lt;/code-example&gt;
</code-example>

<code-example path="toh-pt2/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (hero-class-1)" region="selected-hero">

</code-example>

HTML files can also contain #docregion comments:
<code-example language="html">
&lt;!-- #docregion --&gt;
...
&lt;script src="app.js"&gt;&lt;/script&gt;
...
</code-example>

as can CSS files:
<code-example language="html">
/&#42; #docregion center-global &#42;/
.center-global {
  max-width: 1020px;
  margin: 0 auto;
}
</code-example>


### Inline code and code examples provided directly i.e. not from an example file.

Code can be included directly inline, that is, not be fetched from some external file.

#### Example
<code-example language="html">
code-example(format="linenums" language="javascript").
  //SOME CODE
</code-example>

#### Specify starting line number
<code-example language="html">
code-example(language="html" format="linenums:4").
  var title = "This starts on line four";
</code-example>



## Live Examples

<code-example language="html">
&lt;live-example name="toh-pt6"&gt;&lt;/live-example&gt; 
</code-example>

When you are done, the above example will look like this <live-example name="toh-pt6"></live-example>



## Alerts

Please use alerts sparingly throughout the docs. They are meant to draw attention on important occasions. Alerts should not be used for multi-line content (user callouts insteads) or stacked on top of each other.

<div class="l-sub-section">

### Adding an Alert

<div class="alert is-critical">
A very critical alert.
</div>

<div class="alert is-important">
A very important alert.
</div>

<div class="alert is-helpful">
A very helpful alert.
</div>

To-do: format below closer to what is seen in old guide


* class="alert is-critical" A very critical alert
* class="alert is-important" A very important alert
* class="alert is-helpful" A very helpful alert

</div>

## Callouts

Please use callouts sparingly throughout the docs. Callouts (like alerts) are meant to draw attention on important occasions. Unlike alerts, callouts are designed to display multi-line content.

<div class="l-sub-section">

### Adding a Callout

<div class="callout is-critical">

<header>
A CRITICAL TITLE
</header>

Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix

</div>

<div class="callout is-important">

<header>
A VERY IMPORTANT TITLE
</header>

Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix

</div>

<div class="callout is-helpful">

<header>
A VERY HELPFUL TITLE
</header>

Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix

</div>

To-do: format below closer to what is seen in old guide


* class="callout is-critical"
    - header A Critical Title
    - Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix


* class="callout is-important"
    - header A Very Important Title
    - Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix


* class="callout is-helpful"
    - header A Very Helpful Title
    - Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix

</div>


## Tables

Tables can be used to present tabular data as it relates to each other.

<div class="l-sub-section">

### Adding a Table

<style>
  td, th {vertical-align: top}
</style>

<table>

  <tr>

    <th>
      Framework
    </th>

    <th>
      Task
    </th>
 
    <th>
      Speed
    </th>

 </tr>

  <tr>

    <td>
      <code>AngularJS</code>
    </td>

    <td>
      Routing 
    </td>

    <td>
      <code>Fast</code>
    </td>

</tr>

  <tr>

    <td>
      <code>Angular 2</code>
    </td>

    <td>
      Routing 
    </td>

    <td>
      <code>Faster</code>
    </td>

</tr>

<tr>

    <td>
      <code>Angular 4</code>
    </td>

    <td>
      Routing 
    </td>

    <td>
      <code>Fastest :)</code>
    </td>

</tr>


</table>

To-do: format below closer to what is seen in old guide

<code-example language="html">
table
    tr
        th Framework
        th Task
        th Speed
    tr
        td AngularJS
        td Routing
        td fast
</code-example>

</div>

## Images

### Image guide

<p>To maintain visual consistency across documentation chapters, please follow the best
practices for authors outlined in the <a href="/docs/ImageGuide.pdf" target="_blank">Image
Guide</a>.</p><p>The browser background template used for outlining screenshots is <a href="/resources/images/backgrounds/browser-background-template.png" target="_blank">here</a>.</p>

Please use HTML to declare images in the docs. Do not use the markdown \!\[\.\.\.\]\(\.\.\.\) shorthand.

The HTML to use is an &lt;img src="..." alt="..."&gt; tag. You must supply a src attribute that is relative to the base path; and you should provide an alt attribute describing the image for accessibility. _Note that Image tags do not have a closing tag._


### Image Size

The doc generation process will read the image dimensions and automatically add width and height attributes to the img tag. If you want to control the size of the image then you should supply your own width and height images.

Images should not be wider than 700px otherwise they may overflow the width of the document in certain viewports. If you wish to have a larger image then provide a link to the actual image that the user can click on to see the larger images separately.


### Image Formatting

There are three types of images that you can put in docs: inline, floating and standalone.

#### Inline Images

To create an inline image, simply place the img tag in the content where you want the image to appear. For example:

<code-example language="html">The image here &lt;img src="..." alt="..."&gt; is visible inline in the text.

</code-example>

#### Floating Images

You can cause an image to float to the left or right of the text by applying the class="left" or class="right" attributes respectively.
    
<code-example language="html">&lt;img src="..." alt="..." class="left"&gt;This text will wrap around the to the right of this floating image.

</code-example>

All headings and code-examples will automatically clear a floating image. If you need to force a piece of text to clear a floating image then you can use the following snippet:

<code-example language="html">&lt;br class="clear"&gt;

</code-example>

Finally, if you have floating images inside alerts or sub-sections then it is a good idea to apply the clear-fix class to the div to ensure that the image doesn't overflow its container. For example:

<code-example language="html">&lt;div class="l-sub-section clear-fix"&gt;

  &lt;img class="right" src="..." alt="..."&gt;
  Some **markdown** formatted text.

&lt;/div&gt;

</code-example>

#### Standalone Images

Some images should stand alone from the text. You do this by wrapping the img tag in a figure tag. This causes the image to get additional styling, such as a rounded border and shadow. The text will not flow around this image but will stop before the image and start again afterword. For example:

<code-example language="html">Some paragraph preceding the image.
&lt;figure&gt;
  &lt;img src="" alt=""&gt;
&lt;/figure&gt;

</code-example>


## Nested Chapters

To-do: Describe how for example the Directives chapter has nesting

