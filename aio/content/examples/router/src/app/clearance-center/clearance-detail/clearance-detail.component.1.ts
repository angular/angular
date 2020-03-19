// #docplaster
// #docregion
import { Component, OnInit }   from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Observable }                       from 'rxjs';
import { switchMap }                        from 'rxjs/operators';

import { ClearanceService }  from '../clearance.service';
import { ClearanceItem } from '../clearance-item';
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
    private service: ClearanceService,
    private router: Router,
    private route: ActivatedRoute,
    public dialogService: DialogService
  ) {}

  // #docregion ngOnInit
  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) =>
          this.service.getClearanceItem(params.get('id'))))
      .subscribe((clearanceItem: ClearanceItem) => {
        if (clearanceItem) {
          this.editName = clearanceItem.name;
          this.clearanceItem = clearanceItem;
        } else { // id not found
          this.gotoClearanceItem();
        }
      });
  }
  // #enddocregion ngOnInit

  cancel() {
    this.gotoClearanceItem();
  }

  save() {
    this.clearanceItem.name = this.editName;
    this.gotoClearanceItem();
  }

  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no clearance or the clearance is unchanged
    if (!this.clearanceItem || this.clearanceItem.name === this.editName) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes?');
  }

  gotoClearanceItem() {
    let clearanceId = this.clearanceItem ? this.clearanceItem.id : null;
    // Pass along the clearance id if available
    // so that the ClearanceListComponent can select that clearance item.
    // Add a useless `foo` parameter, to show optional parameters
    // Relative navigation back to the clearance item
    this.router.navigate(['../', { id: clearanceId, foo: 'foo' }], { relativeTo: this.route });
  }
}
