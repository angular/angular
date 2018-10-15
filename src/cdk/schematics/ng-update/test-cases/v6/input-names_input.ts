import {Component} from '@angular/core';

@Component({
  template: `
    <ng-template cdkConnectedOverlay
                 [origin]="myOrigin"
                 [positions]="myPositions"
                 [offsetX]="myOffsetX"
                 [offsetY]="myOffsetY"
                 [width]="myWidth"
                 [height]="myHeight"
                 [minWidth]="myMinWidth"
                 [minHeight]="myMinHeight"
                 [backdropClass]="myBackdropClass"
                 [scrollStrategy]="myScrollStrategy"
                 [open]="isOpen"
                 [hasBackdrop]="hasBackdrop">
    </ng-template>
  `
})
class A {}
