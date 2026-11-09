# Guild Desk

**A retro RPG dashboard kit for small creative teams.**

고전 RPG의 길드 창을 닮은, 실제로 작동하는 React 작업 대시보드입니다. 퀘스트를 고르고, 담당과 진행 상태를 바꾸고, 작은 단계를 체크하고, 마지막 변경을 되돌릴 수 있습니다.

**[라이브 데모](https://chirpyworks.github.io/guild-desk/)** · [오프라인 HTML](release/guild-desk.html) · **[설계 이야기](https://rudadirector.blog/?utm_source=github&utm_medium=readme&utm_campaign=guild_desk&utm_content=intro)** · [구성 요소](docs/kit-guide.md) · [검증 범위](docs/verification.md)

GitHub 파일 화면에서는 HTML이 실행되지 않습니다. `release/guild-desk.html`을 내려받아 브라우저에서 여세요. 글꼴·이미지·패키지 다운로드 없이 동작합니다. 새로고침하면 처음의 합성 데이터로 돌아옵니다.

## 플레이가 아니라, 작업 공간

- **퀘스트 보드**: 검색, 상태·기한·담당자 필터, 정렬, 목록과 상세의 연결.
- **파티**: 4명의 합성 팀원과 실제 미완료 과제 수. 능력치나 생산성 순위가 아닙니다.
- **작은 단계들**: 체크리스트에서 계산한 진척. 퀘스트 완료 상태와 별개입니다.
- **완료 확인**: 남은 체크리스트가 있으면 한 번 확인하고, 미완료 단계는 유지합니다.
- **되돌리기**: 마지막 변경 전 작업 데이터와 활동 기록을 복원합니다.
- **두 가지 테마**: RPG 프레임과 일반 업무 테마를 같은 데이터 위에서 비교합니다.
- **좁은 화면**: 목록에서 상세로 전환하고 목록으로 돌아갑니다.
- **작은 편의**: 목록에서 ↑↓·Home·End로 초점 이동 후 Enter로 선택, `/` 검색, 입력칸 밖에서 `Ctrl/Cmd+Z` 되돌리기, `Escape` 상세 닫기.

소리, 깜빡임, 가짜 XP, 순위 경쟁은 없습니다. 픽셀 SVG와 창 테두리로 분위기를 만들고, 한글 본문은 시스템 글꼴로 읽기 쉽게 유지합니다. 모든 아이콘과 캐릭터 SVG는 이 프로젝트에서 직접 작성했습니다.

## 개발

Node.js 22.13 이상과 npm이 필요합니다. 재현 가능한 개발·CI 환경은 `.nvmrc`의 Node.js 24.22.1과 함께 제공되는 npm 11.19.1을 기준으로 검증했습니다. nvm을 사용한다면 먼저 `nvm install && nvm use`를 실행하세요.

직접 의존성은 `package.json`에, 전이 의존성과 무결성 해시는 `package-lock.json`에 고정했습니다. 처음 설치하거나 CI에서 설치할 때는 `npm ci`를 사용합니다.

```sh
npm ci
npm run dev
npm test
npm run build
```

빌드는 `dist/`의 정적 사이트와 `release/guild-desk.html` 독립 실행 파일을 만듭니다. `dist/`는 정적 호스팅에 올릴 수 있습니다. 인증·DB·서버 API는 포함하지 않습니다.

`.github/workflows/ci.yml`은 PR, `main` 푸시, 수동 실행에서 깨끗한 설치 → 모델 테스트 7개 → 타입 검사·프로덕션 빌드 → 독립 HTML 생성과 파일 검사를 수행합니다. 배포나 생성 HTML의 자동 커밋은 하지 않습니다. 의존성을 변경할 때만 `npm install`로 lockfile을 갱신하고 두 의존성 파일을 함께 검토하세요.

## 내 프로젝트에 가져오기

```tsx
import { GameWindow, StatusBadge, ProgressBar } from './src/components';
import type { Quest } from './src/model';
import './src/styles.css';

function QuestPreview({ quest }: { quest: Quest }) {
  return <GameWindow title="QUEST DETAILS" icon="flag">
    <h2>{quest.title}</h2>
    <StatusBadge status={quest.status} />
    <ProgressBar quest={quest} />
  </GameWindow>;
}
```

현재 스타일은 **앱 전체의 CSS**입니다. 기존 제품에 컴포넌트만 옮길 때는 전역 선택자(`button`, `main`, `input` 등)를 제품의 범위 선택자 아래로 옮겨 주세요. 독립적으로 설치하는 npm 컴포넌트 라이브러리는 아닙니다.

| 파일 | 바꾸는 곳 |
| --- | --- |
| `src/model.ts` | 퀘스트·멤버 타입, 합성 데이터, 날짜·필터·변경 로직 |
| `src/components.tsx` | 게임창, 배지, 진척 바, 픽셀 SVG, 파티 |
| `src/main.tsx` | 화면 조립, 상태, 대화창, 마지막 변경 되돌리기 |
| `src/styles.css` | 색·프레임 토큰, 두 테마, 반응형 레이아웃 |
| `scripts/standalone.mjs` | 빌드 결과를 독립 HTML로 묶는 스크립트 |

## 서로 다른 도구

| 프로젝트 | 주된 용도 |
| --- | --- |
| Guild Desk | 게임 감성의 팀 작업 공간과 상태 변경 UX |
| [KPI Kit](https://github.com/chirpyworks/kpi-kit) | 지표·차트·표를 구성하는 대시보드 소스 킷 |
| [decision-ui](https://github.com/chirpyworks/decision-ui) | 판단 중심 UI를 만드는 에이전트용 지침 |
| Retry Audit Kit | CSV의 AI 실행 기록과 작업·시도 분모 검산 |

## 왜 이렇게 설계했을까

게임창의 테두리는 옮겼지만 업무의 의미는 그대로 두었습니다. 선택한 항목, 상태, 다음 행동이 분명해야 레트로 스타일도 쓰기 좋은 화면이 됩니다. [대시보드는 카드의 집합이 아니다](https://rudadirector.blog/2026/09/27/dashboard-is-not-a-stack-of-cards/?utm_source=github&utm_medium=readme&utm_campaign=guild_desk&utm_content=principles)에서 정보 구조에 관한 배경을 읽을 수 있습니다.

이 링크에는 유입 경로를 구분하는 UTM만 붙습니다. 킷 안에는 분석 SDK, 추적 스크립트, 외부 글꼴 요청이 없습니다. 트래픽 증가 효과를 검증했다는 뜻은 아닙니다.

## 개인정보와 데이터

예제 인물·팀·프로젝트는 모두 합성 데이터입니다. 입력은 브라우저 메모리에서만 처리하고 저장하거나 서버로 전송하지 않습니다. 블로그 링크는 새 탭으로 열립니다. 공개 파일 검사 범위는 [보안 점검 기록](docs/security.md)에 남겼습니다. 번들에 포함한 React 관련 라이선스는 [Third-party notices](THIRD_PARTY_NOTICES.md)를 참고하세요.

## 범위

샘플은 브라우저 메모리에서 동작합니다. 실제 협업, 영구 저장, 서버 권한, 동시 수정 충돌, 실행 취소 API, 기한 알림은 직접 구현해야 합니다. 세션 활동 기록은 감사 로그가 아니며, 되돌리면 해당 변경 기록도 복원 전 상태로 돌아갑니다. 전체 작업 완료율과 체크리스트 완료율을 하나의 수치로 섞지 않습니다.

루다의 방향 제안에 따라 Codex가 제작하고, Flint와 주제 중복·RPG 표현·상태 규칙·검수 기준을 논의했습니다. 실제 검증 범위는 [검증 기록](docs/verification.md)을 기준으로 합니다.

MIT License · Made by [RUDA DIRECTOR](https://rudadirector.blog/?utm_source=github&utm_medium=readme&utm_campaign=guild_desk&utm_content=footer)
