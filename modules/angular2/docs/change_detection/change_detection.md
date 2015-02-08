# Change Detection

Change Detection is a mechanism of detecting changes in the model so that they can be propageted to the destination. Changes are detected and propageted in a top down manner from the root View to the child Views in a depth first traversal.


## `ChangeDetector`s

Each View has an associated `ChangeDetector` class with it. (Some Views may have more than one `ChangeDetector` to support partial views updates as is the case with `[hidden]` bindings.) `ChangeDetector`s are arranged in 





* Mechanisms by which changes are detected in the model
* DAG
* Order of evaluation
* Pure Functions
* `onChange` method
* Parser
