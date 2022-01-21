const { projectId, key, mnemonic } = require('./secrets.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    hartest: {
      provider: () => {
        return new HDWalletProvider({
          mnemonic: mnemonic.hart,
          providerOrUrl: 'https://api.s0.b.hmny.io',
          derivationPath: `m/44'/1023'/0'/0/`
        });
      },
      network_id: 1666700000,
    },
    harmain: {
      provider: () => {
        return new HDWalletProvider({
          mnemonic: mnemonic.harmain,
          providerOrUrl: 'https://harmony-0-rpc.gateway.pokt.network', // 'https://api.harmony.one',
          derivationPath: `m/44'/60'/0'/0/`,
          confirmations: 0,
          timeoutBlocks: 200,
        });
      },
      network_id: 1666600000,
    },
  },
  compilers: {
    solc: {
      version: '0.8.11',
    },
  },
};
