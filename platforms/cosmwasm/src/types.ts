import type { UniversalOrNative, PlatformToChains } from "@wormhole-foundation/sdk-connect";
import type { logs as cosmosLogs } from "@cosmjs/stargate";

/**
 * Runtime value for the Cosmwasm Platform
 */
export const _platform: "Cosmwasm" = "Cosmwasm";
/**
 * Compile time type for Cosmwasm Platform
 */
export type CosmwasmPlatformType = typeof _platform;

export type CosmwasmChains = PlatformToChains<CosmwasmPlatformType>;
export type UniversalOrCosmwasm = UniversalOrNative<CosmwasmChains>;
export type AnyCosmwasmAddress = UniversalOrCosmwasm | string | Uint8Array;

export interface WrappedRegistryResponse {
  address: string;
}

export const searchCosmosLogs = (key: string, logs: readonly cosmosLogs.Log[]): string | null => {
  for (const log of logs) {
    for (const ev of log.events) {
      for (const attr of ev.attributes) {
        if (attr.key === key) return attr.value;
      }
    }
  }
  return null;
};
