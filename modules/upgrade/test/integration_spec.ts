import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
} from 'angular2/test_lib';

import {Component, View, Inject} from 'angular2/angular2';
import {createUpgradeModule, UpgradeModule, bootstrapHybrid} from 'upgrade/upgrade';

export function main() {
  describe('upgrade: ng1 to ng2', () => {
    it('should have angular 1 loaded', () => expect(angular.version.major).toBe(1));

    it('should instantiate ng2 in ng1 template', inject([AsyncTestCompleter], (async) => {
         var element = html("<div>{{ 'ng1-' }}<ng2>~~</ng2>{{ '-ng1' }}</div>");

         var upgradeModule: UpgradeModule = createUpgradeModule();
         upgradeModule.importNg2Component(SimpleComponent);
         upgradeModule.bootstrap(element).ready(() => {
           expect(document.body.textContent).toEqual("ng1-NG2-ng1");
           async.done();
         });
       }));

    it('should instantiate ng1 in ng2 template', inject([AsyncTestCompleter], (async) => {
         var element = html("<div>{{'ng1('}}<ng2-1></ng2-1>{{')'}}</div>");

         ng1inNg2Module.bootstrap(element).ready(() => {
           expect(document.body.textContent).toEqual("ng1(ng2(ng1 WORKS!))");
           async.done();
         });
       }));
  });
}

@Component({selector: 'ng2'})
@View({template: `{{ 'NG2' }}`})
class SimpleComponent {
}

var ng1inNg2Module: UpgradeModule = createUpgradeModule();

@Component({selector: 'ng2-1'})
@View({
  template: `{{ 'ng2(' }}<ng1></ng1>{{ ')' }}`,
  directives: [ng1inNg2Module.exportAsNg2Component('ng1')]
})
class Ng2ContainsNg1 {
}

ng1inNg2Module.ng1Module.directive('ng1', () => { return {template: 'ng1 {{ "WORKS" }}!'}; });
ng1inNg2Module.importNg2Component(Ng2ContainsNg1);


function html(html: string): Element {
  var body = document.body;
  body.innerHTML = html;
  if (body.childNodes.length == 1 && body.firstChild instanceof HTMLElement)
    return <Element>body.firstChild;
  return body;
}
