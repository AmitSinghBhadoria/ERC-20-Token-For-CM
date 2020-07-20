const CryptoMediumToken = artifacts.require("CryptoMediumToken");

module.exports = function(deployer) {
  deployer.deploy(CryptoMediumToken, 100000000);
};
