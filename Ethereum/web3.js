// Ethereum/web3.js (UPDATED)
import Web3 from 'web3'; // <-- FIX: Use default import for v1.x syntax

let web3;

// Check if we are in the browser and MetaMask is running
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
	console.log('MetaMask (window.ethereum) detected.');
	
	// Request account access
	window.ethereum.request({ method: 'eth_requestAccounts' });
	
	// Create the web3 instance (v1 style)
	web3 = new Web3(window.ethereum);

} else {
	// We are on the server *or* the user is not running MetaMask
	console.log('No MetaMask. Falling back to Infura.');
    // v1.x way to set a provider
	const provider = new Web3.providers.HttpProvider(
		'https://sepolia.infura.io/v3/68d063a7908a4c678160288916c2129c'
	);
	web3 = new Web3(provider);
}

export default web3;