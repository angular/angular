import {NgModule} from '@angular/core';
import {CdkMenuModule} from '@angular/cdk/menu';
import {CdkMenuStandaloneMenuExample} from './cdk-menu-standalone-menu/cdk-menu-standalone-menu-example';
import {CdkMenuStandaloneStatefulMenuExample} from './cdk-menu-standalone-stateful-menu/cdk-menu-standalone-stateful-menu-example';
import {CdkMenuMenubarExample} from './cdk-menu-menubar/cdk-menu-menubar-example';
import {CdkMenuInlineExample} from './cdk-menu-inline/cdk-menu-inline-example';
import {CdkMenuContextExample} from './cdk-menu-context/cdk-menu-context-example';
import {CdkMenuNestedContextExample} from './cdk-menu-nested-context/cdk-menu-nested-context-example';
import {CommonModule} from '@angular/common';

export {
  CdkMenuStandaloneMenuExample,
  CdkMenuMenubarExample,
  CdkMenuInlineExample,
  CdkMenuContextExample,
  CdkMenuNestedContextExample,
  CdkMenuStandaloneStatefulMenuExample,
};

const EXAMPLES = [
  CdkMenuStandaloneMenuExample,
  CdkMenuMenubarExample,
  CdkMenuInlineExample,
  CdkMenuContextExample,
  CdkMenuNestedContextExample,
  CdkMenuStandaloneStatefulMenuExample,
];

@NgModule({
  imports: [CdkMenuModule, CommonModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkMenuExamplesModule {}
