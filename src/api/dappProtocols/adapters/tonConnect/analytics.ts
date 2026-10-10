import type { ApiNetwork } from '../../../types';
import { CHAIN } from './types';

// Mochi fork: TON Connect telemetry is deleted, not disabled. `recordTonConnectEvent` below is a no-op kept
// only so existing call sites keep compiling; it performs no network request and retains nothing.

export type TonConnectEventName =
  | 'wallet-connect-request-received'
  | 'wallet-connect-request-ui-displayed'
  | 'wallet-connect-accepted'
  | 'wallet-connect-rejected'
  | 'wallet-connect-response-sent'
  | 'wallet-transaction-request-received'
  | 'wallet-transaction-confirmation-ui-displayed'
  | 'wallet-transaction-accepted'
  | 'wallet-transaction-declined'
  | 'wallet-transaction-sent'
  | 'wallet-sign-data-request-received'
  | 'wallet-sign-data-confirmation-ui-displayed'
  | 'wallet-sign-data-accepted'
  | 'wallet-sign-data-declined'
  | 'wallet-sign-data-sent'
  | 'bridge-client-connect-started'
  | 'bridge-client-connect-established'
  | 'bridge-client-connect-error'
  | 'bridge-client-message-sent'
  | 'bridge-client-message-received'
  | 'bridge-client-message-decode-error'
  | 'js-bridge-call'
  | 'js-bridge-response'
  | 'js-bridge-error';

export type TonConnectVerificationResult = 'unknown' | 'ok' | 'warning' | 'danger';

export type TonConnectRequestType = 'sendTransaction' | 'signData' | 'disconnect' | 'connect' | 'connect_error';

// Per-event fields a caller may provide; the shared envelope fields are filled by `recordTonConnectEvent`.
export interface TonConnectEventFields {
  // Normally auto-filled by the recorder from the flow context (or a session fallback). A caller may pass it
  // explicitly for a flow event emitted before its context exists (e.g. the on-arrival `*-request-received`).
  network_id?: string;
  client_id?: string;
  wallet_id?: string;
  manifest_json_url?: string;
  origin_url?: string;
  dapp_name?: string;
  callback_return_action?: string;
  is_ton_addr?: boolean;
  is_ton_proof?: boolean;
  proof_payload_size?: number;
  verification_result?: TonConnectVerificationResult;
  emulation_success?: boolean;
  decline_reason?: string;
  payload?: string;
  normalized_hash?: string;
  signed_boc?: string;
  error_code?: number;
  error_message?: string;
  bridge_url?: string;
  message_id?: string;
  request_type?: TonConnectRequestType;
  encrypted_message_hash?: string;
  bridge_connect_duration?: number;
  bridge_key?: string;
  js_bridge_method?: string;
}

// Fields that scope a single connect/transaction/sign flow, shared by all its events via `promiseId`.
export type TonConnectFlowContext = {
  trace_id: string;
  network_id: string;
} & Pick<TonConnectEventFields,
'client_id' | 'wallet_id' | 'manifest_json_url' | 'origin_url' | 'dapp_name'
| 'callback_return_action' | 'verification_result'
>;

export type RecordTonConnectEventInput = TonConnectEventFields & {
  event_name: TonConnectEventName;
  // Resolves the shared flow context (`trace_id`, `network_id`, dapp/session fields); not sent on the wire.
  promiseId?: string;
  // Explicit trace for events not tied to a flow (e.g. a js-bridge call paired with its response).
  trace_id?: string;
};

const TON_CONNECT_REQUEST_TYPES = new Set<TonConnectRequestType>([
  'sendTransaction', 'signData', 'disconnect', 'connect', 'connect_error',
]);

// Narrows an attacker-controllable bridge `method` string to the known union, or `undefined` when unrecognized,
// instead of force-casting an arbitrary string.
export function toTonConnectRequestType(method: string): TonConnectRequestType | undefined {
  return TON_CONNECT_REQUEST_TYPES.has(method as TonConnectRequestType)
    ? (method as TonConnectRequestType)
    : undefined;
}

const flowContexts = new Map<string, TonConnectFlowContext>();

export function setTonConnectFlowContext(promiseId: string, context: TonConnectFlowContext) {
  flowContexts.set(promiseId, context);
}

export function getTonConnectFlowContext(promiseId: string) {
  return flowContexts.get(promiseId);
}

export function clearTonConnectFlowContext(promiseId: string) {
  flowContexts.delete(promiseId);
}

// Reports the final wallet→dapp event of a flow. The shared context is dropped by the caller's `finally`, not
// here, so it stays available to a late UI event (e.g. a slow native `*-accepted`) until the handler returns.
export function finishTonConnectFlow(
  promiseId: string,
  responseEventName: TonConnectEventName,
  fields?: TonConnectEventFields,
) {
  void recordTonConnectEvent({ event_name: responseEventName, promiseId, ...fields });
}

export function toTonConnectNetworkId(network?: ApiNetwork): string {
  return network === 'testnet' ? CHAIN.TESTNET : CHAIN.MAINNET;
}

export function recordTonConnectEvent(_input: RecordTonConnectEventInput) {
  // Deleted in the Mochi fork: no telemetry is collected, buffered, or sent. The parameter is kept so the
  // existing fire-and-forget call sites (`void recordTonConnectEvent(...)`) keep compiling unchanged.
}
