import React, {useEffect, useState} from 'react';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Tag from 'antd/es/tag';

import {getDocumentList, createDocument, signDocument, getBalance, getDocumentSigneesList} from "../crud";
import {useAppUIContext} from "../App";
import Spin from "antd/es/spin";
import {SigneeSelect} from "../Signee/Signee";
import EthScanLink from "../EthScanLink/EthScanLink";


function SignModal({onCloseModal, onOk, documentData = {}, showModal = false}) {
  console.log('documentData', documentData)
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const uiContext = useAppUIContext()

  const handleCloseModal = () => {
    setFormValues({})
    onCloseModal();
  };

  const handleFormChange = (key, value) => {
    setFormValues({
      ...formValues,
      [key]: value
    })
  };

  const handleSubmit = () => {
    console.log('handleSubmit');
    setLoading(true);
    getBalance(formValues.signeeAddresse).then((blance => {
      console.log(blance);
      if (blance == 0) {
        uiContext.openNotification('error', 'Balance is not enough to do transaction');
        setLoading(false)
        return;
      }
      signDocument(documentData.transaction.transactionHash, formValues.signeeAddresse)
        .then(({isError, transactionHash}) => {
          console.log('transactionHash', transactionHash);
          if (!isError) {
            uiContext.openNotification('success', <EthScanLink display={`Sign Success at ${transactionHash}`}
                                                               type={'tx'} value={transactionHash}/>);
            onOk();
          } else {
            uiContext.openNotification('error', <EthScanLink display={`Sign Error at ${transactionHash}`} type={'tx'}
                                                             value={transactionHash}/>);
          }
          uiContext.setLoadSigneeList(true);
          setLoading(false)
        });
    }))
  };

  useEffect(() => {
    setFormValues({
      name: documentData.name
    })
  }, [showModal]);

  console.log('formValues', formValues, documentData);

  return <Modal
    title="Sign Document"
    width={'50%'}
    visible={showModal}
    onCancel={handleCloseModal}
    footer={[
      <Button key="back" onClick={handleCloseModal}>
        Return
      </Button>,
      <Button type="primary" htmlType="button" onClick={handleSubmit} className="">
        Sign
      </Button>
    ]}
  >
    <Spin tip="Loading..." spinning={loading}>
      <Form
        name="basic"
        initialValue={formValues}
      >
        <Form.Item
          label="Name"
          name="name"
        >
          <strong> {formValues.name} </strong>
        </Form.Item>
        <Form.Item
          label="Signee"
        >
          {
            documentData && documentData.transaction &&
            <SigneeSelect value={formValues.signeeAddresse}
                          dataSource={() => getDocumentSigneesList(documentData.transaction.transactionHash)}
                          onChange={(value) => handleFormChange('signeeAddresse', value)}/>
          }
        </Form.Item>
      </Form>
    </Spin>

  </Modal>
}

function Document(props) {
  const uiContext = useAppUIContext()
  const [dataSource, setDataSource] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [showSignModal, setShowSignModal] = useState(false);
  const [, forceUpdate] = useState(1);

  const handleFormChange = (key, value) => {
    setFormValues({
      ...formValues,
      [key]: value
    })
  };

  async function getList() {
    const list = await getDocumentList();
    return setDataSource(list);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    getList();
  }

  const handleShowModal = (isEdit) => {
    setShowModal(true);
    !isEdit && setFormValues({})
  }

  const onFinish = () => {
    console.log('onFinish');
    setLoading(true)
    createDocument(formValues).then((rs) => {
      console.log('rs', rs);
      if (rs) {
        uiContext.openNotification('success', 'Create Success');
        handleCloseModal()
      } else {
        uiContext.openNotification('error', 'Create Error');
      }
      setLoading(false)
    });
  }

  const onSign = (row) => {
    console.log(row);
    setShowSignModal(true);
    setFormValues(row);
  }

  const handleSignSuccess = () => {
    setFormValues({});
    handleCloseModal();
  }

  const onNew = () => {
    setFormValues({});
    handleShowModal(false);
  }

  useEffect(() => {
    forceUpdate();
    getList();
  }, []);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created Transaction',
      key: 'Transaction',
      render: (_, rowData) => {
        return <EthScanLink display={`View BlockChain Tranx`} type={'tx'} value={rowData.transaction.transactionHash}/>
      }
    },
    {
      title: 'Require Signees',
      dataIndex: 'signees',
      key: 'signees',
      render: (signees, rowData) => {
        function renderLink(name, transacionId) {
          return <EthScanLink display={`${name} (Signeed)`} type={'tx'} value={transacionId}/>
        }

        return <div>
          {
            rowData.signees.map(s => {
              return <Tag color={s.signedTransaction ? 'green' : 'red'} closable={false} style={{marginRight: 3}}>
                {
                  s.signedTransaction ? renderLink(s.name, s.signedTransaction.transactionHash) : <span>{s.name} (Not Signeed)</span>
                }
              </Tag>
            })
          }
        </div>
      }
    },
    {
      title: 'Signed Files',
      dataIndex: 'signedDocFileNames',
      key: 'signedDocFileNames',
      render: (signedDocFileNames) => {
        function renderLink(name) {
          return <a href={`http://linktofile/{name}`} target={'_blank'}> {name} </a>
        }

        return <div>
          {
            signedDocFileNames.map((fileName) => {
              return <Tag color={'green'} closable={false} style={{marginRight: 3}}>
                {
                  renderLink(fileName)
                }
              </Tag>
            })
          }
        </div>
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, rowData) => {
        return <div>
          <Button style={{marginRight: 10}} type={'small'} onClick={() => onSign(rowData)}>Sign</Button>
        </div>
      }
    }
  ];

  return (
    <div>
      <div>
        <h1> Document <Button type={'primary'} onClick={onNew} style={{float: 'right'}}>
          New Document
        </Button></h1>

      </div>
      <Table dataSource={dataSource} columns={columns} rowKey={'address'}/>
      <SignModal onOk={handleSignSuccess} onCloseModal={() => setShowSignModal(false) && setFormValues({})} showModal={showSignModal}
                 documentData={formValues}/>
      <Modal
        title="Create Document"
        width={'50%'}
        visible={showModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Return
          </Button>,
          <Button type="primary" htmlType="button" onClick={onFinish} className="">
            Save
          </Button>
        ]}
      >
        <Spin tip="Loading..." spinning={loading}>
          <Form
            name="basic"
            initialValue={formValues}
          >
            <>
              <Form.Item
                label="Name"
                name="name"
              >
                <Input value={formValues.name} onChange={(e) => handleFormChange('name', e.target.value)}/>
              </Form.Item>
              <Form.Item
                label="Signees"
                name="Require Signees"
              >
                <SigneeSelect value={formValues.signeeAddresses}
                              mode={'multiple'}
                              onChange={(value) => handleFormChange('signeeAddresses', value)}/>
              </Form.Item>
            </>
          </Form>
        </Spin>

      </Modal>
    </div>

  );
}

Document.propTypes = {};
Document.defaultProps = {};

export default Document;
