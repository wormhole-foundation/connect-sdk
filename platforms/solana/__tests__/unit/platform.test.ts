import { expect, test } from '@jest/globals';
import '../mocks/web3';

import {
  DEFAULT_NETWORK,
  chainConfigs,
  chainToPlatform,
  chains
} from '@wormhole-foundation/connect-sdk';

import { SolanaPlatform } from '../../src';

import '@wormhole-foundation/connect-sdk-solana-core'
import '@wormhole-foundation/connect-sdk-solana-tokenbridge'

// @ts-ignore -- this is the mock we import above
import { getDefaultProvider } from '@solana/web3.js';

const network = DEFAULT_NETWORK;

const SOLANA_CHAINS = chains.filter(
  (c) => chainToPlatform(c) === SolanaPlatform.platform,
);
const configs = chainConfigs(network);

describe('Solana Platform Tests', () => {
  const fakeRpc = getDefaultProvider();

  describe('Get Token Bridge', () => {
    test('Hardcoded Genesis mock', async () => {
      const p = SolanaPlatform.setConfig(network, {
        [SOLANA_CHAINS[0]]: configs[SOLANA_CHAINS[0]],
      });

      const tb = await p.getTokenBridge(fakeRpc);
      expect(tb).toBeTruthy();
    });
  });

  describe('Get Chain', () => {
    test('No conf', () => {
      const p = SolanaPlatform.setConfig(network, {});
      expect(p.conf).toEqual({});
      expect(() => p.getChain(SOLANA_CHAINS[0])).toThrow();
    });

    test('With conf', () => {
      const p = SolanaPlatform.setConfig(network, {
        [SOLANA_CHAINS[0]]: configs[SOLANA_CHAINS[0]],
      });
      expect(() => p.getChain(SOLANA_CHAINS[0])).not.toThrow();
    });
  });

  describe('Get RPC Connection', () => {
    test('No conf', () => {
      const p = SolanaPlatform.setConfig(network, {});
      expect(p.conf).toEqual({});

      // expect getRpc to throw an error since we havent provided
      // the conf to figure out how to connect
      expect(() => p.getRpc(SOLANA_CHAINS[0])).toThrow();
      expect(() => p.getChain(SOLANA_CHAINS[0])).toThrow();
    });

    test('With conf', () => {
      const p = SolanaPlatform.setConfig(network, {
        [SOLANA_CHAINS[0]]: configs[SOLANA_CHAINS[0]],
      });
      expect(() => p.getRpc(SOLANA_CHAINS[0])).not.toThrow();
      expect(() => p.getChain(SOLANA_CHAINS[0]).getRpc()).not.toThrow();
    });
  });
});
