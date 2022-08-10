import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyMenuModule} from '@angular/material/legacy-menu';
import {MenuIconsExample} from './menu-icons/menu-icons-example';
import {MenuOverviewExample} from './menu-overview/menu-overview-example';
import {MenuPositionExample} from './menu-position/menu-position-example';
import {MenuNestedExample} from './menu-nested/menu-nested-example';
import {MenuHarnessExample} from './menu-harness/menu-harness-example';

export {
  MenuHarnessExample,
  MenuIconsExample,
  MenuOverviewExample,
  MenuPositionExample,
  MenuNestedExample,
};

const EXAMPLES = [
  MenuHarnessExample,
  MenuIconsExample,
  MenuOverviewExample,
  MenuPositionExample,
  MenuNestedExample,
];

@NgModule({
  imports: [MatButtonModule, MatIconModule, MatLegacyMenuModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class MenuExamplesModule {}
