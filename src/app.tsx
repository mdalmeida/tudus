import React from 'react';
import { useState, useRef, useEffect } from "react";
import { getTudus, createTudu, updateTudu, deleteTudu, type Tudu } from "./notion";
import { CheckSquare, Lightbulb, ChatCircle, Envelope, Users, ShoppingCart, Phone, MagnifyingGlass, Star, Lightning, Briefcase, Wallet, Heartbeat, GridFour, Gear, SignOut, Tray } from "@phosphor-icons/react";

const BRAND = "#75b0e4";

const TUDU_TYPES = ["📋 Tarea","💡 Idea","💬 WhatsApp","✉ Mail","👥 Teams","🛒 Compra","📞 Llamada","🎯 Decisión","🔁 Hábito","📚 Aprender","💭 Reflexionar","🔎 Investigar","💪 Ejercicio","✍ Redactar","📊 Analizar"];
const ESTADOS_DEFAULT = ["Por hacer","Empezada","En curso","Terminando","Esperando","Listo","No lo haré"];
const CATEGORIAS_NAMES = ["My Work","Setup Base","House & Car","Financial","Family","Social & Experiences","Skills","Health","Mindset","Inbox"];
const CUANDO = ["Sin fecha","Hoy","Mañana","Esta semana","Próxima semana","Este mes","Algún día"];

const calcDate = (c) => {
  const d = new Date();
  if(c==="Hoy") return d.toLocaleDateString("es-AR");
  if(c==="Mañana"){d.setDate(d.getDate()+1);return d.toLocaleDateString("es-AR");}
  if(c==="Esta semana"){d.setDate(d.getDate()+7);return d.toLocaleDateString("es-AR");}
  if(c==="Próxima semana"){d.setDate(d.getDate()+14);return d.toLocaleDateString("es-AR");}
  if(c==="Este mes"){d.setMonth(d.getMonth()+1);return d.toLocaleDateString("es-AR");}
  if(c==="Algún día"){d.setMonth(d.getMonth()+3);return d.toLocaleDateString("es-AR");}
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
function useToast() {
  const [msg,setMsg] = useState(null);
  const show = m=>{setMsg(m);setTimeout(()=>setMsg(null),2200);};
  const Toast = ()=>msg
    ? <div role="status" aria-live="polite" style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",background:"#111",color:"#fff",padding:"6px 16px",borderRadius:8,fontSize:14,zIndex:999,pointerEvents:"none",whiteSpace:"nowrap"}}>{msg}</div>
    : null;
  return {show,Toast};
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
  Briefcase, Wallet, HeartPulse: Heartbeat, Heartbeat, GridFour, Gear, SignOut, Tray,
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
function useToastInstance() { return useToast(); }

// ── WYSIWYG ───────────────────────────────────────────────────────────────────
const ED_TOOLS = [
  {icon:"B",cmd:"bold"},{icon:"I",cmd:"italic"},{icon:"U",cmd:"underline"},
  {icon:"H2",cmd:"formatBlock",val:"h3"},{icon:"¶",cmd:"formatBlock",val:"p"},
  {icon:"•",cmd:"insertUnorderedList"},{icon:"1.",cmd:"insertOrderedList"},
  {icon:"🔗",cmd:"createLink",prompt:"URL:"},{icon:"—",cmd:"insertHorizontalRule"},{icon:"✕",cmd:"removeFormat"},
];
function WysiwygEditor({placeholder,id}) {
  const ref = useRef(null);
  const exec = t=>{
    ref.current?.focus();
    if(t.prompt){const u=window.prompt(t.prompt);if(u)document.execCommand(t.cmd,false,u);}
    else document.execCommand(t.cmd,false,t.val||null);
  };
  return (
    <div style={{border:"1px solid #E5E7EB",borderRadius:8,overflow:"hidden"}}>
      <div role="toolbar" aria-label="Formato" style={{display:"flex",flexWrap:"wrap",gap:2,padding:"4px 6px",borderBottom:"1px solid #E5E7EB",background:"#F9FAFB"}}>
        {ED_TOOLS.map(t=>(
          <button key={t.icon} type="button" aria-label={t.icon} onMouseDown={e=>{e.preventDefault();exec(t);}}
            style={{padding:"2px 6px",fontSize:13,borderRadius:4,cursor:"pointer",border:"none",background:"transparent",color:"#6B7280",fontFamily:"monospace",minWidth:24}}
            onMouseOver={e=>e.currentTarget.style.background="#E5E7EB"}
            onMouseOut={e=>e.currentTarget.style.background="transparent"}>{t.icon}</button>
        ))}
      </div>
      <div ref={ref} id={id} contentEditable suppressContentEditableWarning
        role="textbox" aria-multiline="true" data-placeholder={placeholder||"Escribí acá..."}
        style={{minHeight:100,padding:"8px 12px",fontSize:14,lineHeight:1.7,outline:"none",color:"#111",background:"#fff"}}/>
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9CA3AF;pointer-events:none}[contenteditable] h3{font-size:13px;font-weight:600;margin:4px 0}[contenteditable] ul{list-style:disc;padding-left:18px;margin:4px 0}[contenteditable] ol{list-style:decimal;padding-left:18px;margin:4px 0}[contenteditable] a{color:#3B82F6;text-decoration:underline}[contenteditable] strong{font-weight:700}[contenteditable] em{font-style:italic}*:focus-visible{outline:2px solid ${BRAND};outline-offset:2px}`}</style>
    </div>
  );
}

// ── TuduForm ──────────────────────────────────────────────────────────────────
function TuduForm({title,action,onClose,onCreated,editTudu,dark:dk}) {
  const et = editTudu;
  const matchTipo = et?.tipo ? TUDU_TYPES.find(t=>t.includes(et.tipo))||TUDU_TYPES[0] : TUDU_TYPES[0];
  const matchColor = et?.color ? PCOLORS.findIndex(p=>p.bg===et.color) : 0;
  const matchSize = et?.tamano ? ["XS","S","M","L","XL"].indexOf(et.tamano) : 2;
  const [nombre,setNombre]     = useState(et?.title||"");
  const [tipo,setTipo]         = useState(matchTipo);
  const [cat,setCat]           = useState(et?.categoria||CATEGORIAS_NAMES[0]);
  const [estado,setEstado]     = useState(et?.estado||ESTADOS_DEFAULT[0]);
  const [cuando,setCuando]     = useState(et?.cuando||"Sin fecha");
  const [deadline,setDeadline] = useState(et?.deadline||"");
  const [selColor,setSelColor] = useState(matchColor>=0?matchColor:0);
  const [selSize,setSelSize]   = useState(matchSize>=0?matchSize:2);
  const [selIcon,setSelIcon]   = useState("CheckSquare");
  const [tags,setTags]         = useState(et?.etiquetas?.join(", ")||"");
  const [saving,setSaving]     = useState(false);
  const dateHint = calcDate(cuando);
  const titleId = "form-title-"+action;
  const SIZES = ["XS","S","M","L","XL"];

  const handleSubmit = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      const tipoClean = tipo.replace(/^.+\s/,"");
      const data = {
        title: nombre.trim(),
        tipo: tipoClean,
        categoria: cat,
        estado,
        cuando,
        deadline: deadline || null,
        color: PCOLORS[selColor].bg,
        tamano: SIZES[selSize],
        etiquetas: tags.split(",").map(t=>t.trim()).filter(Boolean),
        contenido: "",
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
        <h2 id={titleId} style={{fontSize:14,fontWeight:500,margin:0}}>{title}</h2>
        <button type="button" aria-label="Cerrar" onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
      </div>
      <Fld label="Título" id="f-title"><Inp id="f-title" dark={dk} placeholder="¿Qué tenés que hacer?" autoFocus value={nombre} onChange={e=>setNombre(e.target.value)}/></Fld>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Tipo" id="f-tipo"><Sel id="f-tipo" dark={dk} value={tipo} onChange={e=>setTipo(e.target.value)}>{TUDU_TYPES.map(v=><option key={v}>{v}</option>)}</Sel></Fld>
        <Fld label="Categoría" id="f-cat"><Sel id="f-cat" dark={dk} value={cat} onChange={e=>setCat(e.target.value)}>{CATEGORIAS_NAMES.map(v=><option key={v}>{v}</option>)}</Sel></Fld>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Estado" id="f-estado"><Sel id="f-estado" dark={dk} value={estado} onChange={e=>setEstado(e.target.value)}>{ESTADOS_DEFAULT.filter(v=>v!=="Terminando").map(v=><option key={v}>{v}</option>)}</Sel></Fld>
        <Fld label="Cuándo" id="f-cuando">
          <Sel id="f-cuando" dark={dk} value={cuando} onChange={e=>setCuando(e.target.value)}>{CUANDO.map(v=><option key={v}>{v}</option>)}</Sel>
          {dateHint&&<div style={{fontSize:11,color:BRAND,marginTop:3}}>→ {dateHint}</div>}
        </Fld>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Deadline" id="f-dl"><Inp id="f-dl" dark={dk} type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></Fld>
        <Fld label="Tudú padre" id="f-padre"><Sel id="f-padre" dark={dk}><option>— Ninguno —</option><option>Proyecto Alpha</option></Sel></Fld>
      </div>
      <Fld label="Ícono" id="f-icon"><IconPicker value={selIcon} onChange={setSelIcon}/></Fld>
      <Fld label="Color" id="f-color">
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {PCOLORS.map((pc,i)=>(
            <button key={i} type="button" aria-label={"Color "+(i+1)} onClick={()=>setSelColor(i)}
              style={{width:20,height:20,borderRadius:"50%",cursor:"pointer",background:pc.bg,border:selColor===i?"2px solid #374151":"2px solid transparent"}}/>
          ))}
          <input type="color" aria-label="Color personalizado" defaultValue="#FEF08A" style={{width:20,height:20,borderRadius:"50%",border:"none",padding:0,cursor:"pointer"}}/>
        </div>
      </Fld>
      <Fld label="Tamaño" id="f-size">
        <div style={{display:"flex",gap:6}}>
          {SIZES.map((sz,i)=>(
            <button key={sz} type="button" onClick={()=>setSelSize(i)}
              style={{fontSize:13,padding:"2px 8px",borderRadius:5,cursor:"pointer",border:"1px solid",
                background:selSize===i?BRAND:"transparent",color:selSize===i?"#fff":"#9CA3AF",borderColor:selSize===i?BRAND:"#E5E7EB"}}>{sz}</button>
          ))}
        </div>
      </Fld>
      <Fld label="Etiquetas" id="f-tags"><Inp id="f-tags" dark={dk} placeholder="trabajo, urgente... (coma)" value={tags} onChange={e=>setTags(e.target.value)}/></Fld>
      <Fld label="Contenido" id="f-content"><WysiwygEditor id="f-content" placeholder="Escribí acá..."/></Fld>
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
  const [editing,setEditing]   = useState(false);
  const [status,setStatus]     = useState(tudu?.estado||"Por hacer");
  const [deleting,setDeleting] = useState(false);
  const [subtasks,setSubtasks] = useState([{id:1,title:"Preparar agenda",done:false},{id:2,title:"Confirmar asistentes",done:true}]);
  const [newSub,setNewSub]     = useState("");
  const titleId = "modal-tudu-detail";
  const emoji = TIPO_EMOJI[tudu?.tipo]||"📋";

  if(editing) return <TuduForm title="Editar Tudú" action="Guardar" editTudu={tudu} onClose={()=>setEditing(false)} onCreated={()=>{onSaved?.();setEditing(false);}} dark={dk}/>;

  const handleStatusChange=async(newStatus)=>{
    setStatus(newStatus);
    try{ await updateTudu(tudu.id,{estado:newStatus}); onSaved?.(); }catch(err){ console.error(err); }
  };

  const handleDelete=async()=>{
    setDeleting(true);
    try{ await deleteTudu(tudu.id); onSaved?.(); onClose(); }catch(err){ console.error(err); setDeleting(false); }
  };

  const addSub = ()=>{
    if(!newSub.trim()) return;
    setSubtasks(p=>[...p,{id:Date.now(),title:newSub.trim(),done:false}]);
    setNewSub("");
  };

  return (
    <Overlay onClose={onClose} dark={dk} titleId={titleId}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:12}}>
        <span style={{fontSize:18}}>{emoji}</span>
        <div style={{flex:1}}>
          <h2 id={titleId} style={{fontSize:14,fontWeight:500,color:c.text,margin:0}}>{tudu?.title||"Sin título"}</h2>
          <div style={{fontSize:13,color:c.textFaint,marginTop:2}}>{tudu?.categoria} · {tudu?.tipo}</div>
        </div>
        <button type="button" aria-label="Cerrar" onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:c.textFaint}}>✕</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
        <div style={{background:c.surface2,borderRadius:8,padding:"7px 10px",border:`1px solid ${c.border}`}}>
          <label htmlFor="det-status" style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3,display:"block"}}>Estado</label>
          <select id="det-status" value={status} onChange={e=>handleStatusChange(e.target.value)}
            style={{border:"none",background:"transparent",padding:0,fontSize:14,color:c.text,cursor:"pointer",width:"100%",outline:"none"}}>
            {ESTADOS_DEFAULT.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {[["Cuándo",tudu?.cuando||"Sin fecha"],["Tipo",`${emoji} ${tudu?.tipo}`],["Tamaño",tudu?.tamano||"M"]].map(([l,v])=>(
          <div key={l} style={{background:c.surface2,borderRadius:8,padding:"7px 10px",border:`1px solid ${c.border}`}}>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3}}>{l}</div>
            <div style={{fontSize:14,color:c.text}}>{v}</div>
          </div>
        ))}
      </div>

      {tudu?.contenido&&(
        <div style={{background:c.surface2,borderRadius:8,padding:12,marginBottom:12,fontSize:14,lineHeight:1.7,color:c.textMuted,border:`1px solid ${c.border}`}}>
          {tudu.contenido}
        </div>
      )}

      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:500,color:c.textFaint,marginBottom:6,textTransform:"uppercase",letterSpacing:".4px"}}>Subtareas</div>
        {subtasks.length>0&&(
          <ul style={{listStyle:"none",padding:0,margin:"0 0 8px 0"}}>
            {subtasks.map(sub=>(
              <li key={sub.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${c.border}`}}>
                <input type="checkbox" id={"sub-"+sub.id} checked={sub.done}
                  onChange={()=>setSubtasks(p=>p.map(s=>s.id===sub.id?{...s,done:!s.done}:s))}
                  style={{accentColor:BRAND,cursor:"pointer",flexShrink:0}}/>
                <label htmlFor={"sub-"+sub.id} style={{flex:1,fontSize:14,cursor:"pointer",color:sub.done?c.textFaint:c.text,textDecoration:sub.done?"line-through":"none"}}>{sub.title}</label>
                <button type="button" aria-label={"Eliminar "+sub.title}
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

      <button type="button" onClick={()=>{onClose();onPomo();}}
        style={{display:"flex",alignItems:"center",gap:8,background:c.surface2,borderRadius:8,padding:"8px 12px",cursor:"pointer",border:`1px solid ${c.border}`,width:"100%",textAlign:"left",marginBottom:10,fontFamily:"inherit"}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⏱</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:500,color:c.text}}>Iniciar Pomodoro</div>
          <div style={{fontSize:13,color:c.textFaint}}>25 min de foco</div>
        </div>
        <span style={{color:c.border}}>›</span>
      </button>

      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>setEditing(true)} style={{flex:1}}>✎ Editar Tudú completo</Btn>
        <button type="button" onClick={handleDelete} disabled={deleting}
          style={{padding:"8px 16px",borderRadius:8,border:"1px solid #FCA5A5",background:"transparent",color:"#DC2626",cursor:"pointer",fontSize:14,fontFamily:"inherit",opacity:deleting?0.5:1}}>
          {deleting?"Eliminando...":"🗑 Eliminar"}
        </button>
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
  const [quickVal,setQuickVal] = useState("");
  const [quickSaving,setQuickSaving] = useState(false);
  const slotRefs = useRef({});
  const {show,Toast} = useToast();

  const SLOTS = ["Hoy","Mañana / Pasado","Esta semana","Próxima semana"];
  const pool = allTudus.filter(t=>!t.cuando||t.cuando==="Sin fecha"||t.cuando==="Algún día");
  const slotItems = (slot: string) => allTudus.filter(t=>CUANDO_TO_SLOT[t.cuando]===slot);

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
    setDragId(null);setOverSlot(null);
    const cuando = SLOT_TO_CUANDO[slot];
    if(cuando){
      setAllTudus(p=>p.map(t=>t.id===dragId?{...t,cuando}:t));
      show("Asignado a: "+slot);
      try{ await updateTudu(dragId,{cuando}); onRefresh?.(); }catch(err){ console.error(err); show("Error al mover"); onRefresh?.(); }
    }
  };

  const handleQuickCreate=async()=>{
    if(!quickVal.trim()||quickSaving) return;
    setQuickSaving(true);
    try{
      await createTudu({title:quickVal.trim(),categoria:"Inbox",estado:"Por hacer",cuando:"Sin fecha"});
      setQuickVal("");
      show("Tudú creado en Inbox");
      onRefresh?.();
    }catch(err){ console.error(err); show("Error al crear"); }
    finally{ setQuickSaving(false); }
  };

  const TuduChip=({item})=>(
    <div draggable
      onDragStart={e=>{setDragId(item.id);e.dataTransfer.setData("text/plain",String(item.id));}}
      onDragEnd={()=>setDragId(null)}
      onClick={()=>onTudu(item)}
      style={{background:item.c.bg,color:item.c.tx,borderRadius:8,padding:"6px 9px",fontSize:13,cursor:"grab",minWidth:80,maxWidth:140,userSelect:"none",opacity:dragId===item.id?0.3:1,boxShadow:"1px 2px 6px rgba(0,0,0,0.12)",transition:"opacity .15s"}}>
      <div style={{fontSize:11,opacity:.7,marginBottom:1}}>{item.type}</div>
      <div style={{fontWeight:500,lineHeight:1.3}}>{item.title}</div>
      <div style={{fontSize:11,opacity:.6,marginTop:2}}>{item.cat}</div>
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
      <Toast/>
    </main>
  );
}

// ── ListView ──────────────────────────────────────────────────────────────────
function ListView({title,tudus=[],loading,onTudu,dark:dk}) {
  const c = th(dk||false);
  const [filterEstado,setFilterEstado] = useState("");
  const [filterTipo,setFilterTipo]     = useState("");
  const [filterCuando,setFilterCuando] = useState("");
  const drag = useRef(null);

  let filtered = tudus;
  if(filterEstado) filtered = filtered.filter(t=>t.estado===filterEstado);
  if(filterTipo)   filtered = filtered.filter(t=>t.tipo===filterTipo);
  if(filterCuando) filtered = filtered.filter(t=>t.cuando===filterCuando);
  const [order,setOrder] = useState<string[]>([]);
  useEffect(()=>setOrder(filtered.map(t=>t.id)),[tudus,filterEstado,filterTipo,filterCuando]);
  const sorted = order.map(id=>filtered.find(t=>t.id===id)).filter(Boolean);
  if(sorted.length<filtered.length) filtered.forEach(t=>{if(!sorted.find(s=>s.id===t.id))sorted.push(t);});

  return (
    <main style={{display:"flex",flexDirection:"column",gap:10}}>
      <h1 style={{fontSize:17,fontWeight:500,color:c.text,margin:0}}>{title}</h1>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <select aria-label="Filtrar estado" value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}
          style={{fontSize:13,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
          <option value="">Todos los estados</option>
          {ESTADOS_DEFAULT.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select aria-label="Filtrar tipo" value={filterTipo} onChange={e=>setFilterTipo(e.target.value)}
          style={{fontSize:13,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
          <option value="">Todos los tipos</option>
          {TUDU_TYPES.map(t=>{const clean=t.replace(/^.+\s/,"");return <option key={clean} value={clean}>{t}</option>;})}
        </select>
        <select aria-label="Filtrar fecha" value={filterCuando} onChange={e=>setFilterCuando(e.target.value)}
          style={{fontSize:13,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
          <option value="">Cualquier fecha</option>
          {CUANDO.map(q=><option key={q} value={q}>{q}</option>)}
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
                const n=[...order];const[m]=n.splice(drag.current,1);n.splice(i,0,m);setOrder(n);drag.current=null;
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
              <button key={i} type="button" onClick={()=>onTudu(item)} style={{flex:1,borderRadius:8,padding:"8px 10px",cursor:"pointer",background:item.bg,color:item.tx,boxShadow:"1px 2px 6px rgba(0,0,0,0.18)",border:"none",textAlign:"left"}}
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
function PostitsView({onTudu,dark:dk}) {
  const c = th(dk||false);
  const [pos,setPos] = useState(CANVAS_INIT.reduce((a,p)=>({...a,[p.id]:{x:p.x,y:p.y}}),{}));
  const drag = useRef(null);
  const moved = useRef(false);
  const areaRef = useRef(null);
  const onMD=(e,id)=>{const r=areaRef.current.getBoundingClientRect();drag.current={id,ox:e.clientX-r.left-pos[id].x,oy:e.clientY-r.top-pos[id].y};moved.current=false;e.preventDefault();};
  const onMM=e=>{if(!drag.current||!areaRef.current)return;moved.current=true;const{id,ox,oy}=drag.current;const r=areaRef.current.getBoundingClientRect();setPos(p=>({...p,[id]:{x:Math.max(0,Math.min(r.width-120,e.clientX-r.left-ox)),y:Math.max(0,Math.min(r.height-100,e.clientY-r.top-oy))}}));};
  const onMU=(e,id)=>{if(!moved.current&&id!==undefined)onTudu();drag.current=null;moved.current=false;};
  return (
    <div ref={areaRef} onMouseMove={onMM} onMouseUp={()=>{drag.current=null;}}
      style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:12,height:320,position:"relative",overflow:"hidden",backgroundImage:`radial-gradient(circle,${c.border} 1px,transparent 1px)`,backgroundSize:"20px 20px"}}>
      {CANVAS_INIT.map(p=>(
        <div key={p.id} onMouseDown={e=>onMD(e,p.id)} onMouseUp={e=>onMU(e,p.id)}
          style={{position:"absolute",left:pos[p.id].x,top:pos[p.id].y,background:p.bg,color:p.tx,borderRadius:8,padding:"8px 10px",fontSize:13,userSelect:"none",minWidth:95,maxWidth:135,cursor:drag.current?.id===p.id?"grabbing":"grab",boxShadow:"2px 3px 8px rgba(0,0,0,0.18)",zIndex:drag.current?.id===p.id?50:1}}>
          <div style={{fontSize:11,opacity:.75,marginBottom:2,pointerEvents:"none"}}>{p.type}</div>
          <div style={{fontWeight:500,lineHeight:1.3,pointerEvents:"none"}}>{p.title}</div>
          {p.status&&<div style={{fontSize:11,padding:"1px 5px",borderRadius:3,background:"rgba(0,0,0,0.1)",marginTop:4,display:"inline-block",pointerEvents:"none"}}>{p.status}</div>}
          <div style={{fontSize:11,opacity:.65,marginTop:3,pointerEvents:"none"}}>{p.date}</div>
        </div>
      ))}
    </div>
  );
}

// ── KanbanView ────────────────────────────────────────────────────────────────
function KanbanView({init,onTudu,dark:dk}) {
  const c = th(dk||false);
  const [cols,setCols] = useState(init);
  const drag = useRef(null);
  const onDS=(col,id)=>{drag.current={col,id};};
  const onDrop=target=>{
    if(!drag.current) return;
    const{col,id}=drag.current;drag.current=null;if(col===target)return;
    setCols(prev=>{const card=(prev[col]||[]).find(item=>item.id===id);if(!card)return prev;return{...prev,[col]:(prev[col]||[]).filter(item=>item.id!==id),[target]:[...(prev[target]||[]),card]};});
  };
  return (
    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
      {Object.entries(cols).map(([col,cards])=>(
        <div key={col} style={{minWidth:138,maxWidth:138,background:c.surface2,borderRadius:12,padding:8,flexShrink:0,border:col==="Vencido"?"2px solid #EF4444":col==="Hoy"?`2px solid ${BRAND}`:`1px solid ${c.border}`}}
          onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(col)}>
          <h3 style={{fontSize:11,fontWeight:500,textTransform:"uppercase",letterSpacing:".4px",margin:"0 0 6px 0",color:col==="Vencido"?"#EF4444":col==="Hoy"?BRAND:c.textFaint}}>{col}</h3>
          {(cards||[]).length===0&&<p style={{fontSize:13,color:c.textFaint,textAlign:"center",padding:"8px 0",margin:0}}>Sin tudús</p>}
          {(cards||[]).map(item=>(
            <div key={item.id} draggable onDragStart={()=>onDS(col,item.id)} onDragEnd={()=>{drag.current=null;}}
              style={{background:c.surface,border:`0.5px solid ${c.border}`,borderLeft:`3px solid ${item.lc}`,borderRadius:6,padding:"6px 8px",marginBottom:4,cursor:"grab",fontSize:14}}>
              <div style={{fontSize:11,color:c.textFaint}}>{item.type}</div>
              <button type="button" onClick={onTudu} style={{display:"block",fontWeight:500,fontSize:13,color:c.text,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left",width:"100%"}}>{item.title}</button>
              <div style={{fontSize:11,color:c.textFaint,marginTop:2}}>{item.date}</div>
            </div>
          ))}
        </div>
      ))}
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
function CanvasView({tudus=[],loading,onNew,onTudu,dark:dk,isMobile}) {
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
        {view==="postits"  && <PostitsView onTudu={onTudu} dark={dk}/>}
        {view==="list"     && <ListView title="My Work" tudus={tudus} loading={loading} onTudu={onTudu} dark={dk}/>}
        {view==="kanban"   && <KanbanView init={KANBAN_INIT} onTudu={onTudu} dark={dk}/>}
        {view==="kplan"    && <><p style={{fontSize:13,color:c.textFaint,margin:"0 0 4px"}}>Arrastrá cards entre columnas para re-planificar</p><KanbanView init={KPLAN_INIT} onTudu={onTudu} dark={dk}/></>}
        {view==="gantt"    && <GanttView dark={dk}/>}
      </div>
    </main>
  );
}

// ── ConfigView ────────────────────────────────────────────────────────────────
function ConfigView({dark:dk,onToggle}) {
  const c = th(dk||false);
  const [cats,setCats]       = useState(CATS_INIT);
  const [estados,setEstados] = useState(ESTADOS_DEFAULT);
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
function Sidebar({screen,onNav,collapsed,onToggle,dark:dk,cats}) {
  const c = th(dk||false);
  const [catsOpen,setCatsOpen] = useState(true);
  const Item=({iconName,label,id,badge,sub})=>{
    const active=screen===id;
    return (
      <button type="button" onClick={()=>onNav(id)} aria-label={label}
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
        <Item iconName="GridFour" label="Todas"     id="all"   badge={28}/>
        <Item iconName="Tray"     label="Inbox"     id="inbox" badge={3}/>
        {!collapsed&&<div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".5px",color:c.textFaint,padding:"8px 14px 2px"}}>Categorías</div>}
        {!collapsed&&(
          <button type="button" onClick={()=>setCatsOpen(o=>!o)} aria-expanded={catsOpen}
            style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",fontSize:14,cursor:"pointer",color:c.textMuted,borderRadius:6,margin:"1px 4px",background:"none",border:"none",fontFamily:"inherit",textAlign:"left",width:"calc(100% - 8px)"}}>
            <span>{catsOpen?"▾":"▸"}</span><span style={{color:c.text}}>Categorías</span>
          </button>
        )}
        {collapsed&&cats.map(cat=><Item key={cat.id} iconName={cat.icon} label={cat.name} id="category"/>)}
        {!collapsed&&catsOpen&&cats.map(cat=><Item key={cat.id} iconName={cat.icon} label={cat.name} id="category" badge={cat.badge} sub/>)}
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
  const [cats]                   = useState(CATS_INIT);
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
    <div style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:c.bg,color:c.text}}>
      <style>{`*{box-sizing:border-box}*:focus-visible{outline:2px solid ${BRAND};outline-offset:2px}`}</style>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px",height:52,flexShrink:0,background:c.surface,borderBottom:`1px solid ${c.border}`}}>
        <button type="button" aria-label="Inicio" onClick={()=>setScreen("dashboard")} style={{cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0,background:"none",border:"none",padding:0}}>
          <img src="https://i.imgur.com/aSpAvYD.png" style={{height:28,width:"auto"}} alt="tudús"
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
          <span style={{display:"none",fontSize:17,fontWeight:600,color:c.text}}>tudús</span>
        </button>

        <div role="search" style={{flex:1,display:"flex",justifyContent:"center",padding:"0 10px"}}>
          <div onClick={()=>!searchExp&&setSearchExp(true)}
            style={{display:"flex",alignItems:"center",gap:6,height:26,padding:"0 10px",borderRadius:20,cursor:searchExp?"default":"pointer",border:`1px solid ${c.border}`,background:c.surface2,width:searchExp?320:100,overflow:"hidden",transition:"width .25s ease",justifyContent:"center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <circle cx="6.5" cy="6.5" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {!searchExp&&<span style={{fontSize:14,color:c.textFaint}}>Buscar</span>}
            {searchExp&&<>
              <label htmlFor="search-input" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Buscar</label>
              <input id="search-input" autoFocus onBlur={()=>setSearchExp(false)}
                style={{flex:1,fontSize:14,border:"none",background:"transparent",outline:"none",color:c.text,minWidth:0}}
                placeholder="Buscar tudús..."/>
              <select onMouseDown={e=>e.stopPropagation()}
                style={{fontSize:13,border:"none",background:"transparent",outline:"none",color:c.textFaint,cursor:"pointer",flexShrink:0}}>
                <option>Todas</option><option>Esta categoría</option><option>Otra categoría</option>
              </select>
            </>}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <button type="button" aria-label={"Modo "+(dark?"claro":"oscuro")} aria-pressed={dark} onClick={()=>setDark(d=>!d)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,border:`1px solid ${c.border}`,background:"transparent",cursor:"pointer",fontSize:13,color:c.textMuted,fontFamily:"inherit"}}>
            <span>{dark?"☽":"☀"}</span>{!isMobile&&<span>{dark?"Oscuro":"Claro"}</span>}
          </button>
          <div style={{width:26,height:26,borderRadius:"50%",background:"#7F77DD",color:"#fff",fontSize:11,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>JD</div>
        </div>
      </header>

      {/* BODY */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {!isMobile&&<Sidebar screen={screen} onNav={setScreen} collapsed={collapsed} onToggle={()=>setCollapsed(s=>!s)} dark={dark} cats={cats}/>}
        <div style={{flex:1,overflowY:"auto",padding:isMobile?"12px":"16px",paddingBottom:isMobile?72:16,background:c.bg}}>
          {screen==="dashboard" && <Dashboard key={refreshKey} tudus={allTudus} loading={tudusLoading} onNew={()=>setShowNew(true)} onTudu={openTudu} onRefresh={refresh} dark={dark} isMobile={isMobile}/>}
          {screen==="all"       && <ListView title="Todos los tudús" tudus={allTudus} loading={tudusLoading} onTudu={openTudu} dark={dark}/>}
          {screen==="inbox"     && <ListView title="Inbox" tudus={allTudus.filter(t=>t.categoria==="Inbox")} loading={tudusLoading} onTudu={openTudu} dark={dark}/>}
          {screen==="category"  && <CategoryView tudus={allTudus.filter(t=>t.categoria==="My Work")} onView={()=>setScreen("canvas")} onTudu={openTudu}/>}
          {screen==="canvas"    && <CanvasView tudus={allTudus.filter(t=>t.categoria==="My Work")} loading={tudusLoading} onNew={()=>setShowNew(true)} onTudu={openTudu} dark={dark} isMobile={isMobile}/>}
          {screen==="config"    && <ConfigView dark={dark} onToggle={()=>setDark(d=>!d)}/>}
        </div>
      </div>

      {isMobile&&<BottomNav screen={screen} onNav={setScreen} dark={dark}/>}

      {/* FAB */}
      <button type="button" aria-label="Crear nuevo Tudú" onClick={()=>setShowNew(true)}
        style={{position:"fixed",bottom:isMobile?66:18,right:18,width:46,height:46,borderRadius:"50%",background:BRAND,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:40,boxShadow:"0 4px 12px rgba(117,176,228,0.5)",border:"none"}}>
        <img src="https://i.imgur.com/CSTzdkj.png" style={{width:24,height:24,objectFit:"contain"}} alt=""
          onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
        <span style={{display:"none",color:"#fff",fontSize:22,fontWeight:300}}>+</span>
      </button>

      {showNew  && <TuduForm   title="Nuevo Tudú" action="Crear Tudú" onClose={()=>setShowNew(false)} onCreated={refresh} dark={dark}/>}
      {showTudu && <TuduDetail tudu={selectedTudu} onClose={()=>{setShowTudu(false);setSelectedTudu(null);}} onPomo={()=>{setShowTudu(false);setShowPomo(true);}} onSaved={refresh} dark={dark}/>}
      {showPomo && <PomoWidget onClose={()=>setShowPomo(false)} onOpenTask={()=>setShowTudu(true)} isMobile={isMobile} dark={dark}/>}
    </div>
  );
}
