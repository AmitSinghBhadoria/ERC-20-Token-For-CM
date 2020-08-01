const CryptoMediumToken = artifacts.require("CryptoMediumToken");
const CryptoMediumTokenSale = artifacts.require("CryptoMediumTokenSale");

module.exports = function (deployer) {
  deployer.deploy(CryptoMediumToken, 100000000).then((result) => {
    return deployer.deploy(CryptoMediumTokenSale, result.address, 10 ** 15);
  });
};
