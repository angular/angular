import {Component} from '@angular/core';

@Component({
  template: `
    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="myOrigin"
                 [cdkConnectedOverlayPositions]="myPositions"
                 [cdkConnectedOverlayOffsetX]="myOffsetX"
                 [cdkConnectedOverlayOffsetY]="myOffsetY"
                 [cdkConnectedOverlayWidth]="myWidth"
                 [cdkConnectedOverlayHeight]="myHeight"
                 [cdkConnectedOverlayMinWidth]="myMinWidth"
                 [cdkConnectedOverlayMinHeight]="myMinHeight"
                 [cdkConnectedOverlayBackdropClass]="myBackdropClass"
                 [cdkConnectedOverlayScrollStrategy]="myScrollStrategy"
                 [cdkConnectedOverlayOpen]="isOpen"
                 [cdkConnectedOverlayHasBackdrop]="hasBackdrop">
    </ng-template>
  `
})
class A {}
