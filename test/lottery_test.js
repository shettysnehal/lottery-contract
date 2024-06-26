const assert = require('assert');
const ganache = require('ganache');
const {Web3} = require('web3');
const web3 = new Web3(ganache.provider());
const {interface,bytecode} = require('../compile');
let lottery;
let accounts;
console.log(lottery)
beforeEach(async () =>{
    accounts= await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface)).deploy({data:bytecode}).send({from:accounts[0],gas:'1000000'});

});
describe('Lottery contract',()=>{
    it("deploys a contract",()=>{
        assert.ok(lottery.options.address);
    })
    it("allows only multiple accounts to enter",async ()=>{
        await lottery.methods.enter().send({
            from:accounts[1],
            value:web3.utils.toWei('0.002','ether')
        });
        await lottery.methods.enter().send({
            from:accounts[2],
            value:web3.utils.toWei('0.002','ether')
        });
        await lottery.methods.enter().send({
            from:accounts[3],
            value:web3.utils.toWei('0.002','ether')
        });
        
        const players = await lottery.methods.getPlayers().call({
            from:accounts[0]
        })
        assert.equal(accounts[1],players[0]);
        assert.equal(accounts[2],players[1]);
        assert.equal(accounts[3],players[2]);
        assert.equal(3,players.length)

     })
    it('requires a minimum amount of ether to enter', async()=>{
        try{
            await lottery.method.enter().send({
            from:accounts[0],
            value:0  
        }) 
            assert(false)
        }  catch(error){
            assert(error);
        } 
       })
    it("only manager can call pick winner",async()=>{
        try{
            await lottery.methods.pickWinner.send({
                from:accounts[1]
            })
            assert(false);
        } catch(err){
            assert(err);
        }
    })
    it('sends money to the winner and resets the players array', async()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value:web3.utils.toWei(2,'ether')
        })
        const initialBalance=await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from:accounts[0]
        })
        const finalBalance= await web3.eth.getBalance(accounts[0])
        const difference=finalBalance-initialBalance;
        assert(difference>web3.utils.toWei('1.8','ether'))
        //some ether goes as gas in transaction object
    })
})
