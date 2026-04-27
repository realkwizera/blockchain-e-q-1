const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🔧 Fixing and redeploying VaultV1...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📌 Deployer account:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    try {
        // Step 1: Validate contract can be compiled
        console.log("1️⃣  Validating contract compilation...");
        const VaultV1 = await ethers.getContractFactory("VaultV1");
        console.log("   ✅ Contract factory loaded successfully\n");

        // Step 2: Check ABI is valid
        console.log("2️⃣  Checking contract ABI...");
        const hasInitialize = VaultV1.interface.fragments.some(f => f.name === "initialize");
        const hasVersion = VaultV1.interface.fragments.some(f => f.name === "version");
        const hasGetBalance = VaultV1.interface.fragments.some(f => f.name === "getBalance");

        if (!hasInitialize) throw new Error("initialize function not found in ABI");
        if (!hasVersion) throw new Error("version function not found in ABI");
        if (!hasGetBalance) throw new Error("getBalance function not found in ABI");
        console.log("   ✅ All required functions present in ABI\n");

        // Step 3: Deploy with detailed logging
        console.log("3️⃣  Deploying UUPS proxy...");
        console.log("   • Initializing with 100 basis points (1% APY)");

        const vault = await upgrades.deployProxy(VaultV1, [100], {
            initializer: "initialize",
            kind: "uups",
            timeout: 60000,
        });

        await vault.waitForDeployment();
        const proxyAddress = await vault.getAddress();
        console.log("   ✅ Proxy deployed at:", proxyAddress);

        // Step 4: Get implementation details
        console.log("\n4️⃣  Retrieving implementation details...");
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
        console.log("   📍 Implementation:", implementationAddress);
        console.log("   📍 Admin/Proxy Admin:", adminAddress);

        // Step 5: Verify contract state
        console.log("\n5️⃣  Verifying contract state...");
        const version = await vault.version();
        const rewardMultiplier = await vault.rewardMultiplier();
        const totalEthLocked = await vault.totalEthLocked();

        console.log("   • Version:", version);
        console.log("   • Reward Multiplier:", rewardMultiplier.toString(), "basis points");
        console.log("   • Total ETH Locked:", ethers.formatEther(totalEthLocked), "ETH");

        // Step 6: Verify proxy storage (check if code exists)
        console.log("\n6️⃣  Verifying proxy code...");
        const code = await ethers.provider.getCode(proxyAddress);
        console.log("   • Proxy has code:", code.length > 2 ? "✅ YES" : "❌ NO");

        // Step 7: Save deployment info
        console.log("\n7️⃣  Saving deployment configuration...");
        const deploymentInfo = {
            network: "localhost",
            chainId: 31337,
            proxy: proxyAddress,
            implementation: implementationAddress,
            admin: adminAddress,
            deployer: deployer.address,
            version: version,
            rewardMultiplier: rewardMultiplier.toString(),
            blockNumber: await ethers.provider.getBlockNumber(),
            timestamp: new Date().toISOString(),
        };

        // Save to deployment-localhost.json
        fs.writeFileSync(
            "deployment-localhost.json",
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("   ✅ Saved to deployment-localhost.json");

        // Step 8: Update frontend config
        console.log("\n8️⃣  Frontend configuration:");
        console.log("   Update frontend/src/contracts/VaultABI.js with:");
        console.log(`   31337: '${proxyAddress}'`);

        console.log("\n✨ Deployment successful! Ready for frontend integration.\n");

    } catch (error) {
        console.error("\n❌ Deployment failed!");
        console.error("Error:", error.message);

        if (error.message.includes("StackOverflow")) {
            console.error("\n🔍 Troubleshooting StackOverflow:");
            console.error("   • Check contract doesn't have infinite recursion");
            console.error("   • Verify initializer function is correct");
            console.error("   • Clear hardhat cache: rm -rf ./cache ./artifacts");
        }

        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
