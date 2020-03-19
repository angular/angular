// #docplaster
// #docregion
import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ClearanceItem }         from '../clearance-item';
import { DialogService }  from '../../dialog.service';

@Component({
  selector: 'app-clearance-detail',
  templateUrl: './clearance-detail.component.html',
  styleUrls: ['./clearance-detail.component.css']
})
export class ClearanceDetailComponent implements OnInit {
  clearanceItem: ClearanceItem;
  editName: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService
  ) {}

// #docregion ngOnInit
  ngOnInit() {
    this.route.data
      .subscribe((data: { clearanceItem: ClearanceItem }) => {
        this.editName = data.clearanceItem.name;
        this.clearanceItem = data.clearanceItem;
      });
  }
// #enddocregion ngOnInit

  // #docregion cancel-save
  cancel() {
    this.gotoClearanceItems();
  }

  save() {
    this.clearanceItem.name = this.editName;
    this.gotoClearanceItems();
  }
  // #enddocregion cancel-save

  // #docregion canDeactivate
  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!this.clearanceItem || this.clearanceItem.name === this.editName) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes?');
  }
  // #enddocregion canDeactivate

  gotoClearanceItems() {
    let clearanceItemId = this.clearanceItem ? this.clearanceItem.id : null;
    // Pass along the crisis id if available
    // so that the CrisisListComponent can select that crisis.
    // Add a totally useless `foo` parameter for kicks.
  // #docregion gotoCrises-navigate
    // Relative navigation back to the crises
    this.router.navigate(['../', { id: clearanceItemId, foo: 'foo' }], { relativeTo: this.route });
  // #enddocregion gotoCrises-navigate
  }
}
