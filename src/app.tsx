import React from 'react';
import { useState, useRef, useEffect } from "react";
import { getTudus, createTudu, updateTudu, deleteTudu, getPageContent, updatePageContent, type Tudu, type Subtarea } from "./supabase";
import { CheckSquare, Lightbulb, ChatCircle, Envelope, Users, ShoppingCart, Phone, MagnifyingGlass, Star, Lightning, Briefcase, Wallet, Heartbeat, GridFour, Gear, SignOut, Tray, ArrowsClockwise } from "@phosphor-icons/react";

const BRAND = "#75b0e4";

const TUDU_TYPES = ["📋 Tarea","💡 Idea","💬 WhatsApp","✉ Mail","👥 Teams","🛒 Compra","📞 Llamada","🎯 Decisión","🔁 Hábito","📚 Aprender","💭 Reflexionar","🔎 Investigar","💪 Ejercicio","✍ Redactar","📊 Analizar"];
const ESTADOS_DEFAULT = ["Por hacer","Empezada","Terminando","Esperando","Listo","No lo haré"];
const CATEGORIAS_NAMES = ["My Work","Setup Base","House & Car","Financial","Family","Social & Experiences","Skills","Health","Mindset","Inbox"];
const CUANDO = ["Sin fecha","Hoy","Mañana","Esta semana","Próxima semana","Este mes","Algún día"];

const toISO = (d: Date) => d.toISOString().split("T")[0];
const toLocal = (iso: string) => { const [y,m,dd]=iso.split("-"); return `${+dd}/${+m}/${y}`; };
const calcDate = (c) => {
  const d = new Date();
  if(c==="Hoy") return toISO(d);
  if(c==="Mañana"){d.setDate(d.getDate()+1);return toISO(d);}
  if(c==="Esta semana"){d.setDate(d.getDate()+7);return toISO(d);}
  if(c==="Próxima semana"){d.setDate(d.getDate()+14);return toISO(d);}
  if(c==="Este mes"){d.setMonth(d.getMonth()+1);return toISO(d);}
  if(c==="Algún día"){d.setMonth(d.getMonth()+3);return toISO(d);}
  return null;
};

const CATS_INIT = [
  {id:1,name:"My Work",              icon:"Briefcase",    badge:7},
  {id:2,name:"Setup Base",           icon:"Lightning",    badge:3},
  {id:3,name:"House & Car",          icon:"ShoppingCart", badge:2},
  {id:4,name:"Financial",            icon:"Wallet",       badge:1},
  {id:5,name:"Family",               icon:"Users",        badge:4},
  {id:6,name:"Social & Experiences", icon:"ChatCircle",   badge:2},
  {id:7,name:"Skills",               icon:"Lightbulb",    badge:2},
  {id:8,name:"Health",               icon:"HeartPulse",   badge:5},
  {id:9,name:"Mindset",              icon:"Star",         badge:1},
];

const PCOLORS = [
  {bg:"#FEF08A",tx:"#713F12"},{bg:"#E9D5FF",tx:"#4C1D95"},{bg:"#BAE6FD",tx:"#0C4C5C"},
  {bg:"#BBF7D0",tx:"#14532D"},{bg:"#FED7AA",tx:"#7C2D12"},{bg:"#CCFBF1",tx:"#134E4A"},{bg:"#FCA5A5",tx:"#7F1D1D"},
];

const SBADGE = {
  "En curso":{bg:"#DCFCE7",tx:"#166534"},"Empezada":{bg:"#FEF9C3",tx:"#854D0E"},
  "Por hacer":{bg:"#DBEAFE",tx:"#1E40AF"},"Esperando":{bg:"#FEF3C7",tx:"#92400E"},
  "Terminando":{bg:"#CCFBF1",tx:"#134E4A"},"Listo":{bg:"#DCFCE7",tx:"#166534"},
  "No lo haré":{bg:"#F3F4F6",tx:"#6B7280"},
};

const TIPO_EMOJI: Record<string,string> = {
  "Tarea":"📋","Idea":"💡","WhatsApp":"💬","Mail":"✉","Teams":"👥","Compra":"🛒",
  "Llamada":"📞","Decisión":"🎯","Hábito":"🔁","Aprender":"📚","Reflexionar":"💭",
  "Investigar":"🔎","Ejercicio":"💪","Redactar":"✍","Analizar":"📊",
};
const TIPO_ICONO: Record<string,string> = {
  "Tarea":"CheckSquare","Idea":"Lightbulb","WhatsApp":"ChatCircle","Mail":"Envelope","Teams":"Users",
  "Compra":"ShoppingCart","Llamada":"Phone","Decisión":"Star","Hábito":"ArrowsClockwise",
  "Aprender":"Lightbulb","Reflexionar":"ChatCircle","Investigar":"MagnifyingGlass",
  "Ejercicio":"Heartbeat","Redactar":"Briefcase","Analizar":"GridFour",
};
function tuduToPool(t: Tudu, i: number) {
  return { id:t.id, type:`${TIPO_EMOJI[t.tipo]||"📋"} ${t.tipo}`, title:t.title, cat:t.categoria, c:PCOLORS[i % PCOLORS.length], cuando:t.cuando, estado:t.estado };
}
const SLOT_TO_CUANDO: Record<string,string> = {"Hoy":"Hoy","Mañana / Pasado":"Mañana","Esta semana":"Esta semana","Próxima semana":"Próxima semana"};
const CUANDO_TO_SLOT: Record<string,string> = {"Hoy":"Hoy","Mañana":"Mañana / Pasado","Esta semana":"Esta semana","Próxima semana":"Próxima semana"};

const KANBAN_INIT = {
  "Por hacer":[{id:10,type:"🔎 Investigar",title:"Auditoría procesos",date:"Este mes",lc:"#93C5FD"},{id:11,type:"✉ Mail",title:"Responder propuestas",date:"Mañana",lc:"#93C5FD"}],
  "Empezada": [{id:12,type:"📊 Analizar",  title:"Presupuesto Q2",   date:"Esta semana",lc:"#FCD34D"}],
  "En curso": [{id:13,type:"📋 Tarea",     title:"Reunión con equipo",date:"Hoy",       lc:"#6EE7B7"}],
  "Esperando":[{id:14,type:"👥 Teams",     title:"1:1 con María",    date:"Próx. semana",lc:"#C4B5FD"}],
  "Listo":    [{id:15,type:"📋 Tarea",     title:"Onboarding dev",   date:"Ayer",       lc:"#86EFAC"}],
};
const KPLAN_INIT = {
  "Vencido":        [{id:20,type:"📋 Tarea",  title:"Llamar al seguro",  date:"Hace 3 días",lc:"#FCA5A5"}],
  "Hoy":            [{id:21,type:"📋 Tarea",  title:"Reunión con equipo",date:"En curso",   lc:"#6EE7B7"}],
  "Mañana / Pasado":[{id:22,type:"💪 Ejercicio",title:"Ir al gym",       date:"Por hacer",  lc:"#86EFAC"}],
  "Esta semana":    [{id:23,type:"📊 Analizar",title:"Presupuesto Q2",   date:"Empezada",   lc:"#FCD34D"}],
  "Próxima semana": [{id:24,type:"👥 Teams",  title:"1:1 con María",    date:"Esperando",  lc:"#C4B5FD"}],
  "Sin fecha":      [{id:25,type:"🛒 Compra", title:"Renovar seguro",   date:"Por hacer",  lc:"#D1D5DB"}],
};
const CANVAS_INIT = [
  {id:1,type:"📋 Tarea",   title:"Reunión con equipo",  status:"En curso", date:"Hoy",           x:20, y:16, bg:"#FEF08A",tx:"#713F12"},
  {id:2,type:"📊 Analizar",title:"Presupuesto Q2",      status:"Empezada", date:"Esta semana",   x:185,y:28, bg:"#E9D5FF",tx:"#4C1D95"},
  {id:3,type:"✉ Mail",     title:"Responder propuestas",status:"Por hacer",date:"Mañana",        x:330,y:18, bg:"#BAE6FD",tx:"#0C4C5C"},
  {id:4,type:"🔎 Investigar",title:"Auditoría",         status:"Por hacer",date:"Este mes",      x:65, y:175,bg:"#BBF7D0",tx:"#14532D"},
  {id:5,type:"👥 Teams",   title:"1:1 con María",       status:"Esperando",date:"Próxima semana",x:245,y:178,bg:"#FED7AA",tx:"#7C2D12"},
];
const GANTT_INIT = [
  {id:1,title:"Reunión con equipo",status:"En curso", color:PCOLORS[0].bg,startDay:-1,endDay:1},
  {id:2,title:"Presupuesto Q2",    status:"Empezada", color:PCOLORS[1].bg,startDay:-3,endDay:8},
  {id:3,title:"Auditoría",         status:"Por hacer",color:PCOLORS[2].bg,startDay:2, endDay:10},
  {id:4,title:"1:1 con María",     status:"Esperando",color:PCOLORS[4].bg,startDay:5, endDay:7},
];
const SCALE_COLS = {semana:7,quincena:15,mes:30};

const ALL_TASKS = [
  {id:1, title:"Reunión con equipo",   type:"📋",color:PCOLORS[0].bg},
  {id:2, title:"Presupuesto Q2",       type:"📊",color:PCOLORS[1].bg},
  {id:3, title:"Responder propuestas", type:"✉", color:PCOLORS[2].bg},
  {id:4, title:"Auditoría",            type:"🔎",color:PCOLORS[3].bg},
  {id:5, title:"1:1 con María",        type:"👥",color:PCOLORS[4].bg},
  {id:6, title:"Arreglar canilla",     type:"📋",color:PCOLORS[0].bg},
  {id:7, title:"Leer sobre hábitos",   type:"📚",color:PCOLORS[1].bg},
  {id:8, title:"Meditación matutina",  type:"💭",color:PCOLORS[3].bg},
];
const FOCUS_INIT = [
  {id:1,title:"Reunión con equipo",type:"📋",color:PCOLORS[0].bg,secs:0},
  {id:2,title:"Presupuesto Q2",    type:"📊",color:PCOLORS[1].bg,secs:0},
];

// ── Theme ─────────────────────────────────────────────────────────────────────
function th(dark) {
  return dark
    ? {bg:"#0f172a",surface:"#1e293b",surface2:"#273548",border:"#334155",border2:"#475569",text:"#F1F5F9",textMuted:"#94A3B8",textFaint:"#64748B"}
    : {bg:"#F9FAFB",surface:"#ffffff",surface2:"#F9FAFB",border:"#E5E7EB",border2:"#D1D5DB",text:"#111827",textMuted:"#6B7280",textFaint:"#9CA3AF"};
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [m,setM] = useState(window.innerWidth < 640);
  useEffect(()=>{
    const fn = ()=>setM(window.innerWidth < 640);
    window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);
  return m;
}
// ── Global Toast ─────────────────────────────────────────────────────────────
type ToastType = "loading"|"success"|"error";
type ToastEntry = {id:number,msg:string,type:ToastType};
const ToastCtx = React.createContext<(msg:string,type?:ToastType,duration?:number)=>number>(()=>0);
const ToastUpdateCtx = React.createContext<(id:number,msg:string,type?:ToastType,duration?:number)=>void>(()=>{});
function useGlobalToast(){ return {show:React.useContext(ToastCtx), update:React.useContext(ToastUpdateCtx)}; }
let _toastId=0;
function GlobalToastProvider({children}:{children:React.ReactNode}){
  const [toasts,setToasts]=useState<ToastEntry[]>([]);
  const timers=useRef<Record<number,ReturnType<typeof setTimeout>>>({});
  const show=React.useCallback((msg:string,type:ToastType="success",duration=3000)=>{
    const id=++_toastId;
    setToasts(p=>[...p,{id,msg,type}]);
    if(type!=="loading"){ timers.current[id]=setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),duration); }
    return id;
  },[]);
  const update=React.useCallback((id:number,msg:string,type:ToastType="success",duration=3000)=>{
    if(timers.current[id]) clearTimeout(timers.current[id]);
    setToasts(p=>p.map(t=>t.id===id?{...t,msg,type}:t));
    timers.current[id]=setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),duration);
  },[]);
  const ICON:Record<ToastType,string>={"loading":"⏳","success":"✓","error":"✗"};
  const BG:Record<ToastType,string>={"loading":"#1e293b","success":"#1e293b","error":"#7F1D1D"};
  return (
    <ToastCtx.Provider value={show}>
    <ToastUpdateCtx.Provider value={update}>
      {children}
      {toasts.map((t,i)=>(
        <div key={t.id} role="status" aria-live="polite"
          style={{position:"fixed",bottom:72+(i*44),left:"50%",transform:"translateX(-50%)",background:BG[t.type],color:"#fff",padding:"8px 18px",borderRadius:10,fontSize:14,zIndex:9999,pointerEvents:"none",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 16px rgba(0,0,0,0.3)",fontWeight:500}}>
          <span style={{fontSize:15}}>{ICON[t.type]}</span>{t.msg}
        </div>
      ))}
    </ToastUpdateCtx.Provider>
    </ToastCtx.Provider>
  );
}
function useEscapeKey(fn) {
  useEffect(()=>{
    const h = e=>{if(e.key==="Escape")fn();};
    document.addEventListener("keydown",h);
    return ()=>document.removeEventListener("keydown",h);
  },[fn]);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const PHO_MAP: Record<string, React.ElementType> = {
  CheckSquare, Lightbulb, ChatCircle, Envelope, Users, ShoppingCart,
  Phone, MagnifyingGlass, MagGlass: MagnifyingGlass, Star, Lightning,
  Briefcase, Wallet, HeartPulse: Heartbeat, Heartbeat, GridFour, Gear, SignOut, Tray, ArrowsClockwise,
};
const PHO_KEYS = Object.keys(PHO_MAP).filter(k => k !== "MagGlass");

function Icon({name,size=16,color}: {name:string,size?:number,color?:string}) {
  const IconComp = PHO_MAP[name] || CheckSquare;
  return <IconComp size={size} color={color||"currentColor"} />;
}
function IconPicker({value,onChange}) {
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {PHO_KEYS.map(k=>(
        <button key={k} type="button" aria-label={k} onClick={()=>onChange(k)}
          style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
            border:"1px solid",borderColor:value===k?BRAND:"#E5E7EB",
            background:value===k?"rgba(117,176,228,0.12)":"transparent",color:value===k?BRAND:"#6B7280"}}>
          <Icon name={k} size={14}/>
        </button>
      ))}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function SBadge({s}) {
  const c = SBADGE[s]||{bg:"#F3F4F6",tx:"#6B7280"};
  return <span style={{fontSize:11,padding:"2px 6px",borderRadius:4,background:c.bg,color:c.tx}}>{s}</span>;
}
function Btn({children,onClick,ghost,sm,style:sx={},type="button"}) {
  return (
    <button type={type} onClick={onClick} style={{borderRadius:8,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:"none",
      fontSize:sm?11:12,padding:sm?"3px 10px":"5px 12px",
      background:ghost?"#F3F4F6":BRAND,color:ghost?"#6B7280":"#fff",
      ...(ghost?{border:"1px solid #E5E7EB"}:{}),...sx}}>
      {children}
    </button>
  );
}
function Overlay({onClose,dark:dk,titleId,children}) {
  const c = th(dk||false);
  useEscapeKey(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId}
      onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:14,width:480,maxWidth:"95vw",padding:20,maxHeight:"88vh",overflowY:"auto",color:c.text,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        {children}
      </div>
    </div>
  );
}
function Fld({label,id,children}) {
  return (
    <div style={{marginBottom:10}}>
      <label htmlFor={id} style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:"#9CA3AF",marginBottom:3,display:"block"}}>{label}</label>
      {children}
    </div>
  );
}
function Inp({id,dark:dk,...props}) {
  const c = th(dk||false);
  return <input id={id} {...props} style={{width:"100%",padding:"8px 12px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:8,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit",...(props.style||{})}}/>;
}
function Sel({id,dark:dk,children,...props}) {
  const c = th(dk||false);
  return <select id={id} {...props} style={{width:"100%",padding:"8px 12px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:8,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit"}}>{children}</select>;
}
// ── WYSIWYG ───────────────────────────────────────────────────────────────────
const ED_TOOLS = [
  {icon:"B",cmd:"bold"},{icon:"I",cmd:"italic"},{icon:"U",cmd:"underline"},
  {icon:"H2",cmd:"formatBlock",val:"h3"},{icon:"¶",cmd:"formatBlock",val:"p"},
  {icon:"•",cmd:"insertUnorderedList"},{icon:"1.",cmd:"insertOrderedList"},
  {icon:"🔗",cmd:"createLink",prompt:"URL:"},{icon:"—",cmd:"insertHorizontalRule"},{icon:"✕",cmd:"removeFormat"},
];
function WysiwygEditor({placeholder,id,dark:dk}) {
  const c = th(dk||false);
  const ref = useRef(null);
  const exec = t=>{
    ref.current?.focus();
    if(t.prompt){const u=window.prompt(t.prompt);if(u)document.execCommand(t.cmd,false,u);}
    else document.execCommand(t.cmd,false,t.val||null);
  };
  return (
    <div style={{border:`1px solid ${c.border}`,borderRadius:8,overflow:"hidden"}}>
      <div role="toolbar" aria-label="Formato" style={{display:"flex",flexWrap:"wrap",gap:2,padding:"4px 6px",borderBottom:`1px solid ${c.border}`,background:c.surface2}}>
        {ED_TOOLS.map(t=>(
          <button key={t.icon} type="button" aria-label={t.icon} onMouseDown={e=>{e.preventDefault();exec(t);}}
            style={{padding:"2px 6px",fontSize:13,borderRadius:4,cursor:"pointer",border:"none",background:"transparent",color:c.textMuted,fontFamily:"monospace",minWidth:24}}
            onMouseOver={e=>e.currentTarget.style.background=c.border}
            onMouseOut={e=>e.currentTarget.style.background="transparent"}>{t.icon}</button>
        ))}
      </div>
      <div ref={ref} id={id} contentEditable suppressContentEditableWarning
        role="textbox" aria-multiline="true" data-placeholder={placeholder||"Escribí acá..."}
        style={{minHeight:100,padding:"8px 12px",fontSize:14,lineHeight:1.7,outline:"none",color:c.text,background:c.surface}}/>
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:${c.textFaint};pointer-events:none}[contenteditable] h3{font-size:13px;font-weight:600;margin:4px 0}[contenteditable] ul{list-style:disc;padding-left:18px;margin:4px 0}[contenteditable] ol{list-style:decimal;padding-left:18px;margin:4px 0}[contenteditable] a{color:#3B82F6;text-decoration:underline}[contenteditable] strong{font-weight:700}[contenteditable] em{font-style:italic}*:focus-visible{outline:2px solid ${BRAND};outline-offset:2px}`}</style>
    </div>
  );
}

// ── DatePicker (campo Fecha unificado — siempre visible, sin popup) ──────────
const CUANDO_PICKER = ["Sin fecha","Hoy","Mañana","Esta semana","Próxima semana","Este mes","Algún día","Fecha exacta"];
function DatePicker({cuando,deadline,onChange,dark:dk}) {
  const c = th(dk||false);
  const todayISO = toISO(new Date());
  // Derive internal cuando: if parent has a relative cuando, use it; if only deadline, "Fecha exacta"
  const cuandoVal = cuando && cuando!=="Sin fecha" ? cuando : (deadline ? "Fecha exacta" : "Sin fecha");
  // Dropdown → auto-calc date and sync to calendar
  const handleCuandoChange=(val:string)=>{
    if(val==="Sin fecha"){ onChange("Sin fecha",null); }
    else if(val==="Fecha exacta"){ onChange("Sin fecha",deadline||todayISO); }
    else { const calc=calcDate(val); onChange(val,calc||null); }
  };
  // Calendar → set dropdown to "Fecha exacta"
  const handleDateChange=(val:string)=>{
    if(val){ onChange("Sin fecha",val); }
    else { onChange("Sin fecha",null); }
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <select value={cuandoVal} onChange={e=>handleCuandoChange(e.target.value)}
        style={{width:"100%",padding:"6px 10px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:6,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit"}}>
        {CUANDO_PICKER.map(v=><option key={v} style={{background:c.surface,color:c.text}}>{v}</option>)}
      </select>
      <input type="date" value={deadline||""} onChange={e=>handleDateChange(e.target.value)}
        min={todayISO}
        style={{width:"100%",padding:"6px 10px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:6,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit",colorScheme:dk?"dark":"light"}}/>
    </div>
  );
}

// ── TuduForm ──────────────────────────────────────────────────────────────────
function TuduForm({title:formTitle,action,onClose,onCreated,editTudu,dark:dk,defaultCat}) {
  const c = th(dk||false);
  const et = editTudu;
  const [nombre,setNombre]     = useState(et?.title||"");
  const [tipo,setTipo]         = useState(et?.tipo||"Tarea");
  const [cat,setCat]           = useState(et?.categoria||defaultCat||CATEGORIAS_NAMES[0]);
  const [estado,setEstado]     = useState(et?.estado||ESTADOS_DEFAULT[0]);
  const [cuando,setCuando]     = useState(et?.cuando||"Sin fecha");
  const [deadline,setDeadline] = useState(et?.deadline||"");
  const [tags,setTags]         = useState(et?.etiquetas?.join(", ")||"");
  const [contenido,setContenido] = useState(et?.contenido||"");
  const [saving,setSaving]     = useState(false);
  const titleId = "form-title-"+action;
  const TIPOS_CLEAN = TUDU_TYPES.map(t=>t.replace(/^.+\s/,""));

  const handleSubmit = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const data: any = {
        title: nombre.trim(), tipo, categoria: cat, estado, cuando,
        deadline: deadline || null,
        etiquetas: tags.split(",").map(t=>t.trim()).filter(Boolean),
        contenido,
      };
      if(et?.id) await updateTudu(et.id, data);
      else await createTudu(data);
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Error guardando tudú:", err);
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose} dark={dk} titleId={titleId}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h2 id={titleId} style={{fontSize:14,fontWeight:500,margin:0,color:c.text}}>{formTitle}</h2>
        <button type="button" aria-label="Cerrar" onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:c.textFaint}}>✕</button>
      </div>
      <Fld label="Título" id="f-title"><Inp id="f-title" dark={dk} placeholder="¿Qué tenés que hacer?" autoFocus value={nombre} onChange={e=>setNombre(e.target.value)}/></Fld>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Estado" id="f-estado"><Sel id="f-estado" dark={dk} value={estado} onChange={e=>setEstado(e.target.value)}>{ESTADOS_DEFAULT.map(v=><option key={v} style={{background:c.surface,color:c.text}}>{v}</option>)}</Sel></Fld>
        <Fld label="Categoría" id="f-cat"><Sel id="f-cat" dark={dk} value={cat} onChange={e=>setCat(e.target.value)}>{CATEGORIAS_NAMES.map(v=><option key={v} style={{background:c.surface,color:c.text}}>{v}</option>)}</Sel></Fld>
      </div>
      <Fld label="Tipo" id="f-tipo"><Sel id="f-tipo" dark={dk} value={tipo} onChange={e=>setTipo(e.target.value)}>{TIPOS_CLEAN.map(v=><option key={v} style={{background:c.surface,color:c.text}}>{(TIPO_EMOJI[v]||"📋")+" "+v}</option>)}</Sel></Fld>
      <Fld label="Fecha" id="f-fecha"><DatePicker cuando={cuando} deadline={deadline} onChange={(c,d)=>{setCuando(c);setDeadline(d||"");}} dark={dk}/></Fld>
      <Fld label="Etiquetas" id="f-tags"><Inp id="f-tags" dark={dk} placeholder="trabajo, urgente... (coma)" value={tags} onChange={e=>setTags(e.target.value)}/></Fld>
      <Fld label="Contenido" id="f-content">
        <textarea value={contenido} onChange={e=>setContenido(e.target.value)} placeholder="Notas, descripción..."
          style={{width:"100%",minHeight:80,fontSize:14,lineHeight:1.7,color:c.text,background:c.surface,border:`1px solid ${c.border}`,borderRadius:8,padding:"8px 12px",fontFamily:"inherit",resize:"vertical",outline:"none"}}/>
      </Fld>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
        <Btn ghost onClick={onClose}>Cancelar</Btn>
        <Btn onClick={handleSubmit}>{saving ? "Guardando..." : action}</Btn>
      </div>
    </Overlay>
  );
}

// ── TuduDetail ────────────────────────────────────────────────────────────────
function TuduDetail({tudu,onClose,onPomo,onSaved,dark:dk}) {
  const c = th(dk||false);
  const {show:toast,update:toastUpdate} = useGlobalToast();

  // Editable fields
  const [titulo,setTitulo]     = useState(tudu?.title||"");
  const [estado,setEstado]     = useState(tudu?.estado||"Por hacer");
  const [cat,setCat]           = useState(tudu?.categoria||"Inbox");
  const [tipo,setTipo]         = useState(tudu?.tipo||"Tarea");
  const [cuando,setCuando]     = useState(tudu?.cuando||"Sin fecha");
  const [deadline,setDeadline] = useState(tudu?.deadline||"");
  const [tags,setTags]         = useState(tudu?.etiquetas?.join(", ")||"");

  // Content
  const [bodyText,setBodyText] = useState("");
  const [bodyLoading,setBodyLoading] = useState(true);
  const [bodyEditing,setBodyEditing] = useState(false);
  const [bodyDraft,setBodyDraft]     = useState("");

  // Subtasks & misc
  const [subtasks,setSubtasks] = useState<Subtarea[]>(tudu?.subtareas||[]);
  const [newSub,setNewSub]     = useState("");
  const [saving,setSaving]     = useState(false);
  const [deleting,setDeleting] = useState(false);

  const titleId = "modal-tudu-detail";
  const emoji = TIPO_EMOJI[tipo]||"📋";
  const TIPOS_CLEAN = TUDU_TYPES.map(t=>t.replace(/^.+\s/,""));

  useEffect(()=>{
    if(!tudu?.id) return;
    setBodyLoading(true);
    getPageContent(tudu.id)
      .then(txt=>{setBodyText(txt);setBodyDraft(txt);})
      .catch(err=>console.error("Error cargando contenido:",err))
      .finally(()=>setBodyLoading(false));
  },[tudu?.id]);

  const addSub = ()=>{
    if(!newSub.trim()) return;
    setSubtasks(p=>[...p,{id:Date.now(),titulo:newSub.trim(),done:false}]);
    setNewSub("");
  };

  const handleSave=async()=>{
    setSaving(true);
    const tid=toast("Guardando...","loading");
    try{
      const data: any = {
        title:titulo.trim()||tudu?.title, tipo, categoria:cat, estado, cuando,
        deadline:deadline||null,
        etiquetas:tags.split(",").map(t=>t.trim()).filter(Boolean),
        subtareas,
      };
      const promises: Promise<any>[] = [updateTudu(tudu.id,data)];
      const contentChanged = bodyDraft!==bodyText;
      if(contentChanged) promises.push(updatePageContent(tudu.id,bodyDraft));
      await Promise.all(promises);
      toastUpdate(tid,"✓ Guardado","success");
      onSaved?.();
      onClose();
    }catch(err){
      console.error(err);
      toastUpdate(tid,"✗ Error al guardar","error");
      setSaving(false);
    }
  };

  const handleDelete=()=>{
    if(!confirm("¿Eliminar este tudú?")) return;
    setDeleting(true);
    const tid=toast("Eliminando...","loading");
    deleteTudu(tudu.id)
      .then(()=>{ toastUpdate(tid,"✓ Eliminado","success"); onSaved?.(); onClose(); })
      .catch(err=>{ console.error(err); toastUpdate(tid,"✗ Error al eliminar","error"); setDeleting(false); });
  };

  return (
    <Overlay onClose={onClose} dark={dk} titleId={titleId}>
      {/* Header: emoji + título editable + cerrar */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{fontSize:20,flexShrink:0,cursor:"default"}} title={tipo}>{emoji}</span>
        <input id={titleId} value={titulo} onChange={e=>setTitulo(e.target.value)}
          style={{flex:1,fontSize:15,fontWeight:500,color:c.text,background:"transparent",border:"none",outline:"none",fontFamily:"inherit",padding:0}}
          placeholder="Título del tudú"/>
        <button type="button" aria-label="Cerrar" onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:c.textFaint,flexShrink:0}}>✕</button>
      </div>

      {/* Row 1: Estado | Categoría */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3}}>Estado</div>
          <select value={estado} onChange={e=>setEstado(e.target.value)}
            style={{width:"100%",padding:"6px 10px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:6,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit"}}>
            {ESTADOS_DEFAULT.map(s=><option key={s} style={{background:c.surface,color:c.text}}>{s}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3}}>Categoría</div>
          <select value={cat} onChange={e=>setCat(e.target.value)}
            style={{width:"100%",padding:"6px 10px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:6,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit"}}>
            {CATEGORIAS_NAMES.map(v=><option key={v} style={{background:c.surface,color:c.text}}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Tipo */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3}}>Tipo</div>
        <select value={tipo} onChange={e=>setTipo(e.target.value)}
          style={{width:"100%",padding:"6px 10px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:6,background:c.surface,color:c.text,outline:"none",fontFamily:"inherit"}}>
          {TIPOS_CLEAN.map(v=><option key={v} style={{background:c.surface,color:c.text}}>{(TIPO_EMOJI[v]||"📋")+" "+v}</option>)}
        </select>
      </div>

      {/* Row 3: Fecha (dropdown + calendario siempre visibles) */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3}}>Fecha</div>
        <DatePicker cuando={cuando} deadline={deadline} onChange={(cu,dl)=>{setCuando(cu);setDeadline(dl||"");}} dark={dk}/>
      </div>

      {/* Contenido */}
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontSize:11,fontWeight:500,color:c.textFaint,textTransform:"uppercase",letterSpacing:".4px"}}>Contenido</div>
          {!bodyEditing&&!bodyLoading&&(
            <button type="button" onClick={()=>{setBodyDraft(bodyText);setBodyEditing(true);}}
              style={{fontSize:12,color:BRAND,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>Editar</button>
          )}
        </div>
        {bodyLoading?(
          <div style={{background:c.surface2,borderRadius:8,padding:12,border:`1px solid ${c.border}`,fontSize:13,color:c.textFaint}}>Cargando...</div>
        ):bodyEditing?(
          <textarea value={bodyDraft} onChange={e=>setBodyDraft(e.target.value)}
            style={{width:"100%",minHeight:80,fontSize:14,lineHeight:1.7,color:c.text,background:c.surface2,border:`1px solid ${BRAND}`,borderRadius:8,padding:12,fontFamily:"inherit",resize:"vertical",outline:"none"}}/>
        ):bodyText?(
          <div style={{background:c.surface2,borderRadius:8,padding:12,fontSize:14,lineHeight:1.7,color:c.textMuted,border:`1px solid ${c.border}`,whiteSpace:"pre-wrap",cursor:"pointer"}}
            onClick={()=>{setBodyDraft(bodyText);setBodyEditing(true);}}>
            {bodyText}
          </div>
        ):(
          <div style={{background:c.surface2,borderRadius:8,padding:12,border:`1px dashed ${c.border}`,fontSize:13,color:c.textFaint,textAlign:"center",cursor:"pointer"}}
            onClick={()=>{setBodyDraft("");setBodyEditing(true);}}>
            Sin contenido — click para agregar
          </div>
        )}
      </div>

      {/* Subtareas */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:500,color:c.textFaint,marginBottom:6,textTransform:"uppercase",letterSpacing:".4px"}}>Subtareas</div>
        {subtasks.length>0&&(
          <ul style={{listStyle:"none",padding:0,margin:"0 0 8px 0"}}>
            {subtasks.map(sub=>(
              <li key={sub.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${c.border}`}}>
                <input type="checkbox" id={"sub-"+sub.id} checked={sub.done}
                  onChange={()=>setSubtasks(p=>p.map(s=>s.id===sub.id?{...s,done:!s.done}:s))}
                  style={{accentColor:BRAND,cursor:"pointer",flexShrink:0}}/>
                <label htmlFor={"sub-"+sub.id} style={{flex:1,fontSize:14,cursor:"pointer",color:sub.done?c.textFaint:c.text,textDecoration:sub.done?"line-through":"none"}}>{sub.titulo}</label>
                <button type="button" aria-label={"Eliminar "+sub.titulo}
                  onClick={()=>setSubtasks(p=>p.filter(s=>s.id!==sub.id))}
                  style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,padding:0,lineHeight:1}}>×</button>
              </li>
            ))}
          </ul>
        )}
        <div style={{display:"flex",gap:6}}>
          <label htmlFor="new-subtask" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Nueva subtarea</label>
          <Inp id="new-subtask" dark={dk} value={newSub} onChange={e=>setNewSub(e.target.value)} placeholder="Nueva subtarea..."
            onKeyDown={e=>{if(e.key==="Enter")addSub();}} style={{flex:1}}/>
          <Btn sm onClick={addSub}>+ Sub</Btn>
        </div>
      </div>

      {/* Pomodoro */}
      <button type="button" onClick={()=>{onClose();onPomo();}}
        style={{display:"flex",alignItems:"center",gap:8,background:c.surface2,borderRadius:8,padding:"8px 12px",cursor:"pointer",border:`1px solid ${c.border}`,width:"100%",textAlign:"left",marginBottom:14,fontFamily:"inherit"}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⏱</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:500,color:c.text}}>Iniciar Pomodoro</div>
          <div style={{fontSize:13,color:c.textFaint}}>25 min de foco</div>
        </div>
        <span style={{color:c.border}}>›</span>
      </button>

      {/* Footer: Eliminar | Cancelar | Guardar */}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button type="button" onClick={handleDelete} disabled={deleting}
          style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#DC2626",color:"#fff",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500,opacity:deleting?0.5:1}}>
          {deleting?"Eliminando...":"🗑 Eliminar"}
        </button>
        <div style={{flex:1}}/>
        <Btn ghost onClick={onClose}>Cancelar</Btn>
        <Btn onClick={handleSave}>{saving?"Guardando...":"Guardar"}</Btn>
      </div>
    </Overlay>
  );
}

// ── PomoWidget ────────────────────────────────────────────────────────────────
function PomoWidget({onClose,onOpenTask,isMobile,dark:dk}) {
  const c = th(dk||false);
  const [tasks,setTasks]       = useState(FOCUS_INIT);
  const [activeId,setActiveId] = useState(FOCUS_INIT[0].id);
  const [secs,setSecs]         = useState(1500);
  const [run,setRun]           = useState(true);
  const [mini,setMini]         = useState(false);
  const [picking,setPicking]   = useState(false);
  const ivl = useRef(null);

  useEffect(()=>{
    if(run) ivl.current = setInterval(()=>{
      setSecs(s=>{
        if(s<=0){clearInterval(ivl.current);return 0;}
        setTasks(prev=>prev.map(t=>t.id===activeId?{...t,secs:t.secs+1}:t));
        return s-1;
      });
    },1000);
    else clearInterval(ivl.current);
    return ()=>clearInterval(ivl.current);
  },[run,activeId]);

  const switchTo = id=>{setActiveId(id);setSecs(1500);setRun(true);};
  const addTask  = task=>{
    if(tasks.find(t=>t.id===task.id)) return;
    setTasks(p=>[...p,{...task,secs:0}]);
    setPicking(false);
  };
  const removeTask = id=>{
    setTasks(p=>p.filter(t=>t.id!==id));
    if(activeId===id){const remaining=tasks.filter(t=>t.id!==id);if(remaining.length)setActiveId(remaining[0].id);}
  };

  const available = ALL_TASKS.filter(t=>!tasks.find(tt=>tt.id===t.id));
  const C=182, off=C*(1-secs/1500);
  const mm=String(Math.floor(secs/60)).padStart(2,"0"), ss=String(secs%60).padStart(2,"0");
  const active = tasks.find(t=>t.id===activeId)||tasks[0];
  const bottom = isMobile?70:16, right = isMobile?8:72;

  if(mini) return (
    <button type="button" aria-label="Expandir pomodoro" role="timer" onClick={()=>setMini(false)}
      style={{position:"fixed",bottom,right,background:c.surface,border:`1px solid ${c.border}`,borderRadius:20,padding:"5px 14px",zIndex:40,boxShadow:"0 2px 10px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"inherit"}}>
      <span style={{fontSize:14,fontWeight:600,color:BRAND}}>⏱ {mm}:{ss}</span>
      <span style={{fontSize:13,color:c.textMuted,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{active?.title}</span>
      <span style={{fontSize:9,color:c.textFaint}}>↑</span>
    </button>
  );

  return (
    <div role="timer" aria-label="Pomodoro en curso"
      style={{position:"fixed",bottom,right,background:c.surface,border:`1px solid ${c.border}`,borderRadius:12,padding:12,width:210,zIndex:40,boxShadow:"0 4px 20px rgba(0,0,0,0.12)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:11,color:c.textFaint,fontWeight:500,textTransform:"uppercase",letterSpacing:".4px"}}>En foco</span>
        <div style={{display:"flex",gap:4}}>
          <button type="button" aria-label="Minimizar" onClick={()=>setMini(true)} style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,lineHeight:1,padding:"0 3px"}}>−</button>
          <button type="button" aria-label="Cerrar pomodoro" onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,lineHeight:1,padding:"0 3px"}}>✕</button>
        </div>
      </div>

      {tasks.map(task=>(
        <div key={task.id} onClick={()=>switchTo(task.id)}
          style={{display:"flex",alignItems:"center",gap:7,padding:"5px 7px",borderRadius:8,marginBottom:3,cursor:"pointer",
            border:`1px solid ${task.id===activeId?BRAND:c.border}`,
            background:task.id===activeId?"rgba(117,176,228,0.08)":c.surface2,transition:"all .15s"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:task.color,flexShrink:0,outline:task.id===activeId?`2px solid ${BRAND}`:"none",outlineOffset:1}}/>
          <button type="button" onClick={e=>{e.stopPropagation();onOpenTask&&onOpenTask();}}
            style={{flex:1,fontSize:13,fontWeight:task.id===activeId?500:400,color:task.id===activeId?c.text:c.textMuted,
              background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {task.id===activeId?"▶ ":""}{task.title}
          </button>
          <span style={{fontSize:11,color:c.textFaint,flexShrink:0}}>{Math.floor(task.secs/60)}m</span>
          <button type="button" aria-label={"Quitar "+task.title} onClick={e=>{e.stopPropagation();removeTask(task.id);}}
            style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,padding:0,lineHeight:1,flexShrink:0}}>×</button>
        </div>
      ))}

      {tasks.length<3&&!picking&&(
        <button type="button" onClick={()=>setPicking(true)}
          style={{width:"100%",fontSize:11,padding:"4px",borderRadius:6,cursor:"pointer",border:`1px dashed ${c.border}`,background:"transparent",color:c.textFaint,fontFamily:"inherit",marginTop:2}}>
          + Agregar tarea al foco
        </button>
      )}

      {picking&&(
        <div style={{marginTop:4,border:`1px solid ${c.border}`,borderRadius:8,overflow:"hidden",background:c.surface}}>
          <div style={{padding:"4px 8px",borderBottom:`1px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:c.textFaint,fontWeight:500}}>Elegí una tarea</span>
            <button type="button" onClick={()=>setPicking(false)} style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,padding:0}}>✕</button>
          </div>
          {available.length===0
            ? <p style={{fontSize:13,color:c.textFaint,padding:"8px",margin:0,textAlign:"center"}}>No hay más tareas disponibles</p>
            : available.map(task=>(
              <button key={task.id} type="button" onClick={()=>addTask(task)}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",background:"none",border:"none",
                  borderBottom:`1px solid ${c.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:task.color,flexShrink:0}}/>
                <span style={{fontSize:13,color:c.text,flex:1}}>{task.title}</span>
                <span style={{fontSize:11,color:c.textFaint}}>{task.type}</span>
              </button>
            ))
          }
        </div>
      )}

      <div style={{position:"relative",width:70,height:70,margin:"8px auto"}}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="29" fill="none" stroke={c.border} strokeWidth="5"/>
          <circle cx="35" cy="35" r="29" fill="none" stroke={BRAND} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={off}
            style={{transform:"rotate(-90deg)",transformOrigin:"35px 35px",transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div aria-live="off" style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:500,color:c.text}}>{mm}:{ss}</div>
      </div>

      <button type="button" onClick={()=>setRun(r=>!r)}
        style={{width:"100%",fontSize:13,padding:"5px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:500,
          border:`1px solid ${run?BRAND:c.border}`,background:run?BRAND:c.surface2,color:run?"#fff":c.textMuted}}>
        {run?"⏸ Pausar":"▶ Reanudar"}
      </button>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({tudus:rawTudus,loading,onNew,onTudu,onRefresh,dark:dk,isMobile}) {
  const c = th(dk||false);
  const allTudus = rawTudus.map(tuduToPool);
  const [dragId,setDragId]     = useState(null);
  const [overSlot,setOverSlot] = useState(null);
  const [movedIds,setMovedIds] = useState<Record<string,string>>({});
  const [quickVal,setQuickVal] = useState("");
  const [quickSaving,setQuickSaving] = useState(false);
  const slotRefs = useRef({});
  const {show,update} = useGlobalToast();

  const SLOTS = ["Hoy","Mañana / Pasado","Esta semana","Próxima semana"];
  const withMoves = allTudus.map(t=>movedIds[t.id]?{...t,cuando:movedIds[t.id]}:t);
  const pool = withMoves.filter(t=>!t.cuando||t.cuando==="Sin fecha"||t.cuando==="Algún día");
  const slotItems = (slot: string) => withMoves.filter(t=>CUANDO_TO_SLOT[t.cuando]===slot);

  const flyTo=(cx,cy,slotEl,color)=>{
    if(!slotEl) return;
    const r=slotEl.getBoundingClientRect();
    const g=document.createElement("div");
    g.style.cssText=`position:fixed;z-index:9999;pointer-events:none;width:88px;height:34px;border-radius:8px;background:${color};left:${cx-44}px;top:${cy-17}px;box-shadow:2px 3px 8px rgba(0,0,0,0.18);transition:left .38s cubic-bezier(.4,0,.2,1),top .38s cubic-bezier(.4,0,.2,1),transform .38s cubic-bezier(.4,0,.2,1),opacity .35s ease;`;
    document.body.appendChild(g);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      g.style.left=`${r.left+r.width/2-44}px`;g.style.top=`${r.top+r.height/2-17}px`;
      g.style.transform="scale(0)";g.style.opacity="0";
    }));
    setTimeout(()=>g.remove(),420);
  };

  const handleDrop=async(slot,e)=>{
    if(!dragId) return;
    const item=allTudus.find(p=>p.id===dragId);
    flyTo(e.clientX,e.clientY,slotRefs.current[slot],item?.c?.bg||"#FEF08A");
    const movedId=dragId;
    const prevCuando=item?.cuando;
    setDragId(null);setOverSlot(null);
    const cuando = SLOT_TO_CUANDO[slot];
    if(cuando){
      setMovedIds(p=>({...p,[movedId]:cuando}));
      const tid=show("Guardando...","loading");
      updateTudu(movedId,{cuando})
        .then(()=>{ update(tid,"✓ Asignado a: "+slot,"success"); onRefresh?.(); })
        .catch(()=>{ setMovedIds(p=>{const n={...p};if(prevCuando)n[movedId]=prevCuando;else delete n[movedId];return n;}); update(tid,"✗ Error al mover","error"); });
    }
  };

  const handleQuickCreate=async()=>{
    if(!quickVal.trim()||quickSaving) return;
    setQuickSaving(true);
    try{
      await createTudu({title:quickVal.trim(),categoria:"Inbox",estado:"Por hacer",cuando:"Sin fecha"});
      setQuickVal("");
      show("Tudú creado en Inbox","success");
      onRefresh?.();
    }catch(err){ console.error(err); show("Error al crear","error"); }
    finally{ setQuickSaving(false); }
  };

  const TuduChip=({item})=>(
    <div draggable="true"
      onDragStart={e=>{setDragId(item.id);e.dataTransfer.setData("text/plain",String(item.id));e.dataTransfer.effectAllowed="move";}}
      onDragEnd={()=>setDragId(null)}
      onClick={()=>onTudu(item)}
      style={{background:item.c.bg,color:item.c.tx,borderRadius:8,padding:"6px 9px",fontSize:13,cursor:"grab",width:140,height:90,overflow:"hidden",flexShrink:0,userSelect:"none",opacity:dragId===item.id?0.3:1,boxShadow:"1px 2px 6px rgba(0,0,0,0.12)",transition:"opacity .15s"}}>
      <div style={{pointerEvents:"none",fontSize:11,opacity:.7,marginBottom:1}}>{item.type}</div>
      <div style={{pointerEvents:"none",fontWeight:500,lineHeight:1.3}}>{item.title}</div>
      <div style={{pointerEvents:"none",fontSize:11,opacity:.6,marginTop:2}}>{item.cat}</div>
    </div>
  );

  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <h1 style={{fontSize:17,fontWeight:500,color:c.text,margin:0}}>Buenas tardes ✦</h1>
        <p style={{fontSize:14,color:c.textFaint,marginTop:2,marginBottom:0}}>{new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})} · Planificá tu día</p>
      </div>
      <div style={{display:"flex",gap:8}}>
        <label htmlFor="quick-create" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Crear tudú rápido</label>
        <input id="quick-create" style={{flex:1,padding:"6px 12px",fontSize:14,border:`1px solid ${c.border}`,borderRadius:8,outline:"none",fontFamily:"inherit",background:c.surface,color:c.text}}
          placeholder={quickSaving?"Guardando...":"Nuevo tudú rápido... (Enter)"}
          value={quickVal} onChange={e=>setQuickVal(e.target.value)}
          disabled={quickSaving}
          onKeyDown={e=>{if(e.key==="Enter")handleQuickCreate();}}/>
        <Btn onClick={onNew}>+ Nuevo</Btn>
      </div>
      <p style={{fontSize:13,color:c.textFaint,fontWeight:500,margin:0}}>Arrastrá tudús hacia las cajitas para planificar</p>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:8}}>
        {SLOTS.map(slot=>{
          const over=overSlot===slot;
          const items=slotItems(slot);
          return (
            <div key={slot} ref={el=>slotRefs.current[slot]=el}
              style={{border:over?`2px solid ${BRAND}`:`2px dashed ${c.border2}`,borderRadius:12,padding:8,minHeight:64,
                background:over?"rgba(117,176,228,0.08)":c.surface,
                boxShadow:over?`0 0 0 3px rgba(117,176,228,0.15)`:"none",transition:"all .15s"}}
              onDragOver={e=>{e.preventDefault();setOverSlot(slot);}}
              onDragLeave={()=>setOverSlot(null)}
              onDrop={e=>handleDrop(slot,e)}>
              <div style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:".5px",color:over?BRAND:c.textFaint,marginBottom:4}}>{slot}{items.length>0&&` (${items.length})`}</div>
              {items.length>0
                ? <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{items.map(item=><TuduChip key={item.id} item={item}/>)}</div>
                : <div style={{fontSize:13,color:over?BRAND:c.border2,textAlign:"center",paddingTop:6}}>{over?"¡Soltá acá!":"Soltá acá"}</div>
              }
            </div>
          );
        })}
      </div>
      {loading&&<p style={{fontSize:14,color:c.textFaint,textAlign:"center",padding:20}}>Cargando tudús...</p>}
      {!loading&&pool.length>0&&(
        <section style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:12,padding:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <h2 style={{fontSize:14,fontWeight:500,color:c.text,margin:0}}>Vencidos / Sin planificar</h2>
            <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:"#FEE2E2",color:"#DC2626"}}>{pool.length} pendientes</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {pool.map(item=><TuduChip key={item.id} item={item}/>)}
          </div>
        </section>
      )}
    </main>
  );
}

// ── ListView ──────────────────────────────────────────────────────────────────
function ListView({title,tudus=[],loading,onTudu,dark:dk}) {
  const c = th(dk||false);
  const [filterEstado,setFilterEstado] = useState("");
  const [filterTipo,setFilterTipo]     = useState("");
  const [filterCuando,setFilterCuando] = useState("");
  const drag = useRef<number|null>(null);

  let filtered = tudus;
  if(filterEstado) filtered = filtered.filter(t=>t.estado===filterEstado);
  if(filterTipo)   filtered = filtered.filter(t=>t.tipo===filterTipo);
  if(filterCuando) filtered = filtered.filter(t=>t.cuando===filterCuando);
  const [order,setOrder] = useState<string[]>([]);
  useEffect(()=>setOrder(filtered.map(t=>t.id)),[tudus,filterEstado,filterTipo,filterCuando]);
  const sorted = order.map(id=>filtered.find(t=>t.id===id)).filter(Boolean);
  if(sorted.length<filtered.length) filtered.forEach(t=>{if(!sorted.find(s=>s.id===t.id))sorted.push(t);});

  const persistOrder = (newOrder: string[]) => {
    newOrder.forEach((id,i)=>{
      updateTudu(id,{orden:i}).catch(err=>console.error("Error guardando orden:",err));
    });
  };

  return (
    <main style={{display:"flex",flexDirection:"column",gap:10}}>
      <h1 style={{fontSize:17,fontWeight:500,color:c.text,margin:0}}>{title}</h1>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <select aria-label="Filtrar estado" value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}
          style={{fontSize:13,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
          <option value="">Todos los estados</option>
          {ESTADOS_DEFAULT.map(s=><option key={s} value={s} style={{background:c.surface,color:c.text}}>{s}</option>)}
        </select>
        <select aria-label="Filtrar tipo" value={filterTipo} onChange={e=>setFilterTipo(e.target.value)}
          style={{fontSize:13,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
          <option value="" style={{background:c.surface,color:c.text}}>Todos los tipos</option>
          {TUDU_TYPES.map(t=>{const clean=t.replace(/^.+\s/,"");return <option key={clean} value={clean} style={{background:c.surface,color:c.text}}>{t}</option>;})}
        </select>
        <select aria-label="Filtrar fecha" value={filterCuando} onChange={e=>setFilterCuando(e.target.value)}
          style={{fontSize:13,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
          <option value="" style={{background:c.surface,color:c.text}}>Cualquier fecha</option>
          {CUANDO.map(q=><option key={q} value={q} style={{background:c.surface,color:c.text}}>{q}</option>)}
        </select>
      </div>
      {loading&&<p style={{fontSize:14,color:c.textFaint,textAlign:"center",padding:20}}>Cargando...</p>}
      {!loading&&sorted.length===0&&<p style={{fontSize:14,color:c.textFaint,textAlign:"center",padding:20}}>No hay tudús</p>}
      <ul style={{listStyle:"none",padding:0,margin:0}}>
        {sorted.map((item,i)=>{
          const done=item.estado==="Listo"||item.estado==="No lo haré";
          const emoji=TIPO_EMOJI[item.tipo]||"📋";
          return (
            <li key={item.id} draggable
              onDragStart={()=>drag.current=i}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>{
                if(drag.current===null||drag.current===i) return;
                const n=[...order];const[m]=n.splice(drag.current,1);n.splice(i,0,m);setOrder(n);persistOrder(n);drag.current=null;
              }}
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:c.surface,border:`1px solid ${c.border}`,borderRadius:8,marginBottom:4}}>
              <span style={{color:c.border2,cursor:"grab",fontSize:13}}>⠿</span>
              <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${done?"#22C55E":c.border2}`,background:done?"#22C55E":"transparent",flexShrink:0}}/>
              <span style={{fontSize:13}}>{emoji}</span>
              <button type="button" onClick={()=>onTudu(item)} style={{flex:1,fontSize:14,textDecoration:done?"line-through":"none",color:done?c.textFaint:c.text,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>{item.title}</button>
              <span style={{fontSize:11,color:c.textFaint}}>{item.categoria}</span>
              <SBadge s={item.estado}/>
              <span style={{fontSize:13,color:c.textFaint}}>{item.cuando||"—"}</span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

// ── CategoryView ──────────────────────────────────────────────────────────────
function CategoryView({tudus=[],onView,onTudu}) {
  const [desc,setDesc]       = useState("Todo lo relacionado con mi vida profesional y proyectos laborales.");
  const [editDesc,setEditDesc] = useState(false);
  const [hoverDesc,setHoverDesc] = useState(false);
  const TOP = tudus.slice(0,3).map((t,i)=>({
    ...t, type:`${TIPO_EMOJI[t.tipo]||"📋"} ${t.tipo}`, date:t.cuando||"Sin fecha",
    bg:PCOLORS[i%PCOLORS.length].bg, tx:PCOLORS[i%PCOLORS.length].tx,
  }));
  const pill=(children,w)=>(
    <div style={{borderRadius:8,background:"rgba(255,255,255,0.1)",border:"0.5px solid rgba(255,255,255,0.18)",flexShrink:0,width:w||"auto"}}>
      {children}
    </div>
  );
  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <article style={{borderRadius:12,overflow:"hidden",position:"relative",background:"linear-gradient(160deg,#0f2744,#1e3a8a 60%,#1d4ed8)"}}>
        <div style={{padding:"16px 16px 8px"}}>
          <h1 style={{fontSize:18,fontWeight:500,color:"#fff",margin:0}}>💼 My Work</h1>
          <div onMouseEnter={()=>setHoverDesc(true)} onMouseLeave={()=>setHoverDesc(false)} style={{marginTop:4,display:"inline-flex",alignItems:"center",gap:8}}>
            {editDesc
              ? <textarea autoFocus rows={2} value={desc} onChange={e=>setDesc(e.target.value)} onBlur={()=>setEditDesc(false)}
                  style={{fontSize:13,lineHeight:1.5,color:"#fff",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:6,padding:"4px 8px",outline:"none",resize:"none",width:280,fontFamily:"inherit"}}/>
              : <>
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.5}}>{desc}</span>
                  {hoverDesc&&<button type="button" onClick={()=>setEditDesc(true)} style={{fontSize:11,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.12)",border:"none",borderRadius:5,padding:"2px 7px",cursor:"pointer"}}>Editar</button>}
                </>}
          </div>
        </div>
        <div style={{padding:"0 16px 12px",display:"flex",flexDirection:"row",alignItems:"flex-start",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
          <button type="button" onClick={()=>window.open("https://www.youtube.com/watch?v=YDRId6QmNTA","_blank")} aria-label="Ver video: How to build a second brain"
            style={{width:192,height:108,borderRadius:8,overflow:"hidden",flexShrink:0,cursor:"pointer",position:"relative",background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",border:"none",padding:0}}>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-60%)",width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:0,height:0,borderTop:"8px solid transparent",borderBottom:"8px solid transparent",borderLeft:"14px solid rgba(255,255,255,0.9)",marginLeft:3}}/>
            </div>
            <div style={{position:"absolute",bottom:6,left:6,right:6,display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:20,height:14,background:"#FF0000",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{width:0,height:0,borderTop:"4px solid transparent",borderBottom:"4px solid transparent",borderLeft:"6px solid white",marginLeft:1}}/>
              </div>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.8)",lineHeight:1.3}}>How to build a second brain</span>
            </div>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
            {pill(<div style={{padding:"6px 9px",fontSize:13,color:"#fff",lineHeight:1.4}}>Enfocarme en proyectos de impacto real. Delegar lo operativo.</div>,155)}
            {pill(<div style={{padding:"8px 12px",fontSize:13,color:"#fff",fontStyle:"italic",lineHeight:1.4,borderLeft:"2px solid rgba(255,255,255,0.35)"}}>"Productividad es hacer lo que importa."</div>,155)}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
            <div style={{width:115,height:58,borderRadius:8,background:"linear-gradient(135deg,#f093fb,#f5576c)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.8)",fontSize:13}}>📸 Inspiración</div>
            {pill(<div style={{padding:"5px 8px",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:3,background:"#0077B5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>in</div>
              <div><div style={{fontSize:11,color:"#fff",fontWeight:500}}>Productividad</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>linkedin.com</div></div>
            </div>,115)}
            {pill(<div style={{padding:"5px 8px",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:3,background:"linear-gradient(135deg,#f09433,#dc2743,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",flexShrink:0}}>◎</div>
              <div><div style={{fontSize:11,color:"#fff",fontWeight:500}}>@mi_perfil</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>instagram.com</div></div>
            </div>,115)}
          </div>
        </div>
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".5px",color:"rgba(255,255,255,0.4)",marginBottom:6,fontWeight:500}}>Tudús más importantes</div>
          <div style={{display:"flex",gap:8}}>
            {TOP.map((item,i)=>(
              <button key={i} type="button" onClick={()=>onTudu(item)} style={{width:160,height:100,flexShrink:0,borderRadius:8,padding:"8px 10px",cursor:"pointer",background:item.bg,color:item.tx,boxShadow:"1px 2px 6px rgba(0,0,0,0.18)",border:"none",textAlign:"left",overflow:"hidden"}}
                onMouseOver={e=>e.currentTarget.style.transform="scale(1.02)"}
                onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}>
                <div style={{fontSize:11,opacity:.6,marginBottom:2}}>{item.type}</div>
                <div style={{fontSize:13,fontWeight:600,lineHeight:1.3}}>{item.title}</div>
                <div style={{fontSize:11,opacity:.55,marginTop:3}}>{item.date}</div>
              </button>
            ))}
          </div>
        </div>
        <button type="button" style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",fontSize:11,padding:"3px 8px",borderRadius:6,cursor:"pointer"}}>Editar cabezal</button>
      </article>
      <div><Btn onClick={onView}>Ver todos los tudús →</Btn></div>
    </main>
  );
}

// ── PostitsView ───────────────────────────────────────────────────────────────
const POSTIT_COLORS = ["#FEF08A","#E9D5FF","#BAE6FD","#BBF7D0","#FED7AA","#CCFBF1","#FCA5A5","#FECDD3","#DDD6FE","#A7F3D0"];
const POSTIT_TX: Record<string,string> = {"#FEF08A":"#713F12","#E9D5FF":"#4C1D95","#BAE6FD":"#0C4C5C","#BBF7D0":"#14532D","#FED7AA":"#7C2D12","#CCFBF1":"#134E4A","#FCA5A5":"#7F1D1D","#FECDD3":"#881337","#DDD6FE":"#4C1D95","#A7F3D0":"#064E3B"};
const TAMANOS = ["XS","S","M","L","XL"];
const TAMANO_SIZE: Record<string,{w:number,h:number}> = {"XS":{w:100,h:70},"S":{w:115,h:82},"M":{w:130,h:95},"L":{w:160,h:115},"XL":{w:190,h:135}};

function PostitsView({tudus=[],onTudu,onRefresh,dark:dk}) {
  const c = th(dk||false);
  const {show:toast,update:toastUpdate} = useGlobalToast();
  const [pos,setPos] = useState<Record<string,{x:number,y:number}>>({});
  const drag = useRef<{id:string,ox:number,oy:number}|null>(null);
  const moved = useRef(false);
  const areaRef = useRef<HTMLDivElement|null>(null);
  const saveTimer = useRef<Record<string,ReturnType<typeof setTimeout>>>({});
  const clickTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const [editId,setEditId] = useState<string|null>(null);
  const [editColor,setEditColor] = useState("");
  const [editTamano,setEditTamano] = useState("M");
  const [editIcon,setEditIcon] = useState("CheckSquare");
  const [editSaving,setEditSaving] = useState(false);

  useEffect(()=>{
    setPos(prev=>{
      const next={...prev};
      tudus.forEach((t:any,i:number)=>{
        if(!next[t.id]){
          const saved = t.pos_x && t.pos_y;
          next[t.id] = saved ? {x:t.pos_x,y:t.pos_y} : {x:20+(i%4)*160,y:16+Math.floor(i/4)*120};
        }
      });
      return next;
    });
  },[tudus]);

  const persistPos=(id:string,x:number,y:number)=>{
    if(saveTimer.current[id]) clearTimeout(saveTimer.current[id]);
    saveTimer.current[id]=setTimeout(()=>{
      updateTudu(id,{pos_x:Math.round(x),pos_y:Math.round(y)} as any).catch(err=>console.error(err));
    },600);
  };

  const onMD=(e:React.MouseEvent,id:string)=>{
    if(!areaRef.current) return;
    const r=areaRef.current.getBoundingClientRect();
    const p=pos[id]||{x:0,y:0};
    drag.current={id,ox:e.clientX-r.left-p.x,oy:e.clientY-r.top-p.y};
    moved.current=false;
    e.preventDefault();
  };
  const onMM=(e:React.MouseEvent)=>{
    if(!drag.current||!areaRef.current)return;
    moved.current=true;
    const{id,ox,oy}=drag.current;
    const r=areaRef.current.getBoundingClientRect();
    const nx=Math.max(0,Math.min(r.width-130,e.clientX-r.left-ox));
    const ny=Math.max(0,Math.min(r.height-100,e.clientY-r.top-oy));
    setPos(p=>({...p,[id]:{x:nx,y:ny}}));
  };
  const onMU=(id:string)=>{
    if(!moved.current&&id){
      // Single click → open detail (with delay to allow dblclick)
      if(clickTimer.current) clearTimeout(clickTimer.current);
      clickTimer.current=setTimeout(()=>{
        const t=tudus.find((t:any)=>t.id===id);
        if(t) onTudu(t);
      },250);
    } else if(moved.current&&drag.current){
      const mid=drag.current.id;
      const p=pos[mid];
      if(p) persistPos(mid,p.x,p.y);
    }
    drag.current=null;moved.current=false;
  };

  const onDblClick=(e:React.MouseEvent,t:any)=>{
    if(clickTimer.current) clearTimeout(clickTimer.current);
    e.stopPropagation();
    setEditId(t.id);
    setEditColor(t.color||"");
    setEditTamano(t.tamano||"M");
    setEditIcon(TIPO_ICONO[t.tipo]||"CheckSquare");
  };

  const saveEdit=async()=>{
    if(!editId) return;
    setEditSaving(true);
    const tid=toast("Guardando estilo...","loading");
    try{
      await updateTudu(editId,{color:editColor,tamano:editTamano} as any);
      toastUpdate(tid,"✓ Estilo guardado","success");
      onRefresh?.();
      setEditId(null);
    }catch(err){
      console.error(err);
      toastUpdate(tid,"✗ Error al guardar","error");
    }finally{ setEditSaving(false); }
  };

  const getPostColor=(t:any,i:number)=>{
    if(t.color && POSTIT_TX[t.color]) return {bg:t.color,tx:POSTIT_TX[t.color]};
    return PCOLORS[i%PCOLORS.length];
  };
  const getPostSize=(t:any)=> TAMANO_SIZE[t.tamano]||TAMANO_SIZE["M"];

  return (
    <>
    <div ref={areaRef} onMouseMove={onMM} onMouseUp={()=>{if(drag.current&&moved.current){const mid=drag.current.id;const p=pos[mid];if(p)persistPos(mid,p.x,p.y);}drag.current=null;moved.current=false;}}
      style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:12,height:360,position:"relative",overflow:"hidden",backgroundImage:`radial-gradient(circle,${c.border} 1px,transparent 1px)`,backgroundSize:"20px 20px"}}>
      {tudus.length===0&&<p style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14,color:c.textFaint}}>Sin tudús en esta categoría</p>}
      {tudus.map((t:any,i:number)=>{
        const p=pos[t.id];if(!p) return null;
        const pc=getPostColor(t,i);
        const sz=getPostSize(t);
        const emoji=TIPO_EMOJI[t.tipo]||"📋";
        return (
          <div key={t.id} onMouseDown={e=>onMD(e,t.id)} onMouseUp={()=>onMU(t.id)} onDoubleClick={e=>onDblClick(e,t)}
            style={{position:"absolute",left:p.x,top:p.y,width:sz.w,height:sz.h,background:pc.bg,color:pc.tx,borderRadius:8,padding:"8px 10px",fontSize:13,userSelect:"none",cursor:drag.current?.id===t.id?"grabbing":"grab",boxShadow:"2px 3px 8px rgba(0,0,0,0.18)",zIndex:drag.current?.id===t.id?50:1,overflow:"hidden"}}>
            <div style={{fontSize:11,opacity:.75,marginBottom:2,pointerEvents:"none"}}>{emoji} {t.tipo}</div>
            <div style={{fontWeight:500,lineHeight:1.3,pointerEvents:"none"}}>{t.title}</div>
            <div style={{fontSize:11,opacity:.6,marginTop:3,pointerEvents:"none"}}>{t.cuando||"Sin fecha"}</div>
          </div>
        );
      })}
    </div>
    {/* Modal personalizar postit */}
    {editId&&(
      <Overlay onClose={()=>setEditId(null)} dark={dk} titleId="postit-edit-title">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <h2 id="postit-edit-title" style={{fontSize:14,fontWeight:500,margin:0,color:c.text}}>Personalizar postit</h2>
          <button type="button" aria-label="Cerrar" onClick={()=>setEditId(null)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:c.textFaint}}>✕</button>
        </div>
        {/* Color */}
        <div style={{fontSize:11,color:c.textFaint,marginBottom:4,textTransform:"uppercase",letterSpacing:".4px"}}>Color</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {POSTIT_COLORS.map(clr=>(
            <button key={clr} type="button" onClick={()=>setEditColor(clr)}
              style={{width:28,height:28,borderRadius:6,background:clr,border:editColor===clr?`2px solid ${BRAND}`:"2px solid transparent",cursor:"pointer",outline:"none"}}/>
          ))}
        </div>
        {/* Tamaño */}
        <div style={{fontSize:11,color:c.textFaint,marginBottom:4,textTransform:"uppercase",letterSpacing:".4px"}}>Tamaño</div>
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {TAMANOS.map(sz=>(
            <button key={sz} type="button" onClick={()=>setEditTamano(sz)}
              style={{flex:1,padding:"6px 0",fontSize:13,fontWeight:editTamano===sz?600:400,borderRadius:6,cursor:"pointer",fontFamily:"inherit",
                border:editTamano===sz?`1px solid ${BRAND}`:`1px solid ${c.border}`,
                background:editTamano===sz?"rgba(117,176,228,0.12)":c.surface,
                color:editTamano===sz?BRAND:c.textMuted}}>{sz}</button>
          ))}
        </div>
        {/* Ícono */}
        <div style={{fontSize:11,color:c.textFaint,marginBottom:4,textTransform:"uppercase",letterSpacing:".4px"}}>Ícono</div>
        <IconPicker value={editIcon} onChange={setEditIcon}/>
        {/* Actions */}
        <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:16}}>
          <Btn ghost onClick={()=>setEditId(null)}>Cancelar</Btn>
          <Btn onClick={saveEdit}>{editSaving?"Guardando...":"Guardar"}</Btn>
        </div>
      </Overlay>
    )}
    </>
  );
}

// ── KanbanView ────────────────────────────────────────────────────────────────
const KPLAN_COLS = ["Vencido","Hoy","Mañana / Pasado","Esta semana","Próxima semana","Sin fecha"];
function KanbanView({tudus=[],mode="estado",onTudu,onRefresh,dark:dk}) {
  const c = th(dk||false);
  const columns = mode==="cuando"?KPLAN_COLS:ESTADOS_DEFAULT;
  const drag = useRef<{col:string,id:string}|null>(null);
  const [overCol,setOverCol] = useState<string|null>(null);
  const [moved,setMoved] = useState<Record<string,string>>({});

  const field = mode==="cuando"?"cuando":"estado";
  const getCol = (t: any) => {
    if(moved[t.id]) return moved[t.id];
    if(mode==="cuando") return CUANDO_TO_SLOT[t.cuando]||t.cuando||"Sin fecha";
    return t.estado||"Por hacer";
  };

  const colItems = (col: string) => tudus.filter(t=>getCol(t)===col);
  const colColor = (col: string) => col==="Vencido"?"#EF4444":col==="Hoy"||col==="En curso"?BRAND:c.textFaint;
  const cardColor = (t: any, i: number) => PCOLORS[i % PCOLORS.length];

  const onDS=(col: string,id: string)=>{drag.current={col,id};};
  const handleDrop=async(target: string)=>{
    if(!drag.current) return;
    const{col,id}=drag.current;drag.current=null;setOverCol(null);
    if(col===target) return;
    const value = mode==="cuando"?SLOT_TO_CUANDO[target]||target:target;
    setMoved(p=>({...p,[id]:target}));
    try{ await updateTudu(id,{[field]:value}); onRefresh?.(); }catch(err){ console.error(err); onRefresh?.(); }
  };

  return (
    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
      {columns.map(col=>{
        const items=colItems(col);
        const over=overCol===col;
        return (
          <div key={col} style={{minWidth:148,maxWidth:148,background:over?"rgba(117,176,228,0.06)":c.surface2,borderRadius:12,padding:8,flexShrink:0,border:over?`2px solid ${BRAND}`:`1px solid ${c.border}`,transition:"border .15s,background .15s"}}
            onDragOver={e=>{e.preventDefault();setOverCol(col);}}
            onDragLeave={()=>setOverCol(null)}
            onDrop={()=>handleDrop(col)}>
            <h3 style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:".4px",margin:"0 0 6px 0",color:colColor(col)}}>{col} {items.length>0&&`(${items.length})`}</h3>
            {items.length===0&&<p style={{fontSize:13,color:over?BRAND:c.textFaint,textAlign:"center",padding:"8px 0",margin:0}}>{over?"¡Soltá acá!":"Sin tudús"}</p>}
            {items.map((item,i)=>{
              const pc=cardColor(item,i);
              const emoji=TIPO_EMOJI[item.tipo]||"📋";
              return (
                <div key={item.id} draggable="true"
                  onDragStart={()=>onDS(col,item.id)} onDragEnd={()=>{drag.current=null;setOverCol(null);}}
                  onClick={()=>onTudu(item)}
                  style={{background:c.surface,border:`0.5px solid ${c.border}`,borderLeft:`3px solid ${pc.bg}`,borderRadius:6,padding:"6px 8px",marginBottom:4,cursor:"grab",fontSize:14}}>
                  <div style={{pointerEvents:"none",fontSize:11,color:c.textFaint}}>{emoji} {item.tipo}</div>
                  <div style={{pointerEvents:"none",fontWeight:500,fontSize:13,color:c.text,lineHeight:1.3}}>{item.title}</div>
                  <div style={{pointerEvents:"none",fontSize:11,color:c.textFaint,marginTop:2}}>{mode==="cuando"?item.estado:item.cuando||"Sin fecha"}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── GanttView ─────────────────────────────────────────────────────────────────
function GanttView({dark:dk}) {
  const c = th(dk||false);
  const [scale,setScale]   = useState("semana");
  const [offset,setOffset] = useState(0);
  const [items,setItems]   = useState(GANTT_INIT);
  const drag = useRef(null);
  const trackRefs = useRef({});
  const cols=SCALE_COLS[scale], winStart=offset*cols;
  const todayPct=((0-winStart)/cols)*100, showToday=todayPct>=0&&todayPct<=100;
  const getLabel=i=>{const d=winStart+i;if(scale==="semana"){const n=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];return n[((5+d)%7+7)%7];}if(scale==="quincena")return String(14+d);return String(14+d);};
  const barStyle=r=>({left:`${((r.startDay-winStart)/cols)*100}%`,width:`${Math.max(((r.endDay-r.startDay)/cols)*100,1)}%`});
  const onMD=(e,i,role)=>{
    e.stopPropagation();e.preventDefault();
    const tw=trackRefs.current[i]?.offsetWidth||300;
    drag.current={i,role,sx:e.clientX,tw,os:items[i].startDay,oe:items[i].endDay};
    const mv=ev=>{if(!drag.current)return;const{i,role,sx,tw,os,oe}=drag.current;const dd=Math.round(((ev.clientX-sx)/tw)*cols);setItems(prev=>prev.map((b,j)=>{if(j!==i)return b;if(role==="s")return{...b,startDay:Math.min(os+dd,oe-1)};if(role==="e")return{...b,endDay:Math.max(oe+dd,os+1)};return{...b,startDay:os+dd,endDay:oe+dd};}));};
    const up=()=>{drag.current=null;document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);};
    document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:3,padding:3,borderRadius:8,background:c.surface2}}>
          {["semana","quincena","mes"].map(s=>(
            <button key={s} type="button" aria-pressed={scale===s} onClick={()=>{setScale(s);setOffset(0);}}
              style={{fontSize:13,padding:"4px 10px",borderRadius:5,cursor:"pointer",border:"none",fontFamily:"inherit",background:scale===s?c.surface:"transparent",color:scale===s?c.text:c.textFaint,fontWeight:scale===s?500:400,boxShadow:scale===s?`0 0 0 0.5px ${c.border}`:"none"}}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["← Ant",()=>setOffset(o=>o-1)],["Hoy",()=>setOffset(0)],["Sig →",()=>setOffset(o=>o+1)]].map(([l,fn])=>(
            <button key={l} type="button" onClick={fn} style={{fontSize:13,padding:"4px 10px",borderRadius:6,cursor:"pointer",border:`1px solid ${c.border}`,background:c.surface,color:c.text,fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,minWidth:400}}>
          <thead>
            <tr>
              <th style={{textAlign:"left",padding:"4px 8px",fontSize:11,color:c.textFaint,fontWeight:400,borderBottom:`1px solid ${c.border}`,width:"28%"}}>Tudú</th>
              <th style={{textAlign:"left",padding:"4px 8px",fontSize:11,color:c.textFaint,fontWeight:400,borderBottom:`1px solid ${c.border}`,width:"13%"}}>Estado</th>
              <th style={{borderBottom:`1px solid ${c.border}`,padding:0}}>
                <div style={{display:"flex",height:24}}>
                  {Array.from({length:cols},(_,i)=>(
                    <div key={i} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,borderLeft:`1px solid ${c.border}`,background:winStart+i===0?"rgba(239,68,68,0.06)":"transparent",color:winStart+i===0?"#EF4444":c.textFaint,fontWeight:winStart+i===0?600:400}}>
                      {getLabel(i)}
                    </div>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((r,i)=>{
              const bs=barStyle(r);
              const lp=parseFloat(bs.left),wp=parseFloat(bs.width),visible=lp+wp>0&&lp<100;
              return (
                <tr key={r.id} style={{borderBottom:`1px solid ${c.border}`}}>
                  <td style={{padding:"4px 8px",fontSize:13,color:c.text}}>{r.title}</td>
                  <td style={{padding:"4px 8px"}}><SBadge s={r.status}/></td>
                  <td style={{padding:"3px 0"}}>
                    <div ref={el=>trackRefs.current[i]=el} style={{position:"relative",height:26,margin:"2px 0",background:c.surface2,borderRadius:4}}>
                      {Array.from({length:cols},(_,ci)=>(
                        <div key={ci} style={{position:"absolute",top:0,bottom:0,borderLeft:`1px solid ${c.border}`,left:`${(ci/cols)*100}%`,zIndex:1,pointerEvents:"none"}}/>
                      ))}
                      {showToday&&(
                        <div style={{position:"absolute",top:-2,bottom:-2,width:2,background:"#EF4444",left:`${todayPct}%`,zIndex:30,pointerEvents:"none"}}>
                          {i===0&&<span style={{position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"#EF4444",fontWeight:600,whiteSpace:"nowrap"}}>Hoy</span>}
                        </div>
                      )}
                      {visible&&(
                        <div style={{position:"absolute",top:3,bottom:3,borderRadius:4,background:r.color,left:bs.left,width:bs.width,zIndex:20,display:"flex",alignItems:"center",minWidth:8}}>
                          <button type="button" onMouseDown={e=>onMD(e,i,"s")} style={{width:8,height:"100%",cursor:"ew-resize",background:"rgba(0,0,0,0.1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"rgba(0,0,0,0.4)",flexShrink:0,padding:0}}>⠿</button>
                          <button type="button" onMouseDown={e=>onMD(e,i,"m")} style={{flex:1,height:"100%",cursor:"grab",overflow:"hidden",display:"flex",alignItems:"center",background:"none",border:"none",padding:0}}>
                            <span style={{fontSize:11,color:"rgba(0,0,0,0.7)",padding:"0 4px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",pointerEvents:"none"}}>{r.title}</span>
                          </button>
                          <button type="button" onMouseDown={e=>onMD(e,i,"e")} style={{width:8,height:"100%",cursor:"ew-resize",background:"rgba(0,0,0,0.1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"rgba(0,0,0,0.4)",flexShrink:0,padding:0}}>⠿</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CanvasView ────────────────────────────────────────────────────────────────
function CanvasView({tudus=[],loading,onNew,onTudu,onRefresh,dark:dk,isMobile}) {
  const c = th(dk||false);
  const [view,setView] = useState(isMobile?"list":"postits");
  const TABS = isMobile
    ? [["Listado","list"]]
    : [["Postits","postits"],["Listado","list"],["Kanban","kanban"],["Planificación","kplan"],["Gantt","gantt"]];
  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <h1 style={{fontSize:17,fontWeight:500,color:c.text,margin:0}}>💼 My Work</h1>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <Btn sm onClick={onNew}>+ Nuevo Tudú</Btn>
          <div style={{display:"flex",gap:2,padding:3,borderRadius:8,background:c.surface2}} role="tablist">
            {TABS.map(([label,key])=>(
              <button key={key} role="tab" type="button" aria-selected={view===key} onClick={()=>setView(key)}
                style={{fontSize:13,padding:"4px 9px",borderRadius:5,cursor:"pointer",border:"none",whiteSpace:"nowrap",fontFamily:"inherit",background:view===key?c.surface:"transparent",color:view===key?c.text:c.textFaint,fontWeight:view===key?500:400,boxShadow:view===key?`0 0 0 0.5px ${c.border}`:"none"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div role="tabpanel">
        {view==="postits"  && <PostitsView tudus={tudus} onTudu={onTudu} onRefresh={onRefresh} dark={dk}/>}
        {view==="list"     && <ListView title="My Work" tudus={tudus} loading={loading} onTudu={onTudu} dark={dk}/>}
        {view==="kanban"   && <KanbanView tudus={tudus} mode="estado" onTudu={onTudu} onRefresh={onRefresh} dark={dk}/>}
        {view==="kplan"    && <><p style={{fontSize:13,color:c.textFaint,margin:"0 0 4px"}}>Arrastrá cards entre columnas para re-planificar</p><KanbanView tudus={tudus} mode="cuando" onTudu={onTudu} onRefresh={onRefresh} dark={dk}/></>}
        {view==="gantt"    && <GanttView dark={dk}/>}
      </div>
    </main>
  );
}

// ── ConfigView ────────────────────────────────────────────────────────────────
function ConfigView({dark:dk,onToggle}) {
  const c = th(dk||false);
  const [cats,setCats]       = useState(CATS_INIT);
  const [estados,setEstados] = useState(()=>{
    try{ const s=localStorage.getItem("tudus_estados"); return s?JSON.parse(s):ESTADOS_DEFAULT; }catch{ return ESTADOS_DEFAULT; }
  });
  useEffect(()=>{ try{ localStorage.setItem("tudus_estados",JSON.stringify(estados)); }catch{} },[estados]);
  const [editCat,setEditCat] = useState(null);
  const [newEstado,setNewEstado] = useState("");
  const [section,setSection] = useState("appearance");
  const SECTIONS = [["appearance","Apariencia"],["categories","Categorías"],["states","Estados"],["trash","Papelera"]];

  const saveEditCat=()=>{
    if(!editCat) return;
    setCats(prev=>prev.map(cat=>cat.id===editCat.id?{...cat,name:editCat.name,icon:editCat.icon}:cat));
    setEditCat(null);
  };

  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <h1 style={{fontSize:17,fontWeight:500,color:c.text,margin:0,display:"flex",alignItems:"center",gap:8}}>
        <Icon name="Gear" size={18} color={c.textMuted}/> Configuración
      </h1>
      <nav style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {SECTIONS.map(([key,label])=>(
          <button key={key} type="button" onClick={()=>setSection(key)}
            style={{fontSize:13,padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",
              border:`1px solid ${section===key?BRAND:c.border}`,
              background:section===key?"rgba(117,176,228,0.1)":"transparent",
              color:section===key?BRAND:c.textMuted}}>
            {label}
          </button>
        ))}
      </nav>
      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:12,padding:16}}>

        {section==="appearance"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:c.text}}>Tema</div>
                <div style={{fontSize:13,color:c.textFaint}}>Actual: {dk?"Oscuro":"Claro"}</div>
              </div>
              <Btn ghost sm onClick={onToggle}>Cambiar a {dk?"claro":"oscuro"}</Btn>
            </div>
            <hr style={{border:"none",borderTop:`1px solid ${c.border}`,margin:"12px 0"}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:c.text}}>Backend</div>
                <div style={{fontSize:13,color:c.textFaint}}>Notion</div>
              </div>
              <span style={{fontSize:14,color:"#22C55E",fontWeight:500}}>● Conectado</span>
            </div>
          </>
        )}

        {section==="categories"&&(
          <>
            <p style={{fontSize:14,color:c.textMuted,marginTop:0,marginBottom:12}}>Editá nombre e ícono de cada categoría.</p>
            {editCat&&(
              <div style={{background:c.surface2,border:`1px solid ${BRAND}`,borderRadius:12,padding:12,marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:500,color:c.text,marginBottom:8}}>Editando categoría</div>
                <Fld label="Nombre" id="edit-cat-name">
                  <Inp id="edit-cat-name" value={editCat.name} onChange={e=>setEditCat(p=>({...p,name:e.target.value}))}/>
                </Fld>
                <Fld label="Ícono" id="edit-cat-icon">
                  <IconPicker value={editCat.icon} onChange={icon=>setEditCat(p=>({...p,icon}))}/>
                </Fld>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <Btn sm onClick={saveEditCat}>Guardar</Btn>
                  <Btn sm ghost onClick={()=>setEditCat(null)}>Cancelar</Btn>
                </div>
              </div>
            )}
            <ul style={{listStyle:"none",padding:0,margin:0}}>
              {cats.map(cat=>(
                <li key={cat.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${c.border}`}}>
                  <Icon name={cat.icon} size={16} color={c.textMuted}/>
                  <span style={{flex:1,fontSize:13,color:c.text}}>{cat.name}</span>
                  {cat.badge>0&&<span style={{fontSize:11,padding:"1px 6px",borderRadius:12,background:c.surface2,color:c.textFaint}}>{cat.badge}</span>}
                  <button type="button" onClick={()=>setEditCat({id:cat.id,name:cat.name,icon:cat.icon})}
                    style={{fontSize:13,padding:"3px 8px",borderRadius:5,cursor:"pointer",border:`1px solid ${c.border}`,background:c.surface2,color:c.textMuted,fontFamily:"inherit"}}>
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {section==="states"&&(
          <>
            <p style={{fontSize:14,color:c.textMuted,marginTop:0,marginBottom:12}}>Estados disponibles globalmente.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {estados.map((e,i)=>(
                <div key={e} style={{display:"flex",alignItems:"center",gap:6,background:(SBADGE[e]||{bg:c.surface2}).bg,color:(SBADGE[e]||{tx:c.text}).tx,borderRadius:8,padding:"4px 10px",fontSize:13,fontWeight:500}}>
                  {e}
                  <button type="button" aria-label={"Eliminar "+e} onClick={()=>setEstados(p=>p.filter((_,j)=>j!==i))}
                    style={{background:"none",border:"none",cursor:"pointer",color:(SBADGE[e]||{tx:c.textFaint}).tx,fontSize:14,lineHeight:1,padding:0,marginLeft:2,opacity:0.7}}>×</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <label htmlFor="new-estado" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Nuevo estado</label>
              <Inp id="new-estado" dark={dk} value={newEstado} onChange={e=>setNewEstado(e.target.value)} placeholder="Nuevo estado..."
                onKeyDown={e=>{if(e.key==="Enter"&&newEstado.trim()){setEstados(p=>[...p,newEstado.trim()]);setNewEstado("");}}}
                style={{flex:1}}/>
              <Btn sm onClick={()=>{if(newEstado.trim()){setEstados(p=>[...p,newEstado.trim()]);setNewEstado("");}}}>+ Agregar</Btn>
            </div>
          </>
        )}

        {section==="trash"&&(
          <>
            <p style={{fontSize:14,color:c.textMuted,marginTop:0,marginBottom:12}}>Tudús eliminados — podés restaurarlos o eliminarlos definitivamente.</p>
            <div style={{background:c.surface2,borderRadius:8,padding:12,border:`1px dashed ${c.border}`}}>
              <p style={{fontSize:14,color:c.textFaint,textAlign:"center",margin:0}}>No hay tudús eliminados.</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({screen,onNav,collapsed,onToggle,dark:dk,cats,selectedCat,onCatSelect,tudus=[]}) {
  const c = th(dk||false);
  const [catsOpen,setCatsOpen] = useState(true);
  const catCounts: Record<string,number> = {};
  tudus.forEach((t: any)=>{ const cat=t.categoria||"Inbox"; catCounts[cat]=(catCounts[cat]||0)+1; });
  const Item=({iconName,label,id,badge,sub,catName})=>{
    const active = catName ? (screen==="category"&&selectedCat===catName) : screen===id;
    return (
      <button type="button" onClick={()=>{ if(catName){onCatSelect(catName);onNav("category");}else{onNav(id);} }} aria-label={label}
        style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:6,width:"calc(100% - 8px)",padding:collapsed?"10px 0":`8px ${sub?32:12}px`,fontSize:14,cursor:"pointer",borderRadius:6,margin:"1px 4px",background:active?"rgba(117,176,228,0.12)":"transparent",color:active?BRAND:c.textMuted,fontWeight:active?500:400,border:"none",fontFamily:"inherit",textAlign:"left"}}>
        <Icon name={iconName} size={15} color={active?BRAND:c.textMuted}/>
        {!collapsed&&<>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",color:active?BRAND:c.text}}>{label}</span>
          {badge>0&&<span style={{fontSize:11,padding:"1px 5px",borderRadius:12,background:c.surface2,color:c.textFaint,flexShrink:0}}>{badge}</span>}
        </>}
      </button>
    );
  };
  return (
    <nav aria-label="Navegación principal" style={{width:collapsed?44:196,flexShrink:0,background:c.surface,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",transition:"width .2s",overflow:"hidden"}}>
      <button type="button" aria-label={collapsed?"Expandir":"Colapsar"} onClick={onToggle}
        style={{display:"flex",justifyContent:collapsed?"center":"flex-end",padding:"8px 12px",cursor:"pointer",color:c.textFaint,fontSize:14,height:36,alignItems:"center",background:"none",border:"none",borderBottom:`1px solid ${c.border}`,width:"100%"}}>
        {collapsed?"›":"‹"}
      </button>
      <div style={{flex:1,overflowY:"auto",padding:"6px 0",display:"flex",flexDirection:"column"}}>
        <Item iconName="Star"     label="Dashboard" id="dashboard"/>
        <Item iconName="GridFour" label="Todas"     id="all"   badge={tudus.length}/>
        <Item iconName="Tray"     label="Inbox"     id="inbox" badge={catCounts["Inbox"]||0}/>
        {!collapsed&&<div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".5px",color:c.textFaint,padding:"8px 14px 2px"}}>Categorías</div>}
        {!collapsed&&(
          <button type="button" onClick={()=>setCatsOpen(o=>!o)} aria-expanded={catsOpen}
            style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",fontSize:14,cursor:"pointer",color:c.textMuted,borderRadius:6,margin:"1px 4px",background:"none",border:"none",fontFamily:"inherit",textAlign:"left",width:"calc(100% - 8px)"}}>
            <span>{catsOpen?"▾":"▸"}</span><span style={{color:c.text}}>Categorías</span>
          </button>
        )}
        {collapsed&&cats.map(cat=><Item key={cat.id} iconName={cat.icon} label={cat.name} id="category" catName={cat.name}/>)}
        {!collapsed&&catsOpen&&cats.map(cat=><Item key={cat.id} iconName={cat.icon} label={cat.name} id="category" badge={catCounts[cat.name]||0} sub catName={cat.name}/>)}
        <div style={{flex:1}}/>
        <div style={{borderTop:`1px solid ${c.border}`,paddingTop:4}}>
          <Item iconName="Gear"    label="Configuración" id="config"/>
          <Item iconName="SignOut" label="Salir"         id="logout"/>
        </div>
      </div>
    </nav>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
function BottomNav({screen,onNav,dark:dk}) {
  const c = th(dk||false);
  const ITEMS=[["Star","Dashboard","dashboard"],["GridFour","Todas","all"],["Tray","Inbox","inbox"],["Gear","Config","config"]];
  return (
    <nav aria-label="Navegación" style={{position:"fixed",bottom:0,left:0,right:0,background:c.surface,borderTop:`1px solid ${c.border}`,display:"flex",zIndex:100,height:56}}>
      {ITEMS.map(([icon,label,id])=>(
        <button key={id} type="button" aria-label={label} aria-current={screen===id?"page":undefined} onClick={()=>onNav(id)}
          style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer",color:screen===id?BRAND:c.textFaint,gap:2}}>
          <Icon name={icon} size={20} color={screen===id?BRAND:c.textFaint}/>
          <span style={{fontSize:9,fontFamily:"inherit"}}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark,setDark]           = useState(true);
  const [screen,setScreen]       = useState("dashboard");
  const [collapsed,setCollapsed] = useState(false);
  const [showNew,setShowNew]     = useState(false);
  const [showTudu,setShowTudu]   = useState(false);
  const [selectedTudu,setSelectedTudu] = useState<any>(null);
  const [showPomo,setShowPomo]   = useState(false);
  const [refreshKey,setRefreshKey] = useState(0);
  const [searchExp,setSearchExp] = useState(false);
  const [searchQuery,setSearchQuery] = useState("");
  const [cats]                   = useState(CATS_INIT);
  const [selectedCat,setSelectedCat] = useState("My Work");
  const [allTudus,setAllTudus]   = useState<any[]>([]);
  const [tudusLoading,setTudusLoading] = useState(true);
  const isMobile                 = useIsMobile();

  const loadTudus = ()=>{
    setTudusLoading(true);
    getTudus()
      .then(tudus=>setAllTudus(tudus))
      .catch(err=>console.error("Error cargando tudús:",err))
      .finally(()=>setTudusLoading(false));
  };
  useEffect(loadTudus,[refreshKey]);

  const openTudu = (t: any)=>{ setSelectedTudu(t); setShowTudu(true); };
  const refresh = ()=>setRefreshKey(k=>k+1);

  useEffect(()=>{ document.documentElement.classList.toggle("dark",dark); },[dark]);
  useEffect(()=>{ if(isMobile) setCollapsed(true); },[isMobile]);

  const c = th(dark);

  return (
    <GlobalToastProvider>
    <div style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:c.bg,color:c.text}}>
      <style>{`*{box-sizing:border-box}*:focus-visible{outline:2px solid ${BRAND};outline-offset:2px}`}</style>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px",height:52,flexShrink:0,background:c.surface,borderBottom:`1px solid ${c.border}`}}>
        <button type="button" aria-label="Inicio" onClick={()=>setScreen("dashboard")} style={{cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0,background:"none",border:"none",padding:0}}>
          <img src="https://i.imgur.com/aSpAvYD.png" style={{height:28,width:"auto"}} alt="tudús"
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
          <span style={{display:"none",fontSize:17,fontWeight:600,color:c.text}}>tudús</span>
        </button>

        <div role="search" style={{flex:1,display:"flex",justifyContent:"center",padding:"0 10px",position:"relative"}}>
          <div onClick={()=>{if(!searchExp){setSearchExp(true);setSearchQuery("");}}}
            style={{display:"flex",alignItems:"center",gap:6,height:26,padding:"0 10px",borderRadius:searchExp?"10px 10px 0 0":20,cursor:searchExp?"default":"pointer",border:`1px solid ${searchExp?BRAND:c.border}`,background:c.surface2,width:searchExp?360:100,overflow:"hidden",transition:"width .25s ease",justifyContent:"center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <circle cx="6.5" cy="6.5" r="5" stroke={searchExp?BRAND:"#9CA3AF"} strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke={searchExp?BRAND:"#9CA3AF"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {!searchExp&&<span style={{fontSize:14,color:c.textFaint}}>Buscar</span>}
            {searchExp&&<>
              <label htmlFor="search-input" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Buscar</label>
              <input id="search-input" autoFocus value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                onBlur={()=>setTimeout(()=>{setSearchExp(false);setSearchQuery("");},150)}
                onKeyDown={e=>{if(e.key==="Escape"){setSearchExp(false);setSearchQuery("");}}}
                style={{flex:1,fontSize:14,border:"none",background:"transparent",outline:"none",color:c.text,minWidth:0}}
                placeholder="Buscar tudús..."/>
              {searchQuery&&<button type="button" onClick={()=>setSearchQuery("")} style={{background:"none",border:"none",color:c.textFaint,cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>✕</button>}
            </>}
          </div>
          {searchExp&&searchQuery.trim().length>0&&(()=>{
            const q=searchQuery.trim().toLowerCase();
            const results=allTudus.filter((t:any)=>t.title.toLowerCase().includes(q)).slice(0,8);
            return results.length>0?(
              <div style={{position:"absolute",top:26,left:"50%",transform:"translateX(-50%)",width:360,background:c.surface,border:`1px solid ${BRAND}`,borderTop:"none",borderRadius:"0 0 10px 10px",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:200,maxHeight:280,overflowY:"auto"}}>
                {results.map((t:any)=>{
                  const emoji=TIPO_EMOJI[t.tipo]||"📋";
                  return (
                    <button key={t.id} type="button"
                      onMouseDown={e=>{e.preventDefault();openTudu(t);setSearchExp(false);setSearchQuery("");}}
                      style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",background:"none",border:"none",borderBottom:`1px solid ${c.border}`,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                      <span style={{fontSize:14,flexShrink:0}}>{emoji}</span>
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontSize:14,color:c.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                        <div style={{fontSize:11,color:c.textFaint}}>{t.categoria} · {t.estado}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ):searchQuery.trim().length>=2?(
              <div style={{position:"absolute",top:26,left:"50%",transform:"translateX(-50%)",width:360,background:c.surface,border:`1px solid ${BRAND}`,borderTop:"none",borderRadius:"0 0 10px 10px",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:200,padding:"12px",textAlign:"center"}}>
                <span style={{fontSize:13,color:c.textFaint}}>Sin resultados</span>
              </div>
            ):null;
          })()}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <button type="button" aria-label="Recargar tudús" onClick={refresh}
            style={{display:"flex",alignItems:"center",justifyContent:"center",width:30,height:30,borderRadius:6,border:`1px solid ${c.border}`,background:"transparent",cursor:"pointer",color:c.textMuted}}>
            <ArrowsClockwise size={16}/>
          </button>
          <button type="button" aria-label={"Modo "+(dark?"claro":"oscuro")} aria-pressed={dark} onClick={()=>setDark(d=>!d)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,border:`1px solid ${c.border}`,background:"transparent",cursor:"pointer",fontSize:13,color:c.textMuted,fontFamily:"inherit"}}>
            <span>{dark?"☽":"☀"}</span>{!isMobile&&<span>{dark?"Oscuro":"Claro"}</span>}
          </button>
          <div style={{width:26,height:26,borderRadius:"50%",background:"#7F77DD",color:"#fff",fontSize:11,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>JD</div>
        </div>
      </header>

      {/* BODY */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {!isMobile&&<Sidebar screen={screen} onNav={setScreen} collapsed={collapsed} onToggle={()=>setCollapsed(s=>!s)} dark={dark} cats={cats} selectedCat={selectedCat} onCatSelect={setSelectedCat} tudus={allTudus}/>}
        <div style={{flex:1,overflowY:"auto",padding:isMobile?"12px":"16px",paddingBottom:isMobile?72:16,background:c.bg}}>
          {screen==="dashboard" && <Dashboard key={refreshKey} tudus={allTudus} loading={tudusLoading} onNew={()=>setShowNew(true)} onTudu={openTudu} onRefresh={refresh} dark={dark} isMobile={isMobile}/>}
          {screen==="all"       && <ListView title="Todos los tudús" tudus={allTudus} loading={tudusLoading} onTudu={openTudu} dark={dark}/>}
          {screen==="inbox"     && <ListView title="Inbox" tudus={allTudus.filter(t=>t.categoria==="Inbox")} loading={tudusLoading} onTudu={openTudu} dark={dark}/>}
          {screen==="category"  && <CategoryView tudus={allTudus.filter(t=>t.categoria===selectedCat)} onView={()=>setScreen("canvas")} onTudu={openTudu}/>}
          {screen==="canvas"    && <CanvasView tudus={allTudus.filter(t=>t.categoria===selectedCat)} loading={tudusLoading} onNew={()=>setShowNew(true)} onTudu={openTudu} onRefresh={refresh} dark={dark} isMobile={isMobile}/>}
          {screen==="config"    && <ConfigView dark={dark} onToggle={()=>setDark(d=>!d)}/>}
        </div>
      </div>

      {isMobile&&<BottomNav screen={screen} onNav={setScreen} dark={dark}/>}

      {/* FAB */}
      <button type="button" aria-label="Crear nuevo Tudú" onClick={()=>setShowNew(true)}
        style={{position:"fixed",bottom:isMobile?66:18,right:18,width:46,height:46,borderRadius:"50%",background:BRAND,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:40,boxShadow:"0 4px 12px rgba(117,176,228,0.5)",border:"none"}}>
        <span style={{color:"#fff",fontSize:28,fontWeight:300,lineHeight:1}}>+</span>
      </button>

      {showNew  && <TuduForm   title="Nuevo Tudú" action="Crear Tudú" onClose={()=>setShowNew(false)} onCreated={refresh} dark={dark}
        defaultCat={(screen==="category"||screen==="canvas")?selectedCat:screen==="inbox"?"Inbox":undefined}/>}
      {showTudu && <TuduDetail tudu={selectedTudu} onClose={()=>{setShowTudu(false);setSelectedTudu(null);}} onPomo={()=>{setShowTudu(false);setShowPomo(true);}} onSaved={refresh} dark={dark}/>}
      {showPomo && <PomoWidget onClose={()=>setShowPomo(false)} onOpenTask={()=>setShowTudu(true)} isMobile={isMobile} dark={dark}/>}
    </div>
    </GlobalToastProvider>
  );
}
