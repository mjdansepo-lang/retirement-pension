
const {useState,useEffect,useRef,useCallback}=React;

const TODAY=new Date('2026-04-27T00:00:00');

const STEPS={
  퇴직자:[
    {label:'정산요청',desc:'메타페이에 정산요청'},
    {label:'결과확인',desc:'+2일 후 메타페이 결과 확인'},
    {label:'청구서작성',desc:'청구서 작성·출력·인감 날인'},
    {label:'연금청구',desc:'스캔본 → 연금사 이메일 발송 ★청구일 입력'},
    {label:'전표처리',desc:'내부 회계전표 처리'},
    {label:'원천세',desc:'DB만: 원천세 신고 + 귀속월 입력',dbOnly:true},
  ],
  중도인출:[
    {label:'정산요청',desc:'메타페이에 정산요청'},
    {label:'결과확인',desc:'+2일 후 메타페이 결과 확인'},
    {label:'청구서작성',desc:'청구서 작성·출력·인감 날인'},
    {label:'연금청구',desc:'스캔본 → 연금사 이메일 발송 ★청구일 입력'},
    {label:'전표처리',desc:'내부 회계전표 처리'},
  ],
  제도전환:[
    {label:'정산요청',desc:'메타페이에 정산요청'},
    {label:'결과확인',desc:'+2일 후 메타페이 결과 확인'},
    {label:'청구서작성',desc:'청구서 작성·출력·인감 날인'},
    {label:'연금청구',desc:'스캔본 → 연금사 이메일 발송 ★청구일 입력'},
    {label:'전표처리',desc:'내부 회계전표 처리'},
  ],
};

const LOC_MGR={
  '본사':'피플팀','평택공장':'윤지희','광주공장':'유은정',
  '경산공장':'김보선','상하공장':'오종무','청양공장':'김준표',
  '영동공장':'전수현','아산공장':'김다솜',
};
const LOCATIONS=Object.keys(LOC_MGR);
const MANAGERS=Object.values(LOC_MGR);
const PENSION_COS=['삼성생명','삼성증권','미래에셋'];

const INIT_DATA={
  퇴직자:[
    {id:1,소속:'본사',사번:'HQ-2312',이름:'김민수',제도:'DB',연금사:'삼성생명',퇴직일:'2026-04-12',담당자:'피플팀',steps:[true,true,true,true,true,true],청구일:'2026-04-25',귀속월:'26.04',메모:''},
    {id:2,소속:'평택공장',사번:'PT-1187',이름:'이지영',제도:'DC',연금사:'삼성증권',퇴직일:'2026-04-15',담당자:'윤지희',steps:[true,true,true,true,false,null],청구일:'2026-04-25',귀속월:'',메모:''},
    {id:3,소속:'광주공장',사번:'GJ-0945',이름:'정현우',제도:'DB',연금사:'미래에셋',퇴직일:'2026-04-16',담당자:'유은정',steps:[true,true,true,false,false,false],청구일:'',귀속월:'',메모:''},
    {id:4,소속:'경산공장',사번:'GS-2203',이름:'박서연',제도:'DC',연금사:'삼성생명',퇴직일:'2026-04-18',담당자:'김보선',steps:[true,true,false,false,false,null],청구일:'',귀속월:'',메모:''},
    {id:5,소속:'상하공장',사번:'SH-1556',이름:'강동훈',제도:'DB',연금사:'삼성증권',퇴직일:'2026-04-20',담당자:'오종무',steps:[true,true,true,true,true,true],청구일:'2026-04-30',귀속월:'26.04',메모:''},
    {id:6,소속:'청양공장',사번:'CY-0899',이름:'윤수진',제도:'DC',연금사:'미래에셋',퇴직일:'2026-04-21',담당자:'김준표',steps:[true,false,false,false,false,null],청구일:'',귀속월:'',메모:''},
    {id:7,소속:'영동공장',사번:'YD-3401',이름:'최재민',제도:'DB',연금사:'삼성생명',퇴직일:'2026-04-22',담당자:'전수현',steps:[true,true,true,true,false,false],청구일:'2026-05-02',귀속월:'',메모:''},
    {id:8,소속:'아산공장',사번:'AS-1124',이름:'송하늘',제도:'DC',연금사:'삼성증권',퇴직일:'2026-04-23',담당자:'김다솜',steps:[true,true,false,false,false,null],청구일:'',귀속월:'',메모:''},
  ],
  중도인출:[
    {id:1,소속:'본사',사번:'HQ-1801',이름:'한지민',연금사:'삼성생명',신청일:'2026-04-05',담당자:'피플팀',steps:[true,true,true,true,true],청구일:'2026-04-15',메모:''},
    {id:2,소속:'평택공장',사번:'PT-2245',이름:'오재석',연금사:'삼성증권',신청일:'2026-04-10',담당자:'윤지희',steps:[true,true,true,false,false],청구일:'',메모:'청구서 작성 중'},
    {id:3,소속:'경산공장',사번:'GS-1099',이름:'서민지',연금사:'미래에셋',신청일:'2026-04-15',담당자:'김보선',steps:[true,true,false,false,false],청구일:'',메모:'메타페이 결과 대기'},
    {id:4,소속:'아산공장',사번:'AS-3312',이름:'백승호',연금사:'삼성생명',신청일:'2026-04-20',담당자:'김다솜',steps:[true,false,false,false,false],청구일:'',메모:''},
  ],
  제도전환:[
    {id:1,소속:'본사',사번:'HQ-1455',이름:'문지호',전환:'DB→DC',연금사:'삼성생명',DB계산종료일:'2026-01-15',담당자:'피플팀',steps:[true,true,true,true,true],청구일:'2026-01-25',월말기한:'2026-01-31',메모:''},
    {id:2,소속:'평택공장',사번:'PT-3201',이름:'권나래',전환:'DB→DC',연금사:'삼성증권',DB계산종료일:'2026-02-01',담당자:'윤지희',steps:[true,true,true,true,true],청구일:'2026-02-10',월말기한:'2026-02-28',메모:'월말기한 준수 완료'},
    {id:3,소속:'청양공장',사번:'CY-2287',이름:'신유진',전환:'DB→DC',연금사:'미래에셋',DB계산종료일:'2026-03-20',담당자:'김준표',steps:[true,true,true,false,false],청구일:'',월말기한:'2026-03-31',메모:'청구서 작성 중'},
    {id:4,소속:'영동공장',사번:'YD-1190',이름:'조한솔',전환:'DB→DC',연금사:'삼성생명',DB계산종료일:'2026-04-01',담당자:'전수현',steps:[true,true,false,false,false],청구일:'',월말기한:'2026-04-30',메모:'결과 확인 중'},
  ],
  담당자:[
    {소속:'본사',담당자:'피플팀',연락처:'',이메일:''},
    {소속:'평택공장',담당자:'윤지희',연락처:'',이메일:''},
    {소속:'광주공장',담당자:'유은정',연락처:'',이메일:''},
    {소속:'경산공장',담당자:'김보선',연락처:'',이메일:''},
    {소속:'상하공장',담당자:'오종무',연락처:'',이메일:''},
    {소속:'청양공장',담당자:'김준표',연락처:'',이메일:''},
    {소속:'영동공장',담당자:'전수현',연락처:'',이메일:''},
    {소속:'아산공장',담당자:'김다솜',연락처:'',이메일:''},
  ],
};

function addDays(s,n){const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().split('T')[0]}
function daysDiff(s){if(!s)return null;return Math.round((new Date(s+'T00:00:00')-TODAY)/86400000)}
function fmtDate(s){if(!s||s==='-')return '-';const d=new Date(s+'T00:00:00');return`${d.getMonth()+1}/${d.getDate()}`}
function monthEnd(s){const d=new Date(s+'T00:00:00');return new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().split('T')[0]}
function get퇴직Deadline(row){return addDays(row.퇴직일,14)}
function get제도Deadline(row){return row.월말기한||monthEnd(row.DB계산종료일)}
function isComplete(steps){return steps.filter(s=>s!==null).every(s=>s===true)}

function get퇴직Status(row){
  const done=isComplete(row.steps);
  const deadline=get퇴직Deadline(row);
  if(done){
    if(row.청구일){const paid=addDays(row.청구일,2);return paid<=deadline?'기한준수':'기한위반';}
    return '진행완료';
  }
  const diff=daysDiff(deadline);
  if(diff<0)return '기한위반';
  if(diff<=3)return '임박';
  if(diff<=7)return '주의';
  return '정상';
}
function get제도Status(row){
  const done=isComplete(row.steps);
  const deadline=get제도Deadline(row);
  if(done){
    if(row.청구일)return row.청구일<=deadline?'기한준수':'기한초과';
    return '진행완료';
  }
  const diff=daysDiff(deadline);
  if(diff<0)return '기한초과';
  if(diff<=3)return '임박';
  if(diff<=7)return '주의';
  return '정상';
}
function get중도Status(row){return isComplete(row.steps)?'진행완료':'진행중';}
function getStatus(type,row){
  if(type==='퇴직자')return get퇴직Status(row);
  if(type==='제도전환')return get제도Status(row);
  return get중도Status(row);
}

const STATUS_STYLE={
  '기한위반':{bg:'#fff0f0',color:'#c92a2a',dot:'#c92a2a'},
  '기한초과':{bg:'#fff0f0',color:'#c92a2a',dot:'#c92a2a'},
  '임박':{bg:'#fff8e8',color:'#e06c00',dot:'#e06c00'},
  '주의':{bg:'#fffbe8',color:'#a08000',dot:'#d4a000'},
  '기한준수':{bg:'#e8f4ff',color:'#2563ad',dot:'#3b6fd4'},
  '정상':{bg:'#e8f9ee',color:'#1e7a3b',dot:'#2f9e44'},
  '진행완료':{bg:'#e8f9ee',color:'#1e7a3b',dot:'#2f9e44'},
  '진행중':{bg:'#e8f4ff',color:'#2563ad',dot:'#3b6fd4'},
};

function Badge({status,small}){
  const s=STATUS_STYLE[status]||{bg:'#f0f0f0',color:'#666',dot:'#999'};
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,
      padding:small?'2px 7px':'3px 9px',borderRadius:20,
      background:s.bg,color:s.color,fontSize:small?11:12,fontWeight:600,whiteSpace:'nowrap'}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:s.dot,flexShrink:0}}></span>
      {status}
    </span>
  );
}

function ProgressBar({done,total,color}){
  const pct=total>0?Math.round(done/total*100):0;
  return(
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{flex:1,height:6,borderRadius:3,background:'#e8eaf2',overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',background:color||'#3b6fd4',borderRadius:3,transition:'width 0.4s'}}/>
      </div>
      <span style={{fontSize:11,color:'#6b7280',minWidth:36,textAlign:'right'}}>{done}/{total}</span>
    </div>
  );
}

function Modal({title,onClose,children,width}){
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(10,15,40,0.45)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={onClose}>
      <div style={{background:'#fff',borderRadius:12,width:width||460,maxHeight:'90vh',
        overflow:'auto',boxShadow:'0 20px 60px rgba(10,15,40,0.3)'}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'18px 22px',borderBottom:'1px solid #eef0f7'}}>
          <h3 style={{fontSize:15,fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:6,background:'#f0f2f8',
            fontSize:16,color:'#6b7280',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}>×</button>
        </div>
        <div style={{padding:'20px 22px'}}>{children}</div>
      </div>
    </div>
  );
}

function Field({label,children,required}){
  return(
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#6b7280',
        marginBottom:5,textTransform:'uppercase',letterSpacing:'0.04em'}}>
        {label}{required&&<span style={{color:'#c92a2a',marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inp={width:'100%',padding:'8px 10px',border:'1.5px solid #dde0ea',borderRadius:7,
  fontSize:13,outline:'none',color:'#1b2340',background:'#fff'};

// DB제도는 삼성생명 고정
const DC_PENSION_COS=['삼성증권','미래에셋'];

function EditModal({type,row,onClose,onSave}){
  const [form,setForm]=useState({...row});
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  // DB 선택 시 연금사 자동 고정
  function handleJedoChange(e){
    const v=e.target.value;
    setForm(f=>({...f,제도:v,연금사:v==='DB'?'삼성생명':f.연금사==='삼성생명'?'삼성증권':f.연금사}));
  }

  function submit(){
    const required=type==='퇴직자'?['사번','이름','퇴직일']:
                   type==='중도인출'?['사번','이름','신청일']:['사번','이름','DB계산종료일'];
    if(required.some(k=>!form[k])){alert('필수항목을 입력해주세요');return;}
    // Recalculate steps shape if 제도 changed
    let updated={...form,담당자:LOC_MGR[form.소속]||form.담당자};
    if(type==='퇴직자'){
      const isDB=form.제도==='DB';
      const currentSteps=[...form.steps];
      // Resize steps if needed
      if(isDB&&currentSteps.length===5) updated.steps=[...currentSteps,false];
      if(!isDB&&currentSteps.length===6) updated.steps=currentSteps.slice(0,5).concat([null]);
      if(!isDB) updated.steps=updated.steps.map((s,i)=>i===5?null:s);
    }
    if(type==='제도전환'){
      updated.월말기한=monthEnd(form.DB계산종료일);
    }
    onSave(updated);onClose();
  }

  return(
    <Modal title={`정보 수정 — ${row.이름}`} onClose={onClose}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
        <Field label="소속" required>
          <select value={form.소속} onChange={e=>setForm(f=>({...f,소속:e.target.value,담당자:LOC_MGR[e.target.value]||''}))} style={inp}>
            {LOCATIONS.map(l=><option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="담당자">
          <input value={LOC_MGR[form.소속]||form.담당자} readOnly style={{...inp,background:'#f5f6fa',color:'#6b7280'}}/>
        </Field>
        <Field label="사번" required><input value={form.사번} onChange={set('사번')} style={inp}/></Field>
        <Field label="대상자명" required><input value={form.이름} onChange={set('이름')} style={inp}/></Field>

        {type==='퇴직자'&&(
          <Field label="퇴직연금 제도">
            <select value={form.제도} onChange={handleJedoChange} style={inp}>
              <option value="DB">DB (확정급여형)</option>
              <option value="DC">DC (확정기여형)</option>
            </select>
          </Field>
        )}

        <Field label="연금사">
          <select value={form.연금사} onChange={set('연금사')} style={inp}>
              {PENSION_COS.map(p=><option key={p}>{p}</option>)}
            </select>
        </Field>

        {type==='퇴직자'&&<Field label="퇴직일" required><input type="date" value={form.퇴직일} onChange={set('퇴직일')} style={inp}/></Field>}
        {type==='중도인출'&&<Field label="신청일" required><input type="date" value={form.신청일} onChange={set('신청일')} style={inp}/></Field>}
        {type==='제도전환'&&<Field label="DB계산종료일" required><input type="date" value={form.DB계산종료일} onChange={set('DB계산종료일')} style={inp}/></Field>}
      </div>
      <Field label="메모"><textarea value={form.메모||''} onChange={set('메모')} rows={2} style={{...inp,resize:'vertical'}}/></Field>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={{padding:'9px 18px',borderRadius:7,background:'#f0f2f8',fontSize:13,fontWeight:500,color:'#4a5279',border:'none',cursor:'pointer'}}>취소</button>
        <button onClick={submit} style={{padding:'9px 18px',borderRadius:7,background:'#3b6fd4',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>저장</button>
      </div>
    </Modal>
  );
}

function AddModal({type,onClose,onAdd,onGetNextId,managers}){
  const [form,setForm]=useState(()=>({
    소속:'본사',사번:'',이름:'',제도:'DB',연금사:'삼성생명',퇴직일:'',신청일:'',DB계산종료일:'',메모:'',
  }));
  const mgrMap=Object.fromEntries((managers||[]).map(m=>[m.소속,m.담당자]));
  const locations=(managers||[]).map(m=>m.소속);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const mgr=mgrMap[form.소속]||'';
  // DB 선택 시 연금사 자동 고정
  function handleJedoChange(e){
    const v=e.target.value;
    setForm(f=>({...f,제도:v,연금사:v==='DB'?'삼성생명':DC_PENSION_COS[0]}));
  }

  function submit(){
    const required=type==='퇴직자'?['사번','이름','퇴직일']:
                   type==='중도인출'?['사번','이름','신청일']:['사번','이름','DB계산종료일'];
    if(required.some(k=>!form[k])){alert('필수항목을 입력해주세요');return;}
    const newId=onGetNextId();
    const base={id:newId,소속:form.소속,사번:form.사번,이름:form.이름,연금사:form.연금사,담당자:mgr,메모:form.메모,청구일:''};
    let row;
    if(type==='퇴직자'){
      const isDB=form.제도==='DB';
      row={...base,제도:form.제도,퇴직일:form.퇴직일,귀속월:'',steps:[false,false,false,false,false,isDB?false:null]};
    } else if(type==='중도인출'){
      row={...base,신청일:form.신청일,steps:[false,false,false,false,false]};
    } else {
      row={...base,전환:'DB→DC',DB계산종료일:form.DB계산종료일,월말기한:monthEnd(form.DB계산종료일),steps:[false,false,false,false,false]};
    }
    onAdd(row);onClose();
  }
  return(
    <Modal title={`신규 ${type} 등록`} onClose={onClose}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
        <Field label="소속" required>
          <select value={form.소속} onChange={set('소속')} style={inp}>
            {locations.map(l=><option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="담당자">
          <input value={mgr} readOnly style={{...inp,background:'#f5f6fa',color:'#6b7280'}}/>
        </Field>
        <Field label="사번" required><input value={form.사번} onChange={set('사번')} style={inp} placeholder="사번 입력"/></Field>
        <Field label="대상자명" required><input value={form.이름} onChange={set('이름')} style={inp} placeholder="홍길동"/></Field>
        {type==='퇴직자'&&(
          <Field label="퇴직연금 제도">
            <select value={form.제도} onChange={handleJedoChange} style={inp}>
              <option value="DB">DB (확정급여형)</option>
              <option value="DC">DC (확정기여형)</option>
            </select>
          </Field>
        )}
        <Field label="연금사">
          <select value={form.연금사} onChange={set('연금사')} style={inp}>
            {PENSION_COS.map(p=><option key={p}>{p}</option>)}
          </select>
        </Field>
        {type==='퇴직자'&&<Field label="퇴직일" required><input type="date" value={form.퇴직일} onChange={set('퇴직일')} style={inp}/></Field>}
        {type==='중도인출'&&<Field label="신청일" required><input type="date" value={form.신청일} onChange={set('신청일')} style={inp}/></Field>}
        {type==='제도전환'&&<Field label="DB계산종료일" required><input type="date" value={form.DB계산종료일} onChange={set('DB계산종료일')} style={inp}/></Field>}
      </div>
      <Field label="메모">
        <textarea value={form.메모} onChange={set('메모')} rows={2} style={{...inp,resize:'vertical'}}/>
      </Field>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:4}}>
        <button onClick={onClose} style={{padding:'9px 18px',borderRadius:7,background:'#f0f2f8',fontSize:13,fontWeight:500,color:'#4a5279',border:'none',cursor:'pointer'}}>취소</button>
        <button onClick={submit} style={{padding:'9px 18px',borderRadius:7,background:'#3b6fd4',color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>등록</button>
      </div>
    </Modal>
  );
}

// ── DEFAULT PASSWORDS ────────────────────────────────────────────────
const DEFAULT_PASSWORDS={
  '피플팀':'1234',
  '윤지희':'1234',
  '유은정':'1234',
  '김보선':'1234',
  '오종무':'1234',
  '김준표':'1234',
  '전수현':'1234',
  '김다솜':'1234',
};

function LoginScreen({onLogin}){
  const [selected,setSelected]=useState('');
  const [pw,setPw]=useState('');
  const [error,setError]=useState('');
  const [showPw,setShowPw]=useState(false);

  function tryLogin(){
    if(!selected){setError('담당자를 선택해주세요');return;}
    const stored=JSON.parse(localStorage.getItem('rp_passwords')||'{}');
    const correct=stored[selected]||DEFAULT_PASSWORDS[selected]||'';
    if(pw===correct){
      setError('');
      onLogin(selected);
    } else {
      setError('비밀번호가 올바르지 않습니다');
      setPw('');
    }
  }

  function handleKey(e){if(e.key==='Enter')tryLogin();}

  return(
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg,#1b2340 0%,#253060 60%,#1e3a5f 100%)'}}>
      <div style={{width:380,background:'#fff',borderRadius:16,
        boxShadow:'0 24px 80px rgba(0,0,0,0.35)',overflow:'hidden'}}>
        {/* HEADER */}
        <div style={{background:'#1b2340',padding:'32px 32px 24px',textAlign:'center'}}>
          <div style={{width:56,height:56,borderRadius:14,background:'rgba(59,111,212,0.25)',
            border:'2px solid rgba(59,111,212,0.4)',display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:24,margin:'0 auto 14px'}}>🏦</div>
          <div style={{fontSize:18,fontWeight:700,color:'#fff',marginBottom:4}}>퇴직연금 처리현황</div>
          <div style={{fontSize:11,color:'#5a7ab0'}}>PEOPLE TEAM · 인사시스템</div>
        </div>

        {/* FORM */}
        <div style={{padding:'28px 32px 32px'}}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',
              marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>소속 / 담당자</label>
            <select value={selected} onChange={e=>{setSelected(e.target.value);setError('');setPw('');}}
              style={{...inp,padding:'10px 12px',fontSize:13,borderRadius:8,
                borderColor:error&&!selected?'#c92a2a':'#dde0ea'}}>
              <option value=''>선택해주세요</option>
              {Object.entries(LOC_MGR).map(([loc,mgr])=>(
                <option key={mgr} value={mgr}>{loc} — {mgr}</option>
              ))}
            </select>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#6b7280',
              marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>비밀번호</label>
            <div style={{position:'relative'}}>
              <input
                type={showPw?'text':'password'}
                value={pw}
                onChange={e=>{setPw(e.target.value);setError('');}}
                onKeyDown={handleKey}
                placeholder='비밀번호 입력'
                style={{...inp,padding:'10px 40px 10px 12px',fontSize:13,borderRadius:8,
                  borderColor:error?'#c92a2a':'#dde0ea'}}/>
              <button onClick={()=>setShowPw(s=>!s)}
                style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',fontSize:16,color:'#9097b0',padding:4}}>
                {showPw?'🙈':'👁'}
              </button>
            </div>
            {error&&<div style={{marginTop:6,fontSize:11,color:'#c92a2a',fontWeight:500}}>⚠ {error}</div>}
          </div>

          <button onClick={tryLogin}
            style={{width:'100%',padding:'12px',borderRadius:9,background:'#3b6fd4',
              color:'#fff',fontSize:14,fontWeight:700,border:'none',cursor:'pointer',
              transition:'background 0.2s'}}>
            로그인
          </button>

        </div>
      </div>
    </div>
  );
}

// ── PASSWORD CHANGE MODAL ──────────────────────────────────────────────
function PasswordModal({managers,onClose}){
  const stored=JSON.parse(localStorage.getItem('rp_passwords')||'{}');
  const [pws,setPws]=useState(()=>{
    const obj={};
    managers.forEach(m=>{obj[m.담당자]=stored[m.담당자]||DEFAULT_PASSWORDS[m.담당자]||'';});
    return obj;
  });
  const [showPws,setShowPws]=useState({});

  function save(){
    localStorage.setItem('rp_passwords',JSON.stringify(pws));
    alert('비밀번호가 저장됐습니다');
    onClose();
  }

  return(
    <Modal title='담당자 비밀번호 관리' onClose={onClose} width={500}>
      <div style={{fontSize:11,color:'#6b7280',marginBottom:16,padding:'8px 12px',
        borderRadius:7,background:'#fff8e8',border:'1px solid #ffe4a0'}}>
        ⚠ 비밀번호는 이 기기의 브라우저에 저장됩니다. 실서버 운영 시 별도 인증 시스템을 사용하세요.
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {managers.map(m=>(
          <div key={m.담당자} style={{display:'grid',gridTemplateColumns:'100px 1fr 36px',
            gap:8,alignItems:'center'}}>
            <div style={{fontSize:12,fontWeight:600,color:'#1b2340'}}>
              {m.담당자}
              {m.담당자==='피플팀'&&<span style={{marginLeft:4,fontSize:10,color:'#3b6fd4',fontWeight:700}}>관리자</span>}
            </div>
            <input
              type={showPws[m.담당자]?'text':'password'}
              value={pws[m.담당자]||''}
              onChange={e=>setPws(p=>({...p,[m.담당자]:e.target.value}))}
              style={{...inp,padding:'6px 10px',fontSize:12}}
              placeholder='비밀번호 입력'/>
            <button onClick={()=>setShowPws(s=>({...s,[m.담당자]:!s[m.담당자]}))}
              style={{height:34,borderRadius:6,border:'1.5px solid #dde0ea',
                background:'#f5f6fa',cursor:'pointer',fontSize:14,color:'#6b7280'}}>
              {showPws[m.담당자]?'🙈':'👁'}
            </button>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
        <button onClick={onClose} style={{padding:'9px 18px',borderRadius:7,background:'#f0f2f8',
          fontSize:13,fontWeight:500,color:'#4a5279',border:'none',cursor:'pointer'}}>취소</button>
        <button onClick={save} style={{padding:'9px 18px',borderRadius:7,background:'#3b6fd4',
          color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>저장</button>
      </div>
    </Modal>
  );
}


const CSV_TEMPLATES={
  퇴직자:{
    headers:['소속','사번','대상자명','제도','연금사','퇴직일'],
    sample:[
      ['본사','HQ-0001','홍길동','DB','삼성생명','2026-05-01'],
      ['평택공장','PT-0002','김영희','DC','삼성증권','2026-05-03'],
    ],
    requiredFields:['소속','사번','대상자명','제도','연금사','퇴직일'],
    notes:'제도: DB 또는 DC / 연금사: 삼성생명, 삼성증권, 미래에셋 / 날짜: YYYY-MM-DD',
  },
  중도인출:{
    headers:['소속','사번','대상자명','연금사','신청일'],
    sample:[
      ['본사','HQ-0003','이철수','미래에셋','2026-05-05'],
    ],
    requiredFields:['소속','사번','대상자명','연금사','신청일'],
    notes:'연금사: 삼성생명, 삼성증권, 미래에셋 / 날짜: YYYY-MM-DD',
  },
  제도전환:{
    headers:['소속','사번','대상자명','연금사','DB계산종료일'],
    sample:[
      ['경산공장','GS-0004','박지수','삼성생명','2026-04-30'],
    ],
    requiredFields:['소속','사번','대상자명','연금사','DB계산종료일'],
    notes:'월말기한은 DB계산종료일 기준 자동 계산 / 날짜: YYYY-MM-DD',
  },
};

function downloadCSV(filename, headers, rows){
  const bom='\uFEFF';
  const lines=[headers.join(','),...rows.map(r=>r.map(c=>`"${c}"`).join(','))];
  const blob=new Blob([bom+lines.join('\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}

function parseCSV(text){
  const lines=text.trim().split('\n').map(l=>l.trim()).filter(Boolean);
  if(lines.length<2)return{headers:[],rows:[]};
  const parseRow=line=>{
    const result=[];let cur='';let inQ=false;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(c==='"'){inQ=!inQ;}
      else if(c===','&&!inQ){result.push(cur.trim());cur='';}
      else{cur+=c;}
    }
    result.push(cur.trim());
    return result;
  };
  const headers=parseRow(lines[0]);
  const rows=lines.slice(1).map(parseRow);
  return{headers,rows};
}

function BulkUploadModal({type,onClose,onBulkAdd}){
  const tmpl=CSV_TEMPLATES[type];
  const [step,setStep]=useState('upload'); // upload | preview | done
  const [parsed,setParsed]=useState([]);
  const [errors,setErrors]=useState([]);
  const [dragOver,setDragOver]=useState(false);
  const fileRef=useRef();

  function handleFile(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=e=>{
      const text=e.target.result;
      const {headers,rows}=parseCSV(text);
      const errs=[];
      const valid=[];

      // Map headers
      rows.forEach((row,ri)=>{
        const obj={};
        headers.forEach((h,i)=>{obj[h.trim()]=row[i]||'';});
        const rowErrs=[];
        tmpl.requiredFields.forEach(f=>{
          if(!obj[f])rowErrs.push(`${f} 누락`);
        });
        // Validate 소속
        if(obj['소속']&&!LOCATIONS.includes(obj['소속']))rowErrs.push('소속 불일치');
        // Validate 연금사
        if(obj['연금사']&&!PENSION_COS.includes(obj['연금사']))rowErrs.push('연금사 오류');
        // Validate 제도 (퇴직자)
        if(type==='퇴직자'&&obj['제도']&&!['DB','DC'].includes(obj['제도']))rowErrs.push('제도 오류(DB/DC)');
        // Date format
        const dateKey=type==='퇴직자'?'퇴직일':type==='중도인출'?'신청일':'DB계산종료일';
        if(obj[dateKey]&&!/^\d{4}-\d{2}-\d{2}$/.test(obj[dateKey]))rowErrs.push('날짜 형식 오류(YYYY-MM-DD)');

        if(rowErrs.length>0){
          errs.push({row:ri+2,msg:rowErrs.join(', ')});
        } else {
          // Build row
          const mgr=LOC_MGR[obj['소속']]||'';
          const base={id:Date.now()+ri,소속:obj['소속'],사번:obj['사번'],이름:obj['대상자명'],
            연금사:obj['연금사'],담당자:mgr,메모:'',청구일:''};
          let newRow;
          if(type==='퇴직자'){
            const isDB=obj['제도']==='DB';
            newRow={...base,제도:obj['제도'],퇴직일:obj['퇴직일'],귀속월:'',
              steps:[false,false,false,false,false,isDB?false:null]};
          } else if(type==='중도인출'){
            newRow={...base,신청일:obj['신청일'],steps:[false,false,false,false,false]};
          } else {
            newRow={...base,전환:'DB→DC',DB계산종료일:obj['DB계산종료일'],
              월말기한:monthEnd(obj['DB계산종료일']),steps:[false,false,false,false,false]};
          }
          valid.push(newRow);
        }
      });

      setErrors(errs);
      setParsed(valid);
      setStep('preview');
    };
    reader.readAsText(file,'UTF-8');
  }

  function handleDrop(e){
    e.preventDefault();setDragOver(false);
    const file=e.dataTransfer.files[0];
    if(file&&file.name.endsWith('.csv'))handleFile(file);
    else alert('CSV 파일(.csv)만 업로드 가능합니다');
  }

  function confirm(){
    onBulkAdd(parsed);
    setStep('done');
  }

  const dateKey=type==='퇴직자'?'퇴직일':type==='중도인출'?'신청일':'DB계산종료일';

  return(
    <Modal title={`일괄 업로드 — ${type}`} onClose={onClose} width={600}>
      {/* STEP INDICATOR */}
      <div style={{display:'flex',gap:0,marginBottom:20,borderRadius:8,overflow:'hidden',border:'1px solid #dde0ea'}}>
        {[['1','템플릿 다운로드'],['2','파일 업로드'],['3','확인 및 등록']].map(([n,label],i)=>{
          const active=i===(step==='upload'?1:step==='preview'?2:3)-1
            ||(i===0&&step!=='upload');
          const done=i<(step==='upload'?1:step==='preview'?2:3)-1;
          return(
            <div key={n} style={{flex:1,padding:'8px 4px',textAlign:'center',
              background:done?'#3b6fd4':active?'#f0f4ff':'#f8f9fc',
              borderRight:i<2?'1px solid #dde0ea':'none'}}>
              <div style={{fontSize:11,fontWeight:700,
                color:done?'#fff':active?'#3b6fd4':'#9097b0'}}>{done?'✓':n}</div>
              <div style={{fontSize:10,color:done?'rgba(255,255,255,0.8)':active?'#3b6fd4':'#9097b0'}}>{label}</div>
            </div>
          );
        })}
      </div>

      {step==='upload'&&(
        <>
          {/* TEMPLATE DOWNLOAD */}
          <div style={{padding:'14px 16px',borderRadius:8,background:'#f5f7ff',
            border:'1px solid #dde4f7',marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:6,color:'#1b2340'}}>① 업로드 템플릿 다운로드</div>
            <div style={{fontSize:11,color:'#6b7280',marginBottom:10}}>{tmpl.notes}</div>
            <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
              <code style={{fontSize:11,padding:'4px 8px',borderRadius:5,background:'#e8eaf2',color:'#4a5279',fontFamily:'monospace'}}>
                {tmpl.headers.join(', ')}
              </code>
              <button onClick={()=>downloadCSV(`${type}_템플릿.csv`,tmpl.headers,tmpl.sample)}
                style={{padding:'6px 14px',borderRadius:7,background:'#3b6fd4',color:'#fff',
                  fontSize:12,fontWeight:600,border:'none',cursor:'pointer',flexShrink:0}}>
                📥 템플릿 다운로드
              </button>
            </div>
          </div>

          {/* FILE DROP ZONE */}
          <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:'#1b2340'}}>② CSV 파일 업로드</div>
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={handleDrop}
            onClick={()=>fileRef.current.click()}
            style={{border:`2px dashed ${dragOver?'#3b6fd4':'#c5c8d6'}`,borderRadius:10,
              padding:'36px 20px',textAlign:'center',cursor:'pointer',
              background:dragOver?'#f0f4ff':'#fafbff',transition:'all 0.2s',marginBottom:12}}>
            <div style={{fontSize:32,marginBottom:8}}>📂</div>
            <div style={{fontSize:13,fontWeight:600,color:'#4a5279',marginBottom:4}}>
              CSV 파일을 드래그하거나 클릭해서 선택
            </div>
            <div style={{fontSize:11,color:'#9097b0'}}>.csv 파일만 지원 · UTF-8 또는 Excel UTF-8 BOM 권장</div>
            <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}}
              onChange={e=>handleFile(e.target.files[0])}/>
          </div>
        </>
      )}

      {step==='preview'&&(
        <>
          {/* ERROR SUMMARY */}
          {errors.length>0&&(
            <div style={{marginBottom:12,padding:'10px 14px',borderRadius:8,
              background:'#fff5f5',border:'1px solid #ffd0d0'}}>
              <div style={{fontWeight:700,fontSize:12,color:'#c92a2a',marginBottom:6}}>
                ⚠ {errors.length}행에 오류가 있어 제외됩니다
              </div>
              {errors.slice(0,5).map((e,i)=>(
                <div key={i} style={{fontSize:11,color:'#c92a2a'}}>{e.row}행: {e.msg}</div>
              ))}
              {errors.length>5&&<div style={{fontSize:11,color:'#c92a2a'}}>...외 {errors.length-5}건</div>}
            </div>
          )}

          {/* VALID PREVIEW */}
          <div style={{marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:'#1b2340'}}>
              등록 예정: <span style={{color:'#3b6fd4'}}>{parsed.length}건</span>
            </div>
            {parsed.length===0
              ?<div style={{textAlign:'center',padding:'20px',color:'#9097b0',fontSize:12}}>
                  유효한 데이터가 없습니다. 파일을 확인해주세요.
                </div>
              :<div style={{maxHeight:260,overflow:'auto',border:'1px solid #eef0f7',borderRadius:8}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                  <thead>
                    <tr style={{background:'#f5f6fa',borderBottom:'1px solid #eef0f7'}}>
                      {['소속','사번','이름',type==='퇴직자'?'제도':'연금사',dateKey].map(h=>(
                        <th key={h} style={{padding:'7px 10px',textAlign:'left',fontWeight:700,color:'#6b7280'}}>{h}</th>
                      ))}
                      <th style={{padding:'7px 10px',textAlign:'left',fontWeight:700,color:'#6b7280'}}>담당자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((r,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid #f5f6fa'}}>
                        <td style={{padding:'6px 10px'}}>{r.소속}</td>
                        <td style={{padding:'6px 10px',color:'#6b7280'}}>{r.사번}</td>
                        <td style={{padding:'6px 10px',fontWeight:600}}>{r.이름}</td>
                        <td style={{padding:'6px 10px'}}>{type==='퇴직자'?r.제도:r.연금사}</td>
                        <td style={{padding:'6px 10px'}}>{r[dateKey]}</td>
                        <td style={{padding:'6px 10px',color:'#3b6fd4'}}>{r.담당자}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>

          <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:4}}>
            <button onClick={()=>setStep('upload')}
              style={{padding:'9px 16px',borderRadius:7,background:'#f0f2f8',fontSize:12,
                fontWeight:500,color:'#4a5279',border:'none',cursor:'pointer'}}>
              ← 다시 업로드
            </button>
            <button onClick={confirm} disabled={parsed.length===0}
              style={{padding:'9px 20px',borderRadius:7,
                background:parsed.length>0?'#3b6fd4':'#c5c8d6',color:'#fff',
                fontSize:12,fontWeight:600,border:'none',cursor:parsed.length>0?'pointer':'not-allowed'}}>
              {parsed.length}건 등록 확인
            </button>
          </div>
        </>
      )}

      {step==='done'&&(
        <div style={{textAlign:'center',padding:'30px 20px'}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontSize:16,fontWeight:700,color:'#1b2340',marginBottom:6}}>
            {parsed.length}건이 등록됐습니다
          </div>
          <div style={{fontSize:12,color:'#6b7280',marginBottom:20}}>
            각 사업장 담당자가 단계별 처리를 진행할 수 있습니다
          </div>
          <button onClick={onClose}
            style={{padding:'10px 24px',borderRadius:8,background:'#3b6fd4',
              color:'#fff',fontSize:13,fontWeight:600,border:'none',cursor:'pointer'}}>
            닫기
          </button>
        </div>
      )}
    </Modal>
  );
}

function StepGuideModal({stepDefs,onClose}){
  return(
    <Modal title="단계별 업무 가이드" onClose={onClose} width={480}>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {stepDefs.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'12px 14px',
            borderRadius:8,background:'#f5f7ff',border:'1px solid #dde4f7'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'#3b6fd4',color:'#fff',
              fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {i+1}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>
                {s.label}{s.dbOnly&&<span style={{marginLeft:6,fontSize:11,color:'#e06c00',fontWeight:500}}>DB만</span>}
              </div>
              <div style={{color:'#6b7280',fontSize:12}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function TaskRow({row,type,stepDefs,onToggleStep,onUpdateField,onSave,onDelete,isAdmin}){
  const [open,setOpen]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const status=getStatus(type,row);
  const complete=isComplete(row.steps);
  const dateKey=type==='퇴직자'?'퇴직일':type==='중도인출'?'신청일':'DB계산종료일';
  const deadline=type==='퇴직자'?get퇴직Deadline(row):type==='제도전환'?get제도Deadline(row):null;
  const ddays=deadline?daysDiff(deadline):null;
  const isUrgent=!complete&&(status==='기한위반'||status==='기한초과');
  const isWarning=!complete&&status==='임박';

  return(
    <div style={{marginBottom:3,borderRadius:8,overflow:'hidden',background:'#fff',
      boxShadow:'0 1px 3px rgba(27,35,64,0.06)',
      borderLeft:`3px solid ${isUrgent?'#c92a2a':isWarning?'#e06c00':'transparent'}`}}>
      {/* MAIN ROW */}
      <div style={{display:'grid',
        gridTemplateColumns:'34px 88px 120px 54px 70px 96px 1fr 110px',
        alignItems:'center',gap:8,padding:'10px 14px',cursor:'pointer',
        background:complete?'#fafffe':'#fff'}}
        onClick={()=>setOpen(o=>!o)}>

        <span style={{fontSize:11,color:'#9097b0',fontWeight:500}}>{row.id}</span>

        <span style={{fontSize:12,color:'#4a5279',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.소속}</span>

        <div style={{minWidth:0}}>
          <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.이름}</div>
          <div style={{fontSize:10,color:'#9097b0'}}>{row.사번}</div>
        </div>

        <div>
          {type==='퇴직자'
            ?<span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:12,
                background:row.제도==='DB'?'#e8f0ff':'#f0faf5',color:row.제도==='DB'?'#3b6fd4':'#2f9e44'}}>{row.제도}</span>
            :<span style={{fontSize:11,color:'#9097b0'}}>-</span>}
        </div>

        <span style={{fontSize:11,color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.연금사}</span>

        <div>
          <div style={{fontSize:12,color:'#4a5279',fontWeight:500}}>{fmtDate(row[dateKey])}</div>
          {deadline&&!complete&&ddays!=null&&(
            <div style={{fontSize:10,color:ddays<0?'#c92a2a':ddays<=3?'#e06c00':'#9097b0'}}>
              {ddays<0?`D+${Math.abs(ddays)}초과`:`D-${ddays}`}
            </div>
          )}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {stepDefs.map((s,i)=>{
            const v=row.steps[i];
            if(v===null)return null;
            const prevDone=row.steps.slice(0,i).every(x=>x===null||x===true);
            const isNext=!v&&prevDone;
            const sz=27;
            return(
              <React.Fragment key={i}>
                {i>0&&row.steps[i-1]!==null&&(
                  <div style={{width:14,height:2,borderRadius:1,flexShrink:0,
                    background:v?'#3b6fd4':'#dde0ea'}}/>
                )}
                <button
                  title={`${i+1}. ${s.label}\n${s.desc}`}
                  onClick={e=>{e.stopPropagation();onToggleStep(row.id,i);}}
                  style={{width:31,height:31,borderRadius:'50%',fontSize:12,fontWeight:700,
                    display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                    flexShrink:0,border:isNext?'2px solid #3b6fd4':'none',
                    background:v?'#3b6fd4':isNext?'#fff':'#eef0f7',
                    color:v?'#fff':isNext?'#3b6fd4':'#9097b0',
                    boxShadow:v?'0 1px 4px rgba(59,111,212,0.3)':isNext?'0 0 0 3px rgba(59,111,212,0.15)':'none',
                  }}>
                  {v?'✓':i+1}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
          <Badge status={complete?'진행완료':status} small/>
          <span style={{color:'#c5c8d6',fontSize:14,transform:open?'rotate(180deg)':'none',transition:'transform 0.2s',display:'inline-block'}}>▾</span>
        </div>
      </div>

      {/* EXPANDED */}
      {showEdit&&<EditModal type={type} row={row} onClose={()=>setShowEdit(false)} onSave={updated=>onSave(row.id,updated)}/>}
      {open&&(
        <div style={{padding:'14px 18px 16px',borderTop:'1px solid #f0f2f8',background:'#fafbff'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'10px 18px',marginBottom:14}}>
            {deadline&&(
              <div style={{padding:'10px 12px',borderRadius:8,background:'#fff',border:'1px solid #e8eaf2'}}>
                <div style={{fontSize:10,color:'#9097b0',marginBottom:3,fontWeight:600,textTransform:'uppercase'}}>법정기한</div>
                <div style={{fontSize:13,fontWeight:600,color:complete?'#2f9e44':ddays!=null&&ddays<0?'#c92a2a':'#1b2340'}}>
                  {fmtDate(deadline)}
                  {!complete&&ddays!=null&&(
                    <span style={{marginLeft:6,fontSize:11,color:ddays<0?'#c92a2a':ddays<=3?'#e06c00':'#6b7280'}}>
                      ({ddays<0?`${Math.abs(ddays)}일 초과`:`${ddays}일 남음`})
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* 4단계 연금청구 완료 시 또는 다음 단계일 때 청구일 강조 표시 */}
            {(()=>{
              const step3Done=row.steps[3]===true;
              const step3Next=!row.steps[3]&&row.steps.slice(0,3).every(x=>x===null||x===true);
              const highlight=step3Done||step3Next;
              return(
                <div style={{padding:'10px 12px',borderRadius:8,
                  background:highlight?'#fff8e6':'#fff',
                  border:highlight?'2px solid #e06c00':'1px solid #e8eaf2',
                  transition:'all 0.3s',
                  boxShadow:highlight?'0 2px 12px rgba(224,108,0,0.15)':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',
                      color:highlight?'#e06c00':'#9097b0'}}>4단계 청구일</div>
                    {step3Next&&<span style={{fontSize:10,fontWeight:700,color:'#e06c00',
                      background:'#fff0d6',padding:'1px 7px',borderRadius:10}}>★ 입력 필요</span>}
                    {step3Done&&!row.청구일&&<span style={{fontSize:10,fontWeight:700,color:'#c92a2a',
                      background:'#fff0f0',padding:'1px 7px',borderRadius:10}}>미입력</span>}
                  </div>
                  <input type="date" value={row.청구일||''}
                    style={{...inp,padding:'6px 8px',fontSize:12,
                      borderColor:highlight?(row.청구일?'#2f9e44':'#e06c00'):'#dde0ea',
                      background:highlight?'#fff':'#fff',
                      fontWeight:row.청구일?600:400}}
                    onChange={e=>onUpdateField(row.id,'청구일',e.target.value)}
                    onClick={e=>e.stopPropagation()}/>
                  {step3Next&&<div style={{fontSize:10,color:'#e06c00',marginTop:4}}>
                    연금청구 완료 후 반드시 청구일을 입력해주세요
                  </div>}
                </div>
              );
            })()}
            {type==='퇴직자'&&row.제도==='DB'&&(
              <div style={{padding:'10px 12px',borderRadius:8,background:'#fff',border:'1px solid #e8eaf2'}}>
                <div style={{fontSize:10,color:'#9097b0',marginBottom:4,fontWeight:600,textTransform:'uppercase'}}>원천세 귀속월</div>
                <input value={row.귀속월||''} style={{...inp,padding:'4px 8px',fontSize:12}} placeholder="예: 26.04"
                  onChange={e=>onUpdateField(row.id,'귀속월',e.target.value)}
                  onClick={e=>e.stopPropagation()}/>
              </div>
            )}
            {type==='제도전환'&&(
              <div style={{padding:'10px 12px',borderRadius:8,background:'#fff',border:'1px solid #e8eaf2'}}>
                <div style={{fontSize:10,color:'#9097b0',marginBottom:3,fontWeight:600,textTransform:'uppercase'}}>월말기한</div>
                <div style={{fontSize:13,fontWeight:600}}>{fmtDate(row.월말기한)}</div>
              </div>
            )}
            <div style={{padding:'10px 12px',borderRadius:8,background:'#fff',border:'1px solid #e8eaf2'}}>
              <div style={{fontSize:10,color:'#9097b0',marginBottom:3,fontWeight:600,textTransform:'uppercase'}}>담당자</div>
              <div style={{fontSize:13,fontWeight:600}}>{row.담당자}</div>
            </div>
          </div>

          {/* STEP DETAIL BUTTONS */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:'#9097b0',fontWeight:600,marginBottom:8,textTransform:'uppercase'}}>단계별 진행</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {stepDefs.map((s,i)=>{
                const v=row.steps[i];
                if(v===null)return null;
                const prevDone=row.steps.slice(0,i).every(x=>x===null||x===true);
                const isNext=!v&&prevDone;
                return(
                  <button key={i}
                    onClick={e=>{e.stopPropagation();onToggleStep(row.id,i);}}
                    title={s.desc}
                    style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:20,
                      background:v?'#3b6fd4':isNext?'#fff':'#f0f2f8',
                      border:v?'none':isNext?'2px solid #3b6fd4':'1.5px solid #dde0ea',
                      color:v?'#fff':isNext?'#3b6fd4':'#9097b0',
                      fontSize:12,fontWeight:v||isNext?600:400,cursor:'pointer',transition:'all 0.15s'}}>
                    <span style={{width:18,height:18,borderRadius:'50%',
                      background:v?'rgba(255,255,255,0.2)':isNext?'#3b6fd4':'#dde0ea',
                      color:v?'#3b6fd4':isNext?'#fff':'#9097b0',
                      fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {v?'✓':i+1}
                    </span>
                    {s.label}
                    {s.dbOnly&&<span style={{fontSize:10,opacity:0.8}}>(DB)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:'#9097b0',fontWeight:600,marginBottom:4,textTransform:'uppercase'}}>메모</div>
              <textarea value={row.메모||''} rows={2}
                style={{...inp,resize:'vertical',fontSize:12}}
                placeholder="처리 관련 메모"
                onChange={e=>onUpdateField(row.id,'메모',e.target.value)}
                onClick={e=>e.stopPropagation()}/>
            </div>
            {isAdmin&&(
              <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:22,flexShrink:0}}>
                <button onClick={e=>{e.stopPropagation();setShowEdit(true);}}
                  style={{padding:'7px 12px',borderRadius:6,background:'#e8f0ff',color:'#3b6fd4',
                    fontSize:12,fontWeight:600,border:'none',cursor:'pointer'}}>
                  정보 수정
                </button>
                <button onClick={e=>{e.stopPropagation();if(window.confirm(`${row.이름} 항목을 삭제할까요?`))onDelete(row.id);}}
                  style={{padding:'7px 12px',borderRadius:6,background:'#fff0f0',color:'#c92a2a',
                    fontSize:12,fontWeight:500,border:'none',cursor:'pointer'}}>
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskPage({type,rows,stepDefs,onToggleStep,onUpdateField,onSave,onDelete,onAdd,myManager,isAdmin,onGetNextId,managers}){
  const [filterSub,setFilterSub]=useState('전체');
  const [filterStatus,setFilterStatus]=useState('전체');
  const [filterMine,setFilterMine]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [showGuide,setShowGuide]=useState(false);
  const [showBulk,setShowBulk]=useState(false);
  const [search,setSearch]=useState('');
  const [sortDir,setSortDir]=useState('desc'); // 'asc' | 'desc'

  const dateKey=type==='퇴직자'?'퇴직일':type==='중도인출'?'신청일':'DB계산종료일';

  function exportExcel(){
    const bom='\uFEFF';
    const headers=type==='퇴직자'
      ?['No','소속','사번','대상자명','제도','연금사','퇴직일','담당자','1.정산요청','2.결과확인','3.청구서작성','4.연금청구','4단계청구일','5.전표처리','6.원천세(DB)','귀속월','진행상태','메모']
      :type==='중도인출'
      ?['No','소속','사번','대상자명','연금사','신청일','담당자','1.정산요청','2.결과확인','3.청구서작성','4.연금청구','4단계청구일','5.전표처리','진행상태','메모']
      :['No','소속','사번','대상자명','연금사','DB계산종료일','월말기한','담당자','1.정산요청','2.결과확인','3.청구서작성','4.연금청구','4단계청구일','5.전표처리','진행상태','메모'];

    const dataRows=rows.map(r=>{
      const chk=i=>r.steps[i]===true?'✓':r.steps[i]===null?'해당없음':'';
      const status=getStatus(type,r);
      const done=isComplete(r.steps);
      if(type==='퇴직자') return[r.id,r.소속,r.사번,r.이름,r.제도,r.연금사,r.퇴직일,r.담당자,chk(0),chk(1),chk(2),chk(3),r.청구일||'',chk(4),chk(5),r.귀속월||'',done?'진행완료':status,r.메모||''];
      if(type==='중도인출') return[r.id,r.소속,r.사번,r.이름,r.연금사,r.신청일,r.담당자,chk(0),chk(1),chk(2),chk(3),r.청구일||'',chk(4),done?'진행완료':status,r.메모||''];
      return[r.id,r.소속,r.사번,r.이름,r.연금사,r.DB계산종료일,r.월말기한||'',r.담당자,chk(0),chk(1),chk(2),chk(3),r.청구일||'',chk(4),done?'진행완료':status,r.메모||''];
    });

    const lines=[headers.join(','),...dataRows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))];
    const blob=new Blob([bom+lines.join('\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;
    const today=new Date();const ymd=`${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    a.download=`퇴직연금_${type}_${ymd}.csv`;a.click();URL.revokeObjectURL(url);
  }

  const filtered=rows.filter(r=>{
    if(filterMine&&myManager&&r.담당자!==myManager)return false;
    if(filterSub!=='전체'&&r.소속!==filterSub)return false;
    const s=getStatus(type,r);
    const complete=isComplete(r.steps);
    const ds=complete?'진행완료':s;
    if(filterStatus==='진행중'&&ds==='진행완료')return false;
    if(filterStatus==='진행완료'&&ds!=='진행완료')return false;
    if(filterStatus==='긴급'&&!['기한위반','기한초과','임박'].includes(s))return false;
    if(search&&!r.이름.includes(search)&&!r.사번.includes(search))return false;
    return true;
  }).sort((a,b)=>{
    const da=new Date((a[dateKey]||'2099-01-01')+'T00:00:00');
    const db=new Date((b[dateKey]||'2099-01-01')+'T00:00:00');
    return sortDir==='asc'?da-db:db-da;
  });

  const total=rows.length;
  const done=rows.filter(r=>isComplete(r.steps)).length;
  const urgent=rows.filter(r=>{
    const s=getStatus(type,r);
    return['기한위반','기한초과','임박'].includes(s)&&!isComplete(r.steps);
  }).length;

  const subs=['전체',...new Set(rows.map(r=>r.소속))];

  const btnBase={padding:'5px 12px',borderRadius:20,fontSize:12,fontWeight:500,border:'1.5px solid',cursor:'pointer',transition:'all 0.15s'};

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'16px 22px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{display:'flex',gap:8}}>
            {[['전체',total,'#4a5279','#f0f2f8','#dde0ea'],['완료',done,'#2f9e44','#e8f9ee','#c8efd8'],
              ['진행중',total-done,'#3b6fd4','#e8f0ff','#c8d8f8'],
              ...(urgent>0?[['긴급',urgent,'#c92a2a','#fff0f0','#ffc8c8']]:[])]
              .map(([l,v,col,bg,border])=>(
                <div key={l} style={{padding:'8px 16px',borderRadius:8,background:bg,border:`1px solid ${border}`,textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:col}}>{v}</div>
                  <div style={{fontSize:10,color:col,fontWeight:500,opacity:0.8}}>{l}</div>
                </div>
              ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setShowGuide(true)}
              style={{...btnBase,borderColor:'#dde0ea',background:'#fff',color:'#4a5279'}}>
              📖 단계 가이드
            </button>
            {isAdmin&&(
              <div style={{display:'flex',gap:8}}>
                <button onClick={exportExcel}
                  style={{padding:'8px 14px',borderRadius:7,background:'#f0f2f8',color:'#4a5279',
                    fontSize:12,fontWeight:600,border:'1.5px solid #dde0ea',cursor:'pointer'}}>
                  📊 엑셀 다운로드
                </button>
                <button onClick={()=>setShowBulk(true)}
                  style={{padding:'8px 14px',borderRadius:7,background:'#253060',color:'#7aabff',
                    fontSize:12,fontWeight:600,border:'1.5px solid rgba(59,111,212,0.4)',cursor:'pointer'}}>
                  📤 일괄 업로드
                </button>
                <button onClick={()=>setShowAdd(true)}
                  style={{padding:'8px 16px',borderRadius:7,background:'#3b6fd4',color:'#fff',
                    fontSize:12,fontWeight:600,border:'none',cursor:'pointer'}}>
                  + 신규 등록
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12,flexWrap:'wrap'}}>
          {myManager&&(
            <button onClick={()=>setFilterMine(m=>!m)}
              style={{...btnBase,borderColor:filterMine?'#1b2340':'#dde0ea',
                background:filterMine?'#1b2340':'#fff',color:filterMine?'#fff':'#4a5279'}}>
              나의 업무만
            </button>
          )}
          <select value={filterSub} onChange={e=>setFilterSub(e.target.value)}
            style={{padding:'5px 10px',borderRadius:20,border:'1.5px solid #dde0ea',
              fontSize:12,color:'#4a5279',background:'#fff',outline:'none',cursor:'pointer'}}>
            {subs.map(s=><option key={s}>{s}</option>)}
          </select>
          {['전체','진행중','진행완료','긴급'].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              style={{...btnBase,borderColor:filterStatus===s?'#3b6fd4':'#dde0ea',
                background:filterStatus===s?'#3b6fd4':'#fff',color:filterStatus===s?'#fff':'#4a5279',
                fontWeight:filterStatus===s?600:500}}>
              {s}
            </button>
          ))}
          {/* 날짜 정렬 */}
          <button onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')}
            style={{...btnBase,borderColor:'#dde0ea',background:'#fff',color:'#4a5279',
              display:'flex',alignItems:'center',gap:4}}>
            퇴직일/종료일 {sortDir==='asc'?'↑ 오름차순':'↓ 내림차순'}
          </button>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="이름·사번 검색"
            style={{marginLeft:'auto',padding:'5px 12px',borderRadius:20,border:'1.5px solid #dde0ea',
              fontSize:12,outline:'none',width:140}}/>
        </div>

        <div style={{display:'grid',
          gridTemplateColumns:'34px 88px 120px 54px 70px 96px 1fr 110px',
          gap:8,padding:'0 14px 6px',alignItems:'end'}}>
          {['No','소속','대상자','제도','연금사','퇴직일/종료일'].map((h,i)=>(
            <div key={i} style={{fontSize:12,fontWeight:700,color:'#9097b0',textTransform:'uppercase',letterSpacing:'0.05em',lineHeight:'31px'}}>
              {h}
            </div>
          ))}
          {/* Step headers */}
          <div style={{display:'flex',alignItems:'center',gap:12,height:'31px'}}>
            {stepDefs.map((s,i)=>(
              <React.Fragment key={i}>
                {i>0&&<div style={{width:14,height:2,borderRadius:1,background:'#dde0ea',flexShrink:0}}/>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,width:27}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#9097b0',textTransform:'uppercase',
                    letterSpacing:'0.05em',whiteSpace:'nowrap',textAlign:'center'}}>
                    {s.label}{s.dbOnly&&<span style={{color:'#e06c00',marginLeft:1}}>*</span>}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{fontSize:12,fontWeight:700,color:'#9097b0',textTransform:'uppercase',letterSpacing:'0.05em',lineHeight:'31px',textAlign:'right',paddingRight:30}}>상태</div>
        </div>
      </div>

      <div style={{flex:1,overflow:'auto',padding:'0 22px 20px'}}>
        {filtered.length===0
          ?<div style={{textAlign:'center',padding:'60px 0',color:'#9097b0',fontSize:14}}>해당 항목이 없습니다</div>
          :filtered.map(r=>(
            <TaskRow key={r.id} row={r} type={type} stepDefs={stepDefs} isAdmin={isAdmin}
              onToggleStep={onToggleStep} onUpdateField={onUpdateField}
              onSave={onSave} onDelete={onDelete}/>
          ))
        }
      </div>
      {showAdd&&<AddModal type={type} onClose={()=>setShowAdd(false)} onAdd={onAdd} onGetNextId={onGetNextId} managers={managers}/>}
      {showGuide&&<StepGuideModal stepDefs={stepDefs} onClose={()=>setShowGuide(false)}/>}
      {showBulk&&<BulkUploadModal type={type} onClose={()=>setShowBulk(false)} onBulkAdd={rows=>{rows.forEach(r=>onAdd(r));}}/>}
    </div>
  );
}

function Dashboard({data}){
  function summary(rows,type){
    const total=rows.length,done=rows.filter(r=>isComplete(r.steps)).length;
    const urgent=rows.filter(r=>!isComplete(r.steps)&&['기한위반','기한초과','임박'].includes(getStatus(type,r))).length;
    return{total,done,urgent,ongoing:total-done};
  }
  const s퇴=summary(data.퇴직자,'퇴직자');
  const s중=summary(data.중도인출,'중도인출');
  const s제=summary(data.제도전환,'제도전환');

  const typeCards=[
    {label:'퇴직처리',color:'#3b6fd4',bg:'#e8f0ff',bord:'#c8d8f8',icon:'👤',rule:'법정기한: 퇴직일 +14일',...s퇴},
    {label:'중도인출',color:'#e06c00',bg:'#fff4e6',bord:'#ffd9aa',icon:'💸',rule:'법정기한: 없음',...s중},
    {label:'제도전환',color:'#2f9e44',bg:'#e8f9ee',bord:'#c8efd8',icon:'🔄',rule:'법정기한: DB계산종료일 월말',...s제},
  ];

  // 담당자 관리에서 수정된 데이터 기반으로 동적 생성
  const mgrMap=Object.fromEntries(data.담당자.map(m=>[m.소속,m.담당자]));
  const dynamicLocs=[...new Set([
    ...data.퇴직자.map(r=>r.소속),
    ...data.중도인출.map(r=>r.소속),
    ...data.제도전환.map(r=>r.소속),
  ])];

  const locationRows=dynamicLocs.map(loc=>{
    const t=data.퇴직자.filter(r=>r.소속===loc);
    const m=data.중도인출.filter(r=>r.소속===loc);
    const j=data.제도전환.filter(r=>r.소속===loc);
    const urgentT=t.filter(r=>!isComplete(r.steps)&&['기한위반','임박'].includes(get퇴직Status(r))).length;
    const urgentJ=j.filter(r=>!isComplete(r.steps)&&['기한초과','임박'].includes(get제도Status(r))).length;
    return{loc,mgr:mgrMap[loc]||loc,
      퇴직:{total:t.length,done:t.filter(r=>isComplete(r.steps)).length},
      중도:{total:m.length,done:m.filter(r=>isComplete(r.steps)).length},
      전환:{total:j.length,done:j.filter(r=>isComplete(r.steps)).length},
      urgent:urgentT+urgentJ};
  }).filter(r=>r.퇴직.total+r.중도.total+r.전환.total>0);

  const urgentItems=[
    ...data.퇴직자.filter(r=>!isComplete(r.steps)).map(r=>({...r,type:'퇴직자',status:get퇴직Status(r),deadline:get퇴직Deadline(r)})),
    ...data.제도전환.filter(r=>!isComplete(r.steps)).map(r=>({...r,type:'제도전환',status:get제도Status(r),deadline:get제도Deadline(r)})),
  ].filter(r=>['기한위반','기한초과','임박'].includes(r.status))
   .sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));

  return(
    <div style={{height:'100%',overflow:'auto',padding:'20px 22px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {typeCards.map(c=>(
          <div key={c.label} style={{background:'#fff',borderRadius:12,padding:'18px 20px',
            boxShadow:'0 1px 4px rgba(27,35,64,0.07)',border:`1px solid ${c.bord}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div style={{width:36,height:36,borderRadius:8,background:c.bg,
                fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>{c.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{c.label}</div>
                <div style={{fontSize:10,color:'#9097b0'}}>{c.rule}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
              {[['전체',c.total,'#4a5279'],['완료',c.done,'#2f9e44'],['진행중',c.ongoing,c.color]].map(([l,v,col])=>(
                <div key={l} style={{textAlign:'center',padding:'8px 4px',borderRadius:8,background:'#f5f6fa'}}>
                  <div style={{fontSize:22,fontWeight:700,color:col}}>{v}</div>
                  <div style={{fontSize:10,color:'#9097b0',fontWeight:500}}>{l}</div>
                </div>
              ))}
            </div>
            <ProgressBar done={c.done} total={c.total} color={c.color}/>
            {c.urgent>0&&(
              <div style={{marginTop:8,padding:'5px 10px',borderRadius:6,background:'#fff0f0',
                color:'#c92a2a',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
                ⚠ 긴급 처리 필요: {c.urgent}건
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:14}}>
        <div style={{background:'#fff',borderRadius:12,padding:'18px 20px',boxShadow:'0 1px 4px rgba(27,35,64,0.07)'}}>
          <h3 style={{fontSize:13,fontWeight:700,marginBottom:14}}>사업장별 현황</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f5f6fa',borderRadius:8}}>
                {[['사업장',120],['담당자',90],['퇴직처리',90],['중도인출',90],['제도전환',90],['긴급',70]].map(([h,w])=>(
                  <th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:11,fontWeight:700,
                    color:'#6b7280',letterSpacing:'0.03em',width:w}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locationRows.map((r,ri)=>{
                function ProgCell({done,total,color}){
                  if(total===0)return<td style={{padding:'10px 12px',color:'#c5c8d6',fontSize:12}}>—</td>;
                  const pct=Math.round(done/total*100);
                  const allDone=done===total;
                  return(
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{flex:1,height:5,borderRadius:3,background:'#eef0f7',overflow:'hidden',minWidth:40}}>
                          <div style={{width:`${pct}%`,height:'100%',borderRadius:3,
                            background:allDone?'#2f9e44':color||'#3b6fd4',transition:'width 0.4s'}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:600,color:allDone?'#2f9e44':'#4a5279',minWidth:28,textAlign:'right'}}>
                          {done}/{total}
                        </span>
                      </div>
                    </td>
                  );
                }
                return(
                  <tr key={r.loc} style={{borderBottom:'1px solid #f0f2f8',
                    background:ri%2===0?'#fff':'#fafbff'}}>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#1b2340'}}>{r.loc}</div>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:5,
                        padding:'3px 10px',borderRadius:20,background:'#eef0f7'}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:'#3b6fd4',flexShrink:0}}></span>
                        <span style={{fontSize:12,fontWeight:500,color:'#4a5279'}}>{r.mgr}</span>
                      </div>
                    </td>
                    <ProgCell done={r.퇴직.done} total={r.퇴직.total} color='#3b6fd4'/>
                    <ProgCell done={r.중도.done} total={r.중도.total} color='#e06c00'/>
                    <ProgCell done={r.전환.done} total={r.전환.total} color='#2f9e44'/>
                    <td style={{padding:'10px 12px'}}>
                      {r.urgent>0
                        ?<span style={{display:'inline-flex',alignItems:'center',gap:4,
                            background:'#fff0f0',color:'#c92a2a',padding:'3px 10px',
                            borderRadius:20,fontSize:11,fontWeight:700}}>
                            ⚠ {r.urgent}건
                          </span>
                        :<span style={{color:'#c5c8d6',fontSize:13}}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{background:'#fff',borderRadius:12,padding:'18px 20px',boxShadow:'0 1px 4px rgba(27,35,64,0.07)'}}>
          <h3 style={{fontSize:13,fontWeight:700,marginBottom:14}}>
            긴급 처리 필요
            {urgentItems.length>0&&<span style={{marginLeft:8,background:'#c92a2a',color:'#fff',
              fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:10}}>{urgentItems.length}</span>}
          </h3>
          {urgentItems.length===0
            ?<div style={{textAlign:'center',padding:'30px 0',color:'#9097b0',fontSize:13}}>긴급 항목 없음 ✓</div>
            :<div style={{display:'flex',flexDirection:'column',gap:8}}>
              {urgentItems.map((r,idx)=>{
                const diff=daysDiff(r.deadline);
                const doneCount=r.steps.filter(s=>s===true).length;
                const totalCount=r.steps.filter(s=>s!==null).length;
                const nextStep=r.steps.findIndex(s=>s===false);
                const nextLabel=nextStep>=0?STEPS[r.type]?.[nextStep]?.label:'-';
                return(
                  <div key={idx} style={{padding:'10px 12px',borderRadius:8,
                    background:r.status==='기한위반'||r.status==='기한초과'?'#fff5f5':'#fff9ee',
                    border:`1px solid ${r.status==='기한위반'||r.status==='기한초과'?'#ffd0d0':'#ffe4b0'}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                      <div>
                        <span style={{fontWeight:700,fontSize:13}}>{r.이름}</span>
                        <span style={{marginLeft:6,fontSize:11,color:'#9097b0'}}>{r.소속}</span>
                      </div>
                      <Badge status={r.status} small/>
                    </div>
                    <div style={{fontSize:11,color:'#6b7280',marginBottom:3}}>
                      {r.type} · 기한 {fmtDate(r.deadline)} · {diff!=null&&diff<0?`${Math.abs(diff)}일 초과`:`${diff}일 남음`}
                    </div>
                    <div style={{fontSize:11,fontWeight:600,color:'#e06c00'}}>
                      → 다음: {nextLabel} ({doneCount}/{totalCount} 완료)
                    </div>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </div>
  );
}

const NAV_ALL=[
  {id:'dashboard',label:'대시보드',icon:'◼'},
  {id:'퇴직자',label:'퇴직자',icon:'👤'},
  {id:'중도인출',label:'중도인출',icon:'💸'},
  {id:'제도전환',label:'제도전환',icon:'🔄'},
  {id:'담당자',label:'담당자 관리',icon:'👥',adminOnly:true},
];

function Sidebar({page,setPage,myManager,onLogout,isAdmin}){
  const NAV=NAV_ALL.filter(n=>!n.adminOnly||isAdmin);
  return(
    <div style={{width:210,background:'#1b2340',color:'#fff',display:'flex',flexDirection:'column',
      flexShrink:0,height:'100%',overflow:'hidden'}}>
      <div style={{padding:'22px 18px 16px'}}>
        <div style={{fontSize:10,fontWeight:600,color:'#4a5c82',letterSpacing:'0.12em',marginBottom:4}}>PEOPLE TEAM</div>
        <div style={{fontSize:15,fontWeight:700,lineHeight:1.35}}>퇴직연금<br/>처리현황</div>
        <div style={{marginTop:6,fontSize:10,color:'#4a5c82'}}>
          {`${TODAY.getFullYear()}.${String(TODAY.getMonth()+1).padStart(2,'0')}.${String(TODAY.getDate()).padStart(2,'0')} 기준`}
        </div>
      </div>
      <div style={{margin:'0 12px 14px',padding:'10px 12px',borderRadius:8,
        background:isAdmin?'rgba(59,111,212,0.18)':'rgba(47,158,68,0.15)',
        border:`1px solid ${isAdmin?'rgba(59,111,212,0.3)':'rgba(47,158,68,0.25)'}`}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',marginBottom:3,
          color:isAdmin?'#7aabff':'#74d48a',textTransform:'uppercase'}}>
          {isAdmin?'🔑 관리자 (본사)':'👤 사업장 담당자'}
        </div>
        <div style={{fontSize:12,color:'#fff',fontWeight:600,marginBottom:2}}>{myManager}</div>
        <div style={{fontSize:9,color:isAdmin?'#5a8ad4':'#4a9a5a'}}>
          {isAdmin?'등록 · 수정 · 삭제 · 단계처리':'단계처리만 가능'}
        </div>
      </div>
      <nav style={{flex:1,padding:'0 10px'}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 10px',
              borderRadius:7,marginBottom:2,fontSize:13,fontWeight:page===n.id?600:400,
              background:page===n.id?'rgba(59,111,212,0.2)':'transparent',
              color:page===n.id?'#7aabff':'#7a8fba',
              border:page===n.id?'1px solid rgba(59,111,212,0.28)':'1px solid transparent',
              transition:'all 0.15s',textAlign:'left',cursor:'pointer'}}>
            <span style={{fontSize:14}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{fontSize:10,color:'#3a4a6a',lineHeight:1.8,marginBottom:10}}>
          <div>퇴직: 퇴직일 +14일</div>
          <div>제도전환: 월말기한</div>
          <div>중도인출: 기한 없음</div>
        </div>
        <button onClick={onLogout}
          style={{width:'100%',padding:'7px',borderRadius:7,
            background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',
            color:'#7a8fba',fontSize:12,fontWeight:500,cursor:'pointer'}}>
          🚪 로그아웃
        </button>
      </div>
    </div>
  );
}

function ManagersPage({managers,onUpdate,onAddManager,onDeleteManager,isAdmin}){
  const [showPwModal,setShowPwModal]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [addForm,setAddForm]=useState({소속:'',담당자:'',연락처:'',이메일:''});

  function handleAdd(){
    if(!addForm.소속||!addForm.담당자){alert('소속과 담당자명은 필수입니다');return;}
    onAddManager(addForm);
    setAddForm({소속:'',담당자:'',연락처:'',이메일:''});
    setShowAdd(false);
  }

  return(
    <div style={{height:'100%',overflow:'auto',padding:'20px 22px'}}>
      <div style={{background:'#fff',borderRadius:12,padding:'20px',boxShadow:'0 1px 4px rgba(27,35,64,0.07)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:700}}>사업장별 담당자</h3>
          {isAdmin&&(
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowAdd(s=>!s)}
                style={{padding:'7px 14px',borderRadius:7,background:'#3b6fd4',border:'none',
                  fontSize:12,fontWeight:600,color:'#fff',cursor:'pointer'}}>
                + 담당자 추가
              </button>
              <button onClick={()=>setShowPwModal(true)}
                style={{padding:'7px 14px',borderRadius:7,background:'#f0f2f8',border:'1.5px solid #dde0ea',
                  fontSize:12,fontWeight:600,color:'#4a5279',cursor:'pointer'}}>
                🔐 비밀번호 관리
              </button>
            </div>
          )}
        </div>

        {/* 추가 폼 */}
        {showAdd&&(
          <div style={{marginBottom:16,padding:'14px 16px',borderRadius:10,background:'#f5f7ff',border:'1px solid #dde4f7'}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:'#1b2340'}}>신규 담당자 추가</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#9097b0',marginBottom:4}}>소속공장 *</div>
                <input value={addForm.소속} onChange={e=>setAddForm(f=>({...f,소속:e.target.value}))}
                  placeholder="예: 부산공장"
                  style={{...inp,padding:'6px 10px',fontSize:12}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#9097b0',marginBottom:4}}>담당자명 *</div>
                <input value={addForm.담당자} onChange={e=>setAddForm(f=>({...f,담당자:e.target.value}))}
                  placeholder="홍길동"
                  style={{...inp,padding:'6px 10px',fontSize:12}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#9097b0',marginBottom:4}}>연락처</div>
                <input value={addForm.연락처} onChange={e=>setAddForm(f=>({...f,연락처:e.target.value}))}
                  placeholder="010-0000-0000"
                  style={{...inp,padding:'6px 10px',fontSize:12}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:'#9097b0',marginBottom:4}}>이메일</div>
                <input value={addForm.이메일} onChange={e=>setAddForm(f=>({...f,이메일:e.target.value}))}
                  placeholder="email@company.com"
                  style={{...inp,padding:'6px 10px',fontSize:12}}/>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={handleAdd}
                  style={{padding:'7px 14px',borderRadius:7,background:'#3b6fd4',color:'#fff',
                    fontSize:12,fontWeight:600,border:'none',cursor:'pointer',whiteSpace:'nowrap'}}>
                  등록
                </button>
                <button onClick={()=>setShowAdd(false)}
                  style={{padding:'7px 10px',borderRadius:7,background:'#f0f2f8',color:'#4a5279',
                    fontSize:12,border:'none',cursor:'pointer'}}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1.5px solid #eef0f7'}}>
              {['소속공장','담당자','연락처','이메일',...(isAdmin?['']:[''])].map((h,i)=>(
                <th key={i} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,
                  color:'#9097b0',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
              {isAdmin&&<th style={{width:120}}></th>}
            </tr>
          </thead>
          <tbody>
            {managers.map((m,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #f5f6fa',background:editIdx===i?'#f8f9ff':'transparent'}}>
                <td style={{padding:'8px 12px'}}>
                  {editIdx===i
                    ?<input value={m.소속} style={{...inp,padding:'5px 8px',fontSize:12,width:120}}
                        onChange={e=>onUpdate(i,'소속',e.target.value)}/>
                    :<span style={{fontSize:13,fontWeight:600}}>{m.소속}</span>}
                </td>
                <td style={{padding:'8px 12px'}}>
                  {editIdx===i
                    ?<input value={m.담당자} style={{...inp,padding:'5px 8px',fontSize:12,width:100}}
                        onChange={e=>onUpdate(i,'담당자',e.target.value)}/>
                    :<span style={{fontSize:13,color:'#3b6fd4',fontWeight:500}}>{m.담당자}</span>}
                </td>
                <td style={{padding:'8px 12px'}}>
                  <input value={m.연락처} placeholder="010-0000-0000"
                    style={{...inp,padding:'5px 8px',fontSize:12,width:140,
                      background:editIdx===i?'#fff':'#fafbff',
                      borderColor:editIdx===i?'#dde0ea':'transparent'}}
                    readOnly={editIdx!==i}
                    onChange={e=>onUpdate(i,'연락처',e.target.value)}/>
                </td>
                <td style={{padding:'8px 12px'}}>
                  <input value={m.이메일} placeholder="example@company.com"
                    style={{...inp,padding:'5px 8px',fontSize:12,width:200,
                      background:editIdx===i?'#fff':'#fafbff',
                      borderColor:editIdx===i?'#dde0ea':'transparent'}}
                    readOnly={editIdx!==i}
                    onChange={e=>onUpdate(i,'이메일',e.target.value)}/>
                </td>
                {isAdmin&&(
                  <td style={{padding:'8px 12px'}}>
                    <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                      {editIdx===i
                        ?<button onClick={()=>setEditIdx(null)}
                            style={{padding:'5px 12px',borderRadius:6,background:'#3b6fd4',color:'#fff',
                              fontSize:11,fontWeight:600,border:'none',cursor:'pointer'}}>
                            저장
                          </button>
                        :<button onClick={()=>setEditIdx(i)}
                            style={{padding:'5px 12px',borderRadius:6,background:'#e8f0ff',color:'#3b6fd4',
                              fontSize:11,fontWeight:600,border:'none',cursor:'pointer'}}>
                            수정
                          </button>
                      }
                      <button onClick={()=>{
                          if(window.confirm(`${m.담당자}(${m.소속}) 담당자를 삭제할까요?`))onDeleteManager(i);
                        }}
                        style={{padding:'5px 10px',borderRadius:6,background:'#fff0f0',color:'#c92a2a',
                          fontSize:11,fontWeight:500,border:'none',cursor:'pointer'}}>
                        삭제
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPwModal&&<PasswordModal managers={managers} onClose={()=>setShowPwModal(false)}/>}
    </div>
  );
}

function App(){
  const [data,setData]=useState(()=>{
    try{const s=localStorage.getItem('rp_v2');return s?JSON.parse(s):INIT_DATA;}
    catch{return INIT_DATA;}
  });
  const [page,setPage]=useState('dashboard');
  const [loggedInManager,setLoggedInManager]=useState(()=>sessionStorage.getItem('rp_login')||'');

  useEffect(()=>{localStorage.setItem('rp_v2',JSON.stringify(data));},[data]);

  function handleLogin(manager){
    setLoggedInManager(manager);
    sessionStorage.setItem('rp_login',manager);
  }

  function handleLogout(){
    setLoggedInManager('');
    sessionStorage.removeItem('rp_login');
    setPage('dashboard');
  }

  function toggleStep(type,id,idx){
    setData(d=>{
      const rows=d[type].map(r=>{
        if(r.id!==id)return r;
        const steps=[...r.steps];
        if(steps[idx]===null)return r;
        if(steps[idx]){
          for(let i=idx;i<steps.length;i++){if(steps[i]!==null)steps[i]=false;}
        } else {
          for(let i=0;i<=idx;i++){if(steps[i]!==null)steps[i]=true;}
        }
        return{...r,steps};
      });
      return{...d,[type]:rows};
    });
  }

  function updateField(type,id,key,val){
    setData(d=>({...d,[type]:d[type].map(r=>r.id===id?{...r,[key]:val}:r)}));
  }
  function saveRow(type,id,updated){
    setData(d=>({...d,[type]:d[type].map(r=>r.id===id?{...r,...updated}:r)}));
  }
  function deleteRow(type,id){
    setData(d=>({...d,[type]:d[type].filter(r=>r.id!==id)}));
  }
  function addRow(type,row){
    setData(d=>({...d,[type]:[...d[type],row]}));
  }
  function getNextId(type){
    const rows=data[type];
    if(!rows||rows.length===0)return 1;
    const maxId=Math.max(...rows.map(r=>typeof r.id==='number'?r.id:0));
    return isFinite(maxId)?maxId+1:rows.length+1;
  }
  function updateManager(idx,key,val){
    setData(d=>{const mgrs=[...d.담당자];mgrs[idx]={...mgrs[idx],[key]:val};return{...d,담당자:mgrs};});
  }
  function addManager(mgr){
    setData(d=>({...d,담당자:[...d.담당자,{소속:mgr.소속,담당자:mgr.담당자,연락처:mgr.연락처||'',이메일:mgr.이메일||''}]}));
  }
  function deleteManager(idx){
    setData(d=>({...d,담당자:d.담당자.filter((_,i)=>i!==idx)}));
  }

  if(!loggedInManager){
    return <LoginScreen onLogin={handleLogin}/>;
  }

  const isAdmin=loggedInManager==='피플팀';
  const PAGE_TITLE={dashboard:'대시보드',퇴직자:'퇴직자 처리',중도인출:'중도인출 처리',제도전환:'제도전환 (DB→DC)',담당자:'담당자 관리'};

  return(
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <Sidebar page={page} setPage={setPage} myManager={loggedInManager} onLogout={handleLogout} isAdmin={isAdmin}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:48,borderBottom:'1px solid #e8eaf2',background:'#fff',
          display:'flex',alignItems:'center',padding:'0 22px',flexShrink:0,gap:12}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#1b2340'}}>{PAGE_TITLE[page]}</h2>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,
            padding:'4px 12px',borderRadius:20,
            background:isAdmin?'#e8f0ff':'#e8f9ee',
            fontSize:12,color:isAdmin?'#3b6fd4':'#2f9e44',fontWeight:600}}>
            <span style={{width:7,height:7,borderRadius:'50%',
              background:isAdmin?'#3b6fd4':'#2f9e44',display:'inline-block'}}></span>
            {loggedInManager} {isAdmin?'(관리자)':'(담당자)'}
          </div>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          {page==='dashboard'&&<Dashboard data={data}/>}
          {['퇴직자','중도인출','제도전환'].includes(page)&&(
            <TaskPage type={page} rows={data[page]} stepDefs={STEPS[page]}
              myManager={loggedInManager} isAdmin={isAdmin}
              managers={data.담당자}
              onToggleStep={(id,idx)=>toggleStep(page,id,idx)}
              onUpdateField={(id,k,v)=>updateField(page,id,k,v)}
              onSave={(id,updated)=>saveRow(page,id,updated)}
              onDelete={id=>deleteRow(page,id)}
              onAdd={row=>addRow(page,row)}
              onGetNextId={()=>getNextId(page)}/>
          )}
          {page==='담당자'&&<ManagersPage managers={data.담당자} onUpdate={updateManager} onAddManager={addManager} onDeleteManager={deleteManager} isAdmin={isAdmin}/>}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
