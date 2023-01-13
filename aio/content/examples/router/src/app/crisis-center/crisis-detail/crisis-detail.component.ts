// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Crisis } from '../crisis';
import { DialogService } from '../../dialog.service';

@Component({
  selector: 'app-crisis-detail',
  templateUrl: './crisis-detail.component.html',
  styleUrls: ['./crisis-detail.component.css']
})
export class CrisisDetailComponent implements OnInit {
  crisis!: Crisis;
  editName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService
  ) {}

// #docregion ngOnInit
  ngOnInit() {
    this.route.data
      .subscribe(data => {
        const crisis: Crisis = data['crisis'];
        this.editName = crisis.name;
        this.crisis = crisis;
      });
  }
// #enddocregion ngOnInit

  // #docregion cancel-save
  cancel() {
    this.gotoCrises();
  }

  save() {
    this.crisis.name = this.editName;
    this.gotoCrises();
  }
  // #enddocregion cancel-save

  // #docregion canDeactivate
  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!this.crisis || this.crisis.name === this.editName) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes?');
  }
  // #enddocregion canDeactivate

  gotoCrises() {
    const crisisId = this.crisis ? this.crisis.id : null;
    // Pass along the crisis id if available
    // so that the CrisisListComponent can select that crisis.
    // Add a totally useless `foo` parameter for kicks.
  // #docregion gotoCrises-navigate
    // Relative navigation back to the crises
    this.router.navigate(['../', { id: crisisId, foo: 'foo' }], { relativeTo: this.route });
  // #enddocregion gotoCrises-navigate
  }
}
