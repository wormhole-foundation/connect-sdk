import {
  Network,
  PlatformToChains,
  RoArray,
  constMap,
} from "@wormhole-foundation/connect-sdk";
import { CosmwasmChainName } from "./types";

export const MSG_EXECUTE_CONTRACT_TYPE_URL =
  "/cosmwasm.wasm.v1.MsgExecuteContract";

export const IBC_MSG_TYPE = "/ibc.applications.transfer.v1.MsgTransfer";

export const IBC_TRANSFER_PORT = "transfer";

// IBC Message Event type
export const IBC_PACKET_SEND = "send_packet";
export const IBC_PACKET_RECEIVE = "recv_packet";

// Attributes for IBC Packet Event
export const IBC_PACKET_DST = "packet_dst_channel";
export const IBC_PACKET_SRC = "packet_src_channel";
export const IBC_PACKET_SRC_PORT = "packet_src_port";
export const IBC_PACKET_DST_PORT = "packet_dst_port";
export const IBC_PACKET_SEQ = "packet_sequence";
export const IBC_PACKET_DATA = "packet_data";
export const IBC_PACKET_CONN = "packet_connection";

export const IBC_TIMEOUT_MILLIS = 10 * 60 * 1000; // 10 minutes

const networkChainCosmwasmChainIds = [
  [
    "Mainnet",
    [
      ["Cosmoshub", "cosmoshub-4"],
      ["Evmos", "evmos_9001-2"],
      ["Injective", "injective-1"],
      ["Osmosis", "osmosis-1"],
      ["Sei", "pacific-1"],
      ["Terra", "columbus-5"],
      ["Terra2", "phoenix-1"],
      ["Wormchain", "wormchain"],
      ["Xpla", "dimension_37-1"],
    ],
  ],
  [
    "Testnet",
    [
      ["Cosmoshub", "theta-testnet-001"],
      ["Evmos", "evmos_9000-4"],
      ["Injective", "injective-888"],
      ["Osmosis", "osmo-test-5"],
      ["Sei", "atlantic-2"],
      ["Terra2", "pisco-1"],
      ["Wormchain", "wormchain-testnet-0"],
      ["Xpla", "cube_47-5"],
    ],
  ],
  ["Devnet", []],
] as const satisfies RoArray<
  readonly [Network, RoArray<readonly [CosmwasmChainName, string]>]
>;

export const cosmwasmChainIdToNetworkChainPair = constMap(
  networkChainCosmwasmChainIds,
  [2, [0, 1]],
);

export const cosmwasmNetworkChainToChainId = constMap(
  networkChainCosmwasmChainIds,
);

const cosmwasmAddressPrefix = [
  ["Cosmoshub", "cosmos"],
  ["Evmos", "evmos"],
  ["Injective", "inj"],
  ["Kujira", "kuji"], // TODO: make sure this is right
  ["Osmosis", "osmo"],
  ["Sei", "sei"],
  ["Terra", "terra"], // TODO: make sure this is right
  ["Terra2", "terra"],
  ["Wormchain", "wormhole"],
  ["Xpla", "xpla"], // TODO: make sure this is right
] as const satisfies RoArray<readonly [PlatformToChains<"Cosmwasm">, string]>;

export const chainToAddressPrefix = constMap(cosmwasmAddressPrefix);
export const addressPrefixToChain = constMap(cosmwasmAddressPrefix, [1, [0]]);

const cosmwasmNativeDenom = [
  [
    "Mainnet",
    [
      ["Cosmoshub", "uatom"],
      ["Evmos", "aevmos"],
      ["Injective", "inj"],
      ["Kujira", "kuji"],
      ["Osmosis", "uosmo"],
      ["Sei", "usei"],
      ["Terra", "ulunah"],
      ["Terra2", "uluna"], //TODO: same for both?
      ["Wormchain", "uworm"],
      ["Xpla", "uxpla"],
    ],
  ],
  [
    "Testnet",
    [
      ["Cosmoshub", "uatom"],
      ["Evmos", "atevmos"],
      ["Injective", "inj"],
      ["Kujira", "kuji"],
      ["Osmosis", "uosmo"],
      ["Sei", "usei"],
      ["Terra", "ulunah"],
      ["Terra2", "uluna"],
      ["Wormchain", "uworm"],
      ["Xpla", "uxpla"],
    ],
  ],
] as const satisfies RoArray<
  readonly [Network, RoArray<readonly [CosmwasmChainName, string]>]
>;

export const chainToNativeDenoms = constMap(cosmwasmNativeDenom);
export const nativeDenomToChain = constMap(cosmwasmNativeDenom, [[0, 2], [1]]);

const cosmwasmNetworkChainRestUrl = [
  [
    "Mainnet",
    [
      ["Injective", "https://lcd.injective.network"],
      ["Evmos", "https://rest.bd.evmos.org:1317"],
    ],
  ],
  [
    "Testnet",
    [
      ["Injective", "https://k8s.testnet.lcd.injective.network"],
      ["Evmos", "https://rest.bd.evmos.dev:1317"],
    ],
  ],
  ["Devnet", []],
] as const satisfies RoArray<
  readonly [Network, RoArray<readonly [CosmwasmChainName, string]>]
>;

export const cosmwasmNetworkChainToRestUrls = constMap(
  cosmwasmNetworkChainRestUrl,
);

export type IbcChannel = {
  srcChannel: string;
  dstChannel: string;
};

// IBC Channels from the perspective of Wormchain
const gatewayConnections = [
  [
    "Mainnet",
    [
      ["Cosmoshub", { srcChannel: "channel-5", dstChannel: "" }],
      ["Osmosis", { srcChannel: "channel-4", dstChannel: "" }],
    ],
  ],
  [
    "Testnet",
    [
      [
        "Cosmoshub",
        {
          srcChannel: "channel-5",
          dstChannel: "channel-3086",
        },
      ],
      [
        "Osmosis",
        {
          srcChannel: "channel-4",
          dstChannel: "channel-486",
        },
      ],
    ],
  ],
  [
    "Devnet",
    [
      ["Cosmoshub", { srcChannel: "", dstChannel: "" }],
      ["Osmosis", { srcChannel: "", dstChannel: "" }],
    ],
  ],
] as const satisfies RoArray<
  readonly [Network, RoArray<readonly [CosmwasmChainName, IbcChannel]>]
>;

export const networkChainToChannelId = constMap(gatewayConnections);
export const networkChannelToChain = constMap(gatewayConnections, [0, [2, 1]]);
export const networkToChannelMap = constMap(gatewayConnections, [0, [1, 2]]);
