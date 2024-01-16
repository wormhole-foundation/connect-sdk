import { _platform } from '@wormhole-foundation/connect-sdk-solana';
import { registerProtocol } from '@wormhole-foundation/connect-sdk';
import { SolanaTokenBridge } from './tokenBridge';
import { SolanaAutomaticTokenBridge } from './automaticTokenBridge';

registerProtocol(_platform, 'TokenBridge', SolanaTokenBridge);
registerProtocol(_platform, 'AutomaticTokenBridge', SolanaAutomaticTokenBridge);

export * from './tokenBridgeType';
export * from './automaticTokenBridgeType';
export * from './utils';
export * from './tokenBridge';
export * from './automaticTokenBridge';
