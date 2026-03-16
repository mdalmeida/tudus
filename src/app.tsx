import React from 'react';
import { useState, useRef, useEffect } from "react";

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

const POOL_INIT = [
  {id:1,type:"📋 Tarea",   title:"Arreglar canilla",    cat:"House & Car",c:PCOLORS[0]},
  {id:2,type:"💡 Idea",    title:"Leer sobre hábitos",  cat:"Skills",     c:PCOLORS[1]},
  {id:3,type:"📊 Analizar",title:"Revisar inversiones",  cat:"Financial",  c:PCOLORS[2]},
  {id:4,type:"📋 Tarea",   title:"Meditación matutina", cat:"Health",     c:PCOLORS[3]},
  {id:5,type:"💬 WhatsApp",title:"Llamar a mamá",        cat:"Family",     c:PCOLORS[4]},
  {id:6,type:"📊 Analizar",title:"Presupuesto Q2",       cat:"My Work",    c:PCOLORS[5]},
  {id:7,type:"📋 Tarea",   title:"Turno dentista",      cat:"Health",     c:PCOLORS[0]},
  {id:8,type:"🛒 Compra",  title:"Renovar seguro auto", cat:"House & Car",c:PCOLORS[6]},
];

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
    ? <div role="status" aria-live="polite" style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",background:"#111",color:"#fff",padding:"6px 16px",borderRadius:8,fontSize:12,zIndex:999,pointerEvents:"none",whiteSpace:"nowrap"}}>{msg}</div>
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
const PHO = {
  CheckSquare:<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Zm-16,0H48V208H208Z"/></svg>,
  Lightbulb:  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104a88,88,0,0,1,176,0Zm-16,0a72,72,0,1,0-72,72A72.08,72.08,0,0,0,200,104Z"/></svg>,
  ChatCircle: <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a88.11,88.11,0,0,1-45.06-12.41,8,8,0,0,0-6.74-.68L40,216,52.09,179.8a8,8,0,0,0-.68-6.74A88,88,0,1,1,128,216Z"/></svg>,
  Envelope:   <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"/></svg>,
  Users:      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M164.47,195.63a8,8,0,0,1-6.7,12.37H34.23a8,8,0,0,1-6.7-12.37,96.08,96.08,0,0,1,75.23-47.33,52,52,0,1,1,53.48,0A96.08,96.08,0,0,1,164.47,195.63ZM224,212a8,8,0,0,1-8,8H194a8,8,0,0,1,0-16h12.1A88.21,88.21,0,0,0,168,152.84a8,8,0,0,1,4.07-15.49A104.18,104.18,0,0,1,232,212A8,8,0,0,1,224,212ZM184,92a44,44,0,0,0-44-44,8,8,0,0,1,0-16,60,60,0,0,1,0,120,8,8,0,0,1,0-16A44.05,44.05,0,0,0,184,92Z"/></svg>,
  ShoppingCart:<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16H34.05l32.51,168.86A24,24,0,1,0,98.24,224a23.84,23.84,0,0,0-1.24-8H160a24,24,0,1,0,23.84-8H97.76l-4.87-24H208a8,8,0,0,0,7.79-6.22l16-80A8,8,0,0,0,222.14,58.87Z"/></svg>,
  Phone:      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46Z"/></svg>,
  MagGlass:   <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.07a88,88,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>,
  Star:       <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34L128,200l-51.07,29.71A16,16,0,0,1,53.09,212.34l13.51-58.6L21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0L165.93,81.17l59.46,5.15a16,16,0,0,1,9.11,28.06Z"/></svg>,
  Lightning:  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17Z"/></svg>,
  Briefcase:  <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm120,152H40V72H216Z"/></svg>,
  Wallet:     <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M216,72H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,64V192a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm0,128H56a8,8,0,0,1-8-8V86.63A23.84,23.84,0,0,0,56,88H216Zm-32-60a12,12,0,1,1-12-12A12,12,0,0,1,184,140Z"/></svg>,
  HeartPulse: <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M188,40a52,52,0,0,0-52,52,52,52,0,0,0-52-52A52.06,52.06,0,0,0,32,92c0,64,96,124,96,124S224,156,224,92A52.06,52.06,0,0,0,188,40Z"/></svg>,
  GridFour:   <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H40a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V56A8,8,0,0,0,216,48ZM112,192H56V136h56Zm0-72H56V64h56Zm88,72H128V136h72Zm0-72H128V64h72Z"/></svg>,
  Gear:       <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.9,123.66Z"/></svg>,
  SignOut:    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"/></svg>,
  Tray:       <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V160H88a40,40,0,0,0,80,0h40ZM48,144V48H208v96H168a8,8,0,0,0-8,8,24,24,0,0,1-48,0,8,8,0,0,0-8-8Z"/></svg>,
};
const PHO_KEYS = Object.keys(PHO);

function Icon({name,size=16,color}) {
  const icon = PHO[name] || PHO.CheckSquare;
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",color:color||"currentColor",width:size,height:size,flexShrink:0}}>{icon}</span>;
}
function IconPicker({value,onChange}) {
  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {PHO_KEYS.map(k=>(
        <button key={k} type="button" aria-label={k} onClick={()=>onChange(k)}
          style={{width:32,height:32,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
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
  return <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:c.bg,color:c.tx}}>{s}</span>;
}
function Btn({children,onClick,ghost,sm,style:sx={},type="button"}) {
  return (
    <button type={type} onClick={onClick} style={{borderRadius:7,fontWeight:500,cursor:"pointer",fontFamily:"inherit",border:"none",
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
      <label htmlFor={id} style={{fontSize:10,textTransform:"uppercase",letterSpacing:".4px",color:"#9CA3AF",marginBottom:3,display:"block"}}>{label}</label>
      {children}
    </div>
  );
}
function Inp({id,...props}) {
  return <input id={id} {...props} style={{width:"100%",padding:"6px 10px",fontSize:12,border:"1px solid #E5E7EB",borderRadius:7,background:"#F9FAFB",color:"#111827",outline:"none",fontFamily:"inherit",...(props.style||{})}}/>;
}
function Sel({id,children,...props}) {
  return <select id={id} {...props} style={{width:"100%",padding:"6px 10px",fontSize:12,border:"1px solid #E5E7EB",borderRadius:7,background:"#F9FAFB",color:"#111827",outline:"none",fontFamily:"inherit"}}>{children}</select>;
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
            style={{padding:"2px 6px",fontSize:11,borderRadius:4,cursor:"pointer",border:"none",background:"transparent",color:"#6B7280",fontFamily:"monospace",minWidth:24}}
            onMouseOver={e=>e.currentTarget.style.background="#E5E7EB"}
            onMouseOut={e=>e.currentTarget.style.background="transparent"}>{t.icon}</button>
        ))}
      </div>
      <div ref={ref} id={id} contentEditable suppressContentEditableWarning
        role="textbox" aria-multiline="true" data-placeholder={placeholder||"Escribí acá..."}
        style={{minHeight:100,padding:"8px 12px",fontSize:12,lineHeight:1.7,outline:"none",color:"#111",background:"#fff"}}/>
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9CA3AF;pointer-events:none}[contenteditable] h3{font-size:13px;font-weight:600;margin:4px 0}[contenteditable] ul{list-style:disc;padding-left:18px;margin:4px 0}[contenteditable] ol{list-style:decimal;padding-left:18px;margin:4px 0}[contenteditable] a{color:#3B82F6;text-decoration:underline}[contenteditable] strong{font-weight:700}[contenteditable] em{font-style:italic}*:focus-visible{outline:2px solid ${BRAND};outline-offset:2px}`}</style>
    </div>
  );
}

// ── TuduForm ──────────────────────────────────────────────────────────────────
function TuduForm({title,action,onClose,dark:dk}) {
  const [selColor,setSelColor] = useState(0);
  const [selSize,setSelSize]   = useState(2);
  const [selIcon,setSelIcon]   = useState("CheckSquare");
  const [cuando,setCuando]     = useState("Sin fecha");
  const dateHint = calcDate(cuando);
  const titleId = "form-title-"+action;
  return (
    <Overlay onClose={onClose} dark={dk} titleId={titleId}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h2 id={titleId} style={{fontSize:14,fontWeight:500,margin:0}}>{title}</h2>
        <button type="button" aria-label="Cerrar" onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
      </div>
      <Fld label="Título" id="f-title"><Inp id="f-title" placeholder="¿Qué tenés que hacer?" autoFocus/></Fld>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Tipo" id="f-tipo"><Sel id="f-tipo">{TUDU_TYPES.map(v=><option key={v}>{v}</option>)}</Sel></Fld>
        <Fld label="Categoría" id="f-cat"><Sel id="f-cat">{CATEGORIAS_NAMES.map(v=><option key={v}>{v}</option>)}</Sel></Fld>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Estado" id="f-estado"><Sel id="f-estado">{ESTADOS_DEFAULT.map(v=><option key={v}>{v}</option>)}</Sel></Fld>
        <Fld label="Cuándo" id="f-cuando">
          <Sel id="f-cuando" value={cuando} onChange={e=>setCuando(e.target.value)}>{CUANDO.map(v=><option key={v}>{v}</option>)}</Sel>
          {dateHint&&<div style={{fontSize:10,color:BRAND,marginTop:3}}>→ {dateHint}</div>}
        </Fld>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Fld label="Deadline" id="f-dl"><Inp id="f-dl" type="date"/></Fld>
        <Fld label="Tudú padre" id="f-padre"><Sel id="f-padre"><option>— Ninguno —</option><option>Proyecto Alpha</option></Sel></Fld>
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
          {["XS","S","M","L","XL"].map((sz,i)=>(
            <button key={sz} type="button" onClick={()=>setSelSize(i)}
              style={{fontSize:11,padding:"2px 8px",borderRadius:5,cursor:"pointer",border:"1px solid",
                background:selSize===i?BRAND:"transparent",color:selSize===i?"#fff":"#9CA3AF",borderColor:selSize===i?BRAND:"#E5E7EB"}}>{sz}</button>
          ))}
        </div>
      </Fld>
      <Fld label="Etiquetas" id="f-tags"><Inp id="f-tags" placeholder="trabajo, urgente... (coma)"/></Fld>
      <Fld label="Contenido" id="f-content"><WysiwygEditor id="f-content" placeholder="Escribí acá..."/></Fld>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
        <Btn ghost onClick={onClose}>Cancelar</Btn>
        <Btn onClick={onClose}>{action}</Btn>
      </div>
    </Overlay>
  );
}

// ── TuduDetail ────────────────────────────────────────────────────────────────
function TuduDetail({onClose,onPomo,dark:dk}) {
  const c = th(dk||false);
  const [editing,setEditing]   = useState(false);
  const [status,setStatus]     = useState("En curso");
  const [subtasks,setSubtasks] = useState([{id:1,title:"Preparar agenda",done:false},{id:2,title:"Confirmar asistentes",done:true}]);
  const [newSub,setNewSub]     = useState("");
  const titleId = "modal-tudu-detail";

  if(editing) return <TuduForm title="Editar Tudú" action="Guardar" onClose={()=>setEditing(false)} dark={dk}/>;

  const addSub = ()=>{
    if(!newSub.trim()) return;
    setSubtasks(p=>[...p,{id:Date.now(),title:newSub.trim(),done:false}]);
    setNewSub("");
  };

  return (
    <Overlay onClose={onClose} dark={dk} titleId={titleId}>
      {/* header — no edit button here */}
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:12}}>
        <span style={{fontSize:18}}>📋</span>
        <div style={{flex:1}}>
          <h2 id={titleId} style={{fontSize:14,fontWeight:500,color:c.text,margin:0}}>Reunión con equipo</h2>
          <div style={{fontSize:11,color:c.textFaint,marginTop:2}}>My Work · Tarea</div>
        </div>
        <button type="button" aria-label="Cerrar" onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:c.textFaint}}>✕</button>
      </div>

      {/* props grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
        <div style={{background:c.surface2,borderRadius:7,padding:"7px 10px",border:`1px solid ${c.border}`}}>
          <label htmlFor="det-status" style={{fontSize:10,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3,display:"block"}}>Estado</label>
          <select id="det-status" value={status} onChange={e=>setStatus(e.target.value)}
            style={{border:"none",background:"transparent",padding:0,fontSize:12,color:c.text,cursor:"pointer",width:"100%",outline:"none"}}>
            {ESTADOS_DEFAULT.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {[["Fecha","Hoy — 14 mar"],["Tipo","📋 Tarea"],["Pomodoros","2 · 45 min"]].map(([l,v])=>(
          <div key={l} style={{background:c.surface2,borderRadius:7,padding:"7px 10px",border:`1px solid ${c.border}`}}>
            <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".4px",color:c.textFaint,marginBottom:3}}>{l}</div>
            <div style={{fontSize:12,color:c.text}}>{v}</div>
          </div>
        ))}
      </div>

      {/* content */}
      <div style={{background:c.surface2,borderRadius:8,padding:12,marginBottom:12,fontSize:12,lineHeight:1.7,color:c.textMuted,border:`1px solid ${c.border}`}}>
        <strong style={{color:c.text}}>Agenda de la reunión</strong><br/><br/>
        • Revisar avances del sprint<br/>• Definir prioridades<br/>• Bloqueantes del equipo
      </div>

      {/* subtasks */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:500,color:c.textFaint,marginBottom:6,textTransform:"uppercase",letterSpacing:".4px"}}>Subtareas</div>
        {subtasks.length>0&&(
          <ul style={{listStyle:"none",padding:0,margin:"0 0 8px 0"}}>
            {subtasks.map(sub=>(
              <li key={sub.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${c.border}`}}>
                <input type="checkbox" id={"sub-"+sub.id} checked={sub.done}
                  onChange={()=>setSubtasks(p=>p.map(s=>s.id===sub.id?{...s,done:!s.done}:s))}
                  style={{accentColor:BRAND,cursor:"pointer",flexShrink:0}}/>
                <label htmlFor={"sub-"+sub.id} style={{flex:1,fontSize:12,cursor:"pointer",color:sub.done?c.textFaint:c.text,textDecoration:sub.done?"line-through":"none"}}>{sub.title}</label>
                <button type="button" aria-label={"Eliminar "+sub.title}
                  onClick={()=>setSubtasks(p=>p.filter(s=>s.id!==sub.id))}
                  style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,padding:0,lineHeight:1}}>×</button>
              </li>
            ))}
          </ul>
        )}
        <div style={{display:"flex",gap:6}}>
          <label htmlFor="new-subtask" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Nueva subtarea</label>
          <Inp id="new-subtask" value={newSub} onChange={e=>setNewSub(e.target.value)} placeholder="Nueva subtarea..."
            onKeyDown={e=>{if(e.key==="Enter")addSub();}} style={{flex:1}}/>
          <Btn sm onClick={addSub}>+ Sub</Btn>
        </div>
      </div>

      {/* pomo */}
      <button type="button" onClick={()=>{onClose();onPomo();}}
        style={{display:"flex",alignItems:"center",gap:8,background:c.surface2,borderRadius:8,padding:"8px 12px",cursor:"pointer",border:`1px solid ${c.border}`,width:"100%",textAlign:"left",marginBottom:10,fontFamily:"inherit"}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⏱</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:500,color:c.text}}>Iniciar Pomodoro</div>
          <div style={{fontSize:11,color:c.textFaint}}>25 min de foco</div>
        </div>
        <span style={{color:c.border}}>›</span>
      </button>

      {/* single edit button at bottom */}
      <Btn onClick={()=>setEditing(true)} style={{width:"100%"}}>✎ Editar Tudú completo</Btn>
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
      <span style={{fontSize:12,fontWeight:600,color:BRAND}}>⏱ {mm}:{ss}</span>
      <span style={{fontSize:11,color:c.textMuted,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{active?.title}</span>
      <span style={{fontSize:9,color:c.textFaint}}>↑</span>
    </button>
  );

  return (
    <div role="timer" aria-label="Pomodoro en curso"
      style={{position:"fixed",bottom,right,background:c.surface,border:`1px solid ${c.border}`,borderRadius:12,padding:12,width:210,zIndex:40,boxShadow:"0 4px 20px rgba(0,0,0,0.12)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:10,color:c.textFaint,fontWeight:500,textTransform:"uppercase",letterSpacing:".4px"}}>En foco</span>
        <div style={{display:"flex",gap:4}}>
          <button type="button" aria-label="Minimizar" onClick={()=>setMini(true)} style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,lineHeight:1,padding:"0 3px"}}>−</button>
          <button type="button" aria-label="Cerrar pomodoro" onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,lineHeight:1,padding:"0 3px"}}>✕</button>
        </div>
      </div>

      {tasks.map(task=>(
        <div key={task.id} onClick={()=>switchTo(task.id)}
          style={{display:"flex",alignItems:"center",gap:7,padding:"5px 7px",borderRadius:7,marginBottom:3,cursor:"pointer",
            border:`1px solid ${task.id===activeId?BRAND:c.border}`,
            background:task.id===activeId?"rgba(117,176,228,0.08)":c.surface2,transition:"all .15s"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:task.color,flexShrink:0,outline:task.id===activeId?`2px solid ${BRAND}`:"none",outlineOffset:1}}/>
          <button type="button" onClick={e=>{e.stopPropagation();onOpenTask&&onOpenTask();}}
            style={{flex:1,fontSize:11,fontWeight:task.id===activeId?500:400,color:task.id===activeId?c.text:c.textMuted,
              background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {task.id===activeId?"▶ ":""}{task.title}
          </button>
          <span style={{fontSize:10,color:c.textFaint,flexShrink:0}}>{Math.floor(task.secs/60)}m</span>
          <button type="button" aria-label={"Quitar "+task.title} onClick={e=>{e.stopPropagation();removeTask(task.id);}}
            style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:12,padding:0,lineHeight:1,flexShrink:0}}>×</button>
        </div>
      ))}

      {tasks.length<3&&!picking&&(
        <button type="button" onClick={()=>setPicking(true)}
          style={{width:"100%",fontSize:10,padding:"4px",borderRadius:6,cursor:"pointer",border:`1px dashed ${c.border}`,background:"transparent",color:c.textFaint,fontFamily:"inherit",marginTop:2}}>
          + Agregar tarea al foco
        </button>
      )}

      {picking&&(
        <div style={{marginTop:4,border:`1px solid ${c.border}`,borderRadius:8,overflow:"hidden",background:c.surface}}>
          <div style={{padding:"4px 8px",borderBottom:`1px solid ${c.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:10,color:c.textFaint,fontWeight:500}}>Elegí una tarea</span>
            <button type="button" onClick={()=>setPicking(false)} style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:12,padding:0}}>✕</button>
          </div>
          {available.length===0
            ? <p style={{fontSize:11,color:c.textFaint,padding:"8px",margin:0,textAlign:"center"}}>No hay más tareas disponibles</p>
            : available.map(task=>(
              <button key={task.id} type="button" onClick={()=>addTask(task)}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 10px",background:"none",border:"none",
                  borderBottom:`1px solid ${c.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:task.color,flexShrink:0}}/>
                <span style={{fontSize:11,color:c.text,flex:1}}>{task.title}</span>
                <span style={{fontSize:10,color:c.textFaint}}>{task.type}</span>
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
        style={{width:"100%",fontSize:11,padding:"5px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontWeight:500,
          border:`1px solid ${run?BRAND:c.border}`,background:run?BRAND:c.surface2,color:run?"#fff":c.textMuted}}>
        {run?"⏸ Pausar":"▶ Reanudar"}
      </button>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({onNew,onTudu,dark:dk,isMobile}) {
  const c = th(dk||false);
  const [pool,setPool]       = useState(POOL_INIT);
  const [dragId,setDragId]   = useState(null);
  const [overSlot,setOverSlot] = useState(null);
  const slotRefs = useRef({});
  const {show,Toast} = useToast();
  const SLOTS = ["Hoy","Mañana / Pasado","Esta semana","Próxima semana"];

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

  const handleDrop=(slot,e)=>{
    if(!dragId) return;
    const item=pool.find(p=>p.id===dragId);
    flyTo(e.clientX,e.clientY,slotRefs.current[slot],item?.c?.bg||"#FEF08A");
    setPool(p=>p.filter(p2=>p2.id!==dragId));
    setDragId(null);setOverSlot(null);
    show("Asignado a: "+slot);
  };

  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <h1 style={{fontSize:15,fontWeight:500,color:c.text,margin:0}}>Buenas tardes ✦</h1>
        <p style={{fontSize:12,color:c.textFaint,marginTop:2,marginBottom:0}}>Sábado 14 de marzo · Planificá tu día</p>
      </div>
      <div style={{display:"flex",gap:8}}>
        <label htmlFor="quick-create" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Crear tudú rápido</label>
        <input id="quick-create" style={{flex:1,padding:"6px 12px",fontSize:12,border:`1px solid ${c.border}`,borderRadius:8,outline:"none",fontFamily:"inherit",background:c.surface,color:c.text}}
          placeholder="Nuevo tudú rápido... (Enter)"
          onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){show("Tudú creado en Inbox");e.target.value="";}}}/>
        <Btn onClick={onNew}>+ Nuevo</Btn>
      </div>
      <p style={{fontSize:11,color:c.textFaint,fontWeight:500,margin:0}}>Arrastrá tudús hacia las cajitas para planificar</p>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:8}}>
        {SLOTS.map(slot=>{
          const over=overSlot===slot;
          return (
            <div key={slot} ref={el=>slotRefs.current[slot]=el}
              style={{border:over?`2px solid ${BRAND}`:`2px dashed ${c.border2}`,borderRadius:10,padding:8,minHeight:64,
                background:over?"rgba(117,176,228,0.08)":c.surface,
                boxShadow:over?`0 0 0 3px rgba(117,176,228,0.15)`:"none",transition:"all .15s"}}
              onDragOver={e=>{e.preventDefault();setOverSlot(slot);}}
              onDragLeave={()=>setOverSlot(null)}
              onDrop={e=>handleDrop(slot,e)}>
              <div style={{fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:".5px",color:over?BRAND:c.textFaint,marginBottom:4}}>{slot}</div>
              <div style={{fontSize:11,color:over?BRAND:c.border2,textAlign:"center",paddingTop:6}}>{over?"¡Soltá acá!":"Soltá acá"}</div>
            </div>
          );
        })}
      </div>
      {pool.length>0&&(
        <section style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:10,padding:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <h2 style={{fontSize:12,fontWeight:500,color:c.text,margin:0}}>Vencidos / Sin planificar</h2>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"#FEE2E2",color:"#DC2626"}}>{pool.length} pendientes</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {pool.map(item=>(
              <div key={item.id} draggable
                onDragStart={e=>{setDragId(item.id);e.dataTransfer.setData("text/plain",String(item.id));}}
                onDragEnd={()=>setDragId(null)}
                style={{background:item.c.bg,color:item.c.tx,borderRadius:8,padding:"6px 9px",fontSize:11,cursor:"grab",minWidth:80,maxWidth:140,userSelect:"none",opacity:dragId===item.id?0.3:1,boxShadow:"1px 2px 6px rgba(0,0,0,0.12)",transition:"opacity .15s"}}>
                <div style={{fontSize:10,opacity:.7,marginBottom:1}}>{item.type}</div>
                <div style={{fontWeight:500,lineHeight:1.3}}>{item.title}</div>
                <div style={{fontSize:10,opacity:.6,marginTop:2}}>{item.cat}</div>
              </div>
            ))}
          </div>
        </section>
      )}
      <Toast/>
    </main>
  );
}

// ── ListView ──────────────────────────────────────────────────────────────────
function ListView({title,onTudu,dark:dk}) {
  const c = th(dk||false);
  const ITEMS = [
    {id:1,type:"📋",title:"Reunión con equipo",cat:"💼",status:"En curso",date:"Hoy"},
    {id:2,type:"📊",title:"Presupuesto Q2",    cat:"💼",status:"Empezada",date:"Esta semana"},
    {id:3,type:"💡",title:"Leer sobre hábitos",cat:"✦", status:"Por hacer",date:"—"},
    {id:4,type:"📋",title:"Meditación matutina",cat:"❤",status:"Por hacer",date:"—"},
    {id:5,type:"📋",title:"Onboarding dev",    cat:"💼",status:"Listo",   date:"Ayer",done:true},
  ];
  const [order,setOrder] = useState(ITEMS);
  const drag = useRef(null);
  return (
    <main style={{display:"flex",flexDirection:"column",gap:10}}>
      <h1 style={{fontSize:15,fontWeight:500,color:c.text,margin:0}}>{title}</h1>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {["Todos los estados","Todos los tipos","Cualquier fecha"].map(o=>(
          <select key={o} aria-label={o} style={{fontSize:11,padding:"4px 8px",border:`1px solid ${c.border}`,borderRadius:6,background:c.surface2,color:c.text,outline:"none"}}>
            <option>{o}</option>
          </select>
        ))}
      </div>
      <ul style={{listStyle:"none",padding:0,margin:0}}>
        {order.map((item,i)=>(
          <li key={item.id} draggable
            onDragStart={()=>drag.current=i}
            onDragOver={e=>e.preventDefault()}
            onDrop={()=>{
              if(drag.current===null||drag.current===i) return;
              const n=[...order];const[m]=n.splice(drag.current,1);n.splice(i,0,m);setOrder(n);drag.current=null;
            }}
            style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:c.surface,border:`1px solid ${c.border}`,borderRadius:7,marginBottom:4}}>
            <span style={{color:c.border2,cursor:"grab",fontSize:13}}>⠿</span>
            <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${item.done?"#22C55E":c.border2}`,background:item.done?"#22C55E":"transparent",flexShrink:0}}/>
            <span style={{fontSize:11}}>{item.type}</span>
            <button type="button" onClick={onTudu} style={{flex:1,fontSize:12,textDecoration:item.done?"line-through":"none",color:item.done?c.textFaint:c.text,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>{item.title}</button>
            <span style={{fontSize:10,color:c.textFaint}}>{item.cat}</span>
            <SBadge s={item.status}/>
            <span style={{fontSize:11,color:c.textFaint}}>{item.date}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

// ── CategoryView ──────────────────────────────────────────────────────────────
function CategoryView({onView,onTudu}) {
  const [desc,setDesc]       = useState("Todo lo relacionado con mi vida profesional y proyectos laborales.");
  const [editDesc,setEditDesc] = useState(false);
  const [hoverDesc,setHoverDesc] = useState(false);
  const TOP = [
    {type:"📋 Tarea",   title:"Reunión con equipo",  date:"Hoy",        bg:PCOLORS[0].bg,tx:PCOLORS[0].tx},
    {type:"📊 Analizar",title:"Presupuesto Q2",       date:"Esta semana",bg:PCOLORS[1].bg,tx:PCOLORS[1].tx},
    {type:"✉ Mail",     title:"Responder propuestas", date:"Mañana",     bg:PCOLORS[2].bg,tx:PCOLORS[2].tx},
  ];
  const pill=(children,w)=>(
    <div style={{borderRadius:7,background:"rgba(255,255,255,0.1)",border:"0.5px solid rgba(255,255,255,0.18)",flexShrink:0,width:w||"auto"}}>
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
                  style={{fontSize:11,lineHeight:1.5,color:"#fff",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:6,padding:"4px 8px",outline:"none",resize:"none",width:280,fontFamily:"inherit"}}/>
              : <>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.5}}>{desc}</span>
                  {hoverDesc&&<button type="button" onClick={()=>setEditDesc(true)} style={{fontSize:10,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.12)",border:"none",borderRadius:5,padding:"2px 7px",cursor:"pointer"}}>Editar</button>}
                </>}
          </div>
        </div>
        <div style={{padding:"0 16px 12px",display:"flex",flexDirection:"row",alignItems:"flex-start",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
          <button type="button" onClick={()=>window.open("https://www.youtube.com/watch?v=YDRId6QmNTA","_blank")} aria-label="Ver video: How to build a second brain"
            style={{width:192,height:108,borderRadius:7,overflow:"hidden",flexShrink:0,cursor:"pointer",position:"relative",background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",border:"none",padding:0}}>
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
            {pill(<div style={{padding:"6px 9px",fontSize:11,color:"#fff",lineHeight:1.4}}>Enfocarme en proyectos de impacto real. Delegar lo operativo.</div>,155)}
            {pill(<div style={{padding:"6px 10px",fontSize:11,color:"#fff",fontStyle:"italic",lineHeight:1.4,borderLeft:"2px solid rgba(255,255,255,0.35)"}}>"Productividad es hacer lo que importa."</div>,155)}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
            <div style={{width:115,height:58,borderRadius:7,background:"linear-gradient(135deg,#f093fb,#f5576c)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.8)",fontSize:11}}>📸 Inspiración</div>
            {pill(<div style={{padding:"5px 8px",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:3,background:"#0077B5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>in</div>
              <div><div style={{fontSize:10,color:"#fff",fontWeight:500}}>Productividad</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>linkedin.com</div></div>
            </div>,115)}
            {pill(<div style={{padding:"5px 8px",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:3,background:"linear-gradient(135deg,#f09433,#dc2743,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0}}>◎</div>
              <div><div style={{fontSize:10,color:"#fff",fontWeight:500}}>@mi_perfil</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>instagram.com</div></div>
            </div>,115)}
          </div>
        </div>
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".5px",color:"rgba(255,255,255,0.4)",marginBottom:6,fontWeight:500}}>Tudús más importantes</div>
          <div style={{display:"flex",gap:8}}>
            {TOP.map((item,i)=>(
              <button key={i} type="button" onClick={onTudu} style={{flex:1,borderRadius:8,padding:"8px 10px",cursor:"pointer",background:item.bg,color:item.tx,boxShadow:"1px 2px 6px rgba(0,0,0,0.18)",border:"none",textAlign:"left"}}
                onMouseOver={e=>e.currentTarget.style.transform="scale(1.02)"}
                onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}>
                <div style={{fontSize:10,opacity:.6,marginBottom:2}}>{item.type}</div>
                <div style={{fontSize:11,fontWeight:600,lineHeight:1.3}}>{item.title}</div>
                <div style={{fontSize:10,opacity:.55,marginTop:3}}>{item.date}</div>
              </button>
            ))}
          </div>
        </div>
        <button type="button" style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",fontSize:10,padding:"3px 8px",borderRadius:6,cursor:"pointer"}}>Editar cabezal</button>
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
      style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:10,height:320,position:"relative",overflow:"hidden",backgroundImage:`radial-gradient(circle,${c.border} 1px,transparent 1px)`,backgroundSize:"20px 20px"}}>
      {CANVAS_INIT.map(p=>(
        <div key={p.id} onMouseDown={e=>onMD(e,p.id)} onMouseUp={e=>onMU(e,p.id)}
          style={{position:"absolute",left:pos[p.id].x,top:pos[p.id].y,background:p.bg,color:p.tx,borderRadius:8,padding:"8px 10px",fontSize:11,userSelect:"none",minWidth:95,maxWidth:135,cursor:drag.current?.id===p.id?"grabbing":"grab",boxShadow:"2px 3px 8px rgba(0,0,0,0.18)",zIndex:drag.current?.id===p.id?50:1}}>
          <div style={{fontSize:10,opacity:.75,marginBottom:2,pointerEvents:"none"}}>{p.type}</div>
          <div style={{fontWeight:500,lineHeight:1.3,pointerEvents:"none"}}>{p.title}</div>
          {p.status&&<div style={{fontSize:10,padding:"1px 5px",borderRadius:3,background:"rgba(0,0,0,0.1)",marginTop:4,display:"inline-block",pointerEvents:"none"}}>{p.status}</div>}
          <div style={{fontSize:10,opacity:.65,marginTop:3,pointerEvents:"none"}}>{p.date}</div>
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
        <div key={col} style={{minWidth:138,maxWidth:138,background:c.surface2,borderRadius:10,padding:8,flexShrink:0,border:col==="Vencido"?"2px solid #EF4444":col==="Hoy"?`2px solid ${BRAND}`:`1px solid ${c.border}`}}
          onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(col)}>
          <h3 style={{fontSize:10,fontWeight:500,textTransform:"uppercase",letterSpacing:".4px",margin:"0 0 6px 0",color:col==="Vencido"?"#EF4444":col==="Hoy"?BRAND:c.textFaint}}>{col}</h3>
          {(cards||[]).length===0&&<p style={{fontSize:11,color:c.textFaint,textAlign:"center",padding:"8px 0",margin:0}}>Sin tudús</p>}
          {(cards||[]).map(item=>(
            <div key={item.id} draggable onDragStart={()=>onDS(col,item.id)} onDragEnd={()=>{drag.current=null;}}
              style={{background:c.surface,border:`0.5px solid ${c.border}`,borderLeft:`3px solid ${item.lc}`,borderRadius:6,padding:"6px 8px",marginBottom:4,cursor:"grab",fontSize:12}}>
              <div style={{fontSize:10,color:c.textFaint}}>{item.type}</div>
              <button type="button" onClick={onTudu} style={{display:"block",fontWeight:500,fontSize:11,color:c.text,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left",width:"100%"}}>{item.title}</button>
              <div style={{fontSize:10,color:c.textFaint,marginTop:2}}>{item.date}</div>
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
        <div style={{display:"flex",gap:3,padding:3,borderRadius:7,background:c.surface2}}>
          {["semana","quincena","mes"].map(s=>(
            <button key={s} type="button" aria-pressed={scale===s} onClick={()=>{setScale(s);setOffset(0);}}
              style={{fontSize:11,padding:"4px 10px",borderRadius:5,cursor:"pointer",border:"none",fontFamily:"inherit",background:scale===s?c.surface:"transparent",color:scale===s?c.text:c.textFaint,fontWeight:scale===s?500:400,boxShadow:scale===s?`0 0 0 0.5px ${c.border}`:"none"}}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["← Ant",()=>setOffset(o=>o-1)],["Hoy",()=>setOffset(0)],["Sig →",()=>setOffset(o=>o+1)]].map(([l,fn])=>(
            <button key={l} type="button" onClick={fn} style={{fontSize:11,padding:"4px 10px",borderRadius:6,cursor:"pointer",border:`1px solid ${c.border}`,background:c.surface,color:c.text,fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
          <thead>
            <tr>
              <th style={{textAlign:"left",padding:"4px 8px",fontSize:10,color:c.textFaint,fontWeight:400,borderBottom:`1px solid ${c.border}`,width:"28%"}}>Tudú</th>
              <th style={{textAlign:"left",padding:"4px 8px",fontSize:10,color:c.textFaint,fontWeight:400,borderBottom:`1px solid ${c.border}`,width:"13%"}}>Estado</th>
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
                  <td style={{padding:"4px 8px",fontSize:11,color:c.text}}>{r.title}</td>
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
                            <span style={{fontSize:10,color:"rgba(0,0,0,0.7)",padding:"0 4px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",pointerEvents:"none"}}>{r.title}</span>
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
function CanvasView({onNew,onTudu,dark:dk,isMobile}) {
  const c = th(dk||false);
  const [view,setView] = useState(isMobile?"list":"postits");
  const TABS = isMobile
    ? [["Listado","list"]]
    : [["Postits","postits"],["Listado","list"],["Kanban","kanban"],["Planificación","kplan"],["Gantt","gantt"]];
  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <h1 style={{fontSize:15,fontWeight:500,color:c.text,margin:0}}>💼 My Work</h1>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <Btn sm onClick={onNew}>+ Nuevo Tudú</Btn>
          <div style={{display:"flex",gap:2,padding:3,borderRadius:7,background:c.surface2}} role="tablist">
            {TABS.map(([label,key])=>(
              <button key={key} role="tab" type="button" aria-selected={view===key} onClick={()=>setView(key)}
                style={{fontSize:11,padding:"4px 9px",borderRadius:5,cursor:"pointer",border:"none",whiteSpace:"nowrap",fontFamily:"inherit",background:view===key?c.surface:"transparent",color:view===key?c.text:c.textFaint,fontWeight:view===key?500:400,boxShadow:view===key?`0 0 0 0.5px ${c.border}`:"none"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div role="tabpanel">
        {view==="postits"  && <PostitsView onTudu={onTudu} dark={dk}/>}
        {view==="list"     && <ListView title="My Work" onTudu={onTudu} dark={dk}/>}
        {view==="kanban"   && <KanbanView init={KANBAN_INIT} onTudu={onTudu} dark={dk}/>}
        {view==="kplan"    && <><p style={{fontSize:11,color:c.textFaint,margin:"0 0 4px"}}>Arrastrá cards entre columnas para re-planificar</p><KanbanView init={KPLAN_INIT} onTudu={onTudu} dark={dk}/></>}
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
      <h1 style={{fontSize:15,fontWeight:500,color:c.text,margin:0,display:"flex",alignItems:"center",gap:8}}>
        <Icon name="Gear" size={18} color={c.textMuted}/> Configuración
      </h1>
      <nav style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {SECTIONS.map(([key,label])=>(
          <button key={key} type="button" onClick={()=>setSection(key)}
            style={{fontSize:11,padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",
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
                <div style={{fontSize:11,color:c.textFaint}}>Actual: {dk?"Oscuro":"Claro"}</div>
              </div>
              <Btn ghost sm onClick={onToggle}>Cambiar a {dk?"claro":"oscuro"}</Btn>
            </div>
            <hr style={{border:"none",borderTop:`1px solid ${c.border}`,margin:"12px 0"}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:c.text}}>Backend</div>
                <div style={{fontSize:11,color:c.textFaint}}>Notion</div>
              </div>
              <span style={{fontSize:12,color:"#22C55E",fontWeight:500}}>● Conectado</span>
            </div>
          </>
        )}

        {section==="categories"&&(
          <>
            <p style={{fontSize:12,color:c.textMuted,marginTop:0,marginBottom:12}}>Editá nombre e ícono de cada categoría.</p>
            {editCat&&(
              <div style={{background:c.surface2,border:`1px solid ${BRAND}`,borderRadius:10,padding:12,marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:500,color:c.text,marginBottom:8}}>Editando categoría</div>
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
                  {cat.badge>0&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:c.surface2,color:c.textFaint}}>{cat.badge}</span>}
                  <button type="button" onClick={()=>setEditCat({id:cat.id,name:cat.name,icon:cat.icon})}
                    style={{fontSize:11,padding:"3px 8px",borderRadius:5,cursor:"pointer",border:`1px solid ${c.border}`,background:c.surface2,color:c.textMuted,fontFamily:"inherit"}}>
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {section==="states"&&(
          <>
            <p style={{fontSize:12,color:c.textMuted,marginTop:0,marginBottom:12}}>Estados disponibles globalmente.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {estados.map((e,i)=>(
                <div key={e} style={{display:"flex",alignItems:"center",gap:6,background:c.surface2,border:`1px solid ${c.border}`,borderRadius:7,padding:"4px 10px"}}>
                  <SBadge s={e}/>
                  <button type="button" aria-label={"Eliminar "+e} onClick={()=>setEstados(p=>p.filter((_,j)=>j!==i))}
                    style={{background:"none",border:"none",cursor:"pointer",color:c.textFaint,fontSize:14,lineHeight:1,padding:0,marginLeft:2}}>×</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <label htmlFor="new-estado" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Nuevo estado</label>
              <Inp id="new-estado" value={newEstado} onChange={e=>setNewEstado(e.target.value)} placeholder="Nuevo estado..."
                onKeyDown={e=>{if(e.key==="Enter"&&newEstado.trim()){setEstados(p=>[...p,newEstado.trim()]);setNewEstado("");}}}
                style={{flex:1}}/>
              <Btn sm onClick={()=>{if(newEstado.trim()){setEstados(p=>[...p,newEstado.trim()]);setNewEstado("");}}}>+ Agregar</Btn>
            </div>
          </>
        )}

        {section==="trash"&&(
          <>
            <p style={{fontSize:12,color:c.textMuted,marginTop:0,marginBottom:12}}>Tudús eliminados — podés restaurarlos o eliminarlos definitivamente.</p>
            <div style={{background:c.surface2,borderRadius:8,padding:12,border:`1px dashed ${c.border}`}}>
              <p style={{fontSize:12,color:c.textFaint,textAlign:"center",margin:0}}>No hay tudús eliminados.</p>
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
        style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:6,width:"calc(100% - 8px)",padding:collapsed?"8px 0":`6px ${sub?28:10}px`,fontSize:12,cursor:"pointer",borderRadius:6,margin:"1px 4px",background:active?"rgba(117,176,228,0.12)":"transparent",color:active?BRAND:c.textMuted,fontWeight:active?500:400,border:"none",fontFamily:"inherit",textAlign:"left"}}>
        <Icon name={iconName} size={15} color={active?BRAND:c.textMuted}/>
        {!collapsed&&<>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",color:active?BRAND:c.text}}>{label}</span>
          {badge>0&&<span style={{fontSize:10,padding:"1px 5px",borderRadius:10,background:c.surface2,color:c.textFaint,flexShrink:0}}>{badge}</span>}
        </>}
      </button>
    );
  };
  return (
    <nav aria-label="Navegación principal" style={{width:collapsed?44:196,flexShrink:0,background:c.surface,borderRight:`1px solid ${c.border}`,display:"flex",flexDirection:"column",transition:"width .2s",overflow:"hidden"}}>
      <button type="button" aria-label={collapsed?"Expandir":"Colapsar"} onClick={onToggle}
        style={{display:"flex",justifyContent:collapsed?"center":"flex-end",padding:"6px 10px",cursor:"pointer",color:c.textFaint,fontSize:14,height:36,alignItems:"center",background:"none",border:"none",borderBottom:`1px solid ${c.border}`,width:"100%"}}>
        {collapsed?"›":"‹"}
      </button>
      <div style={{flex:1,overflowY:"auto",padding:"6px 0",display:"flex",flexDirection:"column"}}>
        <Item iconName="Star"     label="Dashboard" id="dashboard"/>
        <Item iconName="GridFour" label="Todas"     id="all"   badge={28}/>
        <Item iconName="Tray"     label="Inbox"     id="inbox" badge={3}/>
        {!collapsed&&<div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".5px",color:c.textFaint,padding:"8px 14px 2px"}}>Categorías</div>}
        {!collapsed&&(
          <button type="button" onClick={()=>setCatsOpen(o=>!o)} aria-expanded={catsOpen}
            style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",fontSize:12,cursor:"pointer",color:c.textMuted,borderRadius:6,margin:"1px 4px",background:"none",border:"none",fontFamily:"inherit",textAlign:"left",width:"calc(100% - 8px)"}}>
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
  const [dark,setDark]           = useState(false);
  const [screen,setScreen]       = useState("dashboard");
  const [collapsed,setCollapsed] = useState(false);
  const [showNew,setShowNew]     = useState(false);
  const [showTudu,setShowTudu]   = useState(false);
  const [showPomo,setShowPomo]   = useState(false);
  const [searchExp,setSearchExp] = useState(false);
  const [cats]                   = useState(CATS_INIT);
  const isMobile                 = useIsMobile();

  useEffect(()=>{ document.documentElement.classList.toggle("dark",dark); },[dark]);
  useEffect(()=>{ if(isMobile) setCollapsed(true); },[isMobile]);

  const c = th(dark);

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:c.bg,color:c.text}}>
      <style>{`*{box-sizing:border-box}*:focus-visible{outline:2px solid ${BRAND};outline-offset:2px}`}</style>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px",height:44,flexShrink:0,background:c.surface,borderBottom:`1px solid ${c.border}`}}>
        <button type="button" aria-label="Inicio" onClick={()=>setScreen("dashboard")} style={{cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0,background:"none",border:"none",padding:0}}>
          <img src="https://i.imgur.com/aSpAvYD.png" style={{height:22,width:"auto"}} alt="tudús"
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
          <span style={{display:"none",fontSize:15,fontWeight:600,color:c.text}}>tudús</span>
        </button>

        <div role="search" style={{flex:1,display:"flex",justifyContent:"center",padding:"0 10px"}}>
          <div onClick={()=>!searchExp&&setSearchExp(true)}
            style={{display:"flex",alignItems:"center",gap:6,height:26,padding:"0 10px",borderRadius:20,cursor:searchExp?"default":"pointer",border:`1px solid ${c.border}`,background:c.surface2,width:searchExp?320:100,overflow:"hidden",transition:"width .25s ease",justifyContent:"center"}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <circle cx="6.5" cy="6.5" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {!searchExp&&<span style={{fontSize:12,color:c.textFaint}}>Buscar</span>}
            {searchExp&&<>
              <label htmlFor="search-input" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0,0,0,0)"}}>Buscar</label>
              <input id="search-input" autoFocus onBlur={()=>setSearchExp(false)}
                style={{flex:1,fontSize:12,border:"none",background:"transparent",outline:"none",color:c.text,minWidth:0}}
                placeholder="Buscar tudús..."/>
              <select onMouseDown={e=>e.stopPropagation()}
                style={{fontSize:11,border:"none",background:"transparent",outline:"none",color:c.textFaint,cursor:"pointer",flexShrink:0}}>
                <option>Todas</option><option>Esta categoría</option><option>Otra categoría</option>
              </select>
            </>}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <button type="button" aria-label={"Modo "+(dark?"claro":"oscuro")} aria-pressed={dark} onClick={()=>setDark(d=>!d)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,border:`1px solid ${c.border}`,background:"transparent",cursor:"pointer",fontSize:11,color:c.textMuted,fontFamily:"inherit"}}>
            <span>{dark?"☽":"☀"}</span>{!isMobile&&<span>{dark?"Oscuro":"Claro"}</span>}
          </button>
          <div style={{width:26,height:26,borderRadius:"50%",background:"#7F77DD",color:"#fff",fontSize:10,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>JD</div>
        </div>
      </header>

      {/* BODY */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {!isMobile&&<Sidebar screen={screen} onNav={setScreen} collapsed={collapsed} onToggle={()=>setCollapsed(s=>!s)} dark={dark} cats={cats}/>}
        <div style={{flex:1,overflowY:"auto",padding:isMobile?"12px":"16px",paddingBottom:isMobile?72:16,background:c.bg}}>
          {screen==="dashboard" && <Dashboard onNew={()=>setShowNew(true)} onTudu={()=>setShowTudu(true)} dark={dark} isMobile={isMobile}/>}
          {screen==="all"       && <ListView title="Todos los tudús" onTudu={()=>setShowTudu(true)} dark={dark}/>}
          {screen==="inbox"     && <ListView title="Inbox" onTudu={()=>setShowTudu(true)} dark={dark}/>}
          {screen==="category"  && <CategoryView onView={()=>setScreen("canvas")} onTudu={()=>setShowTudu(true)}/>}
          {screen==="canvas"    && <CanvasView onNew={()=>setShowNew(true)} onTudu={()=>setShowTudu(true)} dark={dark} isMobile={isMobile}/>}
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

      {showNew  && <TuduForm   title="Nuevo Tudú" action="Crear Tudú" onClose={()=>setShowNew(false)} dark={dark}/>}
      {showTudu && <TuduDetail onClose={()=>setShowTudu(false)} onPomo={()=>{setShowTudu(false);setShowPomo(true);}} dark={dark}/>}
      {showPomo && <PomoWidget onClose={()=>setShowPomo(false)} onOpenTask={()=>setShowTudu(true)} isMobile={isMobile} dark={dark}/>}
    </div>
  );
}
