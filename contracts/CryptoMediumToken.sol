pragma solidity >=0.4.16 <0.7.0;

contract CryptoMediumToken {
    //Constructor  this is the function which runs when a smart contract is deployed
    // Set Total supply of tokens
    // REad Total number of tokens
    uint256 public totalSupply;
    constructor() public {
        totalSupply = 100000000;
    }

}