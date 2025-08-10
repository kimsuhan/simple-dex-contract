import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { EventLog } from 'ethers';
import { ethers } from 'hardhat';

describe('SimpleDex', function () {
  async function deploySimpleDex() {
    const SimpleDex = await ethers.getContractFactory('SimpleDex');
    const simpleDex = await SimpleDex.deploy();
    return { simpleDex };
  }

  async function deployAToken() {
    const TestTokenA = await ethers.getContractFactory('ETH');
    const testTokenA = await TestTokenA.deploy('ETH', 'ETH', 10000);
    return { testTokenA };
  }

  async function deployBToken() {
    const TestTokenB = await ethers.getContractFactory('XRP');
    const testTokenB = await TestTokenB.deploy('XRP', 'XRP', 10000);
    return { testTokenB };
  }

  // 테스트용 상수
  // const INITIAL_SUPPLY_A = ethers.parseEther("1000000"); // 100만개
  // const INITIAL_SUPPLY_B = ethers.parseEther("2000000"); // 200만개

  // let simpleDex: SimpleDex;

  // beforeEach(async function () {
  //   const { simpleDex } = await loadFixture(deploySimpleDex);
  //   const { testTokenA } = await loadFixture(deployAToken);
  //   const { testTokenB } = await loadFixture(deployBToken);

  //   console.log("✅ 컨트랙트들이 배포되었습니다!");
  //   console.log("TokenA:", await testTokenA.getAddress());
  //   console.log("TokenB:", await testTokenB.getAddress());
  //   console.log("SimpleDEX:", await simpleDex.getAddress());

  //   return { simpleDex, testTokenA, testTokenB };
  // });

  describe('addLiquidity 테스트', function () {
    it('유동성 추가 테스트', async function () {
      const { simpleDex } = await loadFixture(deploySimpleDex);
      const { testTokenA } = await loadFixture(deployAToken);
      const { testTokenB } = await loadFixture(deployBToken);

      const [owner] = await ethers.getSigners();

      const amountA = ethers.parseEther('1');
      const amountB = ethers.parseEther('2');

      // 토큰 승인
      const simpleDexAddress = await simpleDex.getAddress();

      await testTokenA.connect(owner).approve(simpleDexAddress, amountA);
      await testTokenB.connect(owner).approve(simpleDexAddress, amountB);

      const allowanceA = await testTokenA.allowance(owner.address, simpleDexAddress);
      const allowanceB = await testTokenB.allowance(owner.address, simpleDexAddress);

      expect(allowanceA).to.equal(amountA, 'TTA 승인량이 올바르지 않습니다.');
      expect(allowanceB).to.equal(amountB, 'TTB 승인량이 올바르지 않습니다.');

      // 유동성 추가
      const tx = await simpleDex.connect(owner).addLiquidity(testTokenA.target, testTokenB.target, amountA, amountB);
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      console.log(tx);

      console.log('✅ 성공! Gas used:', receipt!.gasUsed.toString());

      console.log('\n📊 7단계: 최종 상태 확인');
      const balanceA_after = await testTokenA.balanceOf(owner.address);
      const balanceB_after = await testTokenB.balanceOf(owner.address);
      console.log('TTA 잔액 (after):', ethers.formatEther(balanceA_after));
      console.log('TTB 잔액 (after):', ethers.formatEther(balanceB_after));

      // 🎯 이벤트에서 리턴값 찾기
      const eventLogs = receipt!.logs.filter((log): log is EventLog => {
        return 'fragment' in log;
      });

      // LiquidityAdded 이벤트 찾기
      const liquidityAddedEvent = eventLogs.find((log) => log.fragment.name === 'LiquidityAdded');

      if (liquidityAddedEvent) {
        const liquidity = liquidityAddedEvent.args.liquidity;
        console.log('💧 받은 유동성:', ethers.formatEther(liquidity));
        expect(liquidity).to.be.gt(0, '유동성이 0보다 크지 않습니다.');
      } else {
        console.log('❌ LiquidityAdded 이벤트를 찾을 수 없음');
      }

      // 나의 유동성 확인
      const userLiquidity = await simpleDex.pools(testTokenA.target, testTokenB.target);
      console.log('내 유동성:', userLiquidity); // 그냥 숫자
      expect(userLiquidity).to.be.gt(0, '나의 유동성이 0보다 크지 않습니다.');
    });
  });
});
