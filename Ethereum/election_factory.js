import web3 from './web3';
import ElectionFactory from './Build/ElectionFact.json';

const instance = new web3.eth.Contract(
  ElectionFactory.abi, 
  '0x3b3d35382Cec154EC3bee58F1851b1B29d01988F' // <-- PASTE YOUR NEW ADDRESS HERE
);

export default instance;