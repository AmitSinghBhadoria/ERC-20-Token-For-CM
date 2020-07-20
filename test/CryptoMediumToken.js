var CryptoMediumToken = artifacts.require("./CryptoMediumToken.sol");

contract("CryptoMediumToken", (accounts) => {
  it("Initializes the contract with correct values", () => {
    return CryptoMediumToken.deployed()
      .then((result) => {
        contract = result;
        return contract.name();
      })
      .then((TokenName) => {
        assert.equal(
          TokenName,
          "Crypto Medium Token",
          "correctly assigned name"
        );
        return contract.symbol();
      })
      .then((TokenSymbol) => {
        assert.equal(TokenSymbol, "CMT", "Correctly asigned name");
        return contract.standard();
      })
      .then((standard) => {
        assert.equal(standard, "CMT v1.0", "correctly assigns standard");
      });
  });

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
        return contract.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.equal(
          adminBalance.toNumber(),
          100000000,
          "Successfully assigns initial Supply to admin Address"
        );
      });
  });

  it("Transfers Token Ownership", () => {
    return (
      CryptoMediumToken.deployed()
        //   .then((result) => {
        //     contract = result;
        //     // test if the sender has the required tokens by sending tokens above the contract limit
        //     return contract.transfer.call(accounts[1], 9999999999999999n);
        //   })
        //   .then(assert.fail)
        //   .catch((err) => {
        //     console.log(err);
        //     assert(
        //       err.message.indexOf("revert") >= 0,
        //       "error message must contain revert"
        //     );
        //     return contract.transfer(accounts[1], 250000, { from: accounts[0] });
        //   })
        .then((result) => {
          contract = result;
          return contract.transfer.call(accounts[1], 250000, {
            from: accounts[0],
          });
        })
        .then((success) => {
          assert.equal(success, true, "it returns true");
          return contract.transfer(accounts[1], 250000, { from: accounts[0] });
        })
        .then((receipt) => {
          assert.equal(receipt.logs.length, 1, "triggers one event");
          assert.equal(
            receipt.logs[0].event,
            "Transfer",
            'should be the "Transfer" event'
          );
          assert.equal(
            receipt.logs[0].args._from,
            accounts[0],
            "logs the account the tokens are transferred from"
          );
          assert.equal(
            receipt.logs[0].args._to,
            accounts[1],
            "logs the account the tokens are transferred to"
          );
          assert.equal(
            receipt.logs[0].args._value,
            250000,
            "logs the transfer amount"
          );
          return contract.balanceOf(accounts[1]);
        })
        .then((balance) => {
          assert.equal(
            balance.toNumber(),
            250000,
            "adds the amount to recieving account"
          );
          return contract.balanceOf(accounts[0]);
        })
        .then((balance) => {
          assert.equal(balance.toNumber(), 99750000, "deducts the amount from");
        })
    );
  });

  it("Aprroves tokens", () => {
    return CryptoMediumToken.deployed()
      .then((result) => {
        contract = result;
        return contract.approve.call(accounts[1], 2500);
      })
      .then((success) => {
        assert.equal(success, true, "it returns true");
        return contract.approve(accounts[1], 2500, { from: accounts[0] });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          'should be the "Transfer" event'
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are transferred from"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          2500,
          "logs the transfer amount"
        );
        return contract.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance.toNumber(),
          2500,
          "stores the allowance for delegated transfer"
        );
      });
  });
});
