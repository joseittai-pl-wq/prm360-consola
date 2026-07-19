
const SUPABASE_URL = "https://uxinazonncaauouvxdzo.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aW5hem9ubmNhYXVvdXZ4ZHpvIiwicm9sZSI6Im" + "F" + "ub24iLCJpYXQiOjE3ODM4NTE2NjcsImV4cCI6MjA5OTQyNzY2N30.qrO4kH6mxR9oUr_LJm-4pJr2YS6tTXKljC5MBu67FHo";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const $ = s => document.querySelector(s);
const el = (h)=>{const d=document.createElement('div');d.innerHTML=h;return d.firstElementChild;};
let SIGNUP_MODE = false;

/* ===== MOTOR DE PÓLIZAS · Anexo 24 (portado de lib/polizas.js) ===== */
const TIPO_POLIZA = {
  ING_PPD:'Ingreso', ING_PUE:'Ingreso', COBRO:'Ingreso', NC_INGRESO:'Diario', ANTICIPO_CLI:'Ingreso',
  NOM_PROV:'Diario', NOM_PROV_SUB:'Diario', ASIM:'Diario', NOM_DISP:'Egreso', NOM_EFVO:'Egreso',
  PAGO_IMSS:'Egreso', ISN_PROV:'Diario', PTU_PROV:'Diario',
  GASTO_PUE:'Egreso', GASTO_PPD:'Diario', GASTO_RET:'Egreso', NC_COMPRA:'Diario', PAGO_PROV:'Egreso',
  ANTICIPO_PROV:'Egreso', COM_BANC:'Egreso', DEPRE:'Diario', TRASPASO:'Diario', ENT_IMPTOS:'Egreso'
};
const PLANTILLAS = {
  ING_PPD:[['105','Clientes','C','Total'],['401','Ingresos','A','Base'],['209','IVA trasladado no cobrado','A','IVA']],
  ING_PUE:[['102','Bancos','C','Total'],['401','Ingresos','A','Base'],['208','IVA trasladado cobrado','A','IVA']],
  COBRO:[['102','Bancos','C','Total'],['105','Clientes','A','Total'],['209','IVA trasladado no cobrado','C','IVA'],['208','IVA trasladado cobrado','A','IVA']],
  NC_INGRESO:[['402','Devoluciones/descuentos s/ingresos','C','Base'],['208','IVA trasladado cobrado','C','IVA'],['105','Clientes','A','Total']],
  ANTICIPO_CLI:[['102','Bancos','C','Total'],['206','Anticipo de cliente','A','Base'],['208','IVA trasladado cobrado','A','IVA']],
  NOM_PROV:[['601','Sueldos y salarios','C','Base'],['216','ISR retenido','A','RetISR'],['211','Seguridad social (IMSS)','A','IMSS'],['210','Sueldos por pagar','A','Neto']],
  NOM_PROV_SUB:[['601','Sueldos y salarios','C','Base'],['110','Subsidio al empleo por aplicar','C','Subsidio'],['216','ISR retenido','A','RetISR'],['211','Seguridad social (IMSS)','A','IMSS'],['210','Sueldos por pagar','A','Neto']],
  ASIM:[['601','Asimilados a salarios','C','Base'],['216','ISR retenido','A','RetISR'],['210','Sueldos por pagar','A','Neto']],
  NOM_DISP:[['210','Sueldos por pagar','C','Neto'],['102','Bancos','A','Neto']],
  NOM_EFVO:[['210','Sueldos por pagar','C','Neto'],['101','Caja','A','Neto']],
  PAGO_IMSS:[['211','Seguridad social por pagar','C','Total'],['102','Bancos','A','Total']],
  ISN_PROV:[['601','Impuesto sobre nómina (ISN)','C','ISN'],['212','ISN por pagar','A','ISN']],
  PTU_PROV:[['601','PTU del ejercicio','C','PTU'],['215','PTU por pagar','A','PTU']],
  GASTO_PUE:[['601','Gastos generales','C','Base'],['118','IVA acreditable pagado','C','IVA'],['102','Bancos','A','Total']],
  GASTO_PPD:[['601','Gastos generales','C','Base'],['119','IVA acreditable por pagar','C','IVA'],['201','Proveedores','A','Total']],
  GASTO_RET:[['601','Gastos (honorarios/arrend./flete)','C','Base'],['118','IVA acreditable pagado','C','IVA'],['216','ISR retenido a terceros','A','RetISR'],['216','IVA retenido a terceros','A','RetIVA'],['102','Bancos','A','Total']],
  NC_COMPRA:[['201','Proveedores','C','Total'],['503','Devoluciones/descuentos s/compras','A','Base'],['119','IVA acreditable por pagar','A','IVA']],
  PAGO_PROV:[['201','Proveedores','C','Total'],['102','Bancos','A','Total'],['118','IVA acreditable pagado','C','IVA'],['119','IVA acreditable por pagar','A','IVA']],
  ANTICIPO_PROV:[['120','Anticipo a proveedores','C','Total'],['102','Bancos','A','Total']],
  COM_BANC:[['701','Gastos financieros','C','Base'],['118','IVA acreditable pagado','C','IVA'],['102','Bancos','A','Total']],
  DEPRE:[['603','Gastos de administración (depreciación)','C','Base'],['184','Depreciación acumulada','A','Base']],
  TRASPASO:[['102','Bancos (destino)','C','Total'],['102','Bancos (origen)','A','Total']],
  ENT_IMPTOS:[['213','Impuestos y derechos por pagar','C','Total'],['102','Bancos','A','Total']]
};
const TIPO_LABELS = {
  ING_PPD:'Ingreso PPD (a crédito)', ING_PUE:'Ingreso PUE (contado)', COBRO:'Cobro de cliente',
  NC_INGRESO:'Nota de crédito (ingreso)', ANTICIPO_CLI:'Anticipo de cliente',
  NOM_PROV:'Provisión de nómina', NOM_PROV_SUB:'Provisión nómina c/subsidio', ASIM:'Asimilados a salarios',
  NOM_DISP:'Dispersión de nómina', NOM_EFVO:'Nómina en efectivo', PAGO_IMSS:'Pago IMSS',
  ISN_PROV:'Provisión ISN', PTU_PROV:'Provisión PTU', GASTO_PUE:'Gasto PUE (contado)',
  GASTO_PPD:'Gasto PPD (crédito)', GASTO_RET:'Gasto con retenciones', NC_COMPRA:'Nota de crédito (compra)',
  PAGO_PROV:'Pago a proveedor', ANTICIPO_PROV:'Anticipo a proveedor', COM_BANC:'Comisión bancaria',
  DEPRE:'Depreciación', TRASPASO:'Traspaso entre bancos', ENT_IMPTOS:'Entero de impuestos'
};
const n2 = x => Math.round((Number(x)||0)*100)/100;
function generarPoliza(op, imp={}, meta={}){
  const reglas=PLANTILLAS[op]; if(!reglas) return {error:'Tipo desconocido: '+op};
  const movimientos=reglas.map(([cta,nom,ca,fuente])=>{const monto=n2(imp[fuente]);
    return {tipo_poliza:TIPO_POLIZA[op],fecha:meta.fecha||'',concepto:meta.concepto||op,cuenta:cta,nombre:nom,
            cargo:ca==='C'?monto:0,abono:ca==='A'?monto:0,referencia:meta.referencia||meta.uuid||''};});
  const totalCargo=n2(movimientos.reduce((a,m)=>a+m.cargo,0)), totalAbono=n2(movimientos.reduce((a,m)=>a+m.abono,0));
  return {op,tipo_poliza:TIPO_POLIZA[op],movimientos,totalCargo,totalAbono,cuadra:n2(totalCargo-totalAbono)===0};
}
function contabilizarLote(operaciones=[]){
  const polizas=operaciones.map(o=>generarPoliza(o.tipo,o,{fecha:o.fecha,concepto:o.concepto,uuid:o.uuid,referencia:o.referencia}));
  const movs=polizas.flatMap(p=>p.movimientos||[]);
  const totalCargo=n2(movs.reduce((a,m)=>a+m.cargo,0)), totalAbono=n2(movs.reduce((a,m)=>a+m.abono,0));
  return {polizas,totalCargo,totalAbono,cuadra:n2(totalCargo-totalAbono)===0,noCuadran:polizas.filter(p=>p.movimientos&&!p.cuadra).length};
}
function aCSVContpaqi(polizas){
  const NL=String.fromCharCode(10);
  const head=['Tipo de poliza','Fecha','Concepto','Cuenta','Nombre de la cuenta','Concepto del movimiento','Cargo','Abono','Referencia'];
  const esc=v=>{v=String(v==null?'':v);if(v.indexOf('"')>-1)return '"'+v.split('"').join('""')+'"';if(v.indexOf(',')>-1||v.indexOf(NL)>-1)return '"'+v+'"';return v;};
  const lines=[head.join(',')];
  polizas.forEach(p=>(p.movimientos||[]).forEach(m=>{
    lines.push([m.tipo_poliza,m.fecha,m.concepto,m.cuenta,m.nombre,m.nombre,m.cargo.toFixed(2),m.abono.toFixed(2),m.referencia].map(esc).join(','));}));
  return lines.join(NL);
}
const ESTADOS=['recibida','validada','timbrada','contrato','dispersada','nomina_timbrada','conciliada','contabilizada','entregada','rechazada'];

function showMsg(t, ok){const m=$('#authmsg');m.textContent=t;m.className='msg '+(ok?'ok':'err');m.classList.remove('hidden');}
function hideMsg(){$('#authmsg').classList.add('hidden');}

$('#toSignup').onclick = ()=>{
  SIGNUP_MODE = !SIGNUP_MODE;
  $('#signupExtra').classList.toggle('hidden', !SIGNUP_MODE);
  $('#btnLogin').classList.toggle('hidden', SIGNUP_MODE);
  $('#toggleWrap').innerHTML = SIGNUP_MODE
    ? '¿Ya tienes cuenta? <a id="toSignup2">Entrar</a>'
    : '¿No tienes cuenta? <a id="toSignup">Regístrate</a>';
  const back = document.getElementById('toSignup2'); if(back) back.onclick = ()=>location.reload();
};

$('#btnLogin').onclick = async ()=>{
  hideMsg();
  const email=$('#email').value.trim(), password=$('#pass').value;
  if(!email||!password){return showMsg('Escribe correo y contraseña.');}
  $('#btnLogin').textContent='Entrando…'; $('#btnLogin').disabled=true;
  const {error} = await sb.auth.signInWithPassword({email,password});
  $('#btnLogin').textContent='Entrar'; $('#btnLogin').disabled=false;
  if(error) return showMsg(traducir(error.message));
  boot();
};

$('#btnSignup').onclick = async ()=>{
  hideMsg();
  const email=$('#email').value.trim(), password=$('#pass').value;
  if(!email||password.length<6){return showMsg('Correo válido y contraseña de 6+ caracteres.');}
  $('#btnSignup').textContent='Creando…'; $('#btnSignup').disabled=true;
  const {data,error} = await sb.auth.signUp({email,password});
  $('#btnSignup').textContent='Crear cuenta'; $('#btnSignup').disabled=false;
  if(error) return showMsg(traducir(error.message));
  if(data.session){ boot(); }
  else showMsg('Cuenta creada. Revisa tu correo para confirmar, y luego Dirección te asignará acceso.', true);
};

$('#btnLogout').onclick = async ()=>{ await sb.auth.signOut(); location.reload(); };

function traducir(m){
  if(/Invalid login/i.test(m)) return 'Correo o contraseña incorrectos.';
  if(/already registered/i.test(m)) return 'Ese correo ya tiene cuenta. Entra normal.';
  if(/Email not confirmed/i.test(m)) return 'Falta confirmar tu correo (revisa tu bandeja).';
  return m;
}

async function boot(){
  const {data:{session}} = await sb.auth.getSession();
  if(!session){ $('#app').classList.add('hidden'); $('#login').classList.remove('hidden'); return; }
  $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
  $('#who').textContent = session.user.email;
  window.__email = session.user.email;
  let rol='pendiente';
  const {data:perf} = await sb.from('perfiles').select('rol,unidad,rfc_cliente,rfc_empresa,departamento').eq('id', session.user.id).maybeSingle();
  if(perf && perf.rol) rol = perf.rol;
  $('#roleBadge').textContent = (rol==='consulta'?'Solo lectura':rol);
  window.__perfil = perf||{}; window.__rol = rol;
  if(rol==='pendiente'){ renderPendiente(); return; }
  if(rol==='direccion'||rol==='interno'||rol==='consulta'){ await renderInterno(rol); return; }
  renderExterno(rol);
}

function renderPendiente(){
  $('#nav').innerHTML='';
  $('#content').innerHTML =
    '<div class="center-msg"><div class="em">⏳</div><h2>Tu cuenta está en revisión</h2>'+
    '<p>Ya quedó registrada. La Dirección de PR&amp;M te asignará tu rol y acceso en breve. '+
    'Cuando esté listo, al volver a entrar verás tu módulo.</p></div>';
}

const MERGE_AREAS = [
  ['Dirección', [
    ['Resumen ejecutivo','resumen','n'],
    ['Dirección 360 · KPIs','kpis','n'],
    ['Frentes · semáforos','frentes','n'],
    ['Rentabilidad','rentabilidad','n'],
  ]],
  ['Comercial', [
    ['Cotizador de nómina','cotizador','p'],
    ['Tablero de clientes','clientes','p'],
    ['Solicitudes','solicitudes','p'],
    ['Servicios','servicios','p'],
    ['Alta de cliente','altas','n'],
    ['Boletín','__soon_boletin','p'],
  ]],
  ['Vinculación', [
    ['Clientes · Expediente','vinculacion','p'],
    ['Trabajadores · IMSS','trabajadores','p'],
    ['Clientes (fiscal)','__soon_clifiscal','p'],
    ['Contratos','__soon_contratos','p'],
  ]],
  ['Operaciones', [
    ['Tareas / entregables','pendientes','p'],
    ['Tablero operativo','tablero','n'],
    ['Bitácora + entregables','bitacora','n'],
    ['Captura','captura','n'],
    ['Movimientos','__soon_movimientos','p'],
  ]],
  ['Jurídico', [
    ['Actas y poderes','__soon_actas','p'],
    ['Juicios / defensa fiscal','__soon_juicios','p'],
    ['Contratos','__soon_contratos2','p'],
    ['Compliance jurídico','compliance','n'],
  ]],
  ['Fiscal', [
    ['Cumplimiento','compliance','p'],
    ['Alertas REPSE','compliance','p'],
    ['Renovaciones','__soon_renov','p'],
    ['Plan de previsión social','__soon_prevision','p'],
    ['Adhesiones','__soon_adhesiones','p'],
  ]],
  ['Contabilidad', [
    ['Movimientos bancarios','__soon_bancarios','p'],
    ['Cuentas','__soon_cuentas','p'],
    ['Contabilidad / Pólizas','contabilidad','n'],
  ]],
  ['Tesorería', [
    ['Cuentas','tesoreria','p'],
    ['Cobranza','cobranza','n'],
    ['Pagos','__soon_pagos','p'],
  ]],
  ['Administración', [
    ['Empresas del grupo','empresas','p'],
    ['Flujo de efectivo','__soon_flujo','p'],
    ['Personal interno','equipo','n'],
    ['Gastos y costeo','gastos','n'],
    ['Catálogo de gastos','gastos','n'],
    ['Sustancia / cumplimiento','__soon_sustancia','p'],
    ['Directorio · oficinas','directorio','n'],
    ['Accesos y permisos','accesos','n'],
  ]],
];

async function renderInterno(rol){
  if(!window.__deptos){
    const {data:dp}=await sb.from('departamentos').select('clave,nombre,modulos,orden').eq('activo',true).order('orden');
    window.__deptos = dp||[];
  }
  const deptos = window.__deptos;
  const perfDep = (window.__perfil && window.__perfil.departamento) || null;
  if(perfDep){
    const d = deptos.find(x=>x.clave===perfDep);
    if(d) $('#roleBadge').textContent = d.nombre;
  }
  let depClave = perfDep || (rol==='direccion' ? 'DIRECCION' : null);
  const sel=$('#deptPreview');
  if(rol==='direccion' && deptos.length){
    sel.classList.remove('hidden');
    if(!sel.dataset.filled){
      sel.innerHTML = deptos.map(d=> d.clave==='DIRECCION'
        ? '<option value="DIRECCION">▦ Vista Dirección (todo)</option>'
        : `<option value="${d.clave}">👁 Ver como ${d.nombre}</option>`).join('');
      sel.dataset.filled='1';
      sel.onchange=()=>renderNav(rol, sel.value);
    }
    depClave = sel.value || 'DIRECCION';
  } else {
    sel.classList.add('hidden');
  }
  renderNav(rol, depClave);
}

function renderNav(rol, depClave){
  const nav=$('#nav'); nav.innerHTML='';
  if(rol==='consulta'){ nav.appendChild(el('<div class="dm-note">Modo solo lectura</div>')); }
  let firstLink=null;
  MERGE_AREAS.forEach((area,ai)=>{
    const nombre=area[0], mods=area[1];
    const badge = ai===0 ? '★' : String(ai);
    const block=el('<div class="dm-block'+(ai===0?' open':'')+'"></div>');
    const head=el('<button class="dm-head" type="button"><span class="dm-step">'+badge+'</span><span class="dm-name">'+esc(nombre)+'</span><span class="dm-chev">›</span></button>');
    head.onclick=()=>{ block.classList.toggle('open'); };
    const sub=el('<div class="dm-sub"></div>');
    mods.forEach(m=>{
      const label=m[0], moduleId=m[1], tipo=m[2];
      const a=el('<a class="dm-link"><span class="dm-dot'+(tipo==='n'?' dm-dot-n':'')+'"></span><span class="dm-tx">'+esc(label)+'</span></a>');
      a.onclick=()=>{
        document.querySelectorAll('#nav .dm-link').forEach(x=>x.classList.remove('active'));
        a.classList.add('active');
        view(moduleId, rol, label);
      };
      sub.appendChild(a);
      if(!firstLink) firstLink=a;
    });
    block.appendChild(head); block.appendChild(sub);
    nav.appendChild(block);
  });
  if(firstLink){ firstLink.classList.add('active'); firstLink.onclick(); }
}

async function view(v, rol, label){
  const c=$('#content'); c.innerHTML='<div class="loader">Cargando…</div>';
  try{
    if(v==='cotizador')    return await viewCotizador(c);
    if(v==='trabajadores') return await viewTrabajadores(c);
    if(v && v.indexOf('__soon_')===0) return viewSoon(c, label);
    if(v==='resumen')      return await viewResumen(c);
    if(v==='kpis')         return await viewKpis360(c);
    if(v==='frentes')      return await viewFrentes(c);
    if(v==='bitacora')     return await viewBitacora(c);
    if(v==='directorio')   return await viewDirectorio(c);
    if(v==='empresas')     return await viewEmpresas(c);
    if(v==='clientes')     return await viewClientes(c);
    if(v==='solicitudes')  return await viewSolicitudes(c);
    if(v==='tablero')      return await viewTablero(c);
    if(v==='pendientes')   return await viewTareas(c);
    if(v==='vinculacion')  return await viewVinculacion(c);
    if(v==='contabilidad') return await viewContabilidad(c);
    if(v==='rentabilidad') return await viewRentabilidad(c);
    if(v==='cobranza')     return await viewCobranza(c);
    if(v==='tesoreria')    return await viewTesoreria(c);
    if(v==='gastos')       return await viewGastos(c);
    if(v==='compliance')   return await viewCompliance(c);
    if(v==='servicios')    return await viewServicios(c);
    if(v==='equipo')       return await viewEquipo(c, rol);
    if(v==='captura')      return await viewCaptura(c);
    if(v==='altas')        return await viewAltas(c);
    if(v==='accesos')      return await viewAccesos(c);
  }catch(e){ c.innerHTML='<div class="empty">Error al cargar: '+(e.message||e)+'</div>'; }
}

async function cnt(tbl, filtros){
  let q=sb.from(tbl).select('*',{count:'exact',head:true});
  if(filtros) filtros.forEach(f=>q=q.eq(f[0],f[1]));
  const {count}=await q; return count||0;
}

async function viewResumen(c){
  const [padron,clientes,empT,empA,repse,serv,soc,prom,sol] = await Promise.all([
    cnt('clientes_nomen'), cnt('clientes'), cnt('empresas'),
    cnt('empresas',[['estatus','activa']]), cnt('empresas',[['repse',true]]),
    cnt('servicios'), cnt('socios'), cnt('promotores'), cnt('solicitudes')
  ]);
  const [{data:compR},{data:repseR},{data:trabR}] = await Promise.all([
    sb.from('vw_compliance_resumen').select('*'),
    sb.from('empresas').select('repse_estatus').eq('repse',true).eq('estatus','activa'),
    sb.from('trabajadores').select('movimiento')
  ]);
  const cr=compR||[];
  const cVenc=cr.reduce((s,x)=>s+(x.vencidas||0),0), cRie=cr.reduce((s,x)=>s+(x.en_riesgo||0),0), cTot=cr.reduce((s,x)=>s+(x.obligaciones||0),0);
  const rep=repseR||[]; const rc=(v)=>rep.filter(x=>x.repse_estatus===v).length;
  const rCancel=rc('cancelado')+rc('sin_registro')+rc('vencido');
  const tr=trabR||[]; const trAct=tr.filter(x=>x.movimiento!=='BAJA').length;
  const topPend=cr.filter(x=>(x.vencidas+x.en_riesgo)>0).sort((a,b)=>(b.vencidas-a.vencidas)||(b.en_riesgo-a.en_riesgo)).slice(0,6);
  const alerta = (cVenc+rCancel)>0
    ? `<div class="banner" style="background:#f9e4de;border-color:#e2a99a;color:#8a2f1c"><b>Atención Dirección:</b> ${rCancel} registro(s) REPSE cancelados/vencidos y ${cVenc} obligación(es) de compliance vencida(s). Revisa el módulo Compliance para el detalle por empresa.</div>`
    : '';
  const topRows=topPend.map(x=>`<tr><td><b>${esc(x.razon_social)}</b></td><td>${x.vencidas>0?`<span class="tag" style="background:#c0392b;color:#fff">${x.vencidas}</span>`:'0'}</td><td>${x.en_riesgo>0?`<span class="tag" style="background:#e67e22;color:#fff">${x.en_riesgo}</span>`:'0'}</td><td>${x.obligaciones}</td></tr>`).join('');
  c.innerHTML =
   '<h1 class="pg">Tablero de Dirección</h1><div class="pgsub">Vista consolidada de PRM 360 en tiempo real</div>'+
   alerta+
   (padron<100?'<div class="banner">Padrón NOMEN en carga (1,921 en total). Se van sumando aquí y en Clientes conforme entran.</div>':'')+
   '<div class="kpis">'+
     tile(padron,'Padrón NOMEN','var(--gold)')+
     tile(clientes,'Clientes en CRM','var(--teal)')+
     tile(empA+'/'+empT,'Empresas activas','var(--navy)')+
     tile(trAct,'Trabajadores activos','var(--plum)')+
   '</div>'+
   '<div class="kpis">'+
     tile(repse,'Empresas con REPSE','var(--navy)')+
     tile(rc('vigente'),'REPSE vigentes','var(--ok)')+
     tile(rCancel,'REPSE cancelados/vencidos','#c0392b')+
     tile(serv,'Servicios','var(--teal)')+
   '</div>'+
   '<div class="kpis">'+
     tile(cTot,'Obligaciones compliance','var(--navy)')+
     tile(cVenc,'Compliance vencidas','#c0392b')+
     tile(cRie,'Compliance en riesgo','#e67e22')+
     tile(sol,'Solicitudes','var(--gold)')+
   '</div>'+
   (topRows
     ? '<div class="card"><h3>Empresas con pendientes de compliance</h3><table><thead><tr><th>Empresa</th><th>Vencidas</th><th>En riesgo</th><th>Obligaciones</th></tr></thead><tbody>'+topRows+'</tbody></table></div>'
     : '');
}
function tile(n,l,color){return `<div class="tile"><div class="bar" style="background:${color}"></div><div class="num">${n}</div><div class="lbl">${l}</div></div>`;}

async function viewEmpresas(c){
  const {data,error}=await sb.from('empresas').select('rfc,razon_social,estatus,repse,timbra_nomina').order('razon_social');
  if(error) throw error;
  let rows=(data||[]).map(e=>`<tr><td>${esc(e.razon_social)}</td><td>${e.rfc}</td><td><span class="tag ${e.estatus==='activa'?'on':'off'}">${e.estatus}</span></td><td>${e.repse?'<span class="tag repse">REPSE</span>':''}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Empresas del grupo</h1><div class="pgsub">'+(data?data.length:0)+' empresas</div>'+
    '<div class="card"><h3>Nueva empresa</h3><div class="body"><div class="frm">'+
      '<label>Razón social<input id="em_r" style="min-width:220px"></label>'+
      '<label>RFC<input id="em_rfc" maxlength="13"></label>'+
      '<label>Estatus<select id="em_est"><option value="activa">activa</option><option value="inactiva">inactiva</option></select></label>'+
      '<label>REPSE<select id="em_repse"><option value="false">No</option><option value="true">Sí</option></select></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="em_save">Crear empresa</button> <span id="em_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Razón social</th><th>RFC</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin datos</td></tr>')+'</tbody></table></div>';
  document.getElementById('em_save').onclick=async()=>{
    const g=id=>document.getElementById(id); const msg=g('em_msg');
    const r=g('em_r').value.trim(), rfc=g('em_rfc').value.trim();
    if(!r||!rfc){ msg.textContent='Razón social y RFC son obligatorios.'; msg.style.color='var(--danger)'; return; }
    g('em_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('empresas').insert({rfc, razon_social:r, estatus:g('em_est').value, repse:g('em_repse').value==='true'});
    g('em_save').disabled=false;
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; return; }
    viewEmpresas(c);
  };
}

async function viewClientes(c){
  const {data:ofiClave}=await sb.rpc('mi_oficina');
  let q=sb.from('clientes').select('id,razon_social,rfc,grupo,email,telefono,estatus').order('razon_social').limit(300);
  if(ofiClave){ if(!window.__ofis){const {data:ol}=await sb.rpc('oficinas_lista');window.__ofis=ol||[];} const off=(window.__ofis||[]).find(o=>o.clave===ofiClave); if(off) q=q.eq('oficina_id',off.id); }
  const {data,error}=await q;
  if(error) throw error;
  const ed=window.__cliEdit||null;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.razon_social)}</td><td>${x.rfc||''}</td><td>${esc(x.grupo||'')}</td><td><span class="tag ${x.estatus==='activo'?'on':'off'}">${x.estatus}</span></td><td><button class="mini cli-ed" data-id="${x.id}" data-nom="${esc(x.razon_social)}" data-rfc="${esc(x.rfc||'')}" data-grupo="${esc(x.grupo||'')}" data-email="${esc(x.email||'')}" data-tel="${esc(x.telefono||'')}" data-est="${x.estatus}">Editar</button></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Clientes</h1><div class="pgsub">'+(data?data.length:0)+' registros (máx 300)</div>'+
    '<div class="card"><h3>'+(ed?'Editar cliente':'Nuevo cliente')+'</h3><div class="body"><div class="frm">'+
      '<label>Razón social<input id="cl_r" style="min-width:220px"></label>'+
      '<label>RFC<input id="cl_rfc" maxlength="13"></label>'+
      '<label>Grupo<input id="cl_g"></label>'+
      '<label>Correo<input id="cl_e"></label>'+
      '<label>Teléfono<input id="cl_t"></label>'+
      '<label>Estatus<select id="cl_est"><option value="activo">activo</option><option value="inactivo">inactivo</option></select></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="cl_save">'+(ed?'Guardar cambios':'Crear cliente')+'</button> '+(ed?'<button class="btn2 ghost" id="cl_cancel">Cancelar</button>':'')+' <span id="cl_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Razón social</th><th>RFC</th><th>Grupo</th><th>Estatus</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan=5 class="empty">Sin clientes</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  if(ed){ g('cl_r').value=ed.nom; g('cl_rfc').value=ed.rfc; g('cl_g').value=ed.grupo; g('cl_e').value=ed.email; g('cl_t').value=ed.tel; g('cl_est').value=ed.est; }
  g('cl_save').onclick=async()=>{
    const msg=g('cl_msg'); const r=g('cl_r').value.trim();
    if(!r){ msg.textContent='La razón social es obligatoria.'; msg.style.color='var(--danger)'; return; }
    const payload={razon_social:r, rfc:g('cl_rfc').value.trim()||null, grupo:g('cl_g').value.trim()||null, email:g('cl_e').value.trim()||null, telefono:g('cl_t').value.trim()||null, estatus:g('cl_est').value};
    g('cl_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    let e;
    if(ed){ ({error:e}=await sb.from('clientes').update(payload).eq('id',ed.id)); }
    else { ({error:e}=await sb.from('clientes').insert(payload)); }
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('cl_save').disabled=false; return; }
    window.__cliEdit=null; viewClientes(c);
  };
  if(ed){ g('cl_cancel').onclick=()=>{ window.__cliEdit=null; viewClientes(c); }; }
  c.querySelectorAll('button.cli-ed').forEach(b=>b.onclick=()=>{ window.__cliEdit={id:b.dataset.id,nom:b.dataset.nom,rfc:b.dataset.rfc,grupo:b.dataset.grupo,email:b.dataset.email,tel:b.dataset.tel,est:b.dataset.est}; viewClientes(c); });
}

async function viewSolicitudes(c){
  const {data,error}=await sb.from('solicitudes').select('folio,empresa_emisora,estado,rfc,recibido_en').order('recibido_en',{ascending:false}).limit(100);
  if(error) throw error;
  const rows=(data||[]).map(s=>`<tr class="clk" data-folio="${s.folio}"><td>${s.folio||''}</td><td>${s.empresa_emisora||''}</td><td><span class="tag on">${s.estado}</span></td><td>${s.rfc||''}</td><td>${s.recibido_en?new Date(s.recibido_en).toLocaleDateString('es-MX'):''}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Solicitudes</h1><div class="pgsub">Flujo de folios · haz clic en un folio para ver su detalle y línea de tiempo</div>'+
    '<div class="card"><table><thead><tr><th>Folio</th><th>Empresa</th><th>Estado</th><th>RFC</th><th>Recibida</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=5 class="empty">Sin solicitudes</td></tr>')+'</tbody></table></div>';
  c.querySelectorAll('tr.clk').forEach(tr=>tr.onclick=()=>viewFolioDetalle(c, tr.dataset.folio));
}

async function viewFolioDetalle(c, folio){
  c.innerHTML='<div class="loader">Cargando folio…</div>';
  const [{data:sol},{data:bit}]=await Promise.all([
    sb.from('solicitudes').select('*').eq('folio',folio).maybeSingle(),
    sb.from('bitacora').select('estado,usuario,evidencia,creado_en').eq('folio',folio).order('creado_en',{ascending:true})
  ]);
  if(!sol){ c.innerHTML='<div class="empty">No se encontró el folio.</div>'; return; }
  let cli=null;
  if(sol.rfc){ const {data:cc}=await sb.from('clientes').select('razon_social,rfc,email,telefono,contacto,grupo').eq('rfc',sol.rfc).maybeSingle(); cli=cc||null; }
  const ct=sol.sitio_contacto||{};
  const fila=(k,v)=> (v!==null&&v!==undefined&&v!=='')? `<tr><th>${k}</th><td>${esc(String(v))}</td></tr>`:'';
  const tl=(bit||[]).map(b=>`<div class="tl"><div class="tl-dot"></div><div><div><b>${esc(b.estado||'')}</b><span class="tl-date">${b.creado_en?new Date(b.creado_en).toLocaleString('es-MX'):''}</span></div><div class="tl-ev">${esc(b.evidencia||'')}${b.usuario?(' · '+esc(b.usuario)):''}</div></div></div>`).join('') || '<div class="empty">Sin movimientos registrados</div>';
  const {data:evs}=await sb.storage.from('expedientes').list(folio,{limit:100});
  const evRows=(evs||[]).filter(f=>f.name).map(f=>`<div class="tl"><div class="tl-dot"></div><div style="flex:1;font-size:12.5px">${esc(f.name)}</div><button class="mini ev-dl" data-path="${esc(folio+'/'+f.name)}">Ver</button></div>`).join('') || '<div class="empty">Sin evidencia adjunta</div>';
  c.innerHTML=
    '<button class="btn2 ghost" id="volver">← Volver a solicitudes</button>'+
    `<h1 class="pg" style="margin-top:12px">Folio ${esc(folio)}</h1><div class="pgsub">Estado actual: <b>${esc(sol.estado||'')}</b></div>`+
    '<div class="card"><h3>Generar documentos</h3><div class="body"><div style="font-size:12.5px;color:var(--muted);margin-bottom:8px">Se abren con los datos del folio ya rellenados; imprime o guarda como PDF.</div>'+
      '<button class="btn2" id="doc_cot">Cotización</button> <button class="btn2" id="doc_con">Contrato</button> <button class="btn2" id="doc_acu">Acuse</button></div></div>'+
    '<div class="cols2">'+
      '<div class="card"><h3>Datos de la solicitud</h3><div class="body"><table>'+
        fila('Empresa emisora',sol.empresa_emisora)+fila('RFC',sol.rfc)+fila('Servicio / Operación',sol.tipo_operacion)+
        fila('Importe',sol.importe)+fila('Método de pago',sol.metodo_pago)+
        fila('Contacto',ct.nombre)+fila('Correo',ct.email)+fila('Teléfono',ct.telefono)+
        fila('Razón social',(cli&&cli.razon_social)||(sol.payload&&sol.payload.razon_social))+fila('Detalle',sol.payload&&sol.payload.descripcion)+
        fila('Recibida',sol.recibido_en?new Date(sol.recibido_en).toLocaleString('es-MX'):'')+
      '</table></div></div>'+
      '<div class="card"><h3>Línea de tiempo (bitácora)</h3><div class="body">'+tl+'</div></div>'+
    '</div>'+
    '<div class="card"><h3>Evidencia / materialidad</h3><div class="body">'+
      '<div class="frm"><label>Adjuntar evidencia<input type="file" id="ev_file" multiple></label><button class="btn2" id="ev_up">Subir</button> <span id="ev_msg" style="font-size:12px;margin-left:8px"></span></div>'+
      '<div style="margin-top:8px">'+evRows+'</div></div></div>';
  document.getElementById('volver').onclick=()=>viewSolicitudes(c);
  document.getElementById('doc_cot').onclick=()=>genDoc('cotizacion',sol,cli);
  document.getElementById('doc_con').onclick=()=>genDoc('contrato',sol,cli);
  document.getElementById('doc_acu').onclick=()=>genDoc('acuse',sol,cli);
  c.querySelectorAll('button.ev-dl').forEach(b=>b.onclick=async()=>{ const {data:s}=await sb.storage.from('expedientes').createSignedUrl(b.dataset.path,120); if(s) window.open(s.signedUrl,'_blank'); });
  document.getElementById('ev_up').onclick=async()=>{
    const inp=document.getElementById('ev_file'); const msg=document.getElementById('ev_msg');
    if(!inp.files||!inp.files.length){ msg.textContent='Elige un archivo.'; msg.style.color='var(--danger)'; return; }
    const b=document.getElementById('ev_up'); b.disabled=true; msg.style.color='var(--muted)';
    for(let i=0;i<inp.files.length;i++){ const f=inp.files[i]; msg.textContent='Subiendo '+(i+1)+'/'+inp.files.length+'…';
      const clean=f.name.replace(/[^A-Za-z0-9._-]/g,'_');
      const {error:e}=await sb.storage.from('expedientes').upload(folio+'/'+Date.now()+'_'+clean, f);
      if(e){ msg.textContent='Error: '+e.message; b.disabled=false; return; }
    }
    await sb.from('bitacora').insert({folio,estado:sol.estado||'',usuario:window.__email||'interno',evidencia:'evidencia adjuntada'});
    viewFolioDetalle(c,folio);
  };
}

function genDoc(tipo, sol, cli){
  const hoy=new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'});
  const nom=(cli&&cli.razon_social)||(sol.payload&&sol.payload.razon_social)||'—';
  const rfc=sol.rfc||(cli&&cli.rfc)||'—';
  const concepto=sol.tipo_operacion||'Servicio profesional';
  const importe=sol.importe?('$'+Number(sol.importe).toLocaleString('es-MX',{minimumFractionDigits:2})):'(por definir)';
  const titulos={cotizacion:'COTIZACIÓN',contrato:'CONTRATO DE PRESTACIÓN DE SERVICIOS',acuse:'ACUSE DE RECIBO'};
  let cuerpo='';
  if(tipo==='cotizacion'){
    cuerpo='<p>Por medio de la presente, <b>PR&amp;M Business Group</b> presenta a <b>'+esc(nom)+'</b> (RFC '+esc(rfc)+') la siguiente cotización de servicios profesionales:</p>'+
      '<table class="doc-t"><tr><th>Concepto</th><th style="text-align:right">Importe</th></tr><tr><td>'+esc(concepto)+'</td><td style="text-align:right">'+importe+'</td></tr></table>'+
      '<p style="font-size:12px;color:#555">Vigencia de la cotización: 15 días naturales. Importes en pesos mexicanos, más IVA cuando aplique. Folio de referencia: '+esc(sol.folio||'')+'.</p>';
  } else if(tipo==='contrato'){
    cuerpo='<p>Contrato de prestación de servicios que celebran, por una parte, <b>PR&amp;M Business Group</b> (EL PRESTADOR), y por la otra, <b>'+esc(nom)+'</b> (RFC '+esc(rfc)+') (EL CLIENTE), al tenor de las siguientes cláusulas:</p>'+
      '<p><b>PRIMERA. Objeto.</b> EL PRESTADOR se obliga a prestar a EL CLIENTE el siguiente servicio: '+esc(concepto)+'.</p>'+
      '<p><b>SEGUNDA. Honorarios.</b> EL CLIENTE cubrirá la cantidad de '+importe+', en los términos que las partes acuerden.</p>'+
      '<p><b>TERCERA. Vigencia.</b> Surte efectos a partir de su firma y hasta la conclusión del servicio.</p>'+
      '<p><b>CUARTA. Confidencialidad.</b> Las partes guardarán confidencialidad sobre la información intercambiada, conforme a la LFPDPPP.</p>'+
      '<p style="font-size:12px;color:#555">Documento base generado por PRM 360 (folio '+esc(sol.folio||'')+'). Ajústese y complétese conforme al caso concreto antes de su firma.</p>';
  } else {
    cuerpo='<p>Se hace constar que <b>PR&amp;M Business Group</b> recibió de <b>'+esc(nom)+'</b> (RFC '+esc(rfc)+') la solicitud correspondiente al folio <b>'+esc(sol.folio||'')+'</b>, relativa a: '+esc(concepto)+'.</p>'+
      '<p>Fecha de recepción: '+hoy+'. El seguimiento podrá consultarse en todo momento con el número de folio.</p>';
  }
  const html='<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>'+titulos[tipo]+' '+esc(sol.folio||'')+'</title>'+
    '<style>body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1c2b33;max-width:760px;margin:24px auto;padding:0 28px;line-height:1.6}'+
    '.hd{border-bottom:3px solid #A8843C;padding-bottom:12px}.hd .lg{font-size:24px;font-weight:800;color:#14303D}.hd .lg span{color:#A8843C}'+
    '.doc-title{font-size:15px;font-weight:700;color:#14303D;letter-spacing:1px;margin:18px 0 4px}'+
    '.meta{font-size:12px;color:#6b7a82;margin-bottom:16px}'+
    '.doc-t{width:100%;border-collapse:collapse;margin:12px 0}.doc-t th,.doc-t td{border:1px solid #e3ddce;padding:8px 10px;font-size:13px}.doc-t th{background:#f7f1e4;color:#14303D}'+
    '.firmas{display:flex;gap:40px;margin-top:70px}.firma{flex:1;border-top:1px solid #333;padding-top:6px;font-size:12px;text-align:center}'+
    '.noprint{margin:16px 0}.btnp{background:#14303D;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer}'+
    '@media print{.noprint{display:none}body{margin:0}}</style></head><body>'+
    '<div class="noprint"><button class="btnp" onclick="window.print()">Imprimir / Guardar como PDF</button></div>'+
    '<div class="hd"><div class="lg">PR&amp;M <span>360</span></div></div>'+
    '<div class="doc-title">'+titulos[tipo]+'</div>'+
    '<div class="meta">Folio '+esc(sol.folio||'')+' · '+hoy+' · PR&amp;M Business Group</div>'+
    cuerpo+
    '<div class="firmas"><div class="firma">PR&amp;M Business Group</div><div class="firma">'+esc(nom)+'</div></div></body></html>';
  const w=window.open('','_blank'); if(!w){ alert('Permite ventanas emergentes para generar el documento.'); return; }
  w.document.write(html); w.document.close();
}

function recordatorio(asunto, cuerpo){
  try{ navigator.clipboard.writeText(cuerpo); }catch(e){}
  window.location.href='mailto:?subject='+encodeURIComponent(asunto)+'&body='+encodeURIComponent(cuerpo);
}

// ===== NIVEL 3 · Tablero de Dirección 360 =====
function barChart(items){
  const mx=Math.max(1,...items.map(x=>Number(x.val)||0));
  return '<div style="display:flex;flex-direction:column;gap:7px">'+items.map(x=>{
    const v=Number(x.val)||0;
    return '<div style="display:flex;align-items:center;gap:8px;font-size:12px">'+
      '<div style="width:118px;color:var(--muted);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="'+esc(x.label)+'">'+esc(x.label)+'</div>'+
      '<div style="flex:1;background:#eef1f2;border-radius:5px;overflow:hidden"><div style="width:'+Math.round(v/mx*100)+'%;min-width:2px;height:16px;background:'+(x.color||'var(--navy)')+'"></div></div>'+
      '<div style="width:46px;text-align:right;font-weight:700;color:var(--navy)">'+v+'</div></div>';
  }).join('')+'</div>';
}

async function viewKpis360(c){
  c.innerHTML='<div class="loader">Cargando indicadores…</div>';
  const {data:k,error}=await sb.rpc('kpis_direccion');
  if(error||!k){ c.innerHTML='<div class="empty">No se pudieron cargar los indicadores: '+((error&&error.message)||'sin datos')+'</div>'; return; }
  window.__kpis=k;
  const g=k.grupo||{}, t=k.tesoreria||{}, cm=k.compliance||{}, rp=k.repse||{}, rn=k.renovaciones||{}, ca=k.cartera||{}, pl=k.pipeline||{}, L=k.listas||{};
  const fecha=new Date(k.actualizado||Date.now()).toLocaleString('es-MX',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const rojo='var(--danger)', amb='var(--wait)', verde='var(--ok)', nav='var(--navy)';

  const fila1='<div class="kpis">'+
    tile(money(t.saldo_total),'Saldo en tesorería',nav)+
    tile((ca.clientes||0).toLocaleString('es-MX'),'Clientes en cartera','var(--teal)')+
    tile(g.empresas||0,'Empresas del grupo','var(--gold)')+
    tile(g.trabajadores||0,'Trabajadores','var(--plum)')+'</div>';
  const fila2='<div class="kpis">'+
    tile(cm.vencidas||0,'Obligaciones vencidas',(cm.vencidas>0?rojo:verde))+
    tile(rp.vencida||0,'REPSE vencidos',(rp.vencida>0?rojo:verde))+
    tile(rn.vencidas||0,'Renovaciones vencidas',(rn.vencidas>0?rojo:verde))+
    tile(rn.por_vencer||0,'Renovaciones proximas',(rn.por_vencer>0?amb:verde))+'</div>';

  // Distribuciones
  const nivObj=g.por_nivel||{};
  const nivItems=Object.keys(nivObj).map(kk=>({label:kk,val:nivObj[kk],color:nav}));
  const opItems=[{label:'Operando',val:g.operando_si||0,color:verde},{label:'Sin operar',val:g.operando_no||0,color:'var(--muted)'}];
  const repItems=[{label:'Vigentes',val:rp.vigente||0,color:verde},{label:'Vencidos',val:rp.vencida||0,color:rojo}];
  const sinFecha=Math.max(0,(rn.total||0)-((rn.vencidas||0)+(rn.por_vencer||0)+(rn.vigentes||0)));
  const renItems=[{label:'Vigentes',val:rn.vigentes||0,color:verde},{label:'Por vencer',val:rn.por_vencer||0,color:amb},{label:'Vencidas',val:rn.vencidas||0,color:rojo},{label:'Sin fecha',val:sinFecha,color:'var(--muted)'}];
  const solObj=pl.solicitudes||{};
  const solItems=Object.keys(solObj).map(kk=>({label:kk,val:solObj[kk],color:'var(--gold)'}));

  const chartCard=(titulo,inner)=>'<div class="card"><h3>'+titulo+'</h3><div class="body">'+inner+'</div></div>';
  const grid2='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">'+
    chartCard('Empresas por nivel', nivItems.length?barChart(nivItems):'<div class="empty">Sin datos</div>')+
    chartCard('Estado operativo', barChart(opItems))+
    chartCard('Registros REPSE', barChart(repItems))+
    chartCard('Renovaciones y permisos', barChart(renItems))+
    '</div>';

  // Listas de riesgo
  const compRows=(L.compliance_top||[]).map(x=>'<tr><td><b>'+esc(x.empresa)+'</b></td><td><span class="tag" style="background:#c0392b;color:#fff">'+x.vencidas+'</span></td><td>'+(x.vigentes||0)+'</td></tr>').join('');
  const repRows=(L.repse_vencidas||[]).map(x=>'<tr><td><b>'+esc(x.empresa)+'</b></td><td>'+esc(x.folio||'-')+'</td><td>'+esc(x.vigencia||'-')+'</td></tr>').join('');
  const renRows=(L.renov_pendientes||[]).map(x=>{const dv=Number(x.dias); const badge=dv<0?('<span class="tag" style="background:#c0392b;color:#fff">vencida '+Math.abs(dv)+'d</span>'):('<span class="tag" style="background:#e67e22;color:#fff">'+dv+'d</span>');return '<tr><td><b>'+esc(x.empresa)+'</b></td><td>'+esc(x.tipo||'-')+'</td><td>'+esc(x.entidad||'-')+'</td><td>'+badge+'</td></tr>';}).join('');
  const listCards='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px">'+
    '<div class="card"><h3>Compliance · mayor exposición</h3><table><thead><tr><th>Empresa</th><th>Vencidas</th><th>Vigentes</th></tr></thead><tbody>'+(compRows||'<tr><td colspan=3 class="empty">Sin vencidas</td></tr>')+'</tbody></table></div>'+
    '<div class="card"><h3>REPSE vencidos / cancelados</h3><table><thead><tr><th>Empresa</th><th>Folio</th><th>Vigencia</th></tr></thead><tbody>'+(repRows||'<tr><td colspan=3 class="empty">Sin vencidos</td></tr>')+'</tbody></table></div>'+
    '</div>'+
    '<div class="card" style="margin-top:14px"><h3>Renovaciones y permisos pendientes (≤60 días)</h3><table><thead><tr><th>Empresa</th><th>Tipo</th><th>Entidad</th><th>Estatus</th></tr></thead><tbody>'+(renRows||'<tr><td colspan=4 class="empty">Nada por vencer</td></tr>')+'</tbody></table></div>';

  const acciones='<div class="banner" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">'+
    '<div><b>Acciones de Dirección.</b> Genera el reporte ejecutivo o convierte las alertas en pendientes asignados.</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn2" id="kpi_rep">📄 Reporte ejecutivo (PDF)</button> <button class="btn2 ghost" id="kpi_auto">⚙️ Generar pendientes automáticos</button></div></div>'+
    '<div id="kpi_automsg" style="font-size:12.5px;margin:-6px 0 12px"></div>';

  c.innerHTML='<h1 class="pg">Dirección 360</h1><div class="pgsub">Panorama del despacho con datos en vivo · actualizado '+fecha+'</div>'+
    acciones+fila1+fila2+
    '<h3 style="color:var(--navy);font-size:14px;margin:20px 0 10px">Distribución del grupo</h3>'+grid2+
    '<h3 style="color:var(--navy);font-size:14px;margin:22px 0 10px">Focos de atención</h3>'+listCards;

  c.querySelector('#kpi_rep').onclick=()=>genReporteEjecutivo(k, fecha);
  c.querySelector('#kpi_auto').onclick=async()=>{
    const b=c.querySelector('#kpi_auto'), m=c.querySelector('#kpi_automsg');
    b.disabled=true; m.style.color='var(--muted)'; m.textContent='Generando pendientes…';
    const {data:r,error:e}=await sb.rpc('generar_pendientes_auto');
    b.disabled=false;
    if(e){ m.style.color='var(--danger)'; m.textContent='Error: '+e.message; return; }
    const tot=(r&&r.total)||0;
    m.style.color='var(--ok)';
    m.textContent = tot>0 ? ('✓ '+tot+' pendientes creados ('+(r.repse||0)+' REPSE, '+(r.renovaciones||0)+' renovaciones). Revísalos en el módulo Pendientes.') : '✓ Todo al día: no había alertas nuevas para convertir en pendientes.';
  };
}

function genReporteEjecutivo(k, fecha){
  const g=k.grupo||{}, t=k.tesoreria||{}, cm=k.compliance||{}, rp=k.repse||{}, rn=k.renovaciones||{}, ca=k.cartera||{}, L=k.listas||{};
  const kpi=(n,l)=>'<div class="k"><div class="kn">'+n+'</div><div class="kl">'+l+'</div></div>';
  const compRows=(L.compliance_top||[]).map(x=>'<tr><td>'+esc(x.empresa)+'</td><td style="text-align:center;color:#c0392b;font-weight:700">'+x.vencidas+'</td></tr>').join('')||'<tr><td colspan=2>Sin obligaciones vencidas.</td></tr>';
  const repRows=(L.repse_vencidas||[]).map(x=>'<tr><td>'+esc(x.empresa)+'</td><td>'+esc(x.folio||'-')+'</td><td>'+esc(x.vigencia||'-')+'</td></tr>').join('')||'<tr><td colspan=3>Sin registros vencidos.</td></tr>';
  const renRows=(L.renov_pendientes||[]).map(x=>{const dv=Number(x.dias);const est=dv<0?('vencida hace '+Math.abs(dv)+' d'):('vence en '+dv+' d');return '<tr><td>'+esc(x.empresa)+'</td><td>'+esc(x.tipo||'-')+'</td><td>'+esc(x.entidad||'-')+'</td><td>'+est+'</td></tr>';}).join('')||'<tr><td colspan=4>Sin pendientes ≤60 días.</td></tr>';
  const html='<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Reporte Ejecutivo · PRM 360</title>'+
    '<style>body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1c2b33;max-width:900px;margin:20px auto;padding:0 26px;line-height:1.5}'+
    '.hd{border-bottom:3px solid #A8843C;padding-bottom:10px;margin-bottom:6px}.hd .lg{font-size:24px;font-weight:800;color:#14303D}.hd .lg span{color:#A8843C}'+
    '.meta{font-size:12px;color:#6b7a82;margin-bottom:16px}'+
    'h2{color:#14303D;font-size:14px;border-left:4px solid #A8843C;padding-left:9px;margin:22px 0 8px}'+
    '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}'+
    '.k{border:1px solid #e3ddce;border-radius:10px;padding:11px 13px;background:#faf7ef}.kn{font-size:20px;font-weight:800;color:#14303D}.kl{font-size:10.5px;color:#6b7a82;text-transform:uppercase;letter-spacing:.3px}'+
    'table{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}th,td{border:1px solid #e9e3d4;padding:6px 9px;text-align:left}th{background:#f7f1e4;color:#14303D;font-size:10.5px;text-transform:uppercase}'+
    '.noprint{margin:14px 0}.btnp{background:#14303D;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer}'+
    '.foot{margin-top:26px;border-top:1px solid #e3ddce;padding-top:10px;color:#6b7a82;font-size:10.5px}'+
    '@media print{.noprint{display:none}body{margin:0}}</style></head><body>'+
    '<div class="noprint"><button class="btnp" onclick="window.print()">Imprimir / Guardar como PDF</button></div>'+
    '<div class="hd"><div class="lg">PR&amp;M <span>360</span></div></div>'+
    '<div class="meta">Reporte Ejecutivo de Dirección · '+esc(fecha||'')+' · PR&amp;M Business Group</div>'+
    '<h2>Indicadores clave</h2><div class="grid">'+
      kpi(money(t.saldo_total),'Saldo tesorería')+kpi((ca.clientes||0).toLocaleString('es-MX'),'Clientes')+kpi(g.empresas||0,'Empresas')+kpi(g.trabajadores||0,'Trabajadores')+
      kpi(cm.vencidas||0,'Compliance vencidas')+kpi(rp.vencida||0,'REPSE vencidos')+kpi(rn.vencidas||0,'Renov. vencidas')+kpi(rn.por_vencer||0,'Renov. proximas')+
    '</div>'+
    '<h2>Grupo empresarial</h2><table><tr><th>Empresas</th><th>Operando</th><th>Sin operar</th><th>Cuentas tesorería</th><th>Movimientos bancarios</th></tr>'+
      '<tr><td>'+(g.empresas||0)+'</td><td>'+(g.operando_si||0)+'</td><td>'+(g.operando_no||0)+'</td><td>'+(t.cuentas||0)+'</td><td>'+(t.movimientos||0)+'</td></tr></table>'+
    '<h2>Compliance · empresas con mayor exposición</h2><table><tr><th>Empresa</th><th style="text-align:center">Obligaciones vencidas</th></tr>'+compRows+'</table>'+
    '<h2>REPSE · registros vencidos o cancelados</h2><table><tr><th>Empresa</th><th>Folio</th><th>Vigencia</th></tr>'+repRows+'</table>'+
    '<h2>Renovaciones y permisos por atender (≤60 días)</h2><table><tr><th>Empresa</th><th>Tipo</th><th>Entidad</th><th>Estatus</th></tr>'+renRows+'</table>'+
    '<div class="foot">Documento interno generado por PRM 360. Cifras con base en la información cargada al corte indicado. No constituye asesoría fiscal ni legal; verificar cada registro en su fuente oficial (SAT, IMSS, STPS/REPSE).</div>'+
    '</body></html>';
  const w=window.open('','_blank'); if(!w){ alert('Permite ventanas emergentes para generar el reporte.'); return; }
  w.document.write(html); w.document.close();
}

// ===== Cumplimiento por FRENTE (Jurídico · Contable · Fiscal · Laboral/REPSE) =====
async function viewFrentes(c){
  c.innerHTML='<div class="loader">Cargando cumplimiento…</div>';
  const {data:k,error}=await sb.rpc('frentes_cumplimiento');
  if(error||!k){ c.innerHTML='<div class="empty">No se pudo cargar el cumplimiento: '+((error&&error.message)||'sin datos')+'</div>'; return; }
  const fecha=new Date(k.actualizado||Date.now()).toLocaleString('es-MX',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const R='var(--danger)', G='var(--ok)', A='var(--wait)', N='var(--navy)';
  const res=k.resumen||{}, prev=k.preventivas||[];
  const top='<div class="kpis">'+
    tile(res.vencidas||0,'Obligaciones vencidas',(res.vencidas>0?R:G))+
    tile(res.vigentes||0,'Vigentes',G)+
    tile(res.empresas||0,'Empresas monitoreadas',N)+
    tile(prev.length,'Alertas próximas (90d)',(prev.length?A:G))+'</div>';

  const icon={ 'Fiscal':'🧾','Laboral/REPSE':'👷','Contable':'📊','Jurídico':'⚖️' };
  const fcards=(k.frentes||[]).map(f=>{
    const venc=f.vencidas||0, dot=venc>0?R:G;
    const auts=(f.autoridades||[]).map(a=>`<span class="tag" style="background:${a.vencidas>0?R:'#eef1f2'};color:${a.vencidas>0?'#fff':'var(--muted)'}">${esc(a.autoridad)}${a.vencidas>0?(' · '+a.vencidas):''}</span>`).join(' ');
    return `<div class="card"><h3>${icon[f.nombre]||'•'} ${esc(f.nombre)}</h3><div class="body">`+
      `<div style="display:flex;align-items:baseline;gap:10px"><div style="font-size:30px;font-weight:800;color:${dot}">${venc}</div>`+
      `<div style="font-size:12px;color:var(--muted)">vencidas · ${f.vigentes||0} vigentes · ${f.total||0} total</div></div>`+
      `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${auts||'<span style="color:var(--muted);font-size:12px">Sin obligaciones</span>'}</div></div></div>`;
  }).join('');

  const pv=prev.map(p=>{
    const d=Number(p.dias), col=d<=15?R:(d<=45?A:N);
    return `<tr><td><b>${esc(p.empresa)}</b></td><td>${esc(p.autoridad)}</td><td>${esc(p.obligacion)}</td><td>${esc(p.fecha)}</td><td style="text-align:center"><span class="tag" style="background:${col};color:#fff">${d} días</span></td></tr>`;
  }).join('');

  const rp=k.repse||{}, rn=k.renovaciones||{};
  const extra='<div class="kpis" style="margin-top:16px">'+
    tile(rp.vencida||0,'REPSE vencidos',(rp.vencida>0?R:G))+
    tile(rn.vencidas||0,'Renovaciones vencidas',(rn.vencidas>0?R:G))+
    tile(rn.por_vencer||0,'Renovaciones ≤60 días',(rn.por_vencer>0?A:G))+'</div>';

  c.innerHTML='<h1 class="pg">Cumplimiento por frente</h1><div class="pgsub">Semáforo preventivo por área y autoridad (SAT · STPS · IMSS · ICSOE/SISUB) · datos en vivo · actualizado '+fecha+'</div>'+
    top+
    '<h3 style="color:var(--navy);font-size:14px;margin:18px 0 10px">Frentes y autoridades</h3>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">'+fcards+'</div>'+
    '<h3 style="color:var(--navy);font-size:14px;margin:22px 0 10px">Alertas preventivas · próximos vencimientos (90 días)</h3>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Autoridad</th><th>Obligación</th><th>Fecha límite</th><th>Faltan</th></tr></thead><tbody>'+(pv||'<tr><td colspan=5 class="empty">Sin vencimientos en los próximos 90 días</td></tr>')+'</tbody></table></div>'+
    extra;
}

// ===== Bitácora y entregables por cliente =====
async function viewBitacora(c){
  if(!window.__bit) window.__bit={cli:null};
  const st=window.__bit;
  const cats=['Estados financieros','Nómina','Dictámenes','Contrato','Declaración','Constancia','Otro'];
  const fmtF=(s)=>{ try{ return new Date(s).toLocaleString('es-MX',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }catch(e){ return '—'; } };
  c.innerHTML='<h1 class="pg">Bitácora y entregables por cliente</h1><div class="pgsub">Busca un cliente para ver su historial de movimientos y descargar o entregar sus documentos (estados financieros, nómina, dictámenes).</div>'+
    '<div class="card"><div class="body"><div class="frm"><label>Cliente<input id="bit_q" placeholder="Razón social o RFC" autocomplete="off" style="min-width:260px"></label><button class="btn2 ghost" id="bit_buscar">Buscar</button></div><div id="bit_res"></div></div></div>'+
    '<div id="bit_panel"></div>';
  const buscar=async()=>{
    const q=$('#bit_q').value.trim();
    const {data:res}=await sb.rpc('buscar_clientes',{p_q:q});
    const r=res||[];
    $('#bit_res').innerHTML = r.length? ('<div class="card" style="margin:6px 0"><table><tbody>'+r.map(x=>`<tr class="bpick" data-id="${x.id}" data-nom="${esc(x.razon_social)}" data-rfc="${esc(x.rfc||'')}" style="cursor:pointer"><td>${esc(x.razon_social)}</td><td style="color:var(--muted)">${esc(x.rfc||'')}</td></tr>`).join('')+'</tbody></table></div>') : '<div style="font-size:12.5px;color:var(--muted);margin:6px 0">Sin coincidencias</div>';
    c.querySelectorAll('tr.bpick').forEach(tr=>tr.onclick=()=>{ st.cli={id:tr.dataset.id,razon_social:tr.dataset.nom,rfc:tr.dataset.rfc}; $('#bit_res').innerHTML=''; renderPanel(); });
  };
  $('#bit_buscar').onclick=buscar;
  $('#bit_q').onkeydown=(e)=>{ if(e.key==='Enter'){ e.preventDefault(); buscar(); } };
  if(st.cli) renderPanel();

  async function renderPanel(){
    const panel=$('#bit_panel'); if(!st.cli){ panel.innerHTML=''; return; }
    const cli=st.cli;
    panel.innerHTML='<div class="loader">Cargando expediente…</div>';
    const {data:bd}=await sb.rpc('bitacora_cliente',{p_cliente_id:cli.id});
    const movs=(bd&&bd.movimientos)||[];
    const brows=movs.map(m=>`<tr><td>${fmtF(m.fecha)}</td><td><b>${esc(m.folio||'')}</b></td><td>${esc(m.estado||'')}</td><td>${esc(m.usuario||'')}</td></tr>`).join('');
    let flist='<tr><td colspan=3 class="empty">Este cliente no tiene RFC para expediente</td></tr>';
    if(cli.rfc){
      const {data:files}=await sb.storage.from('expedientes').list(cli.rfc,{limit:100,sortBy:{column:'name',order:'asc'}});
      const ff=(files||[]).filter(f=>f.id);
      flist = ff.length? ff.map(f=>`<tr><td><b>${esc(f.name)}</b></td><td style="color:var(--muted)">${f.metadata&&f.metadata.size?Math.round(f.metadata.size/1024)+' KB':''}</td><td><button class="mini bdl" data-path="${esc(cli.rfc+'/'+f.name)}" style="background:var(--gold)">⬇ Descargar</button></td></tr>`).join('') : '<tr><td colspan=3 class="empty">Aún no hay entregables cargados</td></tr>';
    }
    const catOpts=cats.map(x=>`<option>${x}</option>`).join('');
    const upBlock = cli.rfc ? ('<div class="frm"><label>Tipo<select id="bit_cat">'+catOpts+'</select></label><label>Archivo<input type="file" id="bit_file"></label><button class="btn2" id="bit_up">Subir entregable</button> <span id="bit_msg" style="font-size:12.5px;margin-left:8px"></span></div>') : '';
    panel.innerHTML=
      '<div class="card"><h3>Cliente</h3><div class="body"><div style="font-size:18px;font-weight:800;color:var(--navy)">'+esc(cli.razon_social)+'</div><div style="color:var(--muted);font-size:13px">RFC '+esc(cli.rfc||'—')+'</div><button class="mini" id="bit_close" style="background:var(--navy);margin-top:10px">Cambiar de cliente</button></div></div>'+
      '<div class="card"><h3>Bitácora ('+movs.length+')</h3><table><thead><tr><th>Fecha</th><th>Folio</th><th>Estado</th><th>Usuario</th></tr></thead><tbody>'+(brows||'<tr><td colspan=4 class="empty">Sin movimientos registrados para este cliente</td></tr>')+'</tbody></table></div>'+
      '<div class="card"><h3>Entregables</h3><div class="body">'+upBlock+'<table style="margin-top:10px"><thead><tr><th>Documento</th><th>Tamaño</th><th></th></tr></thead><tbody>'+flist+'</tbody></table></div></div>';
    $('#bit_close').onclick=()=>{ st.cli=null; viewBitacora(c); };
    const upBtn=$('#bit_up');
    if(upBtn) upBtn.onclick=async()=>{
      const fi=$('#bit_file'), msg=$('#bit_msg');
      if(!fi.files||!fi.files[0]){ msg.textContent='Elige un archivo primero.'; msg.style.color='var(--danger)'; return; }
      const cat=$('#bit_cat').value, file=fi.files[0];
      const clean=file.name.replace(/[^a-zA-Z0-9._ -]/g,'_');
      const path=cli.rfc+'/'+cat+' - '+clean;
      upBtn.disabled=true; msg.style.color='var(--muted)'; msg.textContent='Subiendo…';
      const {error:e}=await sb.storage.from('expedientes').upload(path, file, {upsert:true});
      upBtn.disabled=false;
      if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; return; }
      renderPanel();
    };
    c.querySelectorAll('button.bdl').forEach(b=>b.onclick=async()=>{
      const t=b.textContent; b.disabled=true; b.textContent='Abriendo…';
      const {data:s,error:e}=await sb.storage.from('expedientes').createSignedUrl(b.dataset.path,120);
      if(e||!s){ b.textContent='No disponible'; setTimeout(()=>{b.textContent=t;b.disabled=false;},1600); return; }
      window.open(s.signedUrl,'_blank'); b.textContent=t; b.disabled=false;
    });
  }
}

async function viewGastos(c){
  if(!window.__gcat){ const {data}=await sb.rpc('gastos_catalogo_lista'); window.__gcat=data||[]; }
  if(!window.__ofis){ const {data}=await sb.rpc('oficinas_lista'); window.__ofis=data||[]; }
  const cat=window.__gcat||[], ofis=window.__ofis||[];
  if(!window.__gsel) window.__gsel={cli:null};
  const gs=window.__gsel;
  const ofiMap={}; ofis.forEach(o=>ofiMap[o.id]=o.nombre);
  const catOpts='<option value="">— categoría —</option>'+cat.map(x=>`<option value="${x.id}" data-tipo="${x.tipo}">${esc(x.nombre)} · ${x.tipo}</option>`).join('');
  const ofiOpts='<option value="">— oficina —</option>'+ofis.map(o=>`<option value="${o.id}">${esc(o.nombre)}</option>`).join('');
  const {data:r}=await sb.rpc('gastos_resumen',{});
  const R=r||{};
  const top='<div class="kpis">'+
    tile(money(R.total||0),'Gasto total (año)','var(--navy)')+
    tile(money(R.fijo||0),'Fijos','var(--teal)')+
    tile(money(R.variable||0),'Variables','var(--gold)')+
    tile(R.registros||0,'Registros','var(--plum)')+'</div>';
  const ofiBars=(R.por_oficina||[]).map(x=>({label:x.oficina,val:Math.round(x.total),color:'var(--navy)'}));
  const catBars=(R.por_categoria||[]).map(x=>({label:x.nombre,val:Math.round(x.total),color:(x.tipo==='fijo'?'var(--teal)':'var(--gold)')}));
  const cliRows=(R.por_cliente||[]).map(x=>`<tr><td>${esc(x.cliente)}</td><td class="num-r">${money(x.total)}</td></tr>`).join('');
  const {data:recent}=await sb.from('gastos').select('id,fecha,concepto,monto,tipo,oficina_id').order('fecha',{ascending:false}).limit(25);
  const rrows=(recent||[]).map(x=>`<tr><td>${esc(x.fecha)}</td><td>${esc(x.concepto)}</td><td><span class="tag ${x.tipo==='fijo'?'on':''}" style="${x.tipo==='variable'?'background:#f5edd8;color:#8a6d1a':''}">${x.tipo}</span></td><td>${esc(ofiMap[x.oficina_id]||'—')}</td><td class="num-r">${money(x.monto)}</td><td><button class="mini g-del" data-id="${x.id}" style="background:var(--danger)">Quitar</button></td></tr>`).join('');

  c.innerHTML='<h1 class="pg">Gastos y costeo</h1><div class="pgsub">Registra gastos fijos y variables con su centro de costo (oficina) y, cuando aplique, el cliente. Base para el costo por oficina, empresa y operación.</div>'+
    '<div class="card"><h3>Registrar gasto</h3><div class="body">'+
      '<div class="frm">'+
        '<label>Fecha<input type="date" id="g_fecha"></label>'+
        '<label>Concepto<input id="g_con" placeholder="Descripción del gasto" style="min-width:200px"></label>'+
        '<label>Monto<input id="g_monto" type="number" step="0.01" placeholder="0.00"></label>'+
        `<label>Categoría<select id="g_cat">${catOpts}</select></label>`+
        `<label>Oficina<select id="g_ofi">${ofiOpts}</select></label>`+
        '<label>Proveedor<input id="g_prov" placeholder="Opcional"></label>'+
      '</div>'+
      '<div class="frm"><label>Cliente (opcional)<input id="g_cliq" placeholder="Razón social o RFC" autocomplete="off" style="min-width:220px"></label><button class="btn2 ghost" id="g_clibuscar">Buscar</button> <span id="g_clisel" style="font-size:12.5px;color:var(--navy)"></span></label></div>'+
      '<div id="g_clires"></div>'+
      '<button class="btn2" id="g_add">Guardar gasto</button> <span id="g_msg" style="font-size:12.5px;margin-left:8px"></span>'+
    '</div></div>'+
    top+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">'+
      '<div class="card"><h3>Gasto por oficina</h3><div class="body">'+(ofiBars.length?barChart(ofiBars):'<div class="empty">Sin gastos aún</div>')+'</div></div>'+
      '<div class="card"><h3>Gasto por categoría</h3><div class="body">'+(catBars.length?barChart(catBars):'<div class="empty">Sin gastos aún</div>')+'</div></div>'+
    '</div>'+
    '<div class="card" style="margin-top:14px"><h3>Top gasto por cliente</h3><table><thead><tr><th>Cliente</th><th class="num-r">Total</th></tr></thead><tbody>'+(cliRows||'<tr><td colspan=2 class="empty">Sin gastos asignados a cliente</td></tr>')+'</tbody></table></div>'+
    '<div class="card"><h3>Últimos registros</h3><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Tipo</th><th>Oficina</th><th class="num-r">Monto</th><th></th></tr></thead><tbody>'+(rrows||'<tr><td colspan=6 class="empty">Aún no hay gastos capturados</td></tr>')+'</tbody></table></div>';

  const setSel=()=>{ $('#g_clisel').textContent = gs.cli? ('✓ '+gs.cli.nom) : ''; };
  setSel();
  const buscar=async()=>{
    const q=$('#g_cliq').value.trim();
    const {data:res}=await sb.rpc('buscar_clientes',{p_q:q});
    const rr=res||[];
    $('#g_clires').innerHTML = rr.length? ('<div class="card" style="margin:6px 0"><table><tbody>'+rr.map(x=>`<tr class="gpick" data-id="${x.id}" data-nom="${esc(x.razon_social)}" style="cursor:pointer"><td>${esc(x.razon_social)}</td><td style="color:var(--muted)">${esc(x.rfc||'')}</td></tr>`).join('')+'</tbody></table></div>') : '';
    c.querySelectorAll('tr.gpick').forEach(tr=>tr.onclick=()=>{ gs.cli={id:tr.dataset.id,nom:tr.dataset.nom}; $('#g_clires').innerHTML=''; $('#g_cliq').value=''; setSel(); });
  };
  $('#g_clibuscar').onclick=buscar;
  $('#g_add').onclick=async()=>{
    const msg=$('#g_msg');
    const con=$('#g_con').value.trim(), monto=parseFloat($('#g_monto').value)||0;
    const catSel=$('#g_cat'), catId=catSel.value, tipo=(catSel.options[catSel.selectedIndex]||{}).getAttribute?catSel.options[catSel.selectedIndex].getAttribute('data-tipo'):'';
    if(!con||monto<=0){ msg.style.color='var(--danger)'; msg.textContent='Captura concepto y monto.'; return; }
    if(!catId||!tipo){ msg.style.color='var(--danger)'; msg.textContent='Elige una categoría.'; return; }
    const b=$('#g_add'); b.disabled=true; msg.style.color='var(--muted)'; msg.textContent='Guardando…';
    const {error:e}=await sb.from('gastos').insert({fecha:$('#g_fecha').value||new Date().toISOString().slice(0,10),concepto:con,monto:monto,catalogo_id:catId,tipo:tipo,oficina_id:$('#g_ofi').value||null,cliente_id:(gs.cli&&gs.cli.id)||null,proveedor:$('#g_prov').value.trim()||null});
    b.disabled=false;
    if(e){ msg.style.color='var(--danger)'; msg.textContent='Error: '+e.message; return; }
    gs.cli=null; viewGastos(c);
  };
  c.querySelectorAll('button.g-del').forEach(b=>b.onclick=async()=>{ b.disabled=true; await sb.from('gastos').delete().eq('id',b.dataset.id); viewGastos(c); });
}

async function viewDirectorio(c){
  if(!window.__dir) window.__dir={cli:null};
  const st=window.__dir;
  if(!window.__ofis){ const {data}=await sb.rpc('oficinas_lista'); window.__ofis=data||[]; }
  const ofis=window.__ofis||[];
  c.innerHTML='<h1 class="pg">Directorio de clientes</h1><div class="pgsub">Busca un cliente para ver y editar su oficina y sus contactos operativos (personal del cliente con quien se opera).</div>'+
    '<div class="kpis">'+(ofis.length?ofis.map(o=>tile(o.clientes||0,esc(o.nombre),'var(--navy)')).join(''):tile(0,'Sin oficinas','var(--muted)'))+'</div>'+
    '<div class="card"><div class="body"><div class="frm"><label>Cliente<input id="dir_q" placeholder="Razón social o RFC" autocomplete="off" style="min-width:260px"></label><button class="btn2 ghost" id="dir_buscar">Buscar</button></div><div id="dir_res"></div></div></div>'+
    '<div id="dir_panel"></div>';
  const buscar=async()=>{
    const q=$('#dir_q').value.trim();
    const {data:res}=await sb.rpc('buscar_clientes',{p_q:q});
    const r=res||[];
    $('#dir_res').innerHTML = r.length? ('<div class="card" style="margin:6px 0"><table><tbody>'+r.map(x=>`<tr class="dpick" data-id="${x.id}" style="cursor:pointer"><td>${esc(x.razon_social)}</td><td style="color:var(--muted)">${esc(x.rfc||'')}</td></tr>`).join('')+'</tbody></table></div>') : '<div style="font-size:12.5px;color:var(--muted);margin:6px 0">Sin coincidencias</div>';
    c.querySelectorAll('tr.dpick').forEach(tr=>tr.onclick=()=>{ st.cli=tr.dataset.id; $('#dir_res').innerHTML=''; renderPanel(); });
  };
  $('#dir_buscar').onclick=buscar;
  $('#dir_q').onkeydown=(e)=>{ if(e.key==='Enter'){ e.preventDefault(); buscar(); } };
  if(st.cli) renderPanel();

  async function renderPanel(){
    const panel=$('#dir_panel'); if(!st.cli){ panel.innerHTML=''; return; }
    panel.innerHTML='<div class="loader">Cargando ficha…</div>';
    const {data:d}=await sb.rpc('directorio_cliente',{p_cliente_id:st.cli});
    if(!d || d.error){ panel.innerHTML='<div class="empty">No se encontró el cliente.</div>'; return; }
    const ofiOpts='<option value="">— sin oficina —</option>'+ofis.map(o=>`<option value="${o.id}" ${o.id===d.oficina_id?'selected':''}>${esc(o.nombre)}</option>`).join('');
    const cts=(d.contactos||[]);
    const crows=cts.map(k=>`<tr><td><b>${esc(k.nombre)}</b>${k.es_responsable?' <span class="tag on">responsable</span>':''}</td><td>${esc(k.puesto||'')}${k.area?(' · '+esc(k.area)):''}</td><td>${esc(k.telefono||'')}</td><td>${esc(k.correo||'')}</td><td><button class="mini dc-del" data-id="${k.id}" style="background:var(--danger)">Quitar</button></td></tr>`).join('');
    panel.innerHTML=
      '<div class="card"><h3>Cliente</h3><div class="body">'+
        '<div style="font-size:18px;font-weight:800;color:var(--navy)">'+esc(d.razon_social)+'</div>'+
        '<div style="color:var(--muted);font-size:13px;margin-bottom:8px">RFC '+esc(d.rfc||'—')+(d.grupo?(' · '+esc(d.grupo)):'')+(d.promotor?(' · Promotor: '+esc(d.promotor)):'')+'</div>'+
        '<div class="frm"><label>Oficina<select id="dir_ofi">'+ofiOpts+'</select></label><button class="btn2" id="dir_saveofi">Guardar oficina</button> <span id="dir_ofimsg" style="font-size:12.5px"></span> <button class="mini" id="dir_close" style="background:var(--navy)">Cambiar de cliente</button></div>'+
      '</div></div>'+
      '<div class="card"><h3>Contactos operativos ('+cts.length+')</h3><div class="body">'+
        '<div class="frm"><label>Nombre<input id="dc_n" placeholder="Nombre" style="min-width:160px"></label><label>Puesto<input id="dc_p" placeholder="Puesto"></label><label>Área<input id="dc_a" placeholder="Área"></label><label>Teléfono<input id="dc_t"></label><label>Correo<input id="dc_c"></label><label style="display:flex;align-items:center;gap:5px;font-size:12.5px"><input type="checkbox" id="dc_r"> Responsable</label><button class="btn2" id="dc_add">Agregar</button> <span id="dc_msg" style="font-size:12.5px"></span></div>'+
        '<table style="margin-top:10px"><thead><tr><th>Nombre</th><th>Puesto / Área</th><th>Teléfono</th><th>Correo</th><th></th></tr></thead><tbody>'+(crows||'<tr><td colspan=5 class="empty">Aún no hay contactos operativos capturados</td></tr>')+'</tbody></table>'+
      '</div></div>';
    $('#dir_close').onclick=()=>{ st.cli=null; viewDirectorio(c); };
    $('#dir_saveofi').onclick=async()=>{
      const m=$('#dir_ofimsg'); m.style.color='var(--muted)'; m.textContent='Guardando…';
      const {data:r,error:e}=await sb.rpc('admin_asignar_oficina',{p_cliente_id:st.cli,p_oficina_id:$('#dir_ofi').value||null});
      if(e||r!=='ok'){ m.style.color='var(--danger)'; m.textContent='Error: '+(e?e.message:r); return; }
      window.__ofis=null; m.style.color='var(--ok)'; m.textContent='✓ Guardado';
    };
    $('#dc_add').onclick=async()=>{
      const n=$('#dc_n').value.trim(), msg=$('#dc_msg');
      if(!n){ msg.style.color='var(--danger)'; msg.textContent='El nombre es obligatorio.'; return; }
      const b=$('#dc_add'); b.disabled=true; msg.style.color='var(--muted)'; msg.textContent='Guardando…';
      const {error:e}=await sb.from('contactos_cliente').insert({cliente_id:st.cli,nombre:n,puesto:$('#dc_p').value.trim()||null,area:$('#dc_a').value.trim()||null,telefono:$('#dc_t').value.trim()||null,correo:$('#dc_c').value.trim()||null,es_responsable:$('#dc_r').checked});
      b.disabled=false;
      if(e){ msg.style.color='var(--danger)'; msg.textContent='Error: '+e.message; return; }
      renderPanel();
    };
    c.querySelectorAll('button.dc-del').forEach(b=>b.onclick=async()=>{ b.disabled=true; await sb.from('contactos_cliente').delete().eq('id',b.dataset.id); renderPanel(); });
  }
}

async function viewVinculacion(c){
  const [{data:sol},{data:emp}] = await Promise.all([
    sb.from('solicitudes').select('folio,rfc,tipo_operacion,importe,estado,empresa_emisora,empresas_sugeridas,recibido_en').order('recibido_en',{ascending:false}).limit(100),
    sb.from('empresas').select('rfc,razon_social').eq('estatus','activa').order('razon_social')
  ]);
  const empOpts=(sel)=>'<option value="">— empresa —</option>'+(emp||[]).map(e=>`<option value="${e.rfc}" ${e.rfc===sel?'selected':''}>${esc(e.razon_social)}</option>`).join('');
  const estOpts=(sel)=>ESTADOS.map(s=>`<option ${s===sel?'selected':''}>${s}</option>`).join('');
  c.innerHTML='<h1 class="pg">Vinculación</h1><div class="pgsub">El motor sugiere la empresa emisora por giro (★) y la pre-selecciona. Ajusta si aplica, avanza el estado y queda en bitácora.</div>';
  if(!sol||!sol.length){ c.innerHTML+='<div class="banner">No hay solicitudes por vincular. Cuando lleguen solicitudes del formulario público, aparecen aquí para asignarles empresa y avanzar su estado.</div>'; return; }
  const rows=sol.map((s,i)=>{
    const sug=(s.empresas_sugeridas&&s.empresas_sugeridas[0])||null;
    const preSel=s.empresa_emisora||(sug?sug.rfc:'');
    const sugTxt=sug?`<b style="color:var(--gold)">★ ${esc(sug.razon_social)}</b><div style="font-size:11px;color:var(--muted)">${esc(sug.categoria_principal||'')} · score ${sug.score}</div>`:'<span style="color:var(--muted)">—</span>';
    return `<tr>
     <td>${s.folio||''}</td><td>${esc(s.tipo_operacion||'')}</td>
     <td>${sugTxt}</td>
     <td><select id="emp_${i}">${empOpts(preSel)}</select></td>
     <td><select id="est_${i}">${estOpts(s.estado)}</select></td>
     <td><button class="mini" data-folio="${s.folio}" data-i="${i}">Guardar</button></td></tr>`;
  }).join('');
  c.innerHTML+='<div class="card"><table><thead><tr><th>Folio</th><th>Operación</th><th>Emisora sugerida (motor)</th><th>Empresa emisora</th><th>Estado</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  c.querySelectorAll('button[data-folio]').forEach(b=>{
    b.onclick=async ()=>{
      const i=b.dataset.i, folio=b.dataset.folio;
      const empresa=document.getElementById('emp_'+i).value, estado=document.getElementById('est_'+i).value;
      b.textContent='…'; b.disabled=true;
      const patch={estado}; if(empresa) patch.empresa_emisora=empresa;
      const {error}=await sb.from('solicitudes').update(patch).eq('folio',folio);
      if(!error){ await sb.from('bitacora').insert({folio,estado,usuario:window.__email||'interno',evidencia:empresa?('empresa asignada: '+empresa):'estado actualizado'}); }
      b.textContent = error?'Error':'✓ Guardado'; if(error) b.disabled=false;
    };
  });
}

async function viewContabilidad(c){
  if(!window.__ops) window.__ops=[];
  const tipoOpts=Object.entries(TIPO_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  const flds=['Base','IVA','RetISR','RetIVA','IMSS','Neto','Total','Subsidio','ISN','PTU'];
  c.innerHTML=`<h1 class="pg">Contabilidad · Motor de pólizas (Anexo 24)</h1>
    <div class="pgsub">Genera pólizas balanceadas y el archivo de importación para el ADD de CONTPAQi · 23 supuestos</div>
    <div class="card"><h3>Nueva operación</h3><div class="body">
      <div class="frm">
        <label>Tipo de operación<select id="op_tipo">${tipoOpts}</select></label>
        <label>Fecha<input id="op_fecha" type="date"></label>
        <label>Concepto<input id="op_concepto" placeholder="Concepto / referencia"></label>
      </div>
      <div class="frm imp">${flds.map(f=>`<label>${f}<input id="op_${f}" type="number" step="0.01" placeholder="0.00"></label>`).join('')}</div>
      <button class="btn2" id="op_add">Agregar operación</button>
      <div style="font-size:11.5px;color:var(--muted);margin-top:8px">Llena solo los importes que apliquen al tipo (p. ej. Ingreso: Base + IVA + Total).</div>
    </div></div>
    <div class="card"><h3>Operaciones en el lote (<span id="op_count">0</span>)</h3><div id="op_list" class="body"></div></div>
    <div id="op_result"></div>`;
  const render=()=>{
    document.getElementById('op_count').textContent=window.__ops.length;
    const list=document.getElementById('op_list');
    if(!window.__ops.length){ list.innerHTML='<div class="empty">Agrega operaciones para generar las pólizas.</div>'; return; }
    list.innerHTML='<table><thead><tr><th>#</th><th>Tipo</th><th>Fecha</th><th>Concepto</th></tr></thead><tbody>'+
      window.__ops.map((o,i)=>`<tr><td>${i+1}</td><td>${TIPO_LABELS[o.tipo]||o.tipo}</td><td>${o.fecha||''}</td><td>${esc(o.concepto||'')}</td></tr>`).join('')+
      '</tbody></table><div style="margin-top:12px"><button class="btn2" id="op_gen">Generar pólizas y CSV</button> <button class="btn2 ghost" id="op_clear">Limpiar</button></div>';
    document.getElementById('op_gen').onclick=generar;
    document.getElementById('op_clear').onclick=()=>{window.__ops=[];render();document.getElementById('op_result').innerHTML='';};
  };
  document.getElementById('op_add').onclick=()=>{
    const o={tipo:document.getElementById('op_tipo').value,fecha:document.getElementById('op_fecha').value,concepto:document.getElementById('op_concepto').value};
    flds.forEach(f=>{const v=parseFloat(document.getElementById('op_'+f).value); if(!isNaN(v)) o[f]=v;});
    window.__ops.push(o);
    flds.forEach(f=>document.getElementById('op_'+f).value=''); document.getElementById('op_concepto').value='';
    render();
  };
  const generar=()=>{
    const r=contabilizarLote(window.__ops);
    const csv=aCSVContpaqi(r.polizas);
    const movs=r.polizas.flatMap(p=>(p.movimientos||[]));
    const rows=movs.map(m=>`<tr><td>${m.tipo_poliza}</td><td>${m.cuenta}</td><td>${esc(m.nombre)}</td><td class="num-r">${m.cargo?m.cargo.toFixed(2):''}</td><td class="num-r">${m.abono?m.abono.toFixed(2):''}</td></tr>`).join('');
    document.getElementById('op_result').innerHTML=
      `<div class="card"><h3>Pólizas generadas · ${r.polizas.length} ${r.cuadra?'· ✅ Cuadran':'· ⚠️ No cuadran ('+r.noCuadran+')'}</h3><div class="body">
        <div style="margin-bottom:10px;font-size:13px">Total cargos: <b>${r.totalCargo.toFixed(2)}</b> &nbsp;·&nbsp; Total abonos: <b>${r.totalAbono.toFixed(2)}</b></div>
        <table><thead><tr><th>Póliza</th><th>Cuenta</th><th>Nombre</th><th class="num-r">Cargo</th><th class="num-r">Abono</th></tr></thead><tbody>${rows}</tbody></table>
        <div style="margin-top:12px"><button class="btn2" id="op_dl">⬇ Descargar CSV para CONTPAQi</button></div>
      </div></div>`;
    document.getElementById('op_dl').onclick=()=>{const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='polizas_contpaqi.csv';a.click();};
  };
  render();
}

function money(n){return '$'+(Number(n)||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});}

async function viewRentabilidad(c){
  const {data,error}=await sb.from('vw_rentabilidad_cliente').select('*').order('margen_mensual',{ascending:false}).limit(500);
  if(error) throw error;
  const conServ=(data||[]).filter(r=>r.num_servicios>0);
  const ing=conServ.reduce((a,r)=>a+Number(r.ingreso_mensual||0),0);
  const cos=conServ.reduce((a,r)=>a+Number(r.costo_mensual||0),0);
  const mar=ing-cos;
  const kp='<div class="kpis">'+
    tile(money(ing),'Ingreso mensual','var(--teal)')+
    tile(money(cos),'Costo mensual','var(--wait)')+
    tile(money(mar),'Margen mensual','var(--ok)')+
    tile((ing?Math.round(100*mar/ing):0)+'%','Margen promedio','var(--gold)')+'</div>';
  const rows=conServ.map(r=>`<tr><td>${esc(r.razon_social)}</td><td>${r.num_servicios}</td><td class="num-r">${money(r.ingreso_mensual)}</td><td class="num-r">${money(r.costo_mensual)}</td><td class="num-r">${money(r.margen_mensual)}</td><td class="num-r"><b style="color:${r.margen_pct<0?'var(--danger)':'var(--ok)'}">${r.margen_pct}%</b></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Rentabilidad por cliente</h1><div class="pgsub">Ingreso, costo y margen mensualizados (según honorario y periodicidad). Captura costos en cada servicio para afinar.</div>'+kp+
    (rows
      ? '<div class="card"><table><thead><tr><th>Cliente</th><th>Servicios</th><th class="num-r">Ingreso/mes</th><th class="num-r">Costo/mes</th><th class="num-r">Margen/mes</th><th class="num-r">Margen %</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      : '<div class="banner">Aún no hay servicios contratados con honorario. Al capturar cliente-servicios (o cargar el padrón) aparece aquí la rentabilidad real.</div>');
}

async function viewCobranza(c){
  const {data,error}=await sb.from('vw_cobranza').select('*').order('vence',{ascending:true,nullsFirst:false}).limit(500);
  if(error) throw error;
  const d=data||[];
  const sel=window.__pagoSel||null;
  const byA=(a)=>d.filter(x=>x.alerta===a).length;
  const kp='<div class="kpis">'+
    tile(byA('vencido'),'Vencidos','var(--danger)')+
    tile(byA('por_vencer'),'Por vencer (30 días)','var(--wait)')+
    tile(byA('vigente'),'Vigentes','var(--ok)')+
    tile(byA('sin_fecha'),'Sin fecha','var(--muted)')+'</div>';
  const tagOf=(a)=>{const m={vencido:['off','Vencido','var(--danger)'],por_vencer:['off','Por vencer','var(--wait)'],vigente:['on','Vigente','var(--ok)'],sin_fecha:['off','Sin fecha','var(--muted)']}[a]||['off',a,'var(--muted)'];return `<span class="tag" style="background:#f3efe6;color:${m[2]}">${m[1]}</span>`;};
  const rows=d.map(x=>`<tr><td>${esc(x.razon_social)}</td><td>${esc(x.servicio||'')}</td><td class="num-r">${money(x.honorario)}</td><td>${esc(x.periodicidad||'')}</td><td>${x.vence?new Date(x.vence).toLocaleDateString('es-MX'):'—'}</td><td>${tagOf(x.alerta)}</td><td style="white-space:nowrap"><button class="mini cob-rem" data-nom="${esc(x.razon_social)}" data-serv="${esc(x.servicio||'servicio')}" data-vence="${x.vence?new Date(x.vence).toLocaleDateString('es-MX'):'(sin fecha)'}" style="background:var(--gold)">Recordatorio</button> <button class="mini cob-pay" data-id="${x.id}" data-hon="${x.honorario||0}" data-nom="${esc(x.razon_social)}" style="background:#3f8f5b">Registrar pago</button></td></tr>`).join('');
  const payCard=sel?('<div class="card"><h3>Registrar pago — '+esc(sel.nom)+'</h3><div class="body"><div class="frm">'+
    '<label>Monto<input id="pg_m" type="number" step="0.01" value="'+esc(sel.hon)+'"></label>'+
    '<label>Fecha<input id="pg_f" type="date"></label>'+
    '<label>Referencia<input id="pg_r" placeholder="Folio o transferencia"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="pg_save">Guardar pago</button> <button class="btn2 ghost" id="pg_cancel">Cancelar</button> <span id="pg_msg" style="font-size:12px;margin-left:8px"></span></div>'+
    '<div style="font-size:11.5px;color:var(--muted);margin-top:6px">Al guardar, la próxima renovación avanza un periodo automáticamente.</div></div></div>'):'';
  c.innerHTML='<h1 class="pg">Cobranza y renovaciones</h1><div class="pgsub">Cartera por vencimiento. Registra pagos y la renovación avanza sola.</div>'+kp+payCard+
    (rows
      ? '<div class="card"><table><thead><tr><th>Cliente</th><th>Servicio</th><th class="num-r">Honorario</th><th>Periodicidad</th><th>Vence</th><th>Alerta</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      : '<div class="banner">Aún no hay servicios en cartera. Al capturar cliente-servicios aparecen aquí sus vencimientos.</div>');
  c.querySelectorAll('button.cob-rem').forEach(b=>b.onclick=()=>{
    const nom=b.dataset.nom, serv=b.dataset.serv, v=b.dataset.vence;
    const asunto='PR&M · Recordatorio de renovación — '+serv;
    const cuerpo='Estimado(a) '+nom+':'+String.fromCharCode(10,10)+
      'Le recordamos que su servicio "'+serv+'" tiene fecha de renovación/vencimiento el '+v+'. Le agradeceremos su atención para mantenerlo vigente y evitar interrupciones.'+String.fromCharCode(10,10)+
      'Quedamos a sus órdenes para cualquier aclaración.'+String.fromCharCode(10,10)+
      'Atentamente,'+String.fromCharCode(10)+'PR&M Business Group';
    recordatorio(asunto, cuerpo);
  });
  c.querySelectorAll('button.cob-pay').forEach(b=>b.onclick=()=>{ window.__pagoSel={id:b.dataset.id,hon:b.dataset.hon,nom:b.dataset.nom}; viewCobranza(c); });
  if(sel){
    const g=id=>document.getElementById(id);
    g('pg_save').onclick=async()=>{
      const msg=g('pg_msg'); g('pg_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
      const {data:res,error:e}=await sb.rpc('registrar_pago',{p_cs:sel.id,p_monto:parseFloat(g('pg_m').value)||0,p_fecha:g('pg_f').value||null,p_ref:g('pg_r').value||null});
      if(e||res!=='ok'){ msg.textContent='Error: '+(e?e.message:res); msg.style.color='var(--danger)'; g('pg_save').disabled=false; return; }
      window.__pagoSel=null; viewCobranza(c);
    };
    g('pg_cancel').onclick=()=>{ window.__pagoSel=null; viewCobranza(c); };
  }
}

async function viewTesoreria(c){
  const {data,error}=await sb.from('vw_tesoreria_saldos').select('*').order('clave');
  if(error) throw error;
  const d=data||[];
  const saldo=d.reduce((a,r)=>a+Number(r.saldo||0),0);
  const movs=d.reduce((a,r)=>a+Number(r.num_movs||0),0);
  const kp='<div class="kpis">'+
    tile(d.length,'Cuentas','var(--navy)')+
    tile(movs,'Movimientos','var(--teal)')+
    tile(money(saldo),'Saldo total','var(--gold)')+'</div>';
  const rows=d.map(r=>`<tr><td><b>${esc(r.clave)}</b></td><td>${esc(r.nombre)}</td><td>${esc(r.banco||'')}</td><td class="num-r">${r.num_movs}</td><td class="num-r">${money(r.total_cargos)}</td><td class="num-r">${money(r.total_abonos)}</td><td class="num-r"><b>${money(r.saldo)}</b></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Tesorería · Saldos por cuenta</h1><div class="pgsub">Movimientos y saldos consolidados · 23 empresas · 41 cuentas bancarias. Saldos al último corte disponible (jun–jul 2026).</div>'+kp+
    (rows
      ? '<div class="card"><table><thead><tr><th>Clave</th><th>Cuenta</th><th>Banco</th><th class="num-r">Movs</th><th class="num-r">Cargos</th><th class="num-r">Abonos</th><th class="num-r">Saldo</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      : '<div class="banner">No hay saldos visibles con tu sesión actual. Si crees que es un error, verifica que tu cuenta tenga acceso interno en el módulo Accesos.</div>');
}

async function viewCompliance(c){
  if(!window.__comp) window.__comp={mode:'resumen',rfc:null,mat:'TODAS'};
  const st=window.__comp;
  const semBadge=(s)=>{const col={VENCIDO:'#c0392b',EN_RIESGO:'#e67e22',VIGENTE:'#27ae60',CUMPLIDO:'#2980b9',NO_APLICA:'#7f8c8d'}[s]||'#7f8c8d';return `<span class="tag" style="background:${col};color:#fff">${(s||'').replace('_',' ')}</span>`;};
  const nav='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">'+
    `<button class="mini" data-go="resumen" style="background:${st.mode==='resumen'||st.mode==='detalle'?'var(--navy)':'var(--gold)'}">Semáforo por empresa</button>`+
    `<button class="mini" data-go="catalogo" style="background:${st.mode==='catalogo'?'var(--navy)':'var(--gold)'}">Catálogo maestro</button>`+'</div>';
  const bind=()=>{c.querySelectorAll('button[data-go]').forEach(b=>b.onclick=()=>{st.mode=b.dataset.go;st.rfc=null;viewCompliance(c);});};

  if(st.mode==='catalogo'){
    const {data,error}=await sb.from('compliance').select('*').order('clave');
    if(error) throw error;
    const d=data||[];
    const materias=[...new Set(d.map(x=>x.materia))];
    const kp='<div class="kpis">'+tile(d.length,'Obligaciones','var(--navy)')+tile(materias.length,'Materias','var(--teal)')+tile(d.filter(x=>/permanente/i.test(x.periodicidad||'')).length,'Permanentes','var(--gold)')+tile(d.filter(x=>/mensual/i.test(x.periodicidad||'')).length,'Mensuales','var(--plum)')+'</div>';
    const chips='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">'+['TODAS',...materias].map(m=>`<button class="mini cmat" data-m="${m}" style="background:${m===st.mat?'var(--navy)':'var(--gold)'}">${m}</button>`).join('')+'</div>';
    const filt=st.mat==='TODAS'?d:d.filter(x=>x.materia===st.mat);
    const rows=filt.map(x=>`<tr><td><b>${esc(x.clave||'')}</b></td><td>${esc(x.materia)}</td><td>${esc(x.obligacion)}</td><td>${esc(x.fundamento||'')}</td><td>${esc(x.periodicidad||'')}</td><td>${esc(x.aplica_a||'')}</td></tr>`).join('');
    c.innerHTML='<h1 class="pg">Compliance · Catálogo maestro</h1><div class="pgsub">'+d.length+' obligaciones de control (Fiscal, Corporativo, Laboral, Seguridad Social, REPSE, Gobierno, Contable).</div>'+nav+chips+'<div class="card"><table><thead><tr><th>Clave</th><th>Materia</th><th>Obligación</th><th>Fundamento</th><th>Periodicidad</th><th>Aplica a</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    bind();
    c.querySelectorAll('button.cmat').forEach(b=>b.onclick=()=>{st.mat=b.dataset.m;viewCompliance(c);});
    return;
  }

  if(st.mode==='detalle' && st.rfc){
    const {data,error}=await sb.from('vw_compliance_empresa').select('*').eq('empresa_rfc',st.rfc).order('materia');
    if(error) throw error;
    const d=data||[];
    const nom=d.length?d[0].razon_social:st.rfc;
    const cnt=(s)=>d.filter(x=>x.semaforo===s).length;
    const kp='<div class="kpis">'+tile(d.length,'Obligaciones','var(--navy)')+tile(cnt('VENCIDO'),'Vencidas','#c0392b')+tile(cnt('EN_RIESGO'),'En riesgo','#e67e22')+tile(cnt('CUMPLIDO'),'Cumplidas','#2980b9')+'</div>';
    const rows=d.map(x=>`<tr><td>${esc(x.materia)}</td><td>${esc(x.obligacion)}</td><td>${esc(x.periodicidad||'')}</td><td>${x.fecha_limite?esc(x.fecha_limite):'—'}</td><td>${semBadge(x.semaforo)}</td><td><button class="mini ck" data-id="${x.id}" data-cur="${x.cumplido?1:0}" style="background:${x.cumplido?'#2980b9':'var(--gold)'};color:#fff">${x.cumplido?'Cumplida':'Marcar'}</button></td></tr>`).join('');
    c.innerHTML='<h1 class="pg">Compliance · '+esc(nom)+'</h1><div class="pgsub">'+d.length+' obligaciones aplicables · '+cnt('VENCIDO')+' vencidas · '+cnt('EN_RIESGO')+' en riesgo</div>'+
      '<div style="margin-bottom:12px"><button class="mini" id="cback" style="background:var(--navy)">&larr; Volver al semáforo</button> <button class="mini" id="crem" style="background:var(--gold)">Generar recordatorio</button></div>'+kp+
      '<div class="card"><table><thead><tr><th>Materia</th><th>Obligación</th><th>Periodicidad</th><th>Fecha límite</th><th>Semáforo</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    c.querySelector('#cback').onclick=()=>{st.mode='resumen';st.rfc=null;viewCompliance(c);};
    c.querySelector('#crem').onclick=()=>{
      const pend=d.filter(x=>x.semaforo==='VENCIDO'||x.semaforo==='EN_RIESGO');
      const NL=String.fromCharCode(10);
      const lista=pend.length?pend.map(x=>'· '+x.materia+' — '+x.obligacion+(x.fecha_limite?(' (límite '+x.fecha_limite+')'):'')).join(NL):'Sin obligaciones vencidas o en riesgo.';
      const asunto='PR&M · Compliance pendiente — '+nom;
      const cuerpo='Recordatorio interno de obligaciones de compliance de '+nom+':'+NL+NL+lista+NL+NL+'Favor de atender y marcar como cumplidas en PRM 360.'+NL+NL+'PR&M Business Group';
      recordatorio(asunto, cuerpo);
    };
    c.querySelectorAll('button.ck').forEach(b=>b.onclick=async()=>{const nv=b.dataset.cur!=='1';await sb.from('compliance_empresa').update({cumplido:nv,actualizado_en:new Date().toISOString()}).eq('id',b.dataset.id);viewCompliance(c);});
    return;
  }

  const {data,error}=await sb.from('vw_compliance_resumen').select('*');
  if(error) throw error;
  const d=(data||[]).sort((a,b)=>(b.vencidas-a.vencidas)||(b.en_riesgo-a.en_riesgo)||(b.obligaciones-a.obligaciones));
  const tot=d.reduce((s,x)=>s+x.obligaciones,0), venc=d.reduce((s,x)=>s+x.vencidas,0), rie=d.reduce((s,x)=>s+x.en_riesgo,0);
  const kp='<div class="kpis">'+tile(d.length,'Empresas','var(--navy)')+tile(tot,'Obligaciones','var(--teal)')+tile(venc,'Vencidas','#c0392b')+tile(rie,'En riesgo','#e67e22')+'</div>';
  const rows=d.map(x=>`<tr class="crow" data-rfc="${esc(x.empresa_rfc)}" style="cursor:pointer"><td><b>${esc(x.razon_social)}</b></td><td>${x.obligaciones}</td><td>${x.vencidas>0?`<span class="tag" style="background:#c0392b;color:#fff">${x.vencidas}</span>`:'0'}</td><td>${x.en_riesgo>0?`<span class="tag" style="background:#e67e22;color:#fff">${x.en_riesgo}</span>`:'0'}</td><td>${x.vigentes}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Compliance · Semáforo por empresa</h1><div class="pgsub">'+d.length+' empresas activas · '+tot+' obligaciones instanciadas · haz clic en una empresa para ver el detalle.</div>'+nav+kp+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Obligaciones</th><th>Vencidas</th><th>En riesgo</th><th>Vigentes</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  bind();
  c.querySelectorAll('tr.crow').forEach(r=>r.onclick=()=>{st.mode='detalle';st.rfc=r.dataset.rfc;viewCompliance(c);});
}

async function viewServicios(c){
  const {data,error}=await sb.from('servicios').select('clave,nombre,area,activo').order('area');
  if(error) throw error;
  const rows=(data||[]).map(s=>`<tr><td><b>${s.clave}</b></td><td>${esc(s.nombre)}</td><td style="text-transform:capitalize">${s.area}</td><td><span class="tag ${s.activo?'on':'off'}">${s.activo?'activo':'inactivo'}</span></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Catálogo de servicios</h1><div class="pgsub">'+(data?data.length:0)+' servicios</div>'+
    '<div class="card"><table><thead><tr><th>Clave</th><th>Servicio</th><th>Área</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

async function viewEquipo(c, rol){
  const [{data:soc},{data:prom}]=await Promise.all([
    sb.from('socios').select('nombre,rol_socio,participacion_pct,estatus'),
    sb.from('promotores').select('nombre,zona,comision_pct,estatus')
  ]);
  const socR=(soc||[]).map(s=>`<tr><td>${esc(s.nombre)}</td><td style="text-transform:capitalize">${s.rol_socio}</td><td>${s.participacion_pct}%</td></tr>`).join('');
  const promR=(prom||[]).map(p=>`<tr><td>${esc(p.nombre)}</td><td>${esc(p.zona||'')}</td><td>${p.comision_pct}%</td></tr>`).join('');
  const socioCard=(rol==='consulta')?'':'<div class="card"><h3>Socios</h3><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Participación</th></tr></thead><tbody>'+(socR||'<tr><td colspan=3 class="empty">Sin socios</td></tr>')+'</tbody></table></div>';
  c.innerHTML='<h1 class="pg">Equipo</h1><div class="pgsub">Socios, promotores y trabajadores</div>'+
   socioCard+
   '<div class="card"><h3>Promotores</h3><table><thead><tr><th>Nombre</th><th>Zona</th><th>Comisión</th></tr></thead><tbody>'+(promR||'<tr><td colspan=3 class="empty">Sin promotores capturados aún</td></tr>')+'</tbody></table></div>';
}

async function viewCaptura(c){
  if(!window.__capt) window.__capt={cli:null};
  const st=window.__capt;
  const {data:servs}=await sb.from('servicios').select('id,nombre,activo').order('nombre');
  const {data:lista,error}=await sb.from('vw_captura_servicios').select('*').limit(200);
  if(error) throw error;
  const servOpts='<option value="">— servicio —</option>'+(servs||[]).map(s=>`<option value="${s.id}">${esc(s.nombre)}</option>`).join('');
  const perOpts=['mensual','bimestral','trimestral','cuatrimestral','semestral','anual'].map(p=>`<option value="${p}">${p}</option>`).join('');
  const rows=(lista||[]).map(x=>`<tr><td><b>${esc(x.razon_social)}</b></td><td>${esc(x.servicio||'—')}</td><td class="num-r">${money(x.honorario)}</td><td class="num-r">${money(x.costo_directo)}</td><td>${esc(x.periodicidad||'')}</td><td>${x.proxima_renovacion?esc(x.proxima_renovacion):'—'}</td><td><button class="mini del" data-id="${x.id}" style="background:var(--danger)">Quitar</button></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Captura de servicios y contratos</h1><div class="pgsub">Da de alta, por cliente, el servicio contratado con su honorario, costo y renovación. En cuanto captures, Rentabilidad y Cobranza se calculan solas.</div>'+
    '<div class="card"><h3>Nuevo servicio de cliente</h3><div class="body">'+
      '<div class="frm"><label>Cliente<input id="cap_q" placeholder="Busca por razón social o RFC" autocomplete="off" style="min-width:260px"></label>'+
        '<button class="btn2 ghost" id="cap_buscar">Buscar</button></div>'+
      '<div id="cap_res"></div>'+
      '<div id="cap_sel" style="font-size:13px;margin:6px 0"></div>'+
      '<div class="frm">'+
        `<label>Servicio<select id="cap_serv">${servOpts}</select></label>`+
        `<label>Periodicidad<select id="cap_per">${perOpts}</select></label>`+
        '<label>Honorario<input id="cap_hon" type="number" step="0.01" placeholder="0.00"></label>'+
        '<label>Costo directo<input id="cap_cos" type="number" step="0.01" placeholder="0.00"></label>'+
        '<label>Inicio<input id="cap_ini" type="date"></label>'+
        '<label>Próxima renovación<input id="cap_ren" type="date"></label>'+
      '</div>'+
      '<button class="btn2" id="cap_guardar">Guardar servicio</button> <span id="cap_msg" style="font-size:12.5px;margin-left:10px"></span>'+
    '</div></div>'+
    '<div class="card"><h3>Servicios capturados ('+(lista?lista.length:0)+')</h3><table><thead><tr><th>Cliente</th><th>Servicio</th><th class="num-r">Honorario</th><th class="num-r">Costo</th><th>Periodicidad</th><th>Renovación</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan=7 class="empty">Aún no hay servicios capturados</td></tr>')+'</tbody></table></div>';
  const setSel=()=>{document.getElementById('cap_sel').innerHTML = st.cli? ('Cliente seleccionado: <b style="color:var(--navy)">'+esc(st.cli.razon_social)+'</b> <span style="color:var(--muted)">('+esc(st.cli.rfc||'')+')</span>') : '<span style="color:var(--muted)">Ningún cliente seleccionado</span>';};
  setSel();
  const buscar=async()=>{
    const q=document.getElementById('cap_q').value.trim();
    const {data:res}=await sb.rpc('buscar_clientes',{p_q:q});
    const r=res||[];
    document.getElementById('cap_res').innerHTML = r.length? ('<div class="card" style="margin:6px 0"><table><tbody>'+r.map(x=>`<tr class="pick" data-id="${x.id}" data-nom="${esc(x.razon_social)}" data-rfc="${esc(x.rfc||'')}" style="cursor:pointer"><td>${esc(x.razon_social)}</td><td style="color:var(--muted)">${esc(x.rfc||'')}</td></tr>`).join('')+'</tbody></table></div>') : '<div style="font-size:12.5px;color:var(--muted);margin:6px 0">Sin coincidencias</div>';
    document.querySelectorAll('tr.pick').forEach(tr=>tr.onclick=()=>{st.cli={id:tr.dataset.id,razon_social:tr.dataset.nom,rfc:tr.dataset.rfc};document.getElementById('cap_res').innerHTML='';setSel();});
  };
  document.getElementById('cap_buscar').onclick=buscar;
  document.getElementById('cap_q').onkeydown=(e)=>{if(e.key==='Enter'){e.preventDefault();buscar();}};
  document.getElementById('cap_guardar').onclick=async()=>{
    const msg=document.getElementById('cap_msg');
    if(!st.cli){ msg.textContent='Primero selecciona un cliente.'; msg.style.color='var(--danger)'; return; }
    const b=document.getElementById('cap_guardar'); b.disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {data:res,error:e}=await sb.rpc('capturar_servicio',{p_cliente_id:st.cli.id,p_servicio_id:document.getElementById('cap_serv').value||null,p_honorario:parseFloat(document.getElementById('cap_hon').value)||0,p_costo:parseFloat(document.getElementById('cap_cos').value)||0,p_periodicidad:document.getElementById('cap_per').value,p_inicio:document.getElementById('cap_ini').value||null,p_proxima_renovacion:document.getElementById('cap_ren').value||null});
    b.disabled=false;
    if(e||res!=='ok'){ msg.textContent='Error: '+(e?e.message:res); msg.style.color='var(--danger)'; return; }
    viewCaptura(c);
  };
  c.querySelectorAll('button.del').forEach(b=>b.onclick=async()=>{b.disabled=true;await sb.rpc('eliminar_cliente_servicio',{p_id:b.dataset.id});viewCaptura(c);});
}

async function viewAccesos(c){
  if(!window.__acc) window.__acc={openId:null,openEmail:'',tipo:'cliente'};
  const st=window.__acc;
  const {data,error}=await sb.rpc('admin_perfiles_vinculacion');
  if(error) throw error;
  const roles=['pendiente','direccion','interno','consulta','cliente','promotor','trabajador','socio'];
  const deptos=(window.__deptos||[]);
  if(!window.__ofis){ const {data:ol}=await sb.rpc('oficinas_lista'); window.__ofis=ol||[]; }
  const ofis=window.__ofis||[];
  const ofiOpts=(sel)=>'<option value="">— sin oficina —</option>'+ofis.map(o=>`<option value="${o.clave}" ${o.clave===sel?'selected':''}>${esc(o.nombre)}</option>`).join('');
  const roleOpts=(sel)=>roles.map(r=>`<option ${r===sel?'selected':''}>${r}</option>`).join('');
  const depOpts=(sel)=>'<option value="">— sin departamento —</option>'+deptos.map(d=>`<option value="${d.clave}" ${d.clave===sel?'selected':''}>${esc(d.nombre)}</option>`).join('');
  const d=data||[];
  const pend=d.filter(x=>x.rol==='pendiente').length;
  const vincBadge=(u)=> u.vinc_tipo ? `<span class="tag on">${u.vinc_tipo}: ${esc(u.vinculo||'')}</span>` : '<span class="tag off">sin vincular</span>';
  const rows=d.map((u,i)=>`<tr><td><b>${esc(u.email||'(sin correo)')}</b>${u.rol==='pendiente'?' <span class="tag" style="background:#e67e22;color:#fff">nuevo</span>':''}</td><td><select id="rol_${i}">${roleOpts(u.rol)}</select></td><td><select id="dep_${i}">${depOpts(u.departamento)}</select></td><td><select id="uni_${i}" style="padding:5px 7px;border:1px solid var(--line);border-radius:6px;font-size:12px">${ofiOpts(u.unidad)}</select></td><td>${vincBadge(u)}</td><td style="white-space:nowrap"><button class="mini gsave" data-id="${u.id}" data-i="${i}">Guardar</button> <button class="mini vinc" data-id="${u.id}" data-em="${esc(u.email||'')}" style="background:var(--teal)">Vincular</button></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Accesos y vinculación</h1><div class="pgsub">'+d.length+' usuario(s) registrado(s)'+(pend?(' · '+pend+' por asignar'):'')+'. Asigna rol y departamento, y vincula cada cuenta con su ficha real.</div>'+
    '<div class="banner">Registro: pide a la persona entrar a <b>consola.prm360.com.mx</b> y darse de alta con su correo. <b>Vincular</b> conecta ese login con su expediente en la app Conecta (cliente, trabajador o promotor). Un <b>socio que además opera</b> (director de oficina) va como rol <b>interno</b> con su <b>Oficina</b> anotada. Sin vínculo, la cuenta entra pero ve su portal vacío.</div>'+
    '<div class="card"><table><thead><tr><th>Correo</th><th>Rol</th><th>Departamento</th><th>Oficina</th><th>Vínculo</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Aún no hay usuarios registrados</td></tr>')+'</tbody></table></div>'+
    (st.openId?renderLinker(st):'');
  c.querySelectorAll('button.gsave').forEach(b=>b.onclick=async()=>{
    const i=b.dataset.i;
    const rol=document.getElementById('rol_'+i).value, dep=document.getElementById('dep_'+i).value, uni=(document.getElementById('uni_'+i)||{}).value||'';
    b.textContent='…'; b.disabled=true;
    const {data:res,error:e}=await sb.rpc('admin_set_acceso',{p_id:b.dataset.id,p_rol:rol,p_departamento:dep,p_unidad:uni});
    b.textContent = e?'Error':(res==='ok'?'✓':res); if(e||res!=='ok'){ b.disabled=false; } else setTimeout(()=>{b.textContent='Guardar';b.disabled=false;},1200);
  });
  c.querySelectorAll('button.vinc').forEach(b=>b.onclick=()=>{ st.openId=b.dataset.id; st.openEmail=b.dataset.em; st.tipo='cliente'; viewAccesos(c); });
  if(st.openId) wireLinker(c, st);
}

function renderLinker(st){
  const tipos=['cliente','trabajador','promotor','desvincular'];
  return '<div class="card" id="linkcard"><h3>Vincular · '+esc(st.openEmail)+'</h3><div class="body">'+
    '<div class="frm"><label>Tipo de vínculo<select id="lk_tipo">'+tipos.map(t=>`<option value="${t}" ${t===st.tipo?'selected':''}>${t}</option>`).join('')+'</select></label> <button class="btn2 ghost" id="lk_cancel">Cerrar</button></div>'+
    '<div id="lk_body" style="margin-top:10px"></div>'+
    '<div id="lk_msg" style="font-size:12.5px;margin-top:8px"></div>'+
  '</div></div>';
}

function wireLinker(c, st){
  const body=c.querySelector('#lk_body'), msg=c.querySelector('#lk_msg');
  c.querySelector('#lk_cancel').onclick=()=>{ st.openId=null; viewAccesos(c); };
  const tipoSel=c.querySelector('#lk_tipo');
  tipoSel.onchange=()=>{ st.tipo=tipoSel.value; draw(); };
  const done=(res)=>{ if(res==='ok'){ st.openId=null; viewAccesos(c); } else { msg.textContent='No se pudo vincular: '+res; msg.style.color='var(--danger)'; } };
  function draw(){
    msg.textContent='';
    if(st.tipo==='desvincular'){
      body.innerHTML='<div style="font-size:13px">Se quitará el vínculo actual de esta cuenta (no borra la ficha, solo la desconecta). <button class="btn2" id="lk_desv" style="margin-left:8px">Quitar vínculo</button></div>';
      c.querySelector('#lk_desv').onclick=async()=>{ const {data:r,error:e}=await sb.rpc('admin_vincular',{p_perfil:st.openId,p_tipo:'desvincular'}); done(e?e.message:r); };
      return;
    }
    if(st.tipo==='promotor'){
      body.innerHTML='<div class="frm"><label>Nombre<input id="pr_n" placeholder="Nombre del promotor" style="min-width:220px"></label><label>Zona<input id="pr_z" placeholder="Zona"></label><label>Comisión %<input id="pr_c" type="number" step="0.1" placeholder="0"></label><button class="btn2" id="pr_go">Crear y vincular</button></div><div style="font-size:12px;color:var(--muted);margin-top:6px">No hay promotores capturados aún; se crea uno nuevo ligado a esta cuenta.</div>';
      c.querySelector('#pr_go').onclick=async()=>{
        const n=c.querySelector('#pr_n').value.trim();
        if(!n){ msg.textContent='El nombre es obligatorio.'; msg.style.color='var(--danger)'; return; }
        const {data:r,error:e}=await sb.rpc('admin_crear_promotor',{p_perfil:st.openId,p_nombre:n,p_zona:c.querySelector('#pr_z').value.trim(),p_comision:parseFloat(c.querySelector('#pr_c').value)||0});
        done(e?e.message:r);
      };
      return;
    }
    const ph = st.tipo==='cliente' ? 'Busca por razón social o RFC' : 'Busca por nombre, RFC o CURP';
    body.innerHTML='<div class="frm"><label>Buscar '+st.tipo+'<input id="lk_q" placeholder="'+ph+'" style="min-width:260px" autocomplete="off"></label><button class="btn2 ghost" id="lk_buscar">Buscar</button></div><div id="lk_res"></div>';
    const buscar=async()=>{
      const q=c.querySelector('#lk_q').value.trim(); const res=c.querySelector('#lk_res');
      res.innerHTML='<div style="font-size:12.5px;color:var(--muted);padding:6px 0">Buscando…</div>';
      let list=[];
      if(st.tipo==='cliente'){ const {data}=await sb.rpc('buscar_clientes',{p_q:q}); list=(data||[]).map(x=>({ref:x.rfc||'',l1:x.razon_social,l2:x.rfc||'(sin RFC)',dis:!x.rfc})); }
      else { const {data}=await sb.rpc('admin_buscar_trabajadores',{p_q:q}); list=(data||[]).map(x=>({ref:x.id,l1:x.nombre,l2:(x.rfc||'')+(x.puesto?(' · '+x.puesto):'')+(x.patron?(' · '+x.patron):'')+(x.ya_vinculado?' · YA VINCULADO':''),dis:x.ya_vinculado})); }
      res.innerHTML = list.length? ('<div class="card" style="margin:6px 0"><table><tbody>'+list.map(x=>`<tr class="lkpick" data-ref="${esc(String(x.ref))}" data-dis="${x.dis?1:0}" style="cursor:${x.dis?'not-allowed':'pointer'};${x.dis?'opacity:.5':''}"><td><b>${esc(x.l1)}</b><div style="font-size:11.5px;color:var(--muted)">${esc(x.l2)}</div></td></tr>`).join('')+'</tbody></table></div>') : '<div style="font-size:12.5px;color:var(--muted);padding:6px 0">Sin coincidencias</div>';
      res.querySelectorAll('tr.lkpick').forEach(tr=>tr.onclick=async()=>{
        if(tr.dataset.dis==='1') return;
        const ref=tr.dataset.ref; let r,e;
        if(st.tipo==='cliente'){ ({data:r,error:e}=await sb.rpc('admin_vincular',{p_perfil:st.openId,p_tipo:'cliente',p_rfc:ref})); }
        else { ({data:r,error:e}=await sb.rpc('admin_vincular',{p_perfil:st.openId,p_tipo:'trabajador',p_trab:ref})); }
        done(e?e.message:r);
      });
    };
    c.querySelector('#lk_buscar').onclick=buscar;
    c.querySelector('#lk_q').onkeydown=(ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); buscar(); } };
  }
  draw();
}

async function viewAltas(c){
  const {data,error}=await sb.from('onboarding_cliente').select('*').order('creado_en',{ascending:false});
  if(error) throw error;
  const d=data||[];
  const fmt=(s)=>{ try{ return new Date(s).toLocaleDateString('es-MX'); }catch(e){ return ''; } };
  const cards=d.map(a=>{
    const docs=(a.documentos||[]);
    const btns = docs.length
      ? docs.map(x=>`<button class="mini dl" data-ruta="${esc(x.ruta)}" style="margin:4px 5px 0 0">⬇ ${esc(x.archivo||x.campo)}</button>`).join('')
      : '<span class="empty">Sin documentos adjuntos</span>';
    const det=(a.datos&&a.datos.detalle)?`<div style="font-size:12.5px;color:#555;margin-top:8px">“${esc(a.datos.detalle)}”</div>`:'';
    const cont=[a.contacto,a.correo,a.telefono].filter(Boolean).map(esc).join(' · ');
    return `<div class="card">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div><b style="color:#27457A">${esc(a.referencia||'')}</b> &nbsp; <b>${esc(a.razon_social||a.rfc||'—')}</b>
          <div style="font-size:12px;color:#888;margin-top:2px">${esc(a.rfc||'')}${a.giro?(' · '+esc(a.giro)):''}</div></div>
        <div style="font-size:12px;color:#888;text-align:right">${fmt(a.creado_en)}${cont?('<br>'+cont):''}</div>
      </div>${det}
      <div style="margin-top:10px"><span style="font-size:11px;color:#9C6B52;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Documentos (${docs.length})</span><div style="margin-top:6px">${btns}</div></div>
      <div style="margin-top:12px;border-top:1px solid #F0EDE8;padding-top:10px">${a.estatus==='convertida'?'<span class="tag on">✓ Convertida en cliente</span>':`<button class="mini conv" data-id="${esc(a.id)}" style="background:var(--navy)">Convertir en cliente + folio</button>`}</div>
    </div>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Altas de clientes</h1><div class="pgsub">'+d.length+' alta(s) recibida(s) desde el formulario en línea. Descarga los documentos y da seguimiento.</div>'+
    '<div class="banner">Comparte la liga <b>prm360-alta.vercel.app</b> con tus prospectos. Cada alta llega aquí con sus documentos; el enlace de descarga es temporal y seguro.</div>'+
    (cards||'<div class="card"><div class="empty">Aún no hay altas recibidas.</div></div>');
  c.querySelectorAll('button.dl').forEach(b=>b.onclick=async()=>{
    const t=b.textContent; b.disabled=true; b.textContent='Abriendo…';
    const {data:s,error:e}=await sb.storage.from('onboarding').createSignedUrl(b.dataset.ruta,120);
    if(e||!s){ b.textContent='No disponible'; setTimeout(()=>{b.textContent=t;b.disabled=false;},1800); return; }
    window.open(s.signedUrl,'_blank'); b.textContent=t; b.disabled=false;
  });
  c.querySelectorAll('button.conv').forEach(b=>b.onclick=async()=>{
    b.textContent='Convirtiendo…'; b.disabled=true;
    const {data:res,error:e}=await sb.rpc('convertir_alta',{p_id:b.dataset.id});
    if(e){ b.textContent='Error'; b.title=e.message||''; b.disabled=false; return; }
    b.outerHTML='<span class="tag on">✓ Convertida · Folio '+res+'</span>';
  });
}

async function viewTablero(c){
  const {data:sol,error}=await sb.from('solicitudes').select('folio,tipo_operacion,estado,rfc,responsable,recibido_en').order('recibido_en',{ascending:false}).limit(300);
  if(error) throw error;
  const d=sol||[];
  const activos=ESTADOS.filter(e=>e!=='rechazada');
  const grupos={}; d.forEach(s=>{ (grupos[s.estado]||(grupos[s.estado]=[])).push(s); });
  const estOpts=(sel)=>ESTADOS.map(e=>`<option ${e===sel?'selected':''}>${e}</option>`).join('');
  const kp='<div class="kpis">'+
    tile(d.length,'Folios','var(--navy)')+
    tile(d.filter(s=>s.estado!=='entregada'&&s.estado!=='rechazada').length,'En proceso','var(--wait)')+
    tile(d.filter(s=>s.estado==='entregada').length,'Entregados','var(--ok)')+
    tile(d.filter(s=>!s.responsable).length,'Sin responsable','var(--danger)')+'</div>';
  let cols='';
  activos.forEach(e=>{
    const items=grupos[e]||[]; if(!items.length) return;
    const cards=items.map(s=>`<div class="card" style="margin-bottom:10px"><div class="body">
      <div style="display:flex;justify-content:space-between;gap:8px"><b style="color:#27457A;font-size:12px">${s.folio||''}</b><span style="font-size:11px;color:var(--muted)">${s.recibido_en?new Date(s.recibido_en).toLocaleDateString('es-MX'):''}</span></div>
      <div style="font-size:13px;font-weight:600;margin:3px 0">${esc(s.tipo_operacion||'Operación')}</div>
      <div style="font-size:11px;color:var(--muted)">${esc(s.rfc||'')}${s.responsable?(' · 👤 '+esc(s.responsable)):''}</div>
      <div class="frm" style="margin:8px 0 0;gap:6px">
        <select class="tb-est" data-folio="${esc(s.folio)}">${estOpts(s.estado)}</select>
        <input class="tb-resp" data-folio="${esc(s.folio)}" placeholder="Responsable" value="${esc(s.responsable||'')}" style="min-width:120px">
        <input class="tb-nota" data-folio="${esc(s.folio)}" placeholder="Nota" style="min-width:130px">
        <button class="mini tb-save" data-folio="${esc(s.folio)}">Guardar</button>
      </div></div></div>`).join('');
    cols+=`<div style="margin-bottom:20px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gold);margin-bottom:8px">${e} · ${items.length}</div>${cards}</div>`;
  });
  c.innerHTML='<h1 class="pg">Tablero de operación</h1><div class="pgsub">Folios por estado. Cambia el estado, asigna responsable y agrega una nota — todo queda en bitácora.</div>'+kp+
    (cols||'<div class="banner">No hay folios en operación todavía. Convierte un alta o recibe solicitudes para empezar.</div>');
  c.querySelectorAll('button.tb-save').forEach(b=>b.onclick=async()=>{
    const f=b.dataset.folio;
    const est=c.querySelector('select.tb-est[data-folio="'+f+'"]').value;
    const resp=c.querySelector('input.tb-resp[data-folio="'+f+'"]').value;
    const nota=c.querySelector('input.tb-nota[data-folio="'+f+'"]').value;
    b.textContent='…'; b.disabled=true;
    const {data:res,error:e}=await sb.rpc('avanzar_folio',{p_folio:f,p_estado:est,p_responsable:resp,p_nota:nota});
    if(e||res!=='ok'){ b.textContent='Error'; b.title=e?e.message:''; b.disabled=false; return; }
    viewTablero(c);
  });
}

async function viewTareas(c){
  const {data,error}=await sb.from('tareas').select('*').order('estatus').order('vence',{ascending:true,nullsFirst:false});
  if(error) throw error;
  const d=data||[];
  const prioColor={alta:'#c0392b',media:'#e67e22',baja:'#2e6f7e'};
  const estColor={pendiente:'#b8862f',en_proceso:'#2980b9',hecha:'#3f8f5b'};
  const rows=d.map(t=>`<tr>
    <td><b>${esc(t.titulo)}</b>${t.detalle?('<div style="font-size:11px;color:var(--muted)">'+esc(t.detalle)+'</div>'):''}</td>
    <td>${esc(t.asignado_a||'—')}</td><td>${t.folio?esc(t.folio):'—'}</td>
    <td><span class="tag" style="background:${prioColor[t.prioridad]||'#888'};color:#fff">${t.prioridad||'media'}</span></td>
    <td>${t.vence?esc(t.vence):'—'}</td>
    <td><span class="tag" style="background:${estColor[t.estatus]||'#888'};color:#fff">${(t.estatus||'').replace('_',' ')}</span></td>
    <td>${t.estatus!=='hecha'?`<button class="mini tk-done" data-id="${t.id}" style="background:#3f8f5b">✓ Hecha</button>`:`<button class="mini tk-reab" data-id="${t.id}" style="background:#888">Reabrir</button>`}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Pendientes del equipo</h1><div class="pgsub">Crea tareas, asígnalas y marca avance. '+d.filter(t=>t.estatus!=='hecha').length+' abiertas.</div>'+
    '<div class="card"><h3>Nueva tarea</h3><div class="body"><div class="frm">'+
      '<label>Título<input id="tk_t" placeholder="¿Qué hay que hacer?" style="min-width:220px"></label>'+
      '<label>Asignar a<input id="tk_a" placeholder="Correo o nombre"></label>'+
      '<label>Folio (opcional)<input id="tk_f" placeholder="PRM-2026-..."></label>'+
      '<label>Prioridad<select id="tk_p"><option value="media">media</option><option value="alta">alta</option><option value="baja">baja</option></select></label>'+
      '<label>Vence<input id="tk_v" type="date"></label>'+
    '</div><div class="frm"><label style="flex:1">Detalle<input id="tk_d" placeholder="Detalle (opcional)" style="min-width:320px"></label></div>'+
    '<div style="margin-top:8px"><button class="btn2" id="tk_add">Crear tarea</button> <span id="tk_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Tarea</th><th>Asignada a</th><th>Folio</th><th>Prioridad</th><th>Vence</th><th>Estatus</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan=7 class="empty">Sin tareas todavía</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('tk_add').onclick=async()=>{
    const t=g('tk_t').value.trim(); const msg=g('tk_msg');
    if(!t){ msg.textContent='Escribe un título.'; msg.style.color='var(--danger)'; return; }
    g('tk_add').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('tareas').insert({titulo:t, detalle:g('tk_d').value.trim()||null, asignado_a:g('tk_a').value.trim()||null, folio:g('tk_f').value.trim()||null, prioridad:g('tk_p').value, vence:g('tk_v').value||null, creado_por:window.__email||'interno'});
    g('tk_add').disabled=false;
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; return; }
    viewTareas(c);
  };
  const upd=async(id,estatus)=>{ await sb.from('tareas').update({estatus,actualizado_en:new Date().toISOString()}).eq('id',id); viewTareas(c); };
  c.querySelectorAll('button.tk-done').forEach(b=>b.onclick=()=>upd(b.dataset.id,'hecha'));
  c.querySelectorAll('button.tk-reab').forEach(b=>b.onclick=()=>upd(b.dataset.id,'pendiente'));
}

async function renderExterno(rol){
  $('#nav').innerHTML='';
  const c=$('#content');
  const titulos={cliente:'Portal del Cliente',promotor:'Portal del Promotor',trabajador:'Portal del Trabajador',socio:'Portal del Socio'};
  c.innerHTML='<h1 class="pg">'+(titulos[rol]||'Portal')+'</h1><div class="pgsub">Bienvenido a PRM 360</div><div class="loader">Cargando tu información…</div>';
  try{
    if(rol==='cliente') return await portalCliente(c);
    if(rol==='promotor') return await portalPromotor(c);
    if(rol==='socio') return await portalSocio(c);
    const {data}=await sb.from('trabajadores').select('nombre,puesto,rfc_patron,estatus').limit(1);
    c.querySelector('.loader').outerHTML = (data&&data[0])
      ? `<div class="card"><h3>Mi registro</h3><table><tr><th>Nombre</th><td>${esc(data[0].nombre)}</td></tr><tr><th>Puesto</th><td>${esc(data[0].puesto||'')}</td></tr><tr><th>Estatus</th><td>${data[0].estatus}</td></tr></table></div>`
      : '<div class="banner">Aún no hay un registro de trabajador ligado a tu cuenta.</div>';
  }catch(e){ c.querySelector('.loader').outerHTML='<div class="empty">'+(e.message||e)+'</div>'; }
}
async function portalCliente(c){
  const {data:cl}=await sb.from('clientes').select('id,razon_social,rfc,grupo,estatus');
  if(!cl||cl.length===0){ c.querySelector('.loader').outerHTML='<div class="banner">Tu ficha de cliente se está preparando. En breve verás tus servicios y expedientes.</div>'; return; }
  const {data:serv}=await sb.from('cliente_servicios').select('estatus,honorario,periodicidad,servicios(nombre,area)');
  const sRows=(serv||[]).map(s=>`<tr><td>${esc(s.servicios?.nombre||'')}</td><td style="text-transform:capitalize">${s.servicios?.area||''}</td><td>${s.estatus}</td></tr>`).join('');
  c.querySelector('.loader').outerHTML=
    `<div class="card"><h3>Mis datos</h3><table><tr><th>Razón social</th><td>${esc(cl[0].razon_social)}</td></tr><tr><th>RFC</th><td>${cl[0].rfc||''}</td></tr><tr><th>Grupo</th><td>${esc(cl[0].grupo||'')}</td></tr></table></div>`+
    `<div class="card"><h3>Mis servicios</h3><table><thead><tr><th>Servicio</th><th>Área</th><th>Estatus</th></tr></thead><tbody>${sRows||'<tr><td colspan=3 class="empty">Sin servicios contratados</td></tr>'}</tbody></table></div>`;
}
async function portalPromotor(c){
  const {data}=await sb.from('clientes').select('razon_social,rfc,estatus').order('razon_social').limit(200);
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.razon_social)}</td><td>${x.rfc||''}</td><td>${x.estatus}</td></tr>`).join('');
  c.querySelector('.loader').outerHTML=`<div class="card"><h3>Mi cartera de clientes</h3><table><thead><tr><th>Razón social</th><th>RFC</th><th>Estatus</th></tr></thead><tbody>${rows||'<tr><td colspan=3 class="empty">Aún sin cartera asignada</td></tr>'}</tbody></table></div>`;
}
async function portalSocio(c){
  const {data}=await sb.from('socios').select('nombre,rol_socio,participacion_pct');
  const rows=(data||[]).map(s=>`<tr><td>${esc(s.nombre)}</td><td style="text-transform:capitalize">${s.rol_socio}</td><td>${s.participacion_pct}%</td></tr>`).join('');
  c.querySelector('.loader').outerHTML=`<div class="card"><h3>Sociedad</h3><table><thead><tr><th>Nombre</th><th>Tipo</th><th>Participación</th></tr></thead><tbody>${rows||'<tr><td colspan=3 class="empty">Sin datos</td></tr>'}</tbody></table></div>`;
}

function esc(s){return (s==null?'':String(s)).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}

/* ===== Placeholder · módulo en construcción ===== */
function viewSoon(c, label){
  const nombre = label || 'Este módulo';
  c.innerHTML='<div class="center-msg"><div class="em">🚧</div>'+
    '<h2>'+esc(nombre)+'</h2>'+
    '<p>En construcción · próximamente.<br>Este módulo estará disponible en una próxima entrega de PRM&nbsp;360.</p></div>';
}

/* ===== Cotizador de nómina (escribe en solicitudes) ===== */
async function viewCotizador(c){
  if(!window.__cotEmp){
    const {data}=await sb.from('empresas').select('rfc,razon_social').order('razon_social');
    window.__cotEmp = data||[];
  }
  const emps = window.__cotEmp;
  const opts = emps.map(e=>'<option value="'+esc(e.rfc)+'">'+esc(e.razon_social||e.rfc)+'</option>').join('') || '<option value="">(sin empresas)</option>';
  c.innerHTML='<h1 class="pg">Cotizador de nómina</h1>'+
    '<div class="pgsub">Calcula el honorario y guarda la cotización como solicitud (folio COT-PRM) en Supabase.</div>'+
    '<div class="card" style="max-width:640px"><h3>Datos de la cotización</h3><div class="body">'+
      '<div class="frm">'+
        '<label>Empresa emisora<select id="c_emp" style="min-width:220px">'+opts+'</select></label>'+
        '<label>N.º de trabajadores<input id="c_emp_n" type="number" value="10" min="0"></label>'+
        '<label>Nómina mensual (bruto)<input id="c_sueldo" type="number" value="12000" min="0"></label>'+
        '<label>Honorario por trabajador<input id="c_hon" type="number" value="180" min="0"></label>'+
        '<label>% de honorario s/nómina<input id="c_pct" type="number" value="0" min="0" step="0.1"></label>'+
      '</div>'+
      '<div id="c_out" style="margin-top:14px"></div>'+
      '<div style="margin-top:14px;display:flex;gap:10px">'+
        '<button class="btn2" id="c_calc">Calcular</button>'+
        '<button class="btn2 ghost" id="c_save">Guardar cotización</button>'+
        '<span id="c_msg" style="font-size:12px;align-self:center"></span>'+
      '</div>'+
    '</div></div>';
  const g=id=>document.getElementById(id);
  const calc=()=>{
    const emp=Number(g('c_emp_n').value)||0, hon=Number(g('c_hon').value)||0;
    const nom=Number(g('c_sueldo').value)||0, pct=Number(g('c_pct').value)||0;
    const honor = emp*hon + nom*emp*(pct/100);
    const iva = honor*0.16, total = honor+iva;
    window._cot = {empleados:emp, honorario_empleado:hon, nomina_mensual:nom, pct_honorario:pct, honorario:honor, iva:iva, total:total};
    g('c_out').innerHTML='<div style="background:var(--cream);border:1px solid var(--line);border-radius:10px;padding:14px">'+
      '<div style="display:flex;justify-content:space-between;padding:5px 0">Honorario del despacho<b>'+money(honor)+'</b></div>'+
      '<div style="display:flex;justify-content:space-between;padding:5px 0">IVA (16%)<b>'+money(iva)+'</b></div>'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid var(--navy);font-weight:700;font-size:16px">Total<span style="color:var(--gold)">'+money(total)+'</span></div></div>';
  };
  g('c_calc').onclick=calc;
  g('c_save').onclick=async()=>{
    const msg=g('c_msg');
    if(!window._cot) calc();
    const cot=window._cot;
    const emp=g('c_emp').value;
    const folio='COT-PRM-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-5);
    const resumen='Cotización de nómina · '+cot.empleados+' trabajadores · nómina '+money(cot.nomina_mensual)+' · honorario '+money(cot.honorario)+' + IVA '+money(cot.iva)+' = total '+money(cot.total);
    msg.textContent='Guardando…'; msg.style.color='var(--muted)'; g('c_save').disabled=true;
    let saved=false, lastErr=null;
    const intentos=[
      {folio, empresa_emisora:emp||null, tipo_operacion:'Cotización de nómina', importe:cot.total, estado:'cotizacion', recibido_en:new Date().toISOString(), payload:cot},
      {folio, empresa_emisora:emp||null, tipo_operacion:'Cotización de nómina', importe:cot.total, estado:'cotizacion'},
      {folio, tipo:'cotizacion', descripcion:resumen},
      {folio, estado:'cotizacion'}
    ];
    for(const obj of intentos){
      const {error}=await sb.from('solicitudes').insert(obj);
      if(!error){ saved=true; break; }
      lastErr=error;
    }
    g('c_save').disabled=false;
    if(saved){
      msg.textContent='';
      g('c_out').innerHTML += '<div style="margin-top:10px;color:var(--ok);font-weight:600;font-size:13px">✓ Folio '+folio+' guardado en solicitudes.</div>';
    } else {
      msg.textContent='No se pudo guardar'+(lastErr&&lastErr.message?(': '+lastErr.message):'.'); msg.style.color='var(--danger)';
    }
  };
  calc();
}

/* ===== Trabajadores · IMSS (búsqueda + ficha detallada) ===== */
async function viewTrabajadores(c){
  c.innerHTML='<h1 class="pg">Trabajadores · IMSS</h1>'+
    '<div class="pgsub">Busca un trabajador y abre su expediente completo.</div>'+
    '<div class="card"><div class="body"><div class="frm">'+
      '<label style="flex:1">Búsqueda<input id="tw_q" placeholder="Nombre, NSS, CURP o cliente…" style="min-width:260px"></label>'+
      '<button class="btn2" id="tw_go" style="align-self:flex-end">Buscar</button>'+
    '</div></div></div>'+
    '<div id="tw_res"></div><div id="tw_ficha"></div>';
  const g=id=>document.getElementById(id);
  const buscar=async()=>{
    const res=g('tw_res'); res.innerHTML='<div class="loader">Buscando…</div>';
    const term=g('tw_q').value.trim();
    const {data,error}=await sb.rpc('trabajadores_ext_lista',{p_q:term});
    if(error){ res.innerHTML='<div class="empty">No se pudo buscar: '+esc(error.message||'')+'</div>'; return; }
    const list = Array.isArray(data) ? data : (data||[]);
    if(!list.length){ res.innerHTML='<div class="card"><div class="empty">Sin resultados</div></div>'; return; }
    const rows=list.map(t=>'<tr class="clk" data-id="'+esc(t.id)+'"><td>'+esc(t.nombre||'')+'</td><td>'+esc(t.cliente_nombre||'')+'</td><td>'+esc(t.puesto||'')+'</td><td>'+esc(t.nss||t.NSS||'')+'</td><td><span class="tag '+((t.estatus||'')==='alta'||(t.estatus||'')==='activo'?'on':'off')+'">'+esc(t.estatus||'')+'</span></td></tr>').join('');
    res.innerHTML='<div class="card"><table><thead><tr><th>Nombre</th><th>Cliente</th><th>Puesto</th><th>NSS</th><th>Estatus</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    res.querySelectorAll('tr.clk').forEach(tr=>tr.onclick=()=>abrirFicha(tr.dataset.id));
  };
  const abrirFicha=async(id)=>{
    const f=g('tw_ficha'); f.innerHTML='<div class="loader">Cargando ficha…</div>';
    const {data,error}=await sb.rpc('trabajador_ficha',{p_id:id});
    if(error){ f.innerHTML='<div class="empty">No se pudo cargar la ficha: '+esc(error.message||'')+'</div>'; return; }
    f.innerHTML=renderFichaTrab(data||{});
    f.scrollIntoView({behavior:'smooth',block:'start'});
  };
  g('tw_go').onclick=buscar;
  g('tw_q').onkeydown=(e)=>{ if(e.key==='Enter') buscar(); };
}

function renderFichaTrab(d){
  const t=d.trabajador||{};
  const fila=(k,v)=>'<tr><th>'+esc(k)+'</th><td>'+esc(v==null||v===''?'—':v)+'</td></tr>';
  const tabla=(rows,cols,empty)=>{
    const arr=Array.isArray(rows)?rows:[];
    if(!arr.length) return '<div class="empty">'+(empty||'Sin registros')+'</div>';
    const head='<tr>'+cols.map(cc=>'<th>'+esc(cc[0])+'</th>').join('')+'</tr>';
    const body=arr.map(r=>'<tr>'+cols.map(cc=>'<td>'+esc(r[cc[1]]==null?'':r[cc[1]])+'</td>').join('')+'</tr>').join('');
    return '<table><thead>'+head+'</thead><tbody>'+body+'</tbody></table>';
  };
  const inf=d.infonavit||{};
  let html='<h1 class="pg" style="margin-top:22px">'+esc(t.nombre||'Trabajador')+'</h1>'+
    '<div class="pgsub">'+esc(t.cliente_nombre||'')+(t.puesto?(' · '+esc(t.puesto)):'')+'</div>';
  html+='<div class="cols2">';
  html+='<div class="card"><h3>Identidad</h3><table>'+
    fila('Nombre',t.nombre)+fila('CURP',t.curp)+fila('RFC',t.rfc)+fila('NSS',t.nss)+'</table></div>';
  html+='<div class="card"><h3>Relación laboral</h3><table>'+
    fila('Cliente',t.cliente_nombre)+fila('Registro patronal',t.registro_patronal)+fila('Puesto',t.puesto)+
    fila('Sucursal',t.sucursal)+fila('Grupo de nómina',t.grupo_nomina)+'</table></div>';
  html+='<div class="card"><h3>Salarios</h3><table>'+
    fila('Salario diario',t.salario_diario)+fila('SDI',t.sdi)+fila('Factor de integración',t.factor_integracion)+'</table></div>';
  html+='<div class="card"><h3>Datos generales</h3><table>'+
    fila('Fecha de nacimiento',t.fecha_nacimiento)+fila('Tipo de contrato',t.tipo_contrato)+fila('Jornada',t.jornada)+
    fila('Banco',t.banco)+fila('CLABE',t.clabe)+'</table></div>';
  html+='<div class="card"><h3>Cumplimiento</h3><table>'+
    fila('Clase de riesgo',t.clase_riesgo)+fila('Prima de riesgo',t.prima_riesgo)+fila('Modalidad',t.modalidad)+'</table></div>';
  html+='<div class="card"><h3>INFONAVIT</h3><table>'+
    fila('Tiene crédito',inf.tiene_credito===true?'Sí':(inf.tiene_credito===false?'No':inf.tiene_credito))+
    fila('Tipo de descuento',inf.tipo_descuento)+fila('Factor',inf.factor)+
    fila('Al corriente',inf.al_corriente===true?'Sí':(inf.al_corriente===false?'No':inf.al_corriente))+'</table></div>';
  html+='</div>';
  html+='<div class="card"><h3>Movimientos afiliatorios</h3><div class="body">'+
    tabla(d.movimientos,[['Tipo','tipo'],['Fecha','fecha'],['SDI','sdi'],['Motivo','motivo'],['Estatus IDSE','estatus_idse']])+'</div></div>';
  html+='<div class="card"><h3>Incidencias</h3><div class="body">'+
    tabla(d.incidencias,[['Tipo','tipo'],['Ramo','ramo'],['Inicio','fecha_inicio'],['Fin','fecha_fin'],['Días','dias']])+'</div></div>';
  html+='<div class="card"><h3>Informativas</h3><div class="body">'+
    tabla(d.informativas,[['Tipo','tipo'],['Cuatrimestre','cuatrimestre'],['Año','anio'],['Estatus','estatus']])+'</div></div>';
  html+='<div class="card"><h3>Liquidaciones</h3><div class="body">'+
    tabla(d.liquidaciones,[['Periodo','periodo'],['Tipo','tipo'],['Monto','monto'],['Estatus','estatus']])+'</div></div>';
  return html;
}

boot();
