import React, {useEffect, useState} from 'react';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Steps from 'antd/es/steps';
import Select from 'antd/es/select';

import {getSigneeList, createSignee, reloadETHCoin, updateSignee} from "../crud";
import {useAppUIContext} from "../App";
import Spin from "antd/es/spin";
import EthScanLink from "../EthScanLink/EthScanLink";
import SigneeEthAmount from "../SigneeEthAmount/SigneeEthAmount";


export const SigneeSelect = ({onChange, mode = 'single', value, dataSource = getSigneeList}) => {
  const [signees, setSigneess] = useState([]);
  console.log('value', value)
  async function getList() {
    const list = await dataSource();
    return setSigneess(list);
  }

  useEffect(() => {
    getList();
  }, [dataSource]);
  return <Select
    value={value}
    mode={mode}
    onChange={onChange}
    style={{width: '100%'}}>
    {
      signees
        .filter(s => !s.signedTransaction)
        .map(s => {
        return <Select.Option value={s.address}>{s.name}</Select.Option>
      })
    }
  </Select>
}


function Signee(props) {
  const uiContext = useAppUIContext();

  const [dataSource, setDataSource] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [step, setStep] = useState(1);
  const [, forceUpdate] = useState(1);

  const handleFormChange = (key, value) => {
    setFormValues({
      ...formValues,
      [key]: value
    })
  };

  const handleCloseModal = () => {
    setShowModal(false);
    uiContext.setLoadSigneeList(true);
  }

  const handleShowModal = (isEdit) => {
    setShowModal(true);
    uiContext.setLoadSigneeList(false);
    !isEdit && setFormValues({})
  }

  const onFinish = () => {
    console.log('onFinish');
    setLoading(true)
    if (step === 1) {
      createSignee(formValues).then((rs) => {
        console.log('rs', rs);
        if (rs) {
          setStep(2);
          setFormValues({
            ...formValues,
            ...rs
          });
          uiContext.openNotification('success', 'Create Success');
        }
        setLoading(false)
      });
    } else if (step === 2) {
      reloadETHCoin(formValues.address, formValues.ethAmount).then(async function (rs) {
        if (rs) {
          uiContext.openNotification('success', 'Reload Success');
          formValues.reloadTransactions = formValues.reloadTransactions || [];
          formValues.reloadTransactions.push(rs);
          await updateSignee(formValues.address, formValues);
          setStep(3);
        } else {
          uiContext.openNotification('error', 'Reload Error');
        }
        setLoading(false)

      });
    } else {
      handleCloseModal();
      setLoading(false)
    }
    uiContext.setLoadSigneeList(true);
  }

  async function getList() {
    const list = await getSigneeList();
    return setDataSource(list);
  }

  const onReload = (row) => {
    setFormValues({...row});
    setStep(2)
    handleShowModal(true);
  }

  useEffect(() => {
    forceUpdate();
    if(uiContext.loadSigneeList) {
      getList();
      uiContext.setLoadSigneeList(false);
    }
  }, [uiContext]);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ETH Amount',
      dataIndex: 'ethAmount',
      key: 'ethAmount',
      render: (_, rowData) => {
        return <SigneeEthAmount refesh={uiContext.loadSigneeList} address={rowData.address}/>
      }
    },
    {
      title: 'ETH Address',
      dataIndex: 'address',
      key: 'address',
      render: (value) => {
        return <EthScanLink display={value} type={'address'} value={value}/>
      }
    },
    {
      title: 'ETH Private Key',
      dataIndex: 'privateKey',
      key: 'privateKey',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, rowData) => {
        return <div>
          <Button style={{marginRight: 10}} type={'small'} onClick={() => onReload(rowData)}>Reload</Button>
          <EthScanLink display={'View On BlockChain'} type={'address'} value={rowData.address}/>
        </div>
      }
    }
  ];
  return (
    <div>
      <div>
        <h1> Signee <Button type={'primary'} onClick={handleShowModal} style={{float: 'right'}}>
          New Signee
        </Button></h1>

      </div>
      <Table dataSource={dataSource} columns={columns} rowKey={'address'}/>
      <Modal
        title="Create Signee"
        width={'50%'}
        visible={showModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Return
          </Button>,
          <Button type="primary" htmlType="button" onClick={onFinish} className="">
            {step === 1 && 'Create Account'}
            {step === 2 && 'Reload ETH'}
            {step === 3 && 'Complete'}
          </Button>
        ]}
      >
        <Spin tip="Loading..." spinning={loading}>

          <Steps current={step - 1} onChange={(val) => setStep(val + 1)}>
            <Steps.Step title="Create Signee" description="Create ETH account"/>
            <Steps.Step title="Reload ETH coin"
                        description="Reload ETH coin to send transaction to Ethereum blockchain network"/>
            <Steps.Step title="Summary" description="Summary Account."/>
          </Steps>

          <Form
            name="basic"
            initialValue={formValues}
          >
            {
              step === 1 && <>
                <Form.Item
                  label="Name"
                  name="name"
                >
                  <Input value={formValues.name} onChange={(e) => handleFormChange('name', e.target.value)}/>
                </Form.Item>
              </>
            }
            {
              step === 2 && <>
                <Form.Item
                  label="Name"
                  name="name"
                >
                  <strong>{formValues.name}</strong>
                </Form.Item>
                <Form.Item
                  label="ETH Account Address"
                  name="address"
                >
                  <strong>{formValues.address}</strong>
                </Form.Item>
                <Form.Item
                  label="ETH Amount"
                  name="ethAmount"
                >
                  <Input value={formValues.ethAmount}
                         type={'number'}
                         onChange={(e) => handleFormChange('ethAmount', e.target.value)}/>
                </Form.Item>
              </>
            }
            {
              step === 3 && <>
                <Form.Item
                  label="Name"
                  name="name"
                >
                  <strong>{formValues.name}</strong>
                </Form.Item>
                <Form.Item
                  label="ETH Account Address"
                  name="address"
                >
                  <strong>{formValues.address}</strong>
                </Form.Item>
                <Form.Item
                  label="ETH Amount"
                  name="ethAmount"
                >
                  <strong>{formValues.ethAmount}</strong>
                </Form.Item>
              </>
            }
          </Form>
        </Spin>

      </Modal>
    </div>

  );
}

Signee.propTypes = {};
Signee.defaultProps = {};

export default Signee;
