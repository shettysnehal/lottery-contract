pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    uint private index;
    address public winner;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > .001 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        index = random() % players.length;
        winner=players[index];
        winner.transfer(this.balance);
        players = new address[](0);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
    function getWinner() public view returns(address){
        return winner;
    }
}   
