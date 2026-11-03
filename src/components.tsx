import type { ReactNode } from 'react';
import { members, progress, statusLabels, type Quest, type Status } from './model';

export function PixelIcon({name='star',size=24}:{name?:string;size?:number}) {
  const paths: Record<string,string> = {star:'M7 1h2v4h4v2h2v2h-4v2H9v4H7v-4H5V9H1V7h4V5h2z',book:'M2 2h5v1h2V2h5v12H9v1H7v-1H2zm2 2v8h3V4zm5 0v8h3V4z',sword:'M11 1h4v4h-2v2h-2v2H9v2H7v2H5v2H1v-4h2V9h2V7h2V5h2V3h2z',flag:'M3 1h2v1h8v7H5v6H3zm2 3v3h6V4z',people:'M3 2h4v5H3zm6 1h4v4H9zM1 9h8v6H1zm10 0h4v6h-4z',check:'M1 7h3v3h2V8h2V6h2V4h2V2h3v4h-2v2h-2v2H9v2H7v2H4v-2H2v-2H1z',clock:'M4 1h8v2h2v2h1v6h-2v2h-2v2H5v-2H3v-2H1V5h2V3h1zm2 3v5h5V7H8V4z',arrow:'M7 2h2v2h2v2h2v2h2v1h-2v2h-2v2H9v2H7v-4H1V7h6z',plus:'M6 1h4v5h5v4h-5v5H6v-5H1V6h5z',chest:'M3 2h10v2h2v10H1V4h2zm0 4v6h10V6H9v3H7V6z',undo:'M5 2v3h5v2h3v3h1v4h-3v-4H9V8H5v3L0 6z',search:'M3 1h6v2h2v6H9v2H3V9H1V3h2zm1 3v4h4V4zm6 6h3v2h2v3h-3v-2h-2z'};
  return <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges"><path fill="currentColor" d={paths[name]||paths.star}/></svg>;
}
export function Avatar({member='',size=40}:{member?:string;size?:number}) {
  const colors:Record<string,string[]>={mira:['#796491','#c9b2dd'],noa:['#4f7967','#a8c5ab'],sol:['#a0664c','#e9ba85'],yul:['#4c6e93','#a7c6db']};
  const [dark,light]=colors[member]||['#6b6d75','#cccbd0'];
  return <span className="avatar" style={{width:size,height:size,background:light}}><svg viewBox="0 0 20 20" shapeRendering="crispEdges" aria-hidden="true"><path fill={dark} d="M6 2h8v2h2v8h-2v2h3v4H3v-4h3v-2H4V4h2z"/><path fill="#f4d9b3" d="M6 7h8v5h-2v2H8v-2H6z"/><path fill="#292c44" d="M7 8h2v2H7zm4 0h2v2h-2z"/><path fill={light} d="M7 15h6v3H7z"/>{member==='mira'&&<path fill={dark} d="M7 0h4v2h2v2H5V2h2z"/>}</svg></span>;
}
export function GameWindow({title,icon='book',children,className='',aside}:{title:string;icon?:string;children:ReactNode;className?:string;aside?:ReactNode}) {
  return <section className={`game-window ${className}`}><header className="window-title"><span><PixelIcon name={icon} size={16}/>{title}</span>{aside||<span className="window-marks" aria-hidden="true">▪ ▪</span>}</header>{children}</section>;
}
export function StatusBadge({status}:{status:Status}) {return <span className={`status ${status}`}><span aria-hidden="true">{status==='done'?'◆':status==='blocked'?'!':status==='active'?'▶':'◇'}</span>{statusLabels[status]}</span>}
export function ProgressBar({quest}:{quest:Quest}) {const p=progress(quest); return <span className="progress-wrap"><span className="progress-track" role="progressbar" aria-label={`${quest.title} 체크리스트`} aria-valuemin={0} aria-valuemax={p.total||1} aria-valuenow={p.done}><span style={{width:`${p.total ? p.done/p.total*100:0}%`}}/></span><span>{p.done}/{p.total}</span></span>}
export function Party({quests,owner,onOwner}:{quests:Quest[];owner:string;onOwner:(id:string)=>void}) {return <div className="party-members">{members.map(m=><button key={m.id} className={`member ${owner===m.id?'selected':''}`} aria-pressed={owner===m.id} onClick={()=>onOwner(owner===m.id?'':m.id)}><Avatar member={m.id}/><span><strong>{m.name}<small>{m.role}</small></strong><span className="member-load">미완료 {quests.filter(q=>q.owner===m.id&&q.status!=='done').length}건</span></span><span className="member-arrow" aria-hidden="true">›</span></button>)}</div>}
