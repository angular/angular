// #docregion
import { ApolloClient } from 'apollo-client';
import { networkInterface } from './in-memory-graphql';

const client = new ApolloClient({
  networkInterface,
  dataIdFromObject: (object: any) => object.id,
});
export function getClient(): ApolloClient {
  return client;
}
// #enddocregion
