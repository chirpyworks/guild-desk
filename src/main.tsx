import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Avatar, GameWindow, Party, PixelIcon, ProgressBar, StatusBadge } from './components';
import { changeQuest, needsCompletionConfirmation, isOverdue, localDate, makeDemo, members, progress, selectQuests, statusLabels, type Filter, type Quest, type Status, type Workspace } from './model';
import './styles.css';

function App() {
  const [today,setToday]=useState(localDate());
  const [state,setState]=useState<Workspace>(()=>makeDemo(localDate()));
  const [previous,setPrevious]=useState<{data:Workspace;selected:string;detailOpen:boolean}|null>(null);
  const [selected,setSelected]=useState('Q-001');
  const [detailOpen,setDetailOpen]=useState(false);
  const [filter,setFilter]=useState<Filter>('all');
  const [owner,setOwner]=useState('');
  const [query,setQuery]=useState('');
  const [sort,setSort]=useState('default');
  const [plain,setPlain]=useState(false);
  const [notice,setNotice]=useState('');
  const [modal,setModal]=useState<'new'|'complete'|'reset'|null>(null);
  const [formError,setFormError]=useState('');
  const [newTitle,setNewTitle]=useState('');
  const dialogRef=useRef<HTMLDialogElement>(null);
  const modalTriggerRef=useRef<HTMLElement|null>(null);
  const searchRef=useRef<HTMLInputElement>(null);
  const detailRef=useRef<HTMLHeadingElement>(null);
  const q=state.quests.find(q=>q.id===selected);
  const filtered=selectQuests(state.quests,filter,query,owner,today);
  const visible=sort==='due'?[...filtered].sort((a,b)=>a.due.localeCompare(b.due)||a.id.localeCompare(b.id)):sort==='title'?[...filtered].sort((a,b)=>a.title.localeCompare(b.title,'ko')):filtered;
  const done=state.quests.filter(q=>q.status==='done').length;
  const overdue=state.quests.filter(q=>isOverdue(q,today)).length;
  const dueToday=state.quests.filter(q=>q.due===today&&q.status!=='done').length;
  useEffect(()=>{const timer=setInterval(()=>setToday(localDate()),60000);return()=>clearInterval(timer)},[]);
  useEffect(()=>{ const d=dialogRef.current; if(!d)return; if(modal){ modalTriggerRef.current=document.activeElement instanceof HTMLElement?document.activeElement:null; d.showModal(); (modal==='new'?d.querySelector<HTMLInputElement>('input'):d.querySelector<HTMLButtonElement>('.dialog-actions button'))?.focus(); } else { d.close(); if(modalTriggerRef.current?.isConnected && modalTriggerRef.current.getClientRects().length)modalTriggerRef.current.focus(); modalTriggerRef.current=null; } },[modal]);
  function undo(){if(previous){setState(previous.data);setSelected(previous.selected);setDetailOpen(previous.detailOpen);setPrevious(null);setNotice('마지막 변경을 되돌렸습니다.');}}
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement && (e.target.matches('input,textarea,select')||e.target.isContentEditable))return;if(modal)return;if(e.key==='/'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();searchRef.current?.focus();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}if(e.key==='Escape')backToList();};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);});
  function backToList(){setDetailOpen(false);requestAnimationFrame(()=>{const row=document.querySelector<HTMLButtonElement>('.quest-row.selected');(row||searchRef.current)?.focus();});}
  function eventId(){return globalThis.crypto?.randomUUID?.()||`event-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
  function select(id:string){setSelected(id);setDetailOpen(true);if(window.matchMedia('(max-width: 900px)').matches)requestAnimationFrame(()=>detailRef.current?.focus());}
  function update(patch:Partial<Pick<Quest,'status'|'owner'|'steps'>>,message:string){if(!q)return;setPrevious({data:state,selected,detailOpen});setState(changeQuest(state,q.id,patch,message,eventId(),new Date().toLocaleTimeString('ko',{hour:'2-digit',minute:'2-digit'})));setNotice(message);}
  function setStatus(status:Status){if(!q||q.status===status)return;if(needsCompletionConfirmation(q,status)){setModal('complete');return;}update({status},`“${q.title}” · ${statusLabels[status]}으로 변경`);}
  function clearFilters(){setFilter('all');setOwner('');setQuery('');}
  const filters:[Filter,string][]=[['all','전체'],['active','진행 중'],['today','오늘 마감'],['overdue','지연'],['done','완료']];
  return <div className={`app ${plain?'plain':''}`}>
    <a className="skip" href="#quest-list">퀘스트 목록으로 건너뛰기</a>
    <aside className="sidebar">
      <a href="#" className="brand" onClick={e=>{e.preventDefault();clearFilters();setDetailOpen(false)}} aria-label="Guild Desk 전체 퀘스트"><span className="brand-mark"><PixelIcon name="sword" size={25}/></span><span>GUILD DESK<small>SMALL TEAM. BIG QUEST.</small></span></a>
      <div className="guild-label"><span className="guild-dot"/>모닝스타 길드<span className="demo-label">DEMO</span></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="작업 보기">
        <button className={filter==='all'&&!owner?'nav-item current':'nav-item'} onClick={()=>{clearFilters();setDetailOpen(false)}}><PixelIcon name="book" size={19}/>퀘스트 보드<span>{state.quests.length}</span></button>
        <button className={filter==='today'?'nav-item current':'nav-item'} onClick={()=>{clearFilters();setFilter('today');setDetailOpen(false)}}><PixelIcon name="clock" size={19}/>오늘의 퀘스트<span>{dueToday}</span></button>
        <button className={filter==='done'?'nav-item current':'nav-item'} onClick={()=>{clearFilters();setFilter('done');setDetailOpen(false)}}><PixelIcon name="chest" size={19}/>완료 보관함<span>{done}</span></button>
      </nav>
      <div className="sidebar-divider"/><p className="nav-label">YOUR PARTY <span>04</span></p>
      <Party quests={state.quests} owner={owner} onOwner={id=>{setOwner(id);setDetailOpen(false)}}/>
      <div className="sidebar-bottom"><div className="field-note"><PixelIcon name="star" size={20}/><strong>작은 진전도, 모험의 일부.</strong><p>오늘의 한 가지를 끝내보세요.</p></div><a target="_blank" rel="noopener noreferrer" href="https://rudadirector.blog/?utm_source=guild_desk&utm_medium=demo&utm_campaign=dashboard_kit&utm_content=sidebar">RUDA DIRECTOR <span>↗</span></a><span className="version">OPEN-SOURCE UI KIT · v0.1</span></div>
    </aside>
    <main>
      <header className="topbar"><span><span className="muted">WORKSPACE</span><span className="crumb">/</span>퀘스트 보드</span><div className="top-actions"><button className="theme-toggle" aria-pressed={plain} onClick={()=>setPlain(!plain)}>{plain?'일반 테마':'RPG 테마'}<span aria-hidden="true">⇄</span></button><span className="top-avatar"><Avatar member="mira" size={30}/></span></div></header>
      <div className="workspace">
        <section className="intro"><div><p className="eyebrow"><PixelIcon name="flag" size={16}/> A NEW DAY, A NEW QUEST</p><h1>오늘도, 한 걸음 앞으로.</h1><p className="intro-sub">작은 팀의 큰 모험을 정리하는 작업 공간.</p></div><button className="primary new-quest" onClick={()=>{setNewTitle('');setFormError('');setModal('new')}}><PixelIcon name="plus" size={16}/>새 퀘스트</button></section>
        <section className="guild-banner" aria-label="전체 길드 진행 상황"><div className="banner-crest"><PixelIcon name="star" size={30}/></div><div className="banner-copy"><span className="eyebrow">GUILD PROGRESS</span><strong>함께 만드는 다음 장</strong><span>{state.quests.length}개 퀘스트 중 {done}개 완료</span></div><div className="guild-meter"><div className="meter-caption"><span>전체 퀘스트 완료</span><strong>{state.quests.length?Math.round(done/state.quests.length*100):0}%</strong></div><div className="guild-track" role="progressbar" aria-label="전체 퀘스트 완료율" aria-valuemin={0} aria-valuemax={state.quests.length||1} aria-valuenow={done}><span style={{width:`${state.quests.length?done/state.quests.length*100:0}%`}}/></div></div><div className="banner-stats"><span><strong>{dueToday}</strong>오늘 마감</span><span className={overdue?'overdue-count':''}><strong>{overdue}</strong>기한 지남</span></div></section>
        <div className={`board-layout ${detailOpen?'detail-open':''}`}>
          <GameWindow title="QUEST BOARD" icon="book" className="board-window" aside={<span className="window-sub">퀘스트 · 프로젝트 과제</span>}>
            <div className="board-toolbar"><label className="search"><PixelIcon name="search" size={16}/><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="제목, 프로젝트, ID 검색" aria-label="제목, 프로젝트, ID로 퀘스트 검색"/><kbd>/</kbd></label><label className="sr-only" htmlFor="sort">퀘스트 정렬</label><select id="sort" value={sort} onChange={e=>setSort(e.target.value)}><option value="default">기본 순서</option><option value="due">마감 빠른 순</option><option value="title">제목 순</option></select></div>
            <div className="filters" aria-label="퀘스트 필터">{filters.map(([value,label])=><button key={value} aria-pressed={filter===value} className={filter===value?'active-filter':''} onClick={()=>setFilter(value)}>{label}<span>{selectQuests(state.quests,value,'','',today).length}</span></button>)}</div>
            {owner&&<div className="owner-filter">담당: {members.find(m=>m.id===owner)?.name}<button aria-label="담당자 필터 해제" onClick={()=>setOwner('')}>×</button></div>}
            <div className="list-caption"><span>{visible.length}개 표시 / 전체 {state.quests.length}개</span><span>체크리스트 · 마감</span></div>
            <div id="quest-list" className="quest-list" tabIndex={-1} onKeyDown={e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const rows=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.quest-row'));const index=rows.indexOf(e.target as HTMLButtonElement);if(index<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?rows.length-1:Math.max(0,Math.min(rows.length-1,index+(e.key==='ArrowDown'?1:-1)));rows[next]?.focus();}}>{visible.length===0?<div className="empty"><PixelIcon name="chest" size={40}/><h3>이곳은 잠시 고요하네요.</h3><p>현재 검색·필터에 맞는 퀘스트가 없습니다.</p><button onClick={clearFilters}>전체 퀘스트 보기</button></div>:visible.map(item=><button className={`quest-row ${selected===item.id?'selected':''}`} key={item.id} aria-current={selected===item.id?'true':undefined} onClick={()=>select(item.id)}><span className={`quest-symbol ${item.status}`}><PixelIcon name={item.status==='done'?'check':item.status==='blocked'?'flag':'sword'} size={19}/></span><span className="quest-main"><span className="quest-meta">{item.id}<span>·</span>{item.project}{item.priority==='high'&&<span className="priority">우선</span>}</span><strong>{item.title}</strong><span className="quest-bottom"><StatusBadge status={item.status}/><span className="row-owner">{members.find(m=>m.id===item.owner)?.name||'미배정'}</span></span></span><span className="quest-end"><ProgressBar quest={item}/><span className={isOverdue(item,today)?'due late':'due'}>{isOverdue(item,today)?'지연 · ':''}{item.due===today?'오늘':item.due.slice(5).replace('-','/')}</span></span><span className="row-chevron" aria-hidden="true">›</span></button>)}</div>
            <footer className="board-footer"><span>필터 숫자는 전체 길드 기준</span><span>선택 → 확인 → 다음 행동</span></footer>
          </GameWindow>
          <GameWindow title="QUEST DETAILS" icon="flag" className="detail-window">
            {q?<div className="detail-body"><button className="mobile-back" onClick={backToList}>← 퀘스트 목록으로</button><div className="detail-meta"><span>{q.id} / {q.project}</span><StatusBadge status={q.status}/></div><h2 tabIndex={-1} ref={detailRef}>{q.title}</h2><p className="description">{q.description}</p>{!visible.some(i=>i.id===q.id)&&<p className="filter-note">선택한 퀘스트가 현재 필터 밖에 있습니다. <button onClick={clearFilters}>전체 보기</button></p>}
              <div className="detail-properties"><label><span>담당 파티원</span><select value={q.owner} onChange={e=>update({owner:e.target.value},`담당자 · ${members.find(m=>m.id===e.target.value)?.name||'미배정'}으로 변경`)}><option value="">미배정</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}</select></label><div><span>마감일</span><strong className={isOverdue(q,today)?'late':''}>{q.due.replaceAll('-','.')} {q.due===today&&<small>오늘</small>}</strong></div></div>
              <div className="checklist-title"><h3>작은 단계들</h3><span>{progress(q).done} / {progress(q).total}</span></div><div className="checklist">{q.steps.length?q.steps.map(step=><label key={step.id} className={step.done?'checked':''}><input type="checkbox" checked={step.done} onChange={()=>update({steps:q.steps.map(s=>s.id===step.id?{...s,done:!s.done}:s)},`체크리스트 · ${step.text} ${step.done?'해제':'완료'}`)}/><span>{step.text}</span></label>):<p className="muted">등록된 체크리스트가 없습니다.</p>}</div>{q.status==='done'&&q.steps.some(s=>!s.done)&&<p className="filter-note">퀘스트는 완료 상태지만 미완료 체크리스트가 남아 있습니다.</p>}
              <div className="status-field"><label htmlFor="quest-status">진행 상태</label><select id="quest-status" value={q.status} onChange={e=>setStatus(e.target.value as Status)}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
              <button className="primary complete-button" onClick={()=>q.status==='done'?setStatus('active'):setStatus('done')}><PixelIcon name={q.status==='done'?'undo':'check'} size={17}/>{q.status==='done'?'다시 진행하기':'퀘스트 완료하기'}</button>
              <div className="activity"><h3>모험 기록 <span>이번 세션</span></h3>{state.activity.filter(a=>a.questId===q.id).length?state.activity.filter(a=>a.questId===q.id).slice(0,5).map(a=><div className="activity-row" key={a.id}><span className="activity-dot"/><p>{a.message}<time>{a.time}</time></p></div>):<p className="muted activity-empty">아직 변경 기록이 없습니다.<br/>다음 행동부터 여기에 기록됩니다.</p>}</div>
            </div>:<div className="empty"><PixelIcon name="flag"/><h3>퀘스트를 선택해 주세요.</h3><p>목록에서 내용을 확인할 수 있습니다.</p></div>}
          </GameWindow>
        </div>
        <footer className="page-footer"><span><span className="status-dot"/>합성 데이터 데모 · 변경은 이 탭에서만 유지</span><div><button onClick={()=>setModal('reset')}>데모 초기화</button><a target="_blank" rel="noopener noreferrer" href="https://rudadirector.blog/2026/09/27/dashboard-is-not-a-stack-of-cards/?utm_source=guild_desk&utm_medium=demo&utm_campaign=dashboard_kit&utm_content=principles">화면을 설계한 원칙 ↗</a></div></footer>
      </div>
    </main>
    <div className="toast" hidden={!notice} role="status"><PixelIcon name="book" size={20}/><span>{notice}</span>{previous&&<button onClick={undo}>되돌리기</button>}<button className="dismiss" aria-label="알림 닫기" onClick={()=>setNotice('')}>×</button></div>
    <dialog ref={dialogRef} onCancel={()=>setModal(null)} onClose={()=>setModal(null)} aria-labelledby="dialog-title"><div className="window-title"><span><PixelIcon name="book" size={16}/>GUILD MESSAGE</span><button aria-label="대화창 닫기" onClick={()=>setModal(null)}>×</button></div><div className="dialog-body"><h2 id="dialog-title">{modal==='new'?'새로운 퀘스트를 시작할까요?':modal==='reset'?'처음의 길드로 돌아갈까요?':'아직 작은 단계가 남아 있어요.'}</h2>{modal==='new'?<form onSubmit={e=>{e.preventDefault();if(!newTitle.trim()){setFormError('퀘스트 제목을 입력해 주세요.');e.currentTarget.querySelector('input')?.focus();return;}const fd=new FormData(e.currentTarget);const id=`Q-${String(Math.max(...state.quests.map(q=>Number(q.id.slice(2))),0)+1).padStart(3,'0')}`;const created:Quest={id,title:newTitle.trim(),project:'나의 프로젝트',description:'새 퀘스트의 담당자와 진행 상태를 정해 보세요.',status:'todo',priority:'normal',owner:String(fd.get('owner')||''),due:String(fd.get('due')||today),steps:[]};setPrevious({data:state,selected,detailOpen});setState({quests:[created,...state.quests],activity:[{id:eventId(),questId:id,message:'새 퀘스트 생성',time:new Date().toLocaleTimeString('ko',{hour:'2-digit',minute:'2-digit'})},...state.activity]});clearFilters();select(id);setModal(null);setNotice('새 퀘스트를 만들었습니다.');}}><label>퀘스트 제목<input autoFocus value={newTitle} onChange={e=>{setNewTitle(e.target.value);setFormError('')}} maxLength={100} aria-invalid={!!formError} aria-describedby={formError?'form-error':undefined}/></label>{formError&&<p id="form-error" className="late" role="alert">{formError}</p>}<label>담당 파티원<select name="owner"><option value="">미배정</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>마감일<input type="date" name="due" defaultValue={today} required/></label><div className="dialog-actions"><button type="button" onClick={()=>setModal(null)}>취소</button><button className="primary" type="submit">퀘스트 만들기</button></div></form>:<><p>{modal==='reset'?'이 탭에서 바꾼 퀘스트와 기록을 처음의 합성 예제로 되돌립니다. 초기화 직후에는 되돌리기로 복원할 수 있습니다.':`미완료 체크리스트가 ${q?.steps.filter(s=>!s.done).length||0}개 남았습니다. 체크리스트는 그대로 두고 퀘스트만 완료할까요?`}</p><div className="dialog-actions"><button autoFocus onClick={()=>setModal(null)}>취소</button><button className="primary" onClick={()=>{if(modal==='reset'){setPrevious({data:state,selected,detailOpen});setState(makeDemo(today));setSelected('Q-001');clearFilters();setDetailOpen(false);setNotice('데모를 초기화했습니다.');}else if(q){update({status:'done'},`“${q.title}” · 미완료 항목을 남기고 완료`);}setModal(null);}}>{modal==='reset'?'초기화':'그래도 완료'}</button></div></>}</div></dialog>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
