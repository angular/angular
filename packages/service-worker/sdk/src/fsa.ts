const protocolVersion = 1;
const worker = 'ngsw';

export enum BroadcastFsa {
  APP_UPDATE_AVAILABLE,
  APP_UPDATE_ACTIVATED,
  STATUS,
  VERSION,
  PONG,
}

export enum DispatchFsa {
  REQUEST_UPDATE_STATUS,
  CHECK_FOR_UPDATES,
  ACTIVATE_UPDATE,
  REQUEST_VERSION,
  PING,
  FAKE_PUSH,
}

const NGSW_PREFIX = 'NGSW_';

export function makeBroadcastFsa(
    type: BroadcastFsa.APP_UPDATE_AVAILABLE,
    payload: UpdateAvailablePayload): FsaBroadcastMessage<UpdateAvailablePayload>;
export function makeBroadcastFsa(
    type: BroadcastFsa.APP_UPDATE_ACTIVATED,
    payload: UpdateActivatedPayload): FsaBroadcastMessage<UpdateActivatedPayload>;
export function makeBroadcastFsa(
    type: BroadcastFsa.PONG, payload: PongPayload): FsaBroadcastMessage<PongPayload>;
export function makeBroadcastFsa(
    type: BroadcastFsa.STATUS, payload: StatusPayload): FsaBroadcastMessage<StatusPayload>;
export function makeBroadcastFsa(
    type: BroadcastFsa.VERSION, payload: VersionPayload): FsaBroadcastMessage<VersionPayload>;
export function makeBroadcastFsa<T>(type: string, payload: T): FsaBroadcastMessage<T>;
export function makeBroadcastFsa<T>(
    type: BroadcastFsa | string, payload: T): FsaBroadcastMessage<T> {
  return {
    type: NGSW_PREFIX + (typeof type === 'string' ? type : BroadcastFsa[type]),
    protocolVersion,
    worker,
    payload,
  };
}

export const FsaDispatchParser = {
  isCheckForUpdatesAction: function(fsa: FsaMessage<any>):
      fsa is FsaMessage<CheckForUpdatesPayload> {
        return !!fsa.type && fsa.type === NGSW_PREFIX + DispatchFsa[DispatchFsa.CHECK_FOR_UPDATES];
      },

  isActivateUpdateAction: function(fsa: FsaMessage<any>): fsa is FsaMessage<ActivateUpdatePayload> {
    return !!fsa.type && fsa.type === NGSW_PREFIX + DispatchFsa[DispatchFsa.ACTIVATE_UPDATE];
  },

  isPingAction: function(fsa: FsaMessage<any>): fsa is FsaMessage<PingPayload> {
    return !!fsa.type && fsa.type === NGSW_PREFIX + DispatchFsa[DispatchFsa.PING];
  },

  isRequestUpdateStatusAction: function(
      fsa: FsaMessage<any>): fsa is FsaMessage<RequestUpdateStatusPayload> {
    return !!fsa.type && fsa.type === NGSW_PREFIX + DispatchFsa[DispatchFsa.REQUEST_UPDATE_STATUS];
  },

  isFakePushAction: function(fsa: FsaMessage<any>): fsa is FsaMessage<FakePushPayload> {
    return !!fsa.type && fsa.type === NGSW_PREFIX + DispatchFsa[DispatchFsa.FAKE_PUSH];
  },

  isRequestVersionAction: function(fsa: FsaMessage<any>): fsa is FsaMessage<RequestVersionPayload> {
    return !!fsa.type && fsa.type === NGSW_PREFIX + DispatchFsa[DispatchFsa.REQUEST_VERSION];
  }
};

export interface FsaMessage<T> {
  readonly type: string;
  readonly protocolVersion: number;
  readonly payload: T;
}

export interface FsaBroadcastMessage<T> extends FsaMessage<T> { readonly worker: string; }

export interface AppVersion {
  readonly manifestHash: string;
  readonly appData: Object|null;
}

export interface UpdateAvailablePayload {
  readonly current: AppVersion;
  readonly next: AppVersion;
}

export interface UpdateActivatedPayload {
  readonly previous: AppVersion|null;
  readonly current: AppVersion;
}

export interface CheckForUpdatesPayload { statusNonce: number; }

export interface PingPayload { nonce: number; }

export interface PongPayload { nonce: number; }

export interface ActivateUpdatePayload {
  manifestHash: string;
  statusNonce: number;
}

export interface StatusPayload {
  nonce: number;
  status: boolean;
  error: Object|null;
}

export interface VersionPayload { readonly version: AppVersion|null; }

export interface RequestVersionPayload {}

export interface RequestUpdateStatusPayload {}

export interface FakePushPayload { payload: Object; }
