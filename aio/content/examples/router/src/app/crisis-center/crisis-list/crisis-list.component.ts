// #docregion
import { Component, OnInit }  from '@angular/core';
import { ActivatedRoute }     from '@angular/router';

import { CrisisService }  from '../crisis.service';
import { Crisis }         from '../crisis';
import { Observable }     from 'rxjs';
import { switchMap }      from 'rxjs/operators';

@Component({
  selector: 'app-crisis-list',
  templateUrl: './crisis-list.component.html',
  styleUrls: ['./crisis-list.component.css']
})
export class CrisisListComponent implements OnInit {
  crises$: Observable<Crisis[]>;
  selectedId: number;

  // #docregion ctor
  constructor(
    private service: CrisisService,
    private route: ActivatedRoute
  ) {}
  // #enddocregion ctor

  ngOnInit() {
    this.crises$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedId = +params.get('id');
        return this.service.getCrises();
      })
    );
  }
}
