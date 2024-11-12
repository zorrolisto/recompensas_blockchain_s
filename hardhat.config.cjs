require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    polygon: {
      url: process.env.POLYGON_URL,
      accounts: [process.env.POLYGON_ACCOUNT],
    },
  },
};
