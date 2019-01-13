// #docplaster
// #docregion
import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Crisis }         from '../crisis';
import { DialogService }  from '../../dialog.service';

@Component({
  selector: 'app-crisis-detail',
  templateUrl: './crisis-detail.component.html',
  styleUrls: ['./crisis-detail.component.css']
})
export class CrisisDetailComponent implements OnInit {
  crisis: Crisis;
  editName: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService
  ) {}

// #docregion ngOnInit
  ngOnInit() {
    this.route.data
      .subscribe((data: { crisis: Crisis }) => {
        this.editName = data.crisis.name;
        this.crisis = data.crisis;
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
    // 위기 목록이 없거나 변경되지 않았으면 `true`를 바로 반환합니다.
    if (!this.crisis || this.crisis.name === this.editName) {
      return true;
    }
    // 내용이 변경된 경우에는 사용자에게 물어보는 팝업을 띄웁니다.
    // 그리고 사용자가 응답한 값을 Observable 타입으로 반환합니다.
    return this.dialogService.confirm('Discard changes?');
  }
  // #enddocregion canDeactivate

  gotoCrises() {
    let crisisId = this.crisis ? this.crisis.id : null;
    // Pass along the crisis id if available
    // so that the CrisisListComponent can select that crisis.
    // Add a totally useless `foo` parameter for kicks.
  // #docregion gotoCrises-navigate
    // 상대주소를 사용해서 목록 화면으로 돌아갑니다.
    this.router.navigate(['../', { id: crisisId, foo: 'foo' }], { relativeTo: this.route });
  // #enddocregion gotoCrises-navigate
  }
}
