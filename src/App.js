import React, {createContext, useContext, useState} from 'react';
import Spin from 'antd/es/spin'
import Signee from "./Signee/Signee";
import notification from "antd/es/notification";

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

  const value = {
    setLoading: (value) => {
      setIsLoading(value);
    },
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
          <h1>Carto Sign POC</h1>
        </header>
        <div>
          <Signee />
        </div>
      </div>
    </AppUIContextProvider>

  );
}

export default App;
