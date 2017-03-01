import { Component, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DocumentService, DocumentContents } from 'app/documents/document.service';
import { NavigationService, NavigationViews } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-shell',
  template: `
    <md-toolbar color="primary" class="app-toolbar">
      <button *ngIf="isHamburgerVisible" class="hamburger" md-button (click)="sidenav.toggle()"><md-icon>menu</md-icon></button>
      <aio-top-menu [nodes]="(navigationViews | async)?.TopBar"></aio-top-menu>
      <md-input-container >
        <input mdInput placeholder="Search" (keyup)="onSearch($event)">
      </md-input-container>
      <span class="fill-remaining-space"></span>
    </md-toolbar>

    <md-sidenav-container class="sidenav-container" (window:resize)="onResize($event.target.innerWidth)">

      <md-sidenav #sidenav class="sidenav" [opened]="isSideBySide" [mode] = "this.isSideBySide ? 'side' : 'over'">
        <aio-nav-menu [nodes]="(navigationViews | async)?.SideNav"></aio-nav-menu>
      </md-sidenav>

      <section class="sidenav-content">
        <div class="search-results">
          <div *ngFor="let result of (searchResults | async)?.results">
            <a href="{{ result.path }}">{{ result.title }}</a>
          </div>
        </div>
        <aio-doc-viewer [doc]="currentDocument | async"></aio-doc-viewer>
      </section>

    </md-sidenav-container>`,
  styles:  [
    `.fill-remaining-space {
        flex: 1 1 auto;
      }

      md-input-container {
        margin-left: 10px;
        input {
          min-width:200px;
        }
      }


      .md-input-element {
        font-size: 70%;
        font-style: italic;
      }

      @media (max-width: 600px) {
        aio-menu {
          display: none;
        }
      }

      .sidenav-container {
        width: 100%;
        height: 100vh;
      }

      .sidenav-content {
        height: 100%;
        width: 100%;
        margin: auto;
        padding: 1rem;
      }

      .sidenav-content button {
        min-width: 50px;
      }

      .sidenav {
        padding: 0;
      }

      // md-toolbar {
      //   display: none;
      //   padding-left: 10px !important;
      // }
      // md-toolbar.active {
      //   display: block;
      // }`
  ]
})
export class AppComponent implements OnInit {
  isHamburgerVisible = true; // always ... for now
  isSideBySide = false;
  sideBySideWidth = 600;

  currentDocument: Observable<DocumentContents>;
  navigationViews: Observable<NavigationViews>;

  constructor(documentService: DocumentService, navigationService: NavigationService) {
    this.currentDocument = documentService.currentDocument;
    this.navigationViews = navigationService.navigationViews;
  }

  ngOnInit() {
    this.onResize(window.innerWidth);
  }

  onResize(width) {
    this.isSideBySide = width > this.sideBySideWidth;
  }
}
