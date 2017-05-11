@title
DOCS STYLE GUIDE

@intro
Style Guide for Angular Authors

@description



This guide covers design and layout patterns for the documentation seen here.  The patterns should be followed by Authors contributing to Angular documentation.

## Basic Layout

You will use the following layouts throughout your documentation to specify sections and sub-sections of content.


## Main Section Title

Main section title should preceeded by ##.  Content can start on the next line.

## Sub Section Title

The content in any sub-section is related to the main section content and _falls within_ the main section. Any sub-section title should preceeded by ###.  Content can start on the next line.

## Code Examples

To-do: Cleanup below & Bring over more examples from marketing/test.html 

Below are some examples of how you can add/customize code examples in a page.

### Including a code example from the _examples_ folder

One of the design goals for this documentation was that any code samples that appear within the documentation be 'testable'. In practice this means that a set of standalone testable examples exist somewhere in the same repository as the rest of the documentation. These examples will each typically consist of a collection of html, javascript and css files.

Clearly there also needs to be some mechanism for including fragments of these files into the Markdown generated html. By convention all of the 'testable' examples within this repository should be created within the content/examples folder.

To include an example from somewhere in the content/examples folder you can use the live-example tag. For example, to include the example seen in TOH Part 6, all you need to do is:

<code-example language="html">
&lt;live-example name="toh-pt6"&gt;&lt;/live-example&gt; 
</code-example>

When you are done, the above example will look like this <live-example name="toh-pt6"></live-example>

### Inline code and code examples provided directly i.e. not from an example file.

<code-example language="html">
&lt;code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"&gt;

&lt;/code-example&gt;
</code-example>

This will read the architecture/src/app/mini-app.ts file and include the path and filename in the heading. Note that the file will be properly escaped and color coded according to the extension on the file (ts in this case).This displays:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false">

</code-example>

<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- Routed views go here -->

</code-example>


### Example in a shell
<code-example language="sh" class="code-shell">
  npm start

</code-example>

### Example in Code Tabs

A tabbed interface is a great way to show different files belonging to a code base. The example below demostrates how to display code using a tabbed interface. This example used the source code for a small application that bundles with Webpack techniques.  This will create three tabs, each with its own title and appropriately color coded.


<code-tabs>

  <code-pane title="src/index.html" path="webpack/src/index.html">

  </code-pane>

  <code-pane title="src/main.ts" path="webpack/src/main.ts">

  </code-pane>

  <code-pane title="src/assets/css/styles.css" path="webpack/src/assets/css/styles.css">

  </code-pane>

</code-tabs>

To-do: Describe code-pane attributes

### CODE-EXAMPLE ATTRIBUTES

* ??name: Name displayed in Tab (required for tabs)
* path
* title
* region
* language: javascript, html, etc.
* escape: html (escapes html, woot!)
* format: linenums (or linenums:4 specify starting line)


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

1. .alert.is-critical A very critical alert
1. .alert.is-important A very important alert
1. .alert.is-helpful A very helpful alert

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

To-do: format below better

1. callout is-critical
1.  header A Critical Title
1.  Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix
1. callout is-important
1.  header A Very Important Title
1.  Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix
1. callout is-helpful
1. header A Very Helpful Title
1. Pitchfork hoodie semiotics, roof party pop-up paleo messenger bag cred Carles tousled Truffaut yr. Semiotics viral freegan VHS, Shoreditch disrupt McSweeney's. Intelligentsia kale chips Vice four dollar toast, Schlitz crucifix

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
      Router 
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
      Router 
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
      Router 
    </td>

    <td>
      <code>Fastest :)</code>
    </td>

</tr>


</table>

To-do: format below better

1. table
1.  tr
1.    th Framework
1.    th Task
1.    th Speed
1.  tr
1.    td AngularJS v.1.3
1.    td Routing
1.    td fast

</div>

To-do: Describe l sub section divs


## Images

It is best to use HTML to declare images in the docs. Do not use the markdown \!\[\.\.\.\]\(\.\.\.\) shorthand.

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

#### Standalone images

Some images should stand alone from the text. You do this by wrapping the img tag in a figure
tag. This causes the image to get additional styling, such as a rounded border and shadow. The text will not flow around this image but will stop before the image and start again afterword. For example:

<code-example language="html">Some paragraph preceding the image.
&lt;figure&gt;
  &lt;img src="" alt=""&gt;
&lt;/figure&gt;

</code-example>


## Nested Chapters

To-do: Describe how for example the Directives chapter has nesting

