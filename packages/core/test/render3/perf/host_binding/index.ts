/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵdefineDirective, ɵɵelement, ɵɵhostProperty, ɵɵlistener} from '../../../../src/render3/index';
import {DirectiveDefList, RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TAttributes} from '../../../../src/render3/interfaces/node';
import {createBenchmark} from '../micro_bench';
import {setupTestHarness} from '../setup';

// Number of Directives with Host Binding and Host Listener
// that should be generated for one element in a template.
const HOST_BINDING_DIRS_COUNT = 100;

function generateHostBindingDirDef() {
  `
  @Directive({
    selector: '[hostBindingDir]'
  })
  export class HostBindingDir {
    exp = 'string-exp';

    @HostBinding('data-a')
    a: string = 'exp';

    @HostListener('click')
    onClick(event: any): void {}
  }
`;
  class HostBindingDir {
    static ɵfac() {
      return new HostBindingDir();
    }
    static ɵdir = ɵɵdefineDirective({
      type: HostBindingDir,
      selectors: [['', 'hostBindingDir', '']],
      hostVars: 2,
      hostBindings:
          function(rf: RenderFlags, ctx: any) {
            if (rf & 1) {
              ɵɵlistener('click', function() {
                return ctx.onClick();
              });
            }
            if (rf & 2) {
              ɵɵhostProperty('data-a', ctx.exp);
            }
          }
    });

    exp = 'string-exp';
    onClick() {}
  }
  return HostBindingDir.ɵdir;
}

`
  <div hostBindingDir></div>
`;
function componentTemplateFn(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div', 0);
  }
}

const context: any = {};
const consts: TAttributes[] = [['hostBindingDir', '']];
const directives: DirectiveDefList = [];
for (let i = 0; i < HOST_BINDING_DIRS_COUNT; i++) {
  directives.push(generateHostBindingDirDef());
}
const harness = setupTestHarness(componentTemplateFn, 1, 0, 1000, context, consts, directives);

// Benchmark host bindings execution in *creation* mode
const createModeBenchmark = createBenchmark('host bindings');
const createModeProfile = createModeBenchmark('`create` mode');

console.profile(createModeBenchmark.name + ':' + createModeProfile.name);
while (createModeProfile()) {
  harness.createEmbeddedLView();
}
console.profileEnd();

createModeBenchmark.report();

// Benchmark host bindings execution in *update* mode
const updateModeBenchmark = createBenchmark('host bindings');
const updateModeProfile = updateModeBenchmark('`update` mode');

console.profile(updateModeBenchmark.name + ':' + updateModeProfile.name);
while (updateModeProfile()) {
  harness.detectChanges();
}
console.profileEnd();

updateModeBenchmark.report();
