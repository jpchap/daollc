<h2>A simple DAO LLC parent contract</h2>

- This contract can receive funds from child contracts, and it can distribute proceeds amongst its members

- The contract uses the ERC20 standard to represent equity in the DAO LLC

- Contract code is in the contracts folder under DAOLLC.sol

- Test code is in the test folder under DAOLLC.ts


<h3>Relevant commands:</h3>

`npm install` to get all the packages

`npx hardhat test` to run the test cases

`npx hardhat run scripts/dao_deploy.ts` to deploy the contract. Use the `--network` flag to specify where you are deploying
