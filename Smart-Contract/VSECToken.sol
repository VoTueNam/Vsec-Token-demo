// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address sender, address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    function mint(address sender, uint256 amout) external;
    function getName() external view returns (string calldata);
    function getSymbol() external view returns (string calldata);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

}


contract VsecCoin is IERC20 {

    string public constant name = "VSEC coin";
    string public constant symbol = "VSEC";
    uint8 public constant decimals = 18;


    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    uint256 totalSupply_ = 1000 ether;

    address public _owner;


    constructor(address owner) {
        balances[msg.sender] = totalSupply_;
        balances[owner] = totalSupply_;
        totalSupply_ = totalSupply_ * 2;
        _owner = msg.sender;
    }

    function getName() external override view returns (string memory) {
        return name;
    }

    function getSymbol() external override view returns (string memory) {
        return symbol;
    }

    function totalSupply() external override view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) external override view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) external override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[receiver] = balances[receiver]+numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    // Lỗi không kiểm soát truy cập hàm approve
    function approve(address sender, address delegate, uint256 numTokens) external override returns (bool) {
        allowed[sender][delegate] = numTokens;
        emit Approval(sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) external override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) external override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner]-numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

    // Lỗi bất kì cũng có thể mint
    function mint(address sender, uint256 amount) external override{
      balances[sender] += amount;
      totalSupply_ += amount;
    }

    modifier onlyOwner() { 
      require(_owner == msg.sender, "Ownable: caller is not the owner");
      _;
    }
}


contract DEX {

    event Bought(uint256 amount);
    event Sold(uint256 amount);

    uint256 private constant decimals = 10**18;

    IERC20 public token;
    address public owner;
    uint8 public taxValue;

    constructor() {
        token = new VsecCoin(msg.sender);
        owner = msg.sender;
        taxValue = 1;
    }

    function getNameToken() external view returns (string memory) {
        return token.getName();
    }

    function getSymbolToken() external view returns (string memory) {
        return token.getSymbol();
    }

    function totalSupply() public view returns (uint256){
        return token.totalSupply() / decimals;
    }

    function balanceOf(address sender) public view returns (uint256){
        return token.balanceOf(sender) / decimals;
    }

    function contractBalance() public view returns (uint256){
        return token.balanceOf(address(this)) / decimals;
    }

    function approveMe(uint256 amount) public {
        token.approve(msg.sender, address(this), amount * decimals);
    }

    function mint(uint256 amount) public {
        token.mint(msg.sender, amount * decimals);
    }

    function buy(uint256 amountTobuy) public {
        // uint256 amountTobuy = msg.value;
        amountTobuy = amountTobuy * decimals;
        uint256 dexBalance = token.balanceOf(address(this));
        require(amountTobuy > 0, "You need to send some ether. OK?");
        require(amountTobuy <= dexBalance, "Not enough tokens in the reserve. OK?");
        token.transfer(msg.sender, amountTobuy);
        emit Bought(amountTobuy);
    }

    function sell(uint256 amount) public{
        amount = (amount * (100 + taxValue)/100) * decimals;
        require(amount > 0, "You need to sell at least some tokens. OK?");
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance. OK?");
        tax(msg.sender, amount / (100 + taxValue));
        token.transferFrom(msg.sender, address(this), amount * 100/(100 + taxValue));
        // payable(msg.sender).transfer(amount);
        emit Sold(amount);
    }

    function transfer(address receiver, uint256 amount) public{
        amount = amount * decimals;
        require(amount > 0, "You need to transfer at least some tokens");
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        token.transferFrom(msg.sender, receiver, amount);
    }

    function tax(address sender, uint256 amount) internal{
        token.transferFrom(sender, owner, amount);
    }

}
