pragma solidity >=0.4.16 <0.7.0;

contract CryptoMediumToken {
    //Set Name of Token
    string public name = "Crypto Medium Token";
    //Set Symbol of Token
    string public symbol = "CMT";
    // set a standard or version
    string public standard = "CMT v1.0";
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Transfer event
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Approve event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    //Constructor  this is the function which runs when a smart contract is deployed
    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        //assing initial supply to a account
    }

    // Transfer function
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // Throw  Exception if account does'nt have enough
        require(balanceOf[msg.sender] >= _value, "sender ");
        // transfer the amount
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // emit Transfer event
        emit Transfer(msg.sender, _to, _value);
        // Return a boolean
        return true;
    }

    // Approve Function
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // transfer approved transaction
        allowance[msg.sender][_spender] = _value;
        // fire Approve event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
}
