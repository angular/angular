The small `ts_library` defined in this directory defines a constant which determines whether the template pipeline should be used. This constant depends on the defined Bazel config flag `//packages/compiler:use_template_pipeline`. In other words:

```
yarn bazel build //some:target --//packages/compiler:use_template_pipeline
```

will enable the prototype template pipeline for this build.
