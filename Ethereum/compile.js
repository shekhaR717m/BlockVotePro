const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, 'Build');
fs.removeSync(buildPath); //deletes the build folder

const contractPath = path.resolve(__dirname, 'Contract', 'Election.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

// New Standard JSON Input format for solc
const input = {
  language: 'Solidity',
  sources: {
    'Election.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'], // Request ABI and bytecode
      },
    },
  },
};

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Error handling
if (output.errors) {
  console.error('Compilation Errors:');
  output.errors.forEach(err => {
    console.error(err.formattedMessage);
  });
  process.exit(1); // Exit if compilation fails
}

fs.ensureDirSync(buildPath); //checks if exists; if doesn't, create one

const contracts = output.contracts['Election.sol'];
console.log('Compiled contracts:', Object.keys(contracts));

// Write the new JSON output files
for (let contractName in contracts) {
  const contract = contracts[contractName];
  fs.outputJsonSync(
    path.resolve(buildPath, contractName + '.json'),
    {
      abi: contract.abi, // <-- Output the ABI as an object
      bytecode: contract.evm.bytecode.object, // <-- Get the bytecode
    }
  );
}

console.log('Contracts compiled and saved to Build directory.');