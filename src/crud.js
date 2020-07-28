import axios from 'axios';

const BASE_ENDPOINT_API = '/api/contract';

// COMMON

export const getBalance = async (address) => {
  return await axios.get(`${BASE_ENDPOINT_API}/${address}/balance`).then((rs) => {
    return rs.data;
  });
}

export const getSystemConfig = async () => {
  return await axios.get(`${BASE_ENDPOINT_API}/systemConfig`).then((rs) => {
    return rs.data;
  });
}

// SIGNEE
export const reloadETHCoin = async (address, amount) => {
  return await axios.post(`${BASE_ENDPOINT_API}/signees/reload`, {address, amount}).then((rs) => {
    return rs.data;
  });
};

export const createSignee = async ({name}) => {
  return await axios.post(`${BASE_ENDPOINT_API}/signees`, {name}).then((rs) => {
    console.log(rs);
    return rs.data;
  });
};

export const updateSignee = async (address, formData) => {
  return await axios.put(`${BASE_ENDPOINT_API}/signees/${address}`, {...formData}).then((rs) => {
    console.log(rs);
    return rs.data;
  });
};

export const getSigneeList = async () => {
  // return await store.get('signees');
  return await axios.get(`${BASE_ENDPOINT_API}/signees`).then((rs) => {
    return rs.data;
  });
};

export const createDocument = async ({name, signeeAddresses = [], signedDocFileNames = []}) => {
  try {
    return await axios.post(`${BASE_ENDPOINT_API}/documents`, {name, signeeAddresses, signedDocFileNames}).then((rs) => {
      console.log(rs);
      return rs.data;
    });
  } catch (e) {
    console.log('add doc error: ', e);
  }
};

export const getDocumentList = async () => {
  return await axios.get(`${BASE_ENDPOINT_API}/documents`).then((rs) => {
    return rs.data;
  });
};

export const getDocumentSigneesList = async (hashId) => {
  return await axios.get(`${BASE_ENDPOINT_API}/documents/${hashId}/signees`).then((rs) => {
    return rs.data;
  });
};

export const signDocument = async function (documentTranxHash, signeeAddresse) {

  try {
    return await axios.post(`${BASE_ENDPOINT_API}/documents/${documentTranxHash}/sign`, {signeeAddresse}).then((rs) => {
      console.log(rs);
      return {
        transactionHash: rs.data,
        isError: false,
      };
    });
  } catch (e) {
    return {isError: true, transactionHash: e.transactionHash}
  }
}


