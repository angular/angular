import { Descriptor } from 'protocol';
import { Property } from './element-property-resolver';

export const arrayify = (props: { [prop: string]: Descriptor }, parent: Property | null = null): Property[] =>
  Object.keys(props)
    .map((name) => ({ name, descriptor: props[name], parent }))
    .sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
