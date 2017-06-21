// #docregion
import { ApolloClient } from 'apollo-client';
// #docregion import-and-use
import { mockNetworkInterface } from './mockedNetworkInterface';

const client = new ApolloClient({
  networkInterface: mockNetworkInterface
});
// #enddocregion import-and-use
export function getClient(): ApolloClient {
  return client;
}
// #enddocregion
