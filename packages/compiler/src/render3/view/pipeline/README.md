# Template Pipeline

This directory contains the code for the template pipeline, an alternative template compiler which is a replacement for the current `TemplateDefinitionBuilder`.

## Design Philosophy

The template pipeline is built around the concept of an Intermediate Representation (IR) for templates, as a nested structure of create and update blocks. Each block is a linked list of nodes representing various template structures (element declarations, input bindings, embedded views, etc).

A sequence of pipeline stages transforms this IR from the initial version extracted from the template into a form that's ready to be emitted as Ivy instructions. This allows various aspects of Ivy templates to be handled in loosely coupled stages, as opposed to the previous design which performed template compilation monolithically.

For example, one stage might look for `ElementStart` and `ElementEnd` nodes that are adjacent, and replace them with a single self-closing `Element` node instead. Instruction chaining, rather than happening simultaneously with the generation of instructions, now happens as a final transformation during emit, where adjacent instructions that are compatible with chaining are converted into the chained form.

## Status

Currently the pipeline is a work in progress, and is only tested internally.

## Directory Layout

* `ir` - contains the core data structures and interfaces of the intermediate representation.
