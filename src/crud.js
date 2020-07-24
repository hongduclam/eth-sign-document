import {
  store,
  web3,
  contract
} from './setupContract'

export const reloadETHCoin = async (address, amount) => {
  return await sendMoney(store.get('adminAddress'), address, amount);
};

export const createSignee = async ({name}) => {
  const ethAccount = web3.eth.accounts.create(JSON.stringify({name}));
  const signeeData = {
    address: ethAccount.address,
    privateKey: ethAccount.privateKey,
    name
  };
  store.set('signees', [signeeData, ...store.get('signees')]);
  console.log('createSignee ok: ', store.get('signees'));
  return await signeeData;
};

export const updateSignee = async (address, formData) => {
  const updateList = store.get('signees').map(item => {
    if(item.address === address) {
      return {...formData}
    }
    return item
  })
  store.set('signees', [...updateList]);
  return await formData;
};

export const getSigneeList = async () => {
  return await store.get('signees');
};

const getTotalDoc = async function () {
  try {
    const rs = await contract.methods.getTotalDoc().call({
      from: store.get('adminAddress'),
      to: store.get('contractAddress'),
    });
    return rs;
  } catch (e) {
    console.log('getTotalDoc error: ', e);
  }
}

export const createDocument = async ({name, signeeAddresses = [], signedDocFileNames = []}) => {
  try {
    web3.eth.accounts.wallet.add(store.get('adminPrivateKey'));
    web3.eth.defaultAccount = store.get('adminAddress');
    const callData = contract.methods.addDocument(name, signeeAddresses, signedDocFileNames).encodeABI();
    const rs = await web3.eth.sendTransaction(
      {
        to: store.get('contractAddress'),
        from: store.get('adminAddress'),
        data: callData, gas: 5500000
      });
    const dbData = {name, signeeAddresses, signedDocFileNames, transaction: rs};
    store.set('documents', [{...dbData}, ...store.get('documents')]);
    return dbData;
  } catch (e) {
    console.log('add doc error: ', e);
  }
};

export const getDocumentList = async () => {
  return await store.get('documents');
};

function addSignatureToDoc(docId, signeeAddress) {
  // TODO: add signature to doc upload and return filename
  return `${docId}_${signeeAddress}.pdf`
}

const sendMoney = async function (from, to, amount) {
  console.log('Start sendMoney: ', from, to, amount);
  try {
    web3.eth.accounts.wallet.add(store.get('adminPrivateKey'));
    web3.eth.defaultAccount = store.get('adminAddress');

    const rs = await web3.eth.sendTransaction({
      from: from,
      to: to,
      gas: 5500000,
      value: web3.utils.toWei(`${amount}.0`, "ether")
    });

    console.log('sendMoney ok: ', rs);
    return rs;
  } catch (e) {
    console.log('sendMoney error: ', e);
  }
}

const sign = async function (docId, signId) {
  try {
    const signeeAccount = store.get('signees')[signId];
    const signatureFileName = addSignatureToDoc(docId, signeeAccount.address);
    const payload = {
      docId,
      signId,
      signedDocFileName: web3.utils.fromAscii(signatureFileName).padEnd(66, '0')
    };
    console.log('sign: ', payload);

    web3.eth.accounts.wallet.add(signeeAccount.privateKey);
    web3.eth.defaultAccount = signeeAccount.address;
    const callData = contract.methods.sign(payload.docId, payload.signId, payload.signedDocFileName).encodeABI();
    const rs = await web3.eth
      .sendTransaction({from: signeeAccount.address, to: store.get('contractAddress'), data: callData, gas: 5500000});

    const signees = store.get('signees');
    signees[signId] = {
      ...signeeAccount,
      transaction: rs
    };
    store.set('signees', [...signees]);
    console.log('sign ok: ', rs);
    return rs;
  } catch (e) {
    console.log('sign error: ', e);
  }
}
