const { expect } = require("chai");
const hre = require("hardhat");

describe("ZyncToken", function () {
  async function deployToken() {
    const [owner, user, spender] = await hre.ethers.getSigners();

    const price = hre.ethers.parseEther("0.001");

    const ZyncToken = await hre.ethers.getContractFactory("ZyncToken");

    const token = await ZyncToken.deploy(price);

    await token.waitForDeployment();

    return {
      token,
      owner,
      user,
      spender,
      price,
    };
  }

  it("mints ZYNC for ETH at the public price", async function () {
    const { token, user, price } = await deployToken();

    const tx = await token
      .connect(user)
      .mintWithEth({ value: price });

    await tx.wait();

    const balance = await token.balanceOf(user.address);

    expect(balance).to.equal(
      hre.ethers.parseEther("1"),
    );

    expect(
      await hre.ethers.provider.getBalance(
        await token.getAddress(),
      ),
    ).to.equal(price);
  });

  it("allows a token holder to successfully burn their own tokens", async function () {
    const { token, owner, user } = await deployToken();

    const mintAmount = hre.ethers.parseEther("100");
    const burnAmount = hre.ethers.parseEther("25");

    await token
      .connect(owner)
      .mintTo(user.address, mintAmount);

    await expect(
      token.connect(user).burn(burnAmount),
    )
      .to.emit(token, "Burned")
      .withArgs(user.address, burnAmount);

    expect(
      await token.balanceOf(user.address),
    ).to.equal(
      hre.ethers.parseEther("75"),
    );

    expect(
      await token.totalSupply(),
    ).to.equal(
      hre.ethers.parseEther("75"),
    );
  });

  it("reverts when a holder tries to burn more tokens than their balance", async function () {
    const { token, owner, user } = await deployToken();

    const mintAmount = hre.ethers.parseEther("10");
    const burnAmount = hre.ethers.parseEther("20");

    await token
      .connect(owner)
      .mintTo(user.address, mintAmount);

    await expect(
      token.connect(user).burn(burnAmount),
    ).to.be.reverted;
  });

  it("allows burnFrom when sufficient allowance has been granted", async function () {
    const { token, owner, user, spender } = await deployToken();

    const mintAmount = hre.ethers.parseEther("100");
    const allowanceAmount = hre.ethers.parseEther("40");
    const burnAmount = hre.ethers.parseEther("25");

    await token
      .connect(owner)
      .mintTo(user.address, mintAmount);

    await token
      .connect(user)
      .approve(spender.address, allowanceAmount);

    await expect(
      token
        .connect(spender)
        .burnFrom(user.address, burnAmount),
    )
      .to.emit(token, "Burned")
      .withArgs(user.address, burnAmount);

    expect(
      await token.balanceOf(user.address),
    ).to.equal(
      hre.ethers.parseEther("75"),
    );

    expect(
      await token.allowance(
        user.address,
        spender.address,
      ),
    ).to.equal(
      hre.ethers.parseEther("15"),
    );

    expect(
      await token.totalSupply(),
    ).to.equal(
      hre.ethers.parseEther("75"),
    );
  });

  it("reverts burnFrom when no allowance has been granted", async function () {
    const { token, owner, user, spender } = await deployToken();

    const mintAmount = hre.ethers.parseEther("100");
    const burnAmount = hre.ethers.parseEther("25");

    await token
      .connect(owner)
      .mintTo(user.address, mintAmount);

    await expect(
      token
        .connect(spender)
        .burnFrom(user.address, burnAmount),
    ).to.be.reverted;

    expect(
      await token.balanceOf(user.address),
    ).to.equal(mintAmount);
  });
});