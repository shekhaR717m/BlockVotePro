require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/68d063a7908a4c678160288916c2129c",
      accounts: ["cbc2bc619f3690e027b34e8758bb8912c95df4ea7f5e805b6d52f67eb2d19fd0"],
    },
  },
  etherscan: {
    apiKey: "MCNM74VK89DRJ2I271N8UREG12IZYTPPF6",
  },
};
