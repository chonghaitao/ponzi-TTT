var PonziTTT = artifacts.require("./PonziTTT.sol");

contract('PonziTTT', function(accounts) {

    it("should checkBalance & checkProgress correctly", function() {
        var ponzi;

        var account_one = accounts[0];

        return PonziTTT.new().then(function(instance) {
            ponzi = instance;
            return ponzi.register({from: account_one, value: web3.toWei(2,'ether') });
        }).then(function() {
            return ponzi.isTrainee(account_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.balanceOf(account_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), web3.toWei(2,'ether'), "");
        }).then(function() {
            return ponzi.checkBalance({from: account_one});
        }).then(function(res) {
            assert.equal(res.valueOf(), web3.toWei(2,'ether'), "");
        }).then(function() {
            return ponzi.progressOf(account_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function() {
            return ponzi.checkProgress({from: account_one});
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        });
    });

    it("should register correctly", function() {
        var ponzi;

        var account_one = accounts[0];
        var account_two = accounts[1];

        return PonziTTT.new().then(function(instance) {
            ponzi = instance;
            return ponzi.register({from: account_one, value: web3.toWei(2,'ether') });
        }).then(function() {
            return ponzi.isTrainee(account_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.balanceOf(account_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), web3.toWei(2,'ether'), "");
        }).then(function() {
            return ponzi.isTrainee(account_two);
        }).then(function(res) {
            assert.equal(res.valueOf(), false, "");
        });
    });

    it("should confirm and check correctly", function() {
        var ponzi;

        var trainer = accounts[0];
        var trainer_two = accounts[1];
        var trainee = accounts[2];

        return PonziTTT.new([trainer, trainer_two], 4).then(function(instance) {
            ponzi = instance;
            return ponzi.register({from: trainee, value: web3.toWei(2,'ether')});
        }).then(function() {
            return ponzi.isOwner(trainer);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.isTrainee(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.balanceOf(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), web3.toWei(2,'ether'), "");
        }).then(function() {
            return ponzi.checkProgress({from: trainee});
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function() {
            ponzi.confirmOnce(trainee, {from: trainer});
        }).then(function() {
            return ponzi.checkProgress({from: trainee});
        }).then(function(res) {
            assert.equal(res.valueOf(), 1, "");
        }).then(function() {
            ponzi.confirmOnce(trainee, {from: trainer_two});
        }).then(function() {
            return ponzi.checkProgress({from: trainee});
        }).then(function(res) {
            assert.equal(res.valueOf(), 2, "");
        }).then(function() {
            return ponzi.checkContractBalance();
        }).then(function(res) {
            assert.equal(res.valueOf(), web3.toWei(2,'ether'), "");
        }).then(function() {
            ponzi.destroy({from: trainer_two});
        });
    });

    it("should confirm as required and refund correctly", function() {
        var ponzi;
        var before, after;

        var trainer = accounts[0];
        var trainer_two = accounts[1];
        var trainee = accounts[2];

        return PonziTTT.new([trainer, trainer_two], 4).then(function(instance) {
            ponzi = instance;
            return ponzi.register({from: trainee, value: web3.toWei(2,'ether')});
        }).then(function() {
            return ponzi.isOwner(trainer);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            before = web3.eth.getBalance(trainee);
            return ponzi.isTrainee(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.balanceOf(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), web3.toWei(2,'ether'), "");
        }).then(function() {
            return ponzi.checkProgress({from: trainee});
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function() {
            return ponzi.confirmOnce(trainee, {from: trainer});
        }).then(function() {
            return ponzi.confirmOnce(trainee, {from: trainer_two});
        }).then(function() {
            return ponzi.confirmOnce(trainee, {from: trainer});
        }).then(function() {
            return ponzi.checkProgress({from: trainee});
        }).then(function(res) {
            assert.equal(res.valueOf(), 3, "");
        }).then(function() {
            return ponzi.isFinished(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), false, "");
        }).then(function() {
            return ponzi.confirmOnce(trainee, {from: trainer_two});
        }).then(function() {
            return ponzi.checkProgress({from: trainee});
        }).then(function(res) {
            assert.equal(res.valueOf(), 4, "");
        }).then(function() {
            return ponzi.isFinished(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.refund(trainee, {from: trainer});
        }).then(function() {
            after = web3.eth.getBalance(trainee);
            return ponzi.balanceOf(trainee);
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function(res) {
            assert.equal(before.plus(web3.toWei(2,'ether')).valueOf(), after.valueOf(), "");
        }).then(function() {
            return ponzi.checkContractBalance();
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        });
    });

    it("should share balance to fineshed trainees correctly", function() {
        var ponzi;
        var before_one, before_two, before_three, after_one, after_two, after_three;

        var trainer = accounts[0];
        var trainee_one = accounts[1];
        var trainee_two = accounts[2];
        var trainee_three = accounts[3];

        return PonziTTT.new([trainer], 4).then(function(instance) {
            ponzi = instance;
            return ponzi.register({from: trainee_one, value: web3.toWei(2, 'ether')});
        }).then(function() {
            return ponzi.register({from: trainee_two, value: web3.toWei(2, 'ether')});
        }).then(function() {
            return ponzi.register({from: trainee_three, value: web3.toWei(2, 'ether')});
        }).then(function() {
            return ponzi.isOwner(trainer);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            before_one = web3.eth.getBalance(trainee_one);
            before_two = web3.eth.getBalance(trainee_two);
            before_three = web3.eth.getBalance(trainee_three);
            ponzi.confirmOnce(trainee_one, {from: trainer});
            ponzi.confirmOnce(trainee_one, {from: trainer});
            ponzi.confirmOnce(trainee_one, {from: trainer});
            ponzi.confirmOnce(trainee_one, {from: trainer});
            ponzi.confirmOnce(trainee_two, {from: trainer});
            ponzi.confirmOnce(trainee_two, {from: trainer});
            ponzi.confirmOnce(trainee_two, {from: trainer});
            ponzi.confirmOnce(trainee_two, {from: trainer});
            return ponzi.isFinished(trainee_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.isFinished(trainee_two);
        }).then(function(res) {
            assert.equal(res.valueOf(), true, "");
        }).then(function() {
            return ponzi.setEndTime(0, {from: trainer});
        //}).then(function(res) {
            //
        }).then(function() {
            return ponzi.shareBalanceToFinishedTrainees();
        }).then(function() {
            after_one = web3.eth.getBalance(trainee_one);
            return ponzi.balanceOf(trainee_one);
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function() {
            after_two = web3.eth.getBalance(trainee_two);
            return ponzi.balanceOf(trainee_two);
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function() {
            after_three = web3.eth.getBalance(trainee_three);
            return ponzi.balanceOf(trainee_three);
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        }).then(function(res) {
            assert.equal(before_one.plus(web3.toWei(3,'ether')).valueOf(), after_one.valueOf(), "");
        }).then(function(res) {
            assert.equal(before_two.plus(web3.toWei(3,'ether')).valueOf(), after_two.valueOf(), "");
        }).then(function(res) {
            assert.equal(before_three.valueOf(), after_three.valueOf(), "");
        }).then(function() {
            return ponzi.checkContractBalance();
        }).then(function(res) {
            assert.equal(res.valueOf(), 0, "");
        });
    });
});
