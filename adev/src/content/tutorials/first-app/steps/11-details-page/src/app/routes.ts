import {Routes} from '@angular/router';
import {Home} from './home/home';
import {HousingLocationDetails} from './details/details';

const routeConfig: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'details/:id',
    component: HousingLocationDetails,
    title: 'Home details',
  },
];

export default routeConfig;
