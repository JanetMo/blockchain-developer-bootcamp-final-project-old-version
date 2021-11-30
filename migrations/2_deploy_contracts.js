var Adoption = artifacts.require("Booking");

module.exports = function(deployer) {
  deployer.deploy(Booking);
};