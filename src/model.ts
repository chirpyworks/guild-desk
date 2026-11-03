export type Status = 'todo' | 'active' | 'blocked' | 'done';
export type Filter = 'all' | Status | 'today' | 'overdue';
export type Quest = { id: string; title: string; project: string; description: string; status: Status; priority: 'normal' | 'high'; owner: string; due: string; steps: { id: string; text: string; done: boolean }[] };
export type Activity = { id: string; questId: string; message: string; time: string };
export type Workspace = { quests: Quest[]; activity: Activity[] };
export const statusLabels: Record<Status, string> = { todo: '대기', active: '진행 중', blocked: '막힘', done: '완료' };
export const members = [
  { id: 'mira', name: '미라', role: '디자인', color: 'purple', sprite: 'mage' },
  { id: 'noa', name: '노아', role: '영상', color: 'green', sprite: 'ranger' },
  { id: 'sol', name: '솔', role: '글·콘텐츠', color: 'orange', sprite: 'knight' },
  { id: 'yul', name: '율', role: '운영', color: 'blue', sprite: 'scholar' },
] as const;
export function localDate(date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function shiftDate(today: string, delta: number): string { const [y,m,d]=today.split('-').map(Number); return localDate(new Date(y,m-1,d+delta,12)); }
export function isOverdue(q: Quest, today: string) { return q.status !== 'done' && q.due < today; }
export function progress(q: Quest) { return { done: q.steps.filter(s=>s.done).length, total: q.steps.length }; }
export function selectQuests(quests: Quest[], filter: Filter, query: string, owner: string, today: string): Quest[] {
  const needle = query.trim().toLocaleLowerCase();
  return quests.filter(q => (filter === 'all' || (filter === 'today' ? q.due === today && q.status !== 'done' : filter === 'overdue' ? isOverdue(q,today) : q.status === filter)) && (!owner || q.owner === owner) && (!needle || `${q.id} ${q.title} ${q.project}`.toLocaleLowerCase().includes(needle)));
}
export function needsCompletionConfirmation(q: Quest, next: Status): boolean { return next === 'done' && q.status !== 'done' && q.steps.some(step => !step.done); }
export function changeQuest(state: Workspace, id: string, patch: Partial<Pick<Quest,'status'|'owner'|'steps'>>, message: string, eventId: string, time: string): Workspace {
  if (!state.quests.some(q=>q.id===id)) return state;
  return { quests: state.quests.map(q=>q.id===id ? {...q,...patch} : q), activity: [{id:eventId,questId:id,message,time},...state.activity] };
}
export function makeDemo(today: string): Workspace {
  const rows: [string,string,string,Status,string,number,string[]][] = [
    ['봄의 상점, 랜딩 페이지 마무리','봄의 상점','새 굿즈 컬렉션의 첫 화면을 완성합니다. 작은 화면에서도 상품과 구매 버튼의 순서가 명확한지 확인해 주세요.','active','mira',0,['히어로 이미지와 문구 배치','모바일 구매 동선 확인','최종 시안 공유']],
    ['브랜드 필름 1차 편집','작은 기록','인터뷰와 작업실 장면을 60초 영상으로 구성합니다. 마지막 장면에는 다음 전시 일정을 넣어 주세요.','active','noa',1,['인터뷰 러프컷 정리','배경음과 자막 입히기','시안 내보내기']],
    ['뉴스레터 12호 원고 다듬기','작은 기록','이번 주 작업 과정과 발견을 독자에게 전합니다. 링크, 날짜, 이미지 설명을 함께 점검합니다.','blocked','sol',-1,['원고 초안 작성','전시 일정 답변 받기','발행 전 교정']],
    ['엽서 패키지 인쇄 파일','봄의 상점','엽서 세트의 재단선과 안전 여백을 확인하고 인쇄소 전달 파일을 준비합니다.','todo','mira',3,['인쇄 규격 확인','색상과 여백 확인','PDF 전달']],
    ['팝업 공간 답사 예약','동네의 발견','출입 시간, 전기 사용, 설치 가능한 벽면을 확인할 수 있도록 답사 일정을 잡습니다.','active','yul',0,['공간 후보 정리','운영자 연락','답사 시간 확정']],
    ['작업실 인터뷰 질문 준비','작은 기록','제작자의 작업 방식과 재료 선택에 관한 열린 질문 다섯 개를 준비합니다.','todo','sol',4,['자료 읽기','질문 초안 작성']],
    ['전시 티저 세로 영상','동네의 발견','전시의 재료와 분위기를 보여주는 15초 티저를 제작합니다.','todo','noa',5,['샷 리스트 작성','소스 촬영','자막·내보내기']],
    ['굿즈 배송 안내 정리','봄의 상점','포장 일정, 배송 방법, 교환 문의 경로를 안내 페이지에 정리합니다.','todo','yul',2,['포장 일정 확인','안내문 작성']],
    ['컬렉션 컬러 팔레트 확정','봄의 상점','화면과 인쇄에 사용할 컬러 조합을 기록했습니다.','done','mira',-2,['색상 조합 비교','토큰과 인쇄값 기록']],
    ['지난달 콘텐츠 아카이브','작은 기록','발행한 글과 영상의 링크를 모아 다음 기획에 참고할 수 있도록 정리했습니다.','done','sol',-3,['발행 링크 수집','주제별 정리']],
    ['전시 초대장 발송 목록','동네의 발견','협업자용 초대장의 발송 대상을 정리합니다. 데모에는 실제 연락처가 없습니다.','todo','',6,['대상 범주 정하기','검토용 목록 준비']],
    ['상품 사진 보정','봄의 상점','일관된 색온도와 여백으로 상품 사진을 준비했습니다.','done','noa',-1,['색온도 조정','웹 이미지 내보내기']],
  ];
  return {quests: rows.map(([title,project,description,status,owner,delta,steps],i)=>({id:`Q-${String(i+1).padStart(3,'0')}`,title,project,description,status,owner,due:shiftDate(today,delta),priority:i===0 || i===2 ? 'high':'normal', steps:steps.map((text,n)=>({id:`s${n}`,text,done:status==='done'||(status!=='todo'&&n===0)}))})), activity:[]};
}
