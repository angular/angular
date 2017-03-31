@title
Documentation Overview

@intro
How to read and use this documentation.

@description



This page describes the Angular documentation at a high level.
If you're new to Angular, you may want to visit "[Learning Angular](guide/learning-angular)" first.

## Themes

The documentation is divided into major thematic sections, each
a collection of pages devoted to that theme.



<table width="100%">

  <col width="15%">

  </col>

  <col>

  </col>

  <tr style=top>

    <td>
      <b><a href="../quickstart.html">QuickStart</a></b>
    </td>

    <td>


      A first taste of Angular<span if-docs="ts"> with zero installation. 
      Run "Hello World" in an online code editor and start playing with live code</span>.
    </td>

  </tr>

  <tr style=top>

    <td>
      <b>Guide</b>
    </td>

    <td>


      Learn the Angular basics (you're already here!) like the setup for local development,
      displaying data and accepting user input, injecting application services into components,
      and building simple forms.
    </td>

  </tr>

  <tr style=top>

    <td>
      <b><a href="../api/">API Reference</a></b>
    </td>

    <td>


      Authoritative details about each of the Angular libraries.
    </td>

  </tr>

  <tr style=top>

    <td>
      <b><a href="../tutorial/">Tutorial</a></b>
    </td>

    <td>


      A step-by-step, immersive approach to learning Angular that
      introduces the major features of Angular in an application context.
    </td>

  </tr>

  <tr style=top>

    <td>
      <b><a href="      ">Advanced</a></b>
    </td>

    <td>


      In-depth analysis of Angular features and development practices.
    </td>

  </tr>

  <tr style=top if-docs="ts">

    <td>
      <b><a href="../cookbook/">Cookbook</a></b>
    </td>

    <td>


      Recipes for specific application challenges, mostly code snippets with a minimum of exposition.

    </td>

  </tr>

</table>



A few early pages are written as tutorials and are clearly marked as such.
The rest of the pages highlight key points in code rather than explain each step necessary to build the sample.
You can always get the full source through the #{_liveLink}s.

## Code samples

Each page includes code snippets from a sample application that accompanies the page.
You can reuse these snippets in your applications.

Look for a link to a running version of that sample, often near the top of the page,
such as this <live-example nodownload name="architecture"></live-example> from the [Architecture](guide/architecture) page.
<span if-docs="ts">
The link launches a browser-based, code editor where you can inspect, modify, save, and download the code.
</span>

Alternatively, you can run the example locally, next to those `live-example` links you have a <a href="/resources/zips/architecture/architecture.zip">download link</a>.
Just download, unzip, run `npm install` to install the dependencies and run it with `npm start`.

## Reference pages

* The [Cheat Sheet](guide/cheatsheet) lists Angular syntax for common scenarios.
* The [Glossary](guide/glossary) defines terms that Angular developers should know.
<li if-docs="ts">The [Change Log](guide/change-log) announces what's new and changed in the documentation.</li>
* The [API Reference](api/) is the authority on every public-facing member of the Angular libraries.

## Feedback

We welcome feedback! 

* Use the <a href="!{_ngDocRepoURL}" target="_blank" title="angular docs on github">!{_angular_io} Github repository</a> for **documentation** issues and pull requests.
* Use the <a href="!{_ngRepoURL}" target="_blank" title="angular source on github">Angular Github repository</a> to report issues with **Angular** itself.