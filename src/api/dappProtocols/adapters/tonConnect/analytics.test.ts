import { recordTonConnectEvent } from './analytics';

const mockFetch = jest.fn();

// Mochi fork: TON Connect telemetry is deleted, not disabled. The recorder is a no-op; a full
// connect/sign/send flow — including events that used to carry on-chain identity (normalized_hash,
// signed_boc, payload) and dapp identity (origin_url, dapp_name, manifest_json_url) — must produce
// zero network requests.
describe('recordTonConnectEvent (telemetry deleted)', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue(undefined);
    global.fetch = mockFetch;
  });

  it('sends zero requests across a connect/sign/send flow', () => {
    recordTonConnectEvent({
      event_name: 'wallet-connect-request-received',
      promiseId: 'connect-flow',
      origin_url: 'https://dapp.example',
      dapp_name: 'Example Dapp',
      manifest_json_url: 'https://dapp.example/manifest.json',
    });
    recordTonConnectEvent({ event_name: 'wallet-connect-accepted', promiseId: 'connect-flow' });
    recordTonConnectEvent({
      event_name: 'wallet-transaction-request-received',
      promiseId: 'tx-flow',
      origin_url: 'https://dapp.example',
      dapp_name: 'Example Dapp',
    });
    recordTonConnectEvent({ event_name: 'wallet-transaction-accepted', promiseId: 'tx-flow' });
    recordTonConnectEvent({
      event_name: 'wallet-transaction-sent',
      promiseId: 'tx-flow',
      normalized_hash: 'abc123',
      signed_boc: 'boc-payload',
    });
    recordTonConnectEvent({
      event_name: 'wallet-sign-data-request-received',
      promiseId: 'sign-flow',
      payload: 'secret-payload',
    });
    recordTonConnectEvent({ event_name: 'wallet-sign-data-sent', promiseId: 'sign-flow' });
    recordTonConnectEvent({ event_name: 'bridge-client-connect-started' });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
