# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["labels-panel.ts", "pipe.module.ts"]
}
```

# /pipe.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'async',
  standalone: false,
})
export class AsyncPipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

@NgModule({
  declarations: [AsyncPipe],
  exports: [AsyncPipe],
})
export class PipeModule {}
```

# /labels-panel.ts
```ts
/**
 * Minimal reproduction for Google3 target:
 * Target: //cloud/console/web/common/components/ai/labels_panel:karma_gm2_chrome-linux
 * Sponge: http://sponge/433ccbcb-7782-49ae-9373-fc3d5931f44e
 * Error: NG0302: The pipe 'async' could not be found in the 'LabelsPanel' component. Verify that it is declared or imported in this module. Find more at <url>
 */
import { Component, NgModule } from '@angular/core';
import { PipeModule } from './pipe.module';
import { ExternalModule } from '@third-party/external';

@Component({
  selector: 'labels-panel',
  template: '<div>{{ data | async }}</div>',
  standalone: false,
})
export class LabelsPanel {
  data: any;
}

@NgModule({
  declarations: [LabelsPanel],
  exports: [LabelsPanel],
  imports: [PipeModule, ExternalModule],
})
export class LabelsPanelModule {}
```
