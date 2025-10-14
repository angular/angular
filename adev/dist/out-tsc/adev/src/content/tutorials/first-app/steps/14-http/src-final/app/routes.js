import {Home} from './home/home';
import {Details} from './details/details';
const routeConfig = [
  {
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'details/:id',
    component: Details,
    title: 'Home details',
  },
];
export default routeConfig;
//# sourceMappingURL=routes.js.map
