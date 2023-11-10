import { MapLevel } from "../../utils";
import { Network } from "../networks";
import { Chain } from "../chains";

export const coreBridgeContracts = [[
  "Mainnet", [
    ["Solana",    "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"],
    ["Ethereum",  "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"],
    ["Terra",     "terra1dq03ugtd40zu9hcgdzrsq6z2z4hwhc9tqk2uy5"],
    ["Bsc",       "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B"],
    ["Polygon",   "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7"],
    ["Avalanche", "0x54a8e5f9c4CbA08F9943965859F6c34eAF03E26c"],
    ["Oasis",     "0xfE8cD454b4A1CA468B57D79c0cc77Ef5B6f64585"],
    ["Algorand",  "842125965"],
    ["Aurora",    "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"],
    ["Fantom",    "0x126783A6Cb203a3E35344528B26ca3a0489a1485"],
    ["Karura",    "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"],
    ["Acala",     "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"],
    ["Klaytn",    "0x0C21603c4f3a6387e241c0091A7EA39E43E90bb7"],
    ["Celo",      "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"],
    ["Near",      "contract.wormhole_crypto.near"],
    ["Injective", "inj17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9l2q74d"],
    ["Aptos",     "0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625"],
    ["Sui",       "0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c"],
    ["Moonbeam",  "0xC8e2b0cD52Cf01b0Ce87d389Daa3d414d4cE29f3"],
    ["Terra2",    "terra12mrnzvhx3rpej6843uge2yyfppfyd3u9c3uq223q8sl48huz9juqffcnhp"],
    ["Arbitrum",  "0xa5f208e072434bC67592E4C49C1B991BA79BCA46"],
    ["Optimism",  "0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722"],
    ["Gnosis",    "0xa321448d90d4e5b0A732867c18eA198e75CAC48E"],
    ["Pythnet",   "H3fxXJ86ADW2PNuDDmZJg6mzTtPxkYCpNuQUTgmJ7AjU"],
    ["Base",      "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6"],
    ["Rootstock", "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6"],
    ["Xpla",      "xpla1jn8qmdda5m6f6fqu9qv46rt7ajhklg40ukpqchkejcvy8x7w26cqxamv3w"],
    ["Sei",       "sei1gjrrme22cyha4ht2xapn3f08zzw6z3d4uxx6fyy9zd5dyr3yxgzqqncdqn"],
    ["Wormchain", "wormhole1ufs3tlq4umljk0qfe8k5ya0x6hpavn897u2cnf9k0en9jr7qarqqaqfk2j"],
  ]], [
  "Testnet", [
    ["Solana",    "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"],
    ["Ethereum",  "0x706abc4E45D419950511e474C7B9Ed348A4a716c"],
    ["Terra",     "terra1pd65m0q9tl3v8znnz5f5ltsfegyzah7g42cx5v"],
    ["Bsc",       "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D"],
    ["Polygon",   "0x0CBE91CF822c73C2315FB05100C2F714765d5c20"],
    ["Avalanche", "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C"],
    ["Oasis",     "0xc1C338397ffA53a2Eb12A7038b4eeb34791F8aCb"],
    ["Algorand",  "86525623"],
    ["Aurora",    "0xBd07292de7b505a4E803CEe286184f7Acf908F5e"],
    ["Fantom",    "0x1BB3B4119b7BA9dfad76B0545fb3F531383c3bB7"],
    ["Karura",    "0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03"],
    ["Acala",     "0x4377B49d559c0a9466477195C6AdC3D433e265c0"],
    ["Klaytn",    "0x1830CC6eE66c84D2F177B94D544967c774E624cA"],
    ["Celo",      "0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56"],
    ["Near",      "wormhole.wormhole.testnet"],
    ["Injective", "inj1xx3aupmgv3ce537c0yce8zzd3sz567syuyedpg"],
    ["Osmosis",   "osmo1hggkxr0hpw83f8vuft7ruvmmamsxmwk2hzz6nytdkzyup9krt0dq27sgyx"],
    ["Aptos",     "0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625"],
    ["Sui",       "0x31358d198147da50db32eda2562951d53973a0c0ad5ed738e9b17d88b213d790"],
    ["Moonbeam",  "0xa5B7D85a8f27dd7907dc8FdC21FA5657D5E2F901"],
    ["Neon",      "0x268557122Ffd64c85750d630b716471118F323c8"],
    ["Terra2",    "terra19nv3xr5lrmmr7egvrk2kqgw4kcn43xrtd5g0mpgwwvhetusk4k7s66jyv0"],
    ["Arbitrum",  "0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e"],
    ["Optimism",  "0x6b9C8671cdDC8dEab9c719bB87cBd3e782bA6a35"],
    ["Gnosis",    "0xE4eacc10990ba3308DdCC72d985f2a27D20c7d03"],
    ["Pythnet",   "EUrRARh92Cdc54xrDn6qzaqjA77NRrCcfbr8kPwoTL4z"],
    ["Xpla",      "xpla1upkjn4mthr0047kahvn0llqx4qpqfn75lnph4jpxfn8walmm8mqsanyy35"],
    ["Base",      "0x23908A62110e21C04F3A4e011d24F901F911744A"],
    ["Sei",       "sei1nna9mzp274djrgzhzkac2gvm3j27l402s4xzr08chq57pjsupqnqaj0d5s"],
    ["Sepolia",   "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78"],
    ["Rootstock", "0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6"],
    ["Wormchain", "wormhole16jzpxp0e8550c9aht6q9svcux30vtyyyyxv5w2l2djjra46580wsazcjwp"],
  ]], [
  "Devnet", [
    ["Solana",    "Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o"],
    ["Ethereum",  "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550"],
    ["Terra",     "terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5"],
    ["Bsc",       "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550"],
    ["Algorand",  "1004"],
    ["Near",      "wormhole.test.near"],
    ["Aptos",     "0xde0036a9600559e295d5f6802ef6f3f802f510366e0c23912b0655d972166017"],
    ["Sui",       "0x5a5160ca3c2037f4b4051344096ef7a48ebf4400b3f385e57ea90e1628a8bde0"],
    ["Terra2",    "terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au"],
    ["Wormchain", "wormhole17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgshdnj3k"],
  ]],
] as const satisfies MapLevel<Network, MapLevel<Chain, string>>;
