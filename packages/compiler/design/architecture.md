# DESIGN DOC(Ivy): Compiler Architecture

AUTHOR: arick@, chuckj@
Status: Draft

## Overview

This document details the new architecture of the Angular compiler in a post-Ivy world, as well as the compatibility functionality needed for the ecosystem to gradually migrate to Ivy without breaking changes. This compatibility ensures Ivy and non-Ivy libraries can coexist during the migration period.

### The Ivy Compilation Model

Broadly speaking, The Ivy model is that Angular decorators (`@Injectable`, etc) are compiled to static properties on the classes (`ngInjectableDef`). This operation must take place without global program knowledge, and in most cases only with knowledge of that single decorator.

The one exception is `@Component`, which requires knowledge of the metadata from the `@NgModule` which declares the component in order to properly generate the `ngComponentDef`. In particular, the selectors which are applicable during compilation of a component template are determined by the module that declares that component, and the transitive closure of the exports of that module's imports.

Going forward, this will be the model by which Angular code will be compiled, shipped to NPM, and eventually bundled into applications.

### Existing code on NPM

Existing Angular libraries exist on NPM today and are distributed in the Angular Package Format, which details the artifacts shipped. Today this includes compiled `.js` files in both ES2015 and ESM (ES5 + ES2015 modules) flavors, `.d.ts` files, and `.metadata.json` files. The `.js` files have the Angular decorator information removed, and the `.metadata.json` files preserve the decorator metadata in an alternate format.

### High Level Proposal

We will produce two compiler entrypoints, `ngtsc` and `ngcc`.

`ngtsc` will be an Typescript-to-Javascript transpiler that reifies Angular decorators into static properties. It is a minimal wrapper around `tsc` which includes a set of Angular transforms.

`ngcc` (which stands for Angular compatibility compiler) is designed to process code coming from NPM and produce the equivalent Ivy version, as if the code was compiled with `ngtsc`. It will operate given a `node_modules` directory and a set of packages to compile, and will produce an equivalent directory from which the Ivy equivalents of those modules can be read.

`ngcc` can also be run as part of a code loader (e.g. for Webpack) to transpile packages being read from `node_modules` on-demand.

## Detailed Design

### Ivy Compilation Model

#### Decorator Reification

Model of compiling decorator -> static property

#### The selector problem

Selectors require non-local knowledge, but can be formed into a problem that's scoped to a compilation unit (and its dependencies).

Describe how components can be compiled with or without reified references to dependencies.

#### Flowing module & selector metadata via types

Talk about the approach of using types to communicate metadata information.

#### Compilers

Describe the implementation of various compilers (especially view compiler) outside the context of TS.

### ngtsc

#### tsc + transforms

Describe the structure of ngtsc as a small wrapper around tsc.

#### Transform pipeline

Describe the various transforms, their purpose, and their ordering.

#### Template Type Checking

Describe how type checking works today and how this design will be integrated into ngtsc.

### ngcc

#### Compilation Model

Describe how ngcc will apply the same transformation on node_modules code to produce the equivalent Ivy code, and what this means for users.

#### Metadata Recombination

Describe how ngcc will read `.js` files along with their `.metadata.json` to produce an AST with `ts.Decorator` nodes.

#### Merging JS Output

Describe issues with using TS emit and the solution which applies patches back to the original JS source files, including sourcemap updates.

### Language Service

A loose description of the architecture of `@angular/language-service`, to be fully described in a future document. Also talk about how the language service will work as-is until the new architecture can be implemented.