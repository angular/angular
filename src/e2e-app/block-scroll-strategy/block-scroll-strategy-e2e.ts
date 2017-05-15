import {Component} from '@angular/core';
import {BlockScrollStrategy, ViewportRuler} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'block-scroll-strategy-e2e',
  templateUrl: 'block-scroll-strategy-e2e.html',
  styleUrls: ['block-scroll-strategy-e2e.css'],
})
export class BlockScrollStrategyE2E {
  constructor(private _viewportRuler: ViewportRuler) { }
  scrollStrategy = new BlockScrollStrategy(this._viewportRuler);
}
