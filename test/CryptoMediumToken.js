var CryptoMediumToken = artifacts.require("./CryptoMediumToken.sol");

contract("CryptoMediumToken", (accounts) => {
  var contract;
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
          .then((result) => {
            contract = result;
            // test if the sender has the required tokens by sending tokens above the contract limit
            return contract.transfer.call(accounts[1], 100000001);
          })
          .then(assert.fail)
          .catch((err) => {
            assert(
              err.message.indexOf("revert") >= 0,
              "error message must contain revert"
            );
            return contract;
          })
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

  it('handles delegated token transfers', function() {
    return CryptoMediumToken.deployed().then(function(result) {
      contract = result;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];
      // Transfer some tokens to fromAccount
      return contract.transfer(fromAccount, 100, { from: accounts[0] });
    }).then(function(receipt) {
      // Approve spendingAccount to spend 10 tokens form fromAccount
      return contract.approve(spendingAccount, 10, { from: fromAccount });
    }).then(function(receipt) {
      // Try transferring something larger than the sender's balance
      return contract.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
      // Try transferring something larger than the approved amount
      return contract.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
      return contract.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function(success) {
      assert.equal(success, true);
      return contract.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      return contract.balanceOf(fromAccount);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
      return contract.balanceOf(toAccount);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
      return contract.allowance(fromAccount, spendingAccount);
    }).then(function(allowance) {
      assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
    });
  });
});
