import ContractABI from './Contract/ABI.json';


const Web3 = require('web3');
export const web3 = new Web3("wss://ropsten.infura.io/ws/v3/5d90d0606974419fb2e52e747784ac76");
export let contract = null;

export const store = {
  init() {
    if (!localStorage.getItem('cartosign_store')) {
      localStorage.setItem('cartosign_store', JSON.stringify({
        signees: [],
        documents: [],
        adminAddress: '0x25719111a040f54c85214fCa2095aEc82A91a2DC',
        adminPrivateKey: 'c9cd7951ca8cfdf0bf5885eb0c54f6c9c302655024ce5c9bdd2ac1b9bdd77085',
        contractAddress: '0xaCb4132d59e2b2d66621D767278E86dea7995f8a',
      }));
    }
    contract = new web3.eth.Contract(ContractABI, store.get('contractAddress'));
  },
  set(key, value) {
    if (!key) {
      return;
    }
    localStorage.setItem('cartosign_store', JSON.stringify({
      ...this.getStore(),
      [key]: value
    }));
  },
  getStore() {
    return JSON.parse(localStorage.getItem('cartosign_store'));
  },
  get(key) {
    if (!key) {
      return;
    }
    return this.getStore()[key];
  }
};

