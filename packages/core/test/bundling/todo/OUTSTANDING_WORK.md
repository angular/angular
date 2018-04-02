# Outstanding on the `Todo` app

## Compiler
- [ ] Remove ` tslib_1.__decorate([core_1.Input(), tslib_1.__metadata("design:type", Object)], TodoComponent.prototype, "todo", void 0);` from generated output.

## Ivy Runtime
- [ ] Work on `ViewContainerRef` needs to cause change detection so that `todo` app renders correctly on first render.
- [ ] The todo input value box is not correctly rendering to checked for completed tasks.
- [ ] `ViewContainerRef` must separate creation mode from update mode otherwise {{todo.done}} fails for `NgFor` because `todo` is not set during creation mode.