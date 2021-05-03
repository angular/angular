/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {registerLocaleData} from '@angular/common';
import {Component} from '@angular/core';
// we need to import data for the french locale
import localeFr from './locale-fr';

// registering french data
registerLocaleData(localeFr);

@Component({
  selector: 'date-pipe',
  template: `<div>
    <!--output 'Jun 15, 2015'-->
    <p>Today is {{today | date}}</p>

    <!--output 'Monday, June 15, 2015'-->
    <p>Or if you prefer, {{today | date:'fullDate'}}</p>

    <!--output '9:43 AM'-->
    <p>The time is {{today | date:'shortTime'}}</p>

    <!--output 'Monday, June 15, 2015 at 9:03:01 AM GMT+01:00' -->
    <p>The full date/time is {{today | date:'full'}}</p>

    <!--output 'Lundi 15 Juin 2015 à 09:03:01 GMT+01:00'-->
    <p>The full date/time in french is: {{today | date:'full':'':'fr'}}</p>

    <!--output '2015-06-15 05:03 PM GMT+9'-->
    <p>The custom date is {{today | date:'yyyy-MM-dd HH:mm a z':'+0900'}}</p>

    <!--output '2015-06-15 09:03 AM GMT+9'-->
    <p>The custom date with fixed timezone is {{fixedTimezone | date:'yyyy-MM-dd HH:mm a z':'+0900'}}</p>
  </div>`
})
export class DatePipeComponent {
  today = Date.now();
  fixedTimezone = '2015-06-15T09:03:01+0900';
}
@Component({
  selector: 'deprecated-date-pipe',
  template: `<div>
    <!--output 'Sep 3, 2010'-->
    <p>Today is {{today | date}}</p>

    <!--output 'Friday, September 3, 2010'-->
    <p>Or if you prefer, {{today | date:'fullDate'}}</p>

    <!--output '12:05 PM'-->
    <p>The time is {{today | date:'shortTime'}}</p>

    <!--output '2010-09-03 12:05 PM'-->
    <p>The custom date is {{today | date:'yyyy-MM-dd HH:mm a'}}</p>
  </div>`
})
export class DeprecatedDatePipeComponent {
  today = Date.now();
}
