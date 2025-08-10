# MetaMask 지갑 연동 프론트엔드

초보자를 위한 MetaMask 지갑 연동 데모 애플리케이션입니다. Next.js, TypeScript, Wagmi를 사용하여 구현되었습니다.

## 🚀 특징

- ✅ MetaMask 지갑 연결/해제
- ✅ 지갑 주소 표시
- ✅ 계정 잔액 확인
- ✅ 네트워크 정보 표시
- ✅ 반응형 UI (Tailwind CSS)
- ✅ TypeScript 완전 지원

## 📋 필요 조건

- Node.js 18.0 이상
- npm 또는 yarn
- MetaMask 브라우저 확장 프로그램

## 🛠️ 설치 및 실행

1. **의존성 설치**
```bash
npm install
```

2. **개발 서버 실행**
```bash
npm run dev
```

3. **브라우저에서 확인**
   - http://localhost:3000 접속

## 📦 사용된 주요 패키지

- **Next.js 15**: React 기반 풀스택 프레임워크
- **Wagmi**: Ethereum을 위한 React Hooks
- **Viem**: TypeScript Ethereum 라이브러리
- **TanStack Query**: 서버 상태 관리
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크

## 🔧 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 메인 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 글로벌 스타일
├── components/
│   ├── ConnectWallet.tsx   # 지갑 연결 컴포넌트
│   ├── WalletInfo.tsx     # 지갑 정보 표시 컴포넌트
│   └── providers.tsx      # Wagmi & React Query 프로바이더
└── lib/
    └── config.ts          # Wagmi 설정
```

## 🌐 지원 네트워크

- **Ethereum Mainnet** (chainId: 1)
- **Sepolia Testnet** (chainId: 11155111) - 테스트 권장
- **Hardhat Local** (chainId: 31337) - 로컬 개발

## 🎯 사용 방법

1. **MetaMask 설치**
   - 브라우저에 MetaMask 확장 프로그램 설치
   - 지갑 생성 또는 복원

2. **지갑 연결**
   - "MetaMask 연결하기" 버튼 클릭
   - MetaMask 팝업에서 연결 승인

3. **기능 확인**
   - 지갑 주소 확인
   - 잔액 조회
   - 네트워크 정보 확인

## ⚠️ 주의사항

- **테스트 환경**: 실제 자금 사용 금지
- **네트워크**: 개발/테스트 네트워크 사용 권장
- **보안**: 개인키, 시드 문구 절대 공유 금지

## 🚀 배포

### Vercel 배포
```bash
npm install -g vercel
vercel
```

### 다른 플랫폼
```bash
npm run build
npm run start
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Wagmi 문서](https://wagmi.sh)
- [MetaMask 개발자 문서](https://docs.metamask.io)
- [Viem 문서](https://viem.sh)

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.
