# Overview

[Plunker](http://plnkr.co) is an online tool for creating, collaborating and sharing ideas. In AIO
we use it to share one or more runnable versions of our examples.

Plunker comes in two flavours. The [classic UI](http://plnkr.co/edit) and an [embedded UI](http://embed.plnkr.co).
The latter can be used both in a new tab or embedded within a guide. The AIO project uses the
embedded version in both ways.

* `regularPlunker.js` - generates an HTML file for each example that will post to Plunker to create
  a new editable project, when rendered.
* `embeddedPlunker.js` - generates an HTML file for each example that can be used in an iframe to
  render an embedded Plunker project.
* `generatePlunkers.js` - executes each of the `regularPlunker.js` and `embeddedPlunker.js` utilities
  to generate all the example plunker files.

## Plunker generation

Both flavours are created within `builder.js`. How is a plunker created? What is the process from a
directory with files to a link with a plunker.

An "executable" plunker is an HTML file with a `<form>` that makes a post to plunker on submit. It
contains an `<input>` element for each file we need in the plunker.

The form will be submitted on load, so you can either double click the HTML file or open it with an
anchor tag to open the plunker.

So the `builder.js` job is to get all the needed files from an example and build this HTML file for you.

For plunkers, we use a special `systemjs.config` that exists in
`/aio/tools/examples/shared/boilerplate/src/systemjs.config.web.js` and we also add the Google's copyright
to each file.

## Customizing the generation per example basis

How does this tool know what is an example and what is not? It will look for all folders containing a
`plnkr.json` file. If found, all files within the folder and subfolders will be used in the plunker, with
a few generic exceptions that you can find at `builder.js`.

You can use the `plnkr.json` to customize the plunker generation. For example:

```json
{
  "description": "Tour of Heroes: Part 6",
  "basePath": "src/",
  "files":[
    "!**/*.d.ts",
    "!**/*.js",
    "!**/*.[1,2].*"
  ],
  "tags": ["tutorial", "tour", "heroes", "http"]
}
```

Here you can specify a description for the plunker, some tags, a basePath and also a files array where you
can specify extra files to add or to ignore.

## Classic plunkers and embedded ones

Luckily, both kind of plunkers are very similar, they are created in the same way with minor exceptions.

To handle those exceptions, we have the `embeddedPlunker.js` and the `regularPlunker.js`. Thanks to them,
the `builder.js`  is as generic as possible.

## Executing the plunker generation

`generatePlunkers.js` will create a classic plunker and an embedded plunker for each `plnkr.json` it finds.

Where? At `src/generated/live-examples/`.

Then the `<live-example>` embedded component will look at this folder to get the plunker it needs for the
example.

## Appendix: Why not generating plunkers at runtime?

At AngularJS, all the plunkers were generated a runtime. The downside is that all the example codes would
need to be deployed as well and they won't be no longer useful after the plunker is generated. This tool
takes a few seconds to run, and the end result is only 3mb~.
