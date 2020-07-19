var CryptoMediumToken = artifacts.require("./CryptoMediumToken.sol");

contract("CryptoMediumToken", (accounts) => {
  it("sets the total supply variable upon deployment", () => {
    return CryptoMediumToken.deployed()
      .then((result) => {
        contract = result;
        return contract.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(
          totalSupply.toNumber(),
          100000000,
          "sets the total Supply to 100,000,000"
        );
      });
  });
});
