import { NgModule }            from '@angular/core';
import { RouterModule }        from '@angular/router';

import { ContactComponent }    from './contact.component';

// #docregion routing
@NgModule({
  imports: [RouterModule.forChild([
    { path: 'contact', component: ContactComponent }
  ])],
  exports: [RouterModule]
})
export class ContactRoutingModule {}
// #enddocregion
