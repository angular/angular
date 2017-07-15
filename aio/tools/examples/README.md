# Overview

Many of the documentation pages contain snippets of code examples. We extract these snippets from real working example
applications, which are stored in subfolders of the `/aio/content/examples` folder. Each example can be built and run
independently. Each example also provides e2e specs, which are run as part of our Travis build tasks, to verify that the
examples continue to work as expected, as changes are made to the core Angular libraries.

In order to build, run and test these examples independently we need to install dependencies into their sub-folder. Also
there are a number of common boilerplate files that are needed to configure each example's project. We maintain these
common boilerplate files centrally to reduce the amount of effort if one of them needs to change.