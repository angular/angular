import {fetchLongTermSupportBranchesFromNpm, ActiveReleaseTrains} from '@angular/ng-dev';
import {ReleaseConfig} from '@angular/ng-dev';
import {AuthenticatedGitClient} from '@angular/ng-dev';

export interface Deployment {
  branch: string;
  redirect?: {
    from: string;
    to: string;
  };
  destination?: string;
}

export type Deployments = Map<string, Deployment>;

export async function getDeployments(): Promise<Deployments> {
  const {github} = await AuthenticatedGitClient.get();
  const releaseTrains = await ActiveReleaseTrains.fetch({
    api: github,
    name: 'angular',
    owner: 'angular',
    nextBranchName: 'main',
  });
  const ltsBranches = await fetchLongTermSupportBranchesFromNpm({
    representativeNpmPackage: '@angular/core',
  } as ReleaseConfig);

  const docSites = new Map<string, Deployment>();

  [...ltsBranches.active, ...ltsBranches.inactive].forEach((branch) => {
    docSites.set(branch.name, {
      branch: branch.name,
      destination: `v${branch.version.major}-angular-dev`,
    });
  });

  docSites.set(releaseTrains.latest.branchName, {
    branch: releaseTrains.latest.branchName,
    redirect: {
      from: `v${releaseTrains.latest.version.major}-angular-dev`,
      to: 'https://angular.dev',
    },
    destination: 'angular-dev-site',
  });

  if (releaseTrains.releaseCandidate) {
    docSites.set(releaseTrains.next.branchName, {
      branch: releaseTrains.next.branchName,
    });

    docSites.set(releaseTrains.releaseCandidate.branchName, {
      branch: releaseTrains.releaseCandidate.branchName,
      destination: 'next-angular-dev',
      redirect: {
        from: `v${releaseTrains.releaseCandidate.version.major}-angular-dev`,
        to: 'https://next.angular.dev',
      },
    });
  } else {
    docSites.set(releaseTrains.next.branchName, {
      branch: releaseTrains.next.branchName,
      destination: 'next-angular-dev',
    });
  }

  return docSites;
}
