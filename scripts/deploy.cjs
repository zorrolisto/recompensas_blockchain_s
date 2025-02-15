const hre = require("hardhat");

async function main() {
  const TokenStorage = await hre.ethers.getContractFactory("TokenStorage");
  const tokenStorage = await TokenStorage.deploy();

  await tokenStorage.deployed();

  console.log("Token Storage deployed to:", tokenStorage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
