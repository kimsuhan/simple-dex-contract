// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

contract SimpleDex is Ownable {
  constructor() Ownable(msg.sender) {}

  /// @dev 수학 라이브러리 사용
  using Math for uint256;

  /// @dev 풀 구조체
  struct Pool {
    uint tokenAReserve; // 토큰 A 총 공급량
    uint tokenBReserve; // 토큰 B 총 공급량
    uint totalLiquidity; // 토큰 A와 토큰 B의 총 공급량
    mapping(address => uint256) liquidityOf; // 사용자의 토큰 A와 토큰 B의 공급량
  }

  /// @dev 토큰 A와 토큰 B를 키로 하는 풀 매핑
  mapping(address => mapping(address => Pool)) public pools;

  /// @dev 유동성 추가 이벤트
  event LiquidityAdded(address indexed provider, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);

  event Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

  /// @dev 토큰 A와 토큰 B를 추가하여 풀을 생성하고 풀에 토큰 A와 토큰 B를 추가합니다.
  function addLiquidity(address tokenA, address tokenB, uint amountA, uint amountB) external returns (uint256 liquidity) {
    console.log('--------------------------------');

    /// @dev 값 검증
    require(tokenA != tokenB, 'TokenA and TokenB cannot be the same'); // 토큰 A와 토큰 B가 같으면 오류
    require(amountA > 0 && amountB > 0, 'Amounts must be greater than 0'); // 토큰 A와 토큰 B의 양이 0보다 크지 않으면 오류

    /// @dev 토큰 순서 정규화 (작은 주소가 먼저)
    if (tokenA > tokenB) {
      (tokenA, tokenB) = (tokenB, tokenA);
      (amountA, amountB) = (amountB, amountA);
    }

    /// @dev 토큰 A와 토큰 B의 주소를 가져옵니다.
    IERC20 ercTokenA = IERC20(tokenA);
    IERC20 ercTokenB = IERC20(tokenB);

    /// @dev 토큰 A와 토큰 B의 양이 풀에 추가할 양보다 작으면 오류
    require(ercTokenA.balanceOf(msg.sender) >= amountA, 'Insufficient balance'); // 토큰 A의 양이 풀에 추가할 양보다 작으면 오류
    require(ercTokenB.balanceOf(msg.sender) >= amountB, 'Insufficient balance'); // 토큰 B의 양이 풀에 추가할 양보다 작으면 오류

    /// @dev TokenA를 msg.sender에서 풀로 이동
    ercTokenA.transferFrom(msg.sender, address(this), amountA);

    /// @dev TokenB를 msg.sender에서 풀로 이동
    ercTokenB.transferFrom(msg.sender, address(this), amountB);

    /// @dev 풀 정보 획득
    Pool storage pool = pools[tokenA][tokenB];

    /// @dev 최초 유동성 공급
    if (pool.totalLiquidity == 0) {
      // 최초 공급시 두 토큰의 기하학적 평균으로 LP 토큰 수량 결정
      liquidity = sqrt(amountA * amountB);
      require(liquidity > 0, 'Insufficient liquidity'); // 유동성이 0보다 크지 않으면 오류
    } else {
      // 기존 풀에 추가: 기존 비율 유지
      uint256 liquidityA = (amountA * pool.totalLiquidity) / pool.tokenAReserve; // 토큰 A의 비율 계산 = 토큰 A의 양 * 풀의 총 유동성 / 토큰 A의 총 공급량
      uint256 liquidityB = (amountB * pool.totalLiquidity) / pool.tokenBReserve; // 토큰 B의 비율 계산 = 토큰 B의 양 * 풀의 총 유동성 / 토큰 B의 총 공급량
      liquidity = Math.min(liquidityA, liquidityB); // 두 비율 중 작은 값을 유동성으로 선택
    }

    /// @dev 풀 상태 업데이트
    pool.tokenAReserve += amountA;
    pool.tokenBReserve += amountB;
    pool.totalLiquidity += liquidity;
    pool.liquidityOf[msg.sender] += liquidity;

    /// @dev 유동성 추가 이벤트 발생
    emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);

    return liquidity;
  }

  /**
   * 스왑 함수
   *
   * 스왑 함수는 토큰을 스왑하는 함수입니다.
   * 토큰을 스왑하면 토큰의 양이 변경됩니다.
   *
   * @param tokenIn 스왑할 토큰
   * @param tokenOut 스왑할 토큰
   * @param amountIn 스왑할 토큰의 양
   * @return amountOut 스왑 후 얻은 토큰의 양
   */
  function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
    require(tokenIn != tokenOut, 'Same token');
    require(amountIn > 0, 'Amount must be > 0');

    // 토큰 순서 정규화 (작은 주소가 먼저)
    bool isReversed = tokenIn > tokenOut;
    address tokenA = isReversed ? tokenOut : tokenIn; // 작은 주소가 먼저
    address tokenB = isReversed ? tokenIn : tokenOut; // 큰 주소가 먼저

    // 정규화해서 찾은 토큰 A와 토큰 B를 키로 하는 풀 정보 획득
    Pool storage pool = pools[tokenA][tokenB];
    require(pool.totalLiquidity > 0, 'Pool not exists'); // 풀이 존재하지 않으면 오류

    // AMM 공식: x * y = k
    uint256 reserveIn = isReversed ? pool.tokenBReserve : pool.tokenAReserve; // 작은 주소가 먼저
    uint256 reserveOut = isReversed ? pool.tokenAReserve : pool.tokenBReserve; // 큰 주소가 먼저

    // 수수료 0.3% 적용
    uint256 amountInWithFee = amountIn * 997; // 0.3% 수수료
    uint256 numerator = amountInWithFee * reserveOut; // 분자
    uint256 denominator = (reserveIn * 1000) + amountInWithFee; // 분모
    amountOut = numerator / denominator; // 결과

    require(amountOut > 0, 'Insufficient output amount'); // 출력 양이 0보다 크지 않으면 오류
    require(amountOut < reserveOut, 'Insufficient liquidity'); // 출력 양이 풀의 출력 양보다 작으면 오류

    // 토큰 전송
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn); // 입력 토큰을 풀로 이동

    uint256 balance = IERC20(tokenOut).balanceOf(address(this)); // 출력 토큰의 잔액 획득
    require(amountOut < balance, 'Insufficient balance'); // 출력 토큰의 잔액이 출력 양보다 작으면 오류
    IERC20(tokenOut).transfer(msg.sender, amountOut); // 출력 토큰을 사용자에게 이동

    // 풀 상태 업데이트
    if (isReversed) {
      // 작은 주소가 먼저
      pool.tokenAReserve -= amountOut; // 작은 주소의 잔액 감소
      pool.tokenBReserve += amountIn; // 큰 주소의 잔액 증가
    } else {
      pool.tokenAReserve += amountIn; // 작은 주소의 잔액 증가
      pool.tokenBReserve -= amountOut; // 큰 주소의 잔액 감소
    }

    emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut); // 스왑 이벤트 발생
  }

  /// @dev 풀 초기화
  function resetPool(address tokenA, address tokenB) external onlyOwner {
    require(tokenA != tokenB, 'TokenA and TokenB cannot be the same');
    require(pools[tokenA][tokenB].totalLiquidity > 0, 'Pool not exists');
    pools[tokenA][tokenB].tokenAReserve = 0;
    pools[tokenA][tokenB].tokenBReserve = 0;
    pools[tokenA][tokenB].totalLiquidity = 0;
  }

  /// @dev 내 유동성 조회
  function getMyLiquidity(address tokenA, address tokenB) external view returns (uint256 liquidity) {
    liquidity = pools[tokenA][tokenB].liquidityOf[msg.sender];
  }

  /**
   * 기하평균 계산식
   *
   * 기하평균은 두 수의 곱의 제곱근을 계산하는 방법입니다.
   * 이 함수는 두 수의 곱의 제곱근을 계산하여 반환합니다.
   *
   * 예시:
   * sqrt(4 * 9) = 6
   * sqrt(4 * 16) = 8
   * sqrt(4 * 25) = 10
   * sqrt(9 * 16) = 12
   * sqrt(9 * 25) = 15
   * sqrt(16 * 25) = 20
   *
   * @param x 두 수의 곱
   * @return 두 수의 곱의 제곱근
   */
  function sqrt(uint256 x) internal pure returns (uint256) {
    if (x == 0) return 0; // 0일 때 0 반환
    uint256 z = (x + 1) / 2; // 초기값 설정
    uint256 y = x; // 초기값 설정

    while (z < y) {
      // z가 y보다 작을 때까지 반복
      y = z; // y를 z로 업데이트
      z = (x / z + z) / 2; // z를 x / z + z의 절반으로 업데이트
    }

    return y; // 결과 반환
  }
}
