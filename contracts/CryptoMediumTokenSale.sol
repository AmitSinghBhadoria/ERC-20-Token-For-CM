pragma solidity >=0.4.16 <0.7.0;
import "./CryptoMediumToken.sol";

contract CryptoMediumTokenSale {
    address payable admin;
    CryptoMediumToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);
    // event EndSale(uint256 _totalAmountSold);

    //Constructor  this is the function which runs when a smart contract is deployed
    constructor(CryptoMediumToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to token price
        require(
            msg.value == multiply(_numberOfTokens, tokenPrice),
            "value must be equal to token price"
        );
        // Require that the contract has enough tokens
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "Contract must have enough supply of tokens"
        );
        // Require that a transfer is successfull
        require(
            tokenContract.transfer(msg.sender, _numberOfTokens),
            "transfer of tokens is successfull"
        );
        // Keep track of tokens Sold
        tokensSold += _numberOfTokens;
        // Trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        // Require Admin
        require(msg.sender == admin, "only admin have access to this function");
        // Transfer remaining Tokens to admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            ),
            "remaining token are transferable to admin"
        );
        // Destroy contract
        selfdestruct(admin);
        // admin.transfer(address(this).balance);
        // emit EndSale(tokensSold);
    }
}
