const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🚀 Deploying from account:", deployer.address);

  // This line automatically finds your compiled contract from the 'artifacts' folder
  const ElectionFact = await hre.ethers.getContractFactory("ElectionFact");
  
  // Deploy the contract
  const electionFact = await ElectionFact.deploy();

  // Wait for the deployment transaction to be mined
  await electionFact.waitForDeployment();

  console.log("✅ Contract deployed at:", await electionFact.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});