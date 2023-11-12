import {
  Chain,
  isChain,
  Platform,
  chainToPlatform,
  ProtocolName,
} from "@wormhole-foundation/sdk-base";
import { RpcConnection } from "./rpc";
import { ChainsConfig } from "./types";

declare global {
  namespace Wormhole {
    export interface PlatformToProtocolMapping {}
  }
}

export interface ProtocolInitializer<P extends Platform> {
  fromRpc(rpc: RpcConnection<P>, config: ChainsConfig): any;
}

const protocolFactory = new Map<
  Platform,
  Map<ProtocolName, ProtocolInitializer<Platform>>
>();

export function registerProtocol<P extends Platform, PN extends ProtocolName>(
  platform: P,
  protocol: PN,
  ctr: ProtocolInitializer<P>,
): void {
  let protocols = protocolFactory.get(platform)!;

  if (!protocols) protocols = new Map<ProtocolName, ProtocolInitializer<Platform>>();

  if (protocols.has(protocol))
    throw new Error(`Protocol ${protocol} for platform ${platform} has already registered`);

  protocols.set(protocol, ctr);
  protocolFactory.set(platform, protocols);
}

export function protocolIsRegistered<T extends Platform | Chain, PN extends ProtocolName>(
  chainOrPlatform: T,
  protocol: PN,
): boolean {
  const platform: Platform = isChain(chainOrPlatform)
    ? chainToPlatform.get(chainOrPlatform)!
    : chainOrPlatform;

  const protocols = protocolFactory.get(platform);
  return !!protocols && protocols.has(protocol);
}

export function getProtocolInitializer<P extends Platform, PN extends ProtocolName>(
  platform: P,
  protocol: PN,
): ProtocolInitializer<P> {
  const protocols = protocolFactory.get(platform);
  if (!protocols) throw new Error(`No protocols registered for platform ${platform}`);

  const pctr = protocols.get(protocol);
  if (!pctr) throw new Error(`No protocol registered for ${platform}:${protocol}`);

  return pctr;
}
