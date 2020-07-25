import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {getBalance} from "../crud";

function SigneeEthAmount({address}) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function getEthAmount(address) {
    setAmount(await getBalance(address));
    setLoading(false)
  }

  useEffect(() => {
    getEthAmount(address)
  }, [address]);
  return (
    <>{loading ? 'Loading ...' : <strong>{amount} ETH</strong>}</>
  );
}

SigneeEthAmount.propTypes = {};
SigneeEthAmount.defaultProps = {};

export default SigneeEthAmount;
