# Outstanding on the `Todo` app

## `Todo` app
- [X] Clicking archive removes todo item.
- [X] Update `Todo` app to match http://todomvc.com/.
- [ ] Make it work with `[(ngModel)]`.
- [ ] Make it work with `(keyup.Enter)`.

## Compiler
- [X] Remove ` tslib_1.__decorate([core_1.Input(), tslib_1.__metadata("design:type", Object)], TodoComponent.prototype, "todo", void 0);` from generated output.
- [ ] Allow compilation of `@angular/common` through ivy.
 
## Ivy Runtime
- [X] Work on `ViewContainerRef` needs to cause change detection so that `todo` app renders correctly on first render.
- [X] The todo input value box is not correctly rendering to checked for completed tasks.
- [ ] `ViewContainerRef` must separate creation mode from update mode otherwise {{todo.done}} fails for `NgFor` because `todo` is not set during creation mode.
- [ ] Injector should be optional

## Testing
- [ ] Create a debug mode which would publish components into DOM for easier writing of tests.

# NOTES

## Killing hung `iblaze` server

At times the `iblaze run packages/core/test/bundling/todo:devserver` keeps running and holding onto
ports even after `ctrl-c`. This command kills the outstanding processes.

```
kill -9 $(ps aux | grep ibazel\\\|devserver | cut -c 17-23)
```
