var CryptoMediumToken = artifacts.require("./CryptoMediumToken.sol");
var CryptoMediumTokenSale = artifacts.require("./CryptoMediumTokenSale.sol");

contract("CryptoMediumTokenSale", (accounts) => {
  var tokenInstance;
  var tokenSaleInstance;
  var tokenPrice = 10 ** 15; // in wei
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokensAvailable = 750000;
  var numberOfTokens;
  it("initializes the contract with correct values", () => {
    return CryptoMediumTokenSale.deployed()
      .then((contract) => {
        tokenSaleInstance = contract;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "token price is correct");
      });
  });
  it("Token Sale", () => {
    return CryptoMediumToken.deployed()
      .then((contract) => {
        tokenInstance = contract;
        return CryptoMediumTokenSale.deployed();
      })
      .then((contract) => {
        tokenSaleInstance = contract;
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvailable,
          { from: admin }
        );
      })
      .then(function (receipt) {
        numberOfTokens = 10;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          'should be the "Sell" event'
        );
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account that purchased the tokens"
        );
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then(function (amount) {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), numberOfTokens);
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function (balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        // Try to buy tokens different from the ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must equal number of tokens in wei"
        );
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot purchase more tokens than available"
        );
      });
  });

  it("ends token sale", () => {
    return CryptoMediumToken.deployed()
      .then((instance) => {
        // Grab token instance first
        tokenInstance = instance;
        return CryptoMediumTokenSale.deployed();
      })
      .then((instance) => {
        // Then grab token sale instance
        tokenSaleInstance = instance;

        // Try to end sale from account other than the admin
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("only admin have access to this function") >= 0,
          "cannot transfer value larger than balance"
        );
        //   assert(error.message, 'only admin have access to this function');
        // End sale as admin
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then((reciept) => {
        return tokenInstance.balanceOf(admin);
      })
      .then(async (balance) => {
        assert.equal(
          balance.toNumber(),
          99999990,
          "returns unsold tokens to admin"
        );
        // Check that the contract has no balance
        return web3.eth.getBalance(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(balance, 0);
      });
  });
});
