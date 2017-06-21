// #docregion
// #docregion imports
import {
  makeExecutableSchema,
  addMockFunctionsToSchema
} from 'graphql-tools';
import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';
import { typeDefinitions } from './schema';
// #enddocregion imports

// #docregion create-interface
const schema = makeExecutableSchema({
  typeDefs: typeDefinitions
});
addMockFunctionsToSchema({ schema });
export const mockNetworkInterface = mockNetworkInterfaceWithSchema({ schema });
// #enddocregion create-interface
