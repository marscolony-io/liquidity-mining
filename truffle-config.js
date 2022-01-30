const { projectId, key, mnemonic } = require('./secrets.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic.bsc, `https://ropsten.infura.io/v3/${projectId}`),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 0,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
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
  plugins: [
    'truffle-plugin-verify',
  ],
};
