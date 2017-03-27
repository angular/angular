// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HeroTaxReturn }        from './hero';
import { HeroTaxReturnService } from './hero-tax-return.service';

@Component({
  selector: 'hero-tax-return',
  templateUrl: './hero-tax-return.component.html',
  styleUrls: [ './hero-tax-return.component.css' ],
  // #docregion providers
  providers: [ HeroTaxReturnService ]
  // #enddocregion providers
})
export class HeroTaxReturnComponent {
  message = '';
  @Output() close = new EventEmitter<void>();

  get taxReturn(): HeroTaxReturn {
    return this.heroTaxReturnService.taxReturn;
  }
  @Input()
  set taxReturn (htr: HeroTaxReturn) {
    this.heroTaxReturnService.taxReturn = htr;
  }

  constructor(private heroTaxReturnService: HeroTaxReturnService ) { }

  onCanceled()  {
    this.flashMessage('Canceled');
    this.heroTaxReturnService.restoreTaxReturn();
  };

  onClose()  { this.close.emit(); };

  onSaved() {
    this.flashMessage('Saved');
    this.heroTaxReturnService.saveTaxReturn();
  }

  flashMessage(msg: string) {
    this.message = msg;
    setTimeout(() => this.message = '', 500);
  }
}
