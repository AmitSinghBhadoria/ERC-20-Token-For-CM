const CryptoMediumToken = artifacts.require("CryptoMediumToken");

module.exports = function(deployer) {
  deployer.deploy(CryptoMediumToken);
};
