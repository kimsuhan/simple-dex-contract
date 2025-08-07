# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
Hardhat과 Ignition을 사용하는 Ethereum 스마트 컨트랙트 개발 템플릿 프로젝트입니다.

## 개발 명령어

### 기본 명령어
- `npm run compile` 또는 `npx hardhat compile` - 스마트 컨트랙트 컴파일
- `npm test` 또는 `npx hardhat test` - 모든 테스트 실행
- `npm run node` 또는 `npx hardhat node` - 로컬 Hardhat 노드 실행

### 배포 명령어
- `npm run deploy:local` - 로컬 네트워크에 배포 (localhost:8545)
- `npx hardhat ignition deploy ./ignition/modules/Lock.ts` - 특정 모듈 배포

### 유용한 명령어
- `REPORT_GAS=true npx hardhat test` - 가스 리포트와 함께 테스트 실행
- `npx hardhat help` - 사용 가능한 명령어 확인

## 프로젝트 구조

### 핵심 디렉토리
- `contracts/` - Solidity 스마트 컨트랙트 (.sol 파일)
- `test/` - TypeScript 테스트 파일
- `ignition/modules/` - Hardhat Ignition 배포 모듈
- `typechain-types/` - 자동 생성된 TypeScript 타입 정의

### 설정 파일
- `hardhat.config.ts` - Hardhat 설정 (네트워크, 플러그인, 가스 리포팅 등)
- `tsconfig.json` - TypeScript 설정
- `.env` - 환경 변수 (PRIVATE_KEY, API 키 등)

## 개발 아키텍처

### 테스트 패턴
- Hardhat 툴박스 사용 (`@nomicfoundation/hardhat-toolbox`)
- `loadFixture`를 사용한 테스트 상태 재사용
- Chai matchers를 사용한 스마트 컨트랙트 검증

### 배포 패턴
- Hardhat Ignition을 사용한 모듈화된 배포
- 배포 매개변수는 `buildModule`에서 `getParameter`로 관리

### 네트워크 설정
- `hardhat` - 로컬 테스트 네트워크
- `localhost` - 로컬 노드 (127.0.0.1:8545, chainId: 31337)
- `sepolia` - 테스트넷 (환경변수 필요: SEPOLIA_URL, PRIVATE_KEY)

### 가스 리포팅
- `REPORT_GAS=Y` 환경변수로 활성화
- Coinmarketcap API와 Etherscan API 지원
- 메서드 시그니처와 미호출 메서드 표시 가능