import React, {createContext, useContext, useState} from 'react';
import Spin from 'antd/es/spin'
import Signee from "./Signee/Signee";
import notification from "antd/es/notification";
import Document from "./Document/Document";
import {store} from "./setupContract";
import EthScanLink from "./EthScanLink/EthScanLink";
import SigneeEthAmount from "./SigneeEthAmount/SigneeEthAmount";

const AppUIContext = createContext();

export function useAppUIContext() {
  return useContext(AppUIContext);
}

export const AppUIContextConsumer =
  AppUIContext.Consumer;

const openNotification = (type, message) => {
  notification.open({
    message: 'Notification',
    type,
    description: message
  });
};


export function AppUIContextProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadSigneeList, setLoadSigneeList] = useState(true);

  const value = {
    setLoading: (value) => {
      setIsLoading(value);
    },
    setLoadSigneeList: (value) => {
      setLoadSigneeList(value);
    },
    loadSigneeList: loadSigneeList,
    openNotification
  };

  return (
    <AppUIContext.Provider value={value}>
      <Spin tip="Loading..." spinning={isLoading}>
        {children}
      </Spin>
    </AppUIContext.Provider>
  );
}


function App() {
  return (
    <AppUIContextProvider>
      <div className="App" style={{margin: '2em'}}>
        <header className="App-header">
          <h3>Carto Sign Contract - Address:
            <EthScanLink display={store.get('contractAddress')} type={'address'} value={store.get('contractAddress')}/>
          </h3>

          <h3>Admin Address:
            <EthScanLink display={store.get('adminAddress')} type={'address'} value={store.get('adminAddress')}/>
            - <SigneeEthAmount address={store.get('adminAddress')}/>
          </h3>
        </header>
        <hr/>
        <div>
          <Signee />
        </div>
        <hr />
        <div>
          <Document />
        </div>
      </div>
    </AppUIContextProvider>

  );
}

export default App;

