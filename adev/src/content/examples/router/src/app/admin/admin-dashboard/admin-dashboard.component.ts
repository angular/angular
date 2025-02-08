// #docregion
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {SelectivePreloadingStrategyService} from '../../selective-preloading-strategy.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  sessionId!: Observable<string>;
  token!: Observable<string>;
  modules: string[] = [];

  constructor(
    private route: ActivatedRoute,
    preloadStrategy: SelectivePreloadingStrategyService,
  ) {
    this.modules = preloadStrategy.preloadedModules;
  }

  ngOnInit() {
    // Capture the session ID if available
    this.sessionId = this.route.queryParamMap.pipe(
      map((params) => params.get('session_id') || 'None'),
    );

    // Capture the fragment if available
    this.token = this.route.fragment.pipe(map((fragment) => fragment || 'None'));
  }
}
