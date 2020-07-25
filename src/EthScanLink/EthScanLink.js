import React from 'react';
import PropTypes from 'prop-types';

function EthScanLink({type, value, display}) {
  const link = `https://ropsten.etherscan.io/${type}/${value}`
  return (
    <a target={'blank'} href={link}>{display || link }</a>
  );
}

EthScanLink.propTypes = {};
EthScanLink.defaultProps = {};

export default EthScanLink;
