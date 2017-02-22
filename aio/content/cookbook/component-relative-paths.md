@title
Component-relative Paths

@intro
Use relative URLs for component templates and styles.

@description
## Write *Component-Relative* URLs to component templates and style files

Our components often refer to external template and style files.
We identify those files with a URL in the `templateUrl` and `styleUrls` properties of the `@Component` metadata
as seen here:


{@example 'cb-component-relative-paths/ts/src/app/some.component.ts' region='absolute-config'}

By default, we *must* specify the full path back to the application root.
We call this an ***absolute path*** because it is *absolute* with respect to the application root.

There are two problems with an *absolute path*:

1. We have to remember the full path back to the application root.

1. We have to update the URL when we move the component around in the application files structure.

It would be much easier to write and maintain our application components if we could specify template and style locations
*relative* to their component class file.

*We can!*


~~~ {.alert.is-important}

We can if we build our application as `commonjs` modules and load those modules
with a suitable package loader such as `systemjs` or `webpack`.
Learn why [below](#why-default).

The Angular CLI uses these technologies and defaults to the
*component-relative path* approach described here.
CLI users can skip this chapter or read on to understand
how it works.


~~~


## _Component-Relative_ Paths

Our goal is to specify template and style URLs *relative* to their component class files, 
hence the term ***component-relative path***.

The key to success is following a convention that puts related component files in well-known locations.

We recommend keeping component template and component-specific style files as *siblings* of their
companion component class files. 
Here we see the three files for `SomeComponent` sitting next to each other in the `app` folder. 

<aio-filetree>

  <aio-folder>
    app
    <aio-file>
      some.component.css
    </aio-file>


    <aio-file>
      some.component.html
    </aio-file>


    <aio-file>
      some.component.ts
    </aio-file>


  </aio-folder>


</aio-filetree>

We'll have more files and folders &mdash; and greater folder depth &mdash; as our application grows.
We'll be fine as long as the component files travel together as the inseparable siblings they are.

### Set the *moduleId*

Having adopted this file structure convention, we can specify locations of the template and style files
relative to the component class file simply by setting the `moduleId` property of the `@Component` metadata like this

{@example 'cb-component-relative-paths/ts/src/app/some.component.ts' region='module-id'}

We strip the `src/app/` base path from the `templateUrl` and `styleUrls` and replace it with `./`. 
The result looks like this:

{@example 'cb-component-relative-paths/ts/src/app/some.component.ts' region='relative-config'}



~~~ {.alert.is-helpful}

Webpack users may prefer [an alternative approach](#webpack).


~~~


## Source

**We can see the <live-example name="cb-component-relative-paths"></live-example>**
and download the source code from there
or simply read the pertinent source here.
<md-tab-group>

  <md-tab label="src/app/some.component.ts">
    {@example 'cb-component-relative-paths/ts/src/app/some.component.ts'}
  </md-tab>


  <md-tab label="src/app/some.component.html">
    {@example 'cb-component-relative-paths/ts/src/app/some.component.html'}
  </md-tab>


  <md-tab label="src/app/some.component.css">
    {@example 'cb-component-relative-paths/ts/src/app/some.component.css'}
  </md-tab>


  <md-tab label="src/app/app.component.ts">
    {@example 'cb-component-relative-paths/ts/src/app/app.component.ts'}
  </md-tab>


</md-tab-group>



{@a why-default}

## Appendix: why *component-relative* is not the default

A *component-relative* path is obviously superior to an *absolute* path.
Why did Angular default to the *absolute* path?
Why do *we* have to set the `moduleId`? Why can't Angular set it?

First, let's look at what happens if we use a relative path and omit the `moduleId`.

`EXCEPTION: Failed to load some.component.html`

Angular can't find the file so it throws an error.

Why can't Angular calculate the template and style URLs from the component file's location? 

Because the location of the component can't be determined without the developer's help.
Angular apps can be loaded in many ways: from individual files, from SystemJS packages, or
from CommonJS packages, to name a few. 
We might generate modules in any of several formats. 
We might not be writing modular code at all!

With this diversity of packaging and module load strategies, 
it's not possible for Angular to know with certainty where these files reside at runtime.

The only location Angular can be sure of is the URL of the `index.html` home page, the application root.
So by default it resolves template and style paths relative to the URL of `index.html`.
That's why we previously wrote our file URLs with an `app/` base path prefix.

But *if* we follow the recommended guidelines and we write modules in `commonjs` format
and we use a module loader that *plays nice*,
*then* we &mdash; the developers of the application &mdash;
know that the semi-global `module.id` variable is available and contains
the absolute URL of the component class module file.

That knowledge enables us to tell Angular where the *component* file is
by setting the `moduleId`:

{@example 'cb-component-relative-paths/ts/src/app/some.component.ts' region='module-id'}



{@a webpack}

## Webpack: load templates and styles
Webpack developers have an alternative to `moduleId`.

They can load templates and styles at runtime by adding `./` at the beginning of the `template` and `styles` / `styleUrls`
properties that reference *component-relative URLS.


{@example 'webpack/ts/src/app/app.component.ts'}


Webpack will do a `require` behind the scenes to load the templates and styles. Read more [here](../guide/webpack.html#highlights).

See the [Introduction to Webpack](../guide/webpack.html).