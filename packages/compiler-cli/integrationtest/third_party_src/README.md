This folder emulates consuming precompiled modules and components.
It is compiled separately from the other sources under `src`
to only generate `*.js` / `*.d.ts` / `*.metadata.json` files,
but no `*.ngfactory.ts` files.

** WARNING **
Do not import components/directives from here directly as we want to test that ngc still compiles 
them when they are not imported.