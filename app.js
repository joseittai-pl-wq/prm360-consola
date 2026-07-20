
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
if(document.getElementById('btnExport')){ document.getElementById('btnExport').onclick=exportContentCSV; }
if(document.getElementById('btnPrint')){ document.getElementById('btnPrint').onclick=function(){ window.print(); }; }
(function(){ var gs=document.getElementById('gsearch'); if(gs){ gs.onkeydown=function(e){ if(e.key==='Enter'){ window.__gterm=gs.value.trim(); const cc=document.querySelector('#content'); document.querySelectorAll('.dm-link').forEach(function(x){x.classList.remove('active');}); viewBusqueda(cc, window.__gterm); } }; } })();

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
  ['Dirección', [ ['Tablero General','tabgen','n'],['Rentabilidad','rentabilidad','n'],['Frentes · semáforos','frentes','n'] ]],
  ['Comercial', [ ['Tablero Comercial','tabcom','n'],['Cotizador de nómina','cotizador','p'],['Solicitud (PDF / editable)','solicitudpdf','p'],['Checklist de documentos','checklistdocs','p'],['Presentaciones comerciales','bibliopresenta','p'],['Tablero de clientes','clientes','p'],['Boletín','boletin','p'] ]],
  ['Vinculación', [ ['Tablero Vinculación','tabvinc','n'],['Clientes','clientescombo','p'],['Trabajadores · IMSS','trabajadorescombo','p'],['Onboarding / KYC','onboarding','n'],['Validación + KYC (CSF/32-D/69)','kyc','p'],['Checklist de documentos','checklistdocs','p'],['Control de entregables','entregables','p'] ]],
  ['Operaciones', [ ['Tablero Operaciones','tabop','n'],['Trámites','tramitescombo','p'],['Facturación','facturacion','p'],['Nómina NOMEN','__soon_nomen','p'],['Layout de dispersión','__soon_layout','p'],['Expediente de Materialidad','materialidad','p'],['Conciliación disp. ↔ CFDI','__soon_concilia','p'],['Descargas SAT / CFDI','descargas','n'],['Calendario de vencimientos','calendario','n'] ]],
  ['Jurídico', [ ['Tablero Jurídico','tabjur','n'],['Corporativo','corporativocombo','p'],['Bitácora de firmas','bitacorafirmas','p'],['Vigencias / Renovaciones','renovaciones','p'],['Gobierno y Padrones','padrones','n'],['Licitaciones y contratos','licitaciones','n'],['Plantillas de contratos','biblioplantillas','p'],['Juicios / defensa fiscal','juicios','p'],['Documentales (púb. y priv.)','documentales','n'],['Compliance jurídico','compliance','n'] ]],
  ['Fiscal', [ ['Tablero Fiscal','tabfisc','n'],['Cumplimiento','cumplimientocombo','p'],['Calendario fiscal','calfiscal','p'],['Calendario REPSE (ICSOE/SISUB)','calrepse','p'],['Previsión social','previsioncombo','p'],['NOM-035','nom035','p'],['Cuestionario NOM-035','nom035cuest','n'],['e.firmas (control)','efirmasv','n'] ]],
  ['Contabilidad', [ ['Tablero Contable','tabcont','n'],['Contabilidad / Pólizas','contabilidad','n'],['Captura de servicios','captura','p'],['Descarga XML / CFDI','descargas','n'],['Bancos','bancoscombo','p'],['Motor de conciliación','__soon_motorconcilia','p'] ]],
  ['Tesorería', [ ['Tablero Tesorería','tabtes','n'],['Cobranza','cobranza','n'],['Cuentas por pagar','cxp','p'],['Bancos y flujo','flujo','p'],['Cuentas','cuentas','p'],['Pagos','pagos','p'],['Calendario fiscal','calfiscal','p'] ]],
  ['Administración', [ ['Tablero Administración','tabadm','n'],['Empresas del grupo','empresascombo','p'],['Gastos y costeo','gastoscombo','p'],['Costeo por cliente','costeo','n'],['Importador de reportes','importador','n'],['Accesos y vinculación','accesos','n'],['Contraloría','contraloria','p'],['Organigrama y matrices','biblioorg','p'],['Directorio','directorio','n'],['Sucursales','sucursalesv','n'],['Personal interno','equipo','n'],['Organigrama y funciones','organigramafn','n'],['Reportes','reportes','p'] ]]
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
    if(v==='clifiscal')    return await viewClientesFiscal(c);
    if(v==='clientescombo') return await viewClientesCombo(c);
    if(v==='contratoscombo') return await viewContratosCombo(c);
    if(v==='contratos')    return await viewContratos(c);
    if(v==='juicios')      return await viewJuicios(c);
    if(v==='renovaciones') return await viewRenovaciones(c);
    if(v==='prevision')    return await viewPrevisionSocial(c);
    if(v==='adhesiones')   return await viewAdhesiones(c);
    if(v==='bancarios')    return await viewMovBancarios(c);
    if(v==='cuentas')      return await viewCuentas(c);
    if(v==='pagos')        return await viewPagos(c);
    if(v==='flujo')        return await viewFlujo(c);
    if(v==='sustancia')    return await viewSustancia(c);
    if(v==='boletin')      return await viewBoletin(c);
    if(v==='actas')        return await viewActas(c);
    if(v==='movimientos')  return await viewMovimientos(c);
    if(v==='onboarding')   return await viewOnboarding(c);
    if(v==='documentos')   return await viewDocumentos(c);
    if(v==='descargas')    return await viewDescargas(c);
    if(v==='calendario')   return await viewCalendario(c);
    if(v==='tabgen')       return await viewTabGen(c);
    if(v==='tabcom')       return await viewTabCom(c);
    if(v==='tabvinc')      return await viewTabVinc(c);
    if(v==='tabop')        return await viewTabOp(c);
    if(v==='tabjur')       return await viewTabJur(c);
    if(v==='tabcont')      return await viewTabCont(c);
    if(v==='tabfisc')      return await viewTabFisc(c);
    if(v==='tabtes')       return await viewTabTes(c);
    if(v==='tabadm')       return await viewTabAdm(c);
    if(v==='trabajadorescombo') return await viewTrabajadoresCombo(c);
    if(v==='tramitescombo') return await viewTramitesCombo(c);
    if(v==='corporativocombo') return await viewCorporativoCombo(c);
    if(v==='bancoscombo')  return await viewBancosCombo(c);
    if(v==='cumplimientocombo') return await viewCumplimientoCombo(c);
    if(v==='previsioncombo') return await viewPrevisionCombo(c);
    if(v==='empresascombo') return await viewEmpresasCombo(c);
    if(v==='gastoscombo')  return await viewGastosCombo(c);
    if(v==='nom035')       return await viewNom035(c);
    if(v==='nom035cuest')  return await viewNom035Cuest(c);
    if(v==='biblioplantillas') return await viewBiblioteca(c,'plantillas_contratos','Plantillas de contratos');
    if(v==='bibliopresenta') return await viewBiblioteca(c,'presentaciones','Presentaciones');
    if(v==='biblioorg')    return await viewBiblioteca(c,'organigrama','Organigrama y matrices');
    if(v==='catalogogastos') return await viewCatalogoGastos(c);
    if(v==='busqueda') return await viewBusqueda(c, window.__gterm||'');
    if(v==='facturacion')  return await viewFacturacion(c);
    if(v==='materialidad') return await viewMaterialidad(c);
    if(v==='cxp')          return await viewCxP(c);
    if(v==='bitacorafirmas') return await viewBitacoraFirmas(c);
    if(v==='kyc')          return await viewKyc(c);
    if(v==='calfiscal')    return await viewCalFiscal(c);
    if(v==='importador')   return await viewImportador(c);
    if(v==='solicitudpdf') return await viewSolicitudPdf(c);
    if(v==='entregables')  return await viewEntregables(c);
    if(v==='contraloria')  return await viewContraloria(c);
    if(v==='calrepse')     return await viewCalRepse(c);
    if(v==='checklistdocs') return await viewChecklistDocs(c);
    if(v==='reportes')     return await viewReportes(c);
    if(v==='costeo')       return await viewCosteo(c);
    if(v==='padrones')     return await viewPadrones(c);
    if(v==='licitaciones') return await viewLicitaciones(c);
    if(v==='sucursalesv')  return await viewSucursales(c);
    if(v==='efirmasv')     return await viewEfirmas(c);
    if(v==='documentales') return await viewDocumentales(c);
    if(v==='organigramafn') return await viewOrganigrama(c);
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
function sem(n, mode){ n=Number(n)||0; if(mode==='alert'){ return n>0?'var(--danger)':'var(--ok)'; } if(mode==='pct'){ return n>=80?'var(--ok)':(n>=50?'var(--wait)':'var(--danger)'); } return 'var(--navy)'; }

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
  const NL2 = String.fromCharCode(10);
  const g = id => document.getElementById(id);
  const primaDef = {I:0.54355, II:1.13065, III:2.59840, IV:4.65325, V:7.58875};
  const claseList = ['I','II','III','IV','V'];
  const ISR2026 = [
    [0.01,0,1.92],
    [746.05,14.32,6.40],
    [6332.06,371.83,10.88],
    [11128.02,893.63,16.00],
    [12935.83,1182.88,17.92],
    [15487.72,1639.32,21.36],
    [31236.50,4005.46,23.52],
    [49233.01,8237.45,30.00],
    [93993.91,21665.72,32.00],
    [125325.21,31691.85,34.00],
    [375975.62,116912.87,35.00]
  ];
  function isrMensual(base){
    if(!(base>0)) return 0;
    let br = ISR2026[0];
    for(let i=0;i<ISR2026.length;i++){ if(base>=ISR2026[i][0]) br = ISR2026[i]; }
    return br[1] + (base - br[0])*br[2]/100;
  }
  const jorList = ['Diurna','Mixta','Nocturna'];
  const perList = ['Diaria','Semanal','Decenal','Catorcenal','Quincenal','28 días','Mensual'];
  const estados = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Estado de México','Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'];

  function blank(){
    return {puesto:'', descripcion:'', clase:'I', prima:String(primaDef.I), jornada:'Diurna', periodicidad:'Mensual', salario:'', num:'1'};
  }
  function canon(val, list, def){
    const v = String(val==null?'':val).trim();
    for(let i=0;i<list.length;i++){ if(list[i].toLowerCase()===v.toLowerCase()) return list[i]; }
    return def;
  }
  if(!Array.isArray(window.__cocRows) || window.__cocRows.length===0){
    window.__cocRows = [blank()];
  }

  const params = [
    ['r_uma','UMA diaria',113.14],
    ['r_sm_general','Salario mínimo general diario 2026',315.04],
    ['r_sm_frontera','Salario mínimo ZLFN diario 2026',440.87],
    ['r_ceav','% Cesantía y Vejez patronal',3.15],
    ['r_retiro','Retiro/SAR %',2],
    ['r_infonavit','Infonavit %',5],
    ['r_eymfija','IMSS EyM cuota fija %UMA',20.40],
    ['r_eymexc','EyM excedente >3UMA %',1.10],
    ['r_eympd','EyM prestaciones dinero %',0.70],
    ['r_eymgmp','EyM gastos médicos pensionados %',1.05],
    ['r_iv','Invalidez y vida %',1.75],
    ['r_guard','Guarderías %',1.00],
    ['r_isn','ISN %',3.00],
    ['r_aguinaldo','Aguinaldo días',15],
    ['r_vac','Vacaciones días',12],
    ['r_primavac','Prima vacacional %',25],
    ['r_honorario','% Honorario despacho',8],
    ['r_iva','IVA %',16]
  ];

  const estOpts = estados.map(e=>'<option>'+esc(e)+'</option>').join('');
  const parHtml = params.map(p=>'<label>'+esc(p[1])+'<input id="'+p[0]+'" type="number" step="0.01" value="'+p[2]+'"></label>').join('');

  c.innerHTML =
    '<h1 class="pg">Cotizador de nómina</h1>'+
    '<div class="pgsub">Cotizador interactivo multi-puesto con importación de Excel/CSV y propuesta en PDF.</div>'+
    '<div class="card"><h3>Datos del cliente</h3><div class="body"><div class="frm">'+
      '<label>Cliente / razón social<input id="coc_cliente" style="min-width:240px"></label>'+
      '<label>Registro patronal<input id="coc_rp"></label>'+
      '<label>Estado (ISN)<select id="coc_estado" style="min-width:180px">'+estOpts+'</select></label>'+
      '<label>Promotor<input id="coc_prom"></label>'+
      '<label>Actividad principal (ref. REPSE)<input id="coc_actividad" placeholder="Ej. Comercio al por mayor…" style="min-width:240px"></label>'+
      '<label>Zona salario mínimo<select id="coc_zona" style="min-width:200px"><option value="general">General</option><option value="frontera">Zona Libre Frontera Norte</option></select></label>'+
      '<label>Clase de riesgo del patrón (Art. 73 LSS)<select id="coc_clase_patron" style="min-width:150px">'+claseList.map(function(k){ return '<option value="'+k+'"'+(k==='III'?' selected':'')+'>'+k+' — '+primaDef[k].toFixed(5)+'%</option>'; }).join('')+'</select></label>'+
      '<label>Prima de riesgo del patrón (%)<input id="coc_prima_patron" type="number" step="0.00001" value="2.59840"></label>'+
      '<label>Tipo de contrato con los trabajadores<select id="coc_tipocontrato" style="min-width:220px"><option>Por tiempo determinado</option><option>Por tiempo indeterminado</option><option>Por obra o tiempo determinado</option><option>Servicios especializados (REPSE)</option></select></label>'+
      '<label>Periodicidad de pago<select id="coc_periodicidad" style="min-width:160px">'+perList.map(k=>'<option>'+esc(k)+'</option>').join('')+'</select></label>'+
      '<label>Honorario por empleado (MXN)<input id="coc_honorario_emp" type="number" step="0.01" value="180"></label>'+
      '<label style="flex-direction:row;align-items:center;gap:6px"><input id="coc_provisiones" type="checkbox" style="width:auto">Incluir provisiones prorrateadas (aguinaldo, prima vacacional, finiquito)</label>'+
    '</div></div></div>'+
    '<div class="card"><h3>Puestos a cotizar</h3><div class="body">'+
      '<div style="overflow-x:auto"><table id="coc_tbl"><thead><tr>'+
        '<th>Puesto</th><th>Descripción de funciones</th><th>Clase</th><th class="num-r">Prima %</th>'+
        '<th>Jornada</th><th>Periodicidad</th><th class="num-r">Salario mensual</th><th class="num-r">Nº trab.</th><th></th>'+
      '</tr></thead><tbody id="coc_body"></tbody></table></div>'+
      '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">'+
        '<button class="btn2 ghost" id="coc_add">➕ Agregar puesto/trabajador</button>'+
        '<button class="btn2 ghost" id="coc_tpl">⬇ Descargar plantilla</button>'+
        '<button class="btn2 ghost" id="coc_imp">📄 Importar Excel/CSV</button>'+
        '<input type="file" id="coc_file" accept=".xlsx,.xls,.csv" style="display:none">'+
        '<span id="coc_impmsg" style="align-self:center;font-size:12px"></span>'+
      '</div></div></div>'+
    '<div class="card"><h3 id="coc_partog" style="cursor:pointer">Tasas y parámetros (editables) ▾</h3>'+
      '<div class="body" id="coc_parbody"><div class="frm">'+parHtml+'</div>'+
      '<div style="font-size:12px;color:var(--muted);margin-top:6px">Tasas estándar 2026 — verifíquelas/ajústelas. Se afinará con su COT-PRM-002.</div>'+
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">Referencia CONASAMI 2026 — no se puede pagar por debajo del mínimo general ni del mínimo profesional aplicable.</div>'+
      '</div></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" class="no-print">'+
      '<button class="btn2" id="coc_calc">Calcular</button>'+
      '<button class="btn2 ghost" id="coc_pdf">📄 Generar propuesta (PDF)</button>'+
      '<button class="btn2 ghost" id="coc_save">Guardar cotización</button>'+
      '<span id="coc_msg" style="align-self:center;font-size:12px"></span>'+
    '</div>'+
    '<div id="coc_desglose"></div>';

  function rowHtml(r, idx){
    const claseOpts = claseList.map(k=>'<option value="'+k+'"'+(r.clase===k?' selected':'')+'>'+k+' — '+primaDef[k].toFixed(5)+'%</option>').join('');
    const jorOpts = jorList.map(k=>'<option'+(r.jornada===k?' selected':'')+'>'+esc(k)+'</option>').join('');
    const perOpts = perList.map(k=>'<option'+(r.periodicidad===k?' selected':'')+'>'+esc(k)+'</option>').join('');
    return '<tr>'+
      '<td><input class="ci_puesto" value="'+esc(r.puesto)+'" style="min-width:130px"></td>'+
      '<td><input class="ci_desc" value="'+esc(r.descripcion)+'" style="min-width:160px"></td>'+
      '<td><select class="ci_clase">'+claseOpts+'</select></td>'+
      '<td><input class="ci_prima num-r" type="number" step="0.00001" value="'+esc(r.prima)+'" style="width:100px"></td>'+
      '<td><select class="ci_jornada">'+jorOpts+'</select></td>'+
      '<td><select class="ci_per">'+perOpts+'</select></td>'+
      '<td><input class="ci_sal" type="number" step="0.01" value="'+esc(r.salario)+'" style="width:120px"></td>'+
      '<td><input class="ci_num" type="number" step="1" value="'+esc(r.num)+'" style="width:70px"></td>'+
      '<td><button class="mini ci_del" data-idx="'+idx+'" title="Quitar" style="background:var(--danger)">🗑</button></td>'+
    '</tr>';
  }
  function syncRows(){
    const tb = g('coc_body');
    if(!tb) return;
    const trs = tb.getElementsByTagName('tr');
    const arr = [];
    for(let i=0;i<trs.length;i++){
      const tr = trs[i];
      const q = cl => { const e = tr.getElementsByClassName(cl)[0]; return e ? e.value : ''; };
      arr.push({
        puesto:q('ci_puesto'), descripcion:q('ci_desc'), clase:q('ci_clase'),
        prima:q('ci_prima'), jornada:q('ci_jornada'), periodicidad:q('ci_per'),
        salario:q('ci_sal'), num:q('ci_num')
      });
    }
    window.__cocRows = arr;
  }
  function renderRows(){
    const tb = g('coc_body');
    tb.innerHTML = window.__cocRows.map((r,i)=>rowHtml(r,i)).join('');
    const dels = tb.getElementsByClassName('ci_del');
    for(let i=0;i<dels.length;i++){
      dels[i].onclick = function(){
        syncRows();
        const idx = Number(this.getAttribute('data-idx'));
        window.__cocRows.splice(idx,1);
        if(window.__cocRows.length===0) window.__cocRows=[blank()];
        renderRows();
      };
    }
    const cls = tb.getElementsByClassName('ci_clase');
    for(let i=0;i<cls.length;i++){
      cls[i].onchange = function(){
        const tr = this.closest('tr');
        const p = tr.getElementsByClassName('ci_prima')[0];
        if(p && primaDef[this.value]!=null) p.value = primaDef[this.value].toFixed(5);
      };
    }
  }
  renderRows();

  g('coc_clase_patron').onchange = function(){
    const p = g('coc_prima_patron');
    if(p && primaDef[this.value]!=null) p.value = primaDef[this.value].toFixed(5);
  };

  g('coc_partog').onclick = function(){
    const b = g('coc_parbody');
    const hidden = b.style.display==='none';
    b.style.display = hidden ? '' : 'none';
    this.textContent = 'Tasas y parámetros (editables) ' + (hidden ? '▾' : '▸');
  };

  g('coc_add').onclick = function(){ syncRows(); window.__cocRows.push(blank()); renderRows(); };

  g('coc_tpl').onclick = function(){
    const header = ['puesto','descripcion','clase_riesgo','prima','jornada','periodicidad','salario_mensual','num_trabajadores'].join(',');
    const ejemplo = ['Auxiliar administrativo','Apoyo general de oficina','I','0.54355','Diurna','Mensual','12000','1'].join(',');
    const csv = header + NL2 + ejemplo + NL2;
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'plantilla_cotizador_nomina.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  g('coc_imp').onclick = function(){ g('coc_file').click(); };
  g('coc_file').onchange = function(ev){
    const impmsg = g('coc_impmsg');
    const f = ev.target.files && ev.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try{
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, {type:'array'});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, {defval:''});
        if(!json.length){ impmsg.style.color='var(--danger)'; impmsg.textContent='El archivo no tiene filas.'; g('coc_file').value=''; return; }
        const rows = json.map(function(o){
          const low = {};
          Object.keys(o).forEach(function(k){ low[String(k).trim().toLowerCase()] = o[k]; });
          const pick = function(){ for(let i=0;i<arguments.length;i++){ const kk=arguments[i]; if(low[kk]!=null && String(low[kk]).trim()!=='') return low[kk]; } return ''; };
          const clase = canon(pick('clase_riesgo','clase','clase de riesgo'), claseList, 'I');
          let prima = pick('prima','prima_riesgo','prima de riesgo');
          if(prima==='' || prima==null){ prima = primaDef[clase]!=null ? primaDef[clase] : ''; }
          return {
            puesto: String(pick('puesto','puestos')||''),
            descripcion: String(pick('descripcion','descripción','descripcion de funciones','funciones')||''),
            clase: clase,
            prima: String(prima),
            jornada: canon(pick('jornada'), jorList, 'Diurna'),
            periodicidad: canon(pick('periodicidad','periodo'), perList, 'Mensual'),
            salario: String(pick('salario_mensual','salario','salario mensual','sueldo')||''),
            num: String(pick('num_trabajadores','no_trabajadores','trabajadores','num','n')||'1')
          };
        });
        window.__cocRows = rows;
        renderRows();
        impmsg.style.color='var(--ok)'; impmsg.textContent='Importados '+rows.length+' registros.';
      }catch(err){
        impmsg.style.color='var(--danger)'; impmsg.textContent='No se pudo leer el archivo. Verifique el formato.';
      }
      g('coc_file').value='';
    };
    reader.readAsArrayBuffer(f);
  };

  function num(id){ const v = parseFloat(g(id).value); return isNaN(v) ? 0 : v; }
  function calc(){
    syncRows();
    const UMA = num('r_uma');
    const ceav = num('r_ceav'), retiro = num('r_retiro'), infonavit = num('r_infonavit');
    const eymfija = num('r_eymfija'), eymexc = num('r_eymexc'), eympd = num('r_eympd'), eymgmp = num('r_eymgmp');
    const rIv = num('r_iv'), rGuard = num('r_guard'), rIsn = num('r_isn');
    const agu = num('r_aguinaldo'), vac = num('r_vac'), primavac = num('r_primavac');
    const rHonorario = num('r_honorario'), rIva = num('r_iva');
    const d304 = 30.4;
    const zona = (g('coc_zona') && g('coc_zona').value)==='frontera' ? 'Zona Libre Frontera Norte' : 'General';
    const smAplicable = zona==='General' ? num('r_sm_general') : num('r_sm_frontera');
    const det = [];
    const warnings = [];
    let subtotal = 0, cuotaTot = 0, isnTot = 0, numTot = 0;
    window.__cocRows.forEach(function(r){
      const salMen = parseFloat(r.salario) || 0;
      const nTrab = parseInt(r.num,10) || 0;
      const prima = parseFloat(r.prima) || 0;
      const salDia = salMen/30;
      const FI = 1 + (agu/365) + ((primavac/100)*(vac/365));
      let SBC = salDia*FI;
      const SDI = SBC;
      const cap = 25*UMA;
      if(SBC>cap) SBC = cap;
      const eymFijaC = (eymfija/100)*UMA*d304;
      const eymExcC = SBC>3*UMA ? (eymexc/100)*(SBC-3*UMA)*d304 : 0;
      const pdC = (eympd/100)*SBC*d304;
      const gmpC = (eymgmp/100)*SBC*d304;
      const ivC = (rIv/100)*SBC*d304;
      const guardC = (rGuard/100)*SBC*d304;
      const riesgoC = (prima/100)*SBC*d304;
      const retiroC = (retiro/100)*SBC*d304;
      const ceavC = (ceav/100)*SBC*d304;
      const infC = (infonavit/100)*SBC*d304;
      const cuotaUno = eymFijaC+eymExcC+pdC+gmpC+ivC+guardC+riesgoC+retiroC+ceavC+infC;
      const isnUno = (rIsn/100)*salMen;
      const costoUno = salMen + cuotaUno + isnUno;
      const costoPuesto = costoUno*nTrab;
      subtotal += costoPuesto;
      cuotaTot += cuotaUno*nTrab;
      isnTot += isnUno*nTrab;
      numTot += nTrab;
      const isrUno = isrMensual(salMen);
      const belowMin = salMen>0 && smAplicable>0 && salDia < smAplicable;
      if(belowMin){
        warnings.push('⚠ Puesto '+(r.puesto||'—')+': salario diario '+mny(salDia)+' por debajo del mínimo CONASAMI aplicable ('+mny(smAplicable)+'). Ajustar — no se puede pagar por debajo del mínimo.');
      }
      det.push({puesto:r.puesto, num:nTrab, salario:salMen, sdi:SDI, cuota:cuotaUno*nTrab, isn:isnUno*nTrab, costo:costoPuesto, isr:isrUno, neto:salMen-isrUno, belowMin:belowMin});
    });
    const honorario = (rHonorario/100)*subtotal;
    const base = subtotal + honorario;
    const iva = (rIva/100)*base;
    const total = base + iva;
    window.__cocResult = {det:det, subtotal:subtotal, honorario:honorario, iva:iva, total:total, numTot:numTot, cuotaTot:cuotaTot, isnTot:isnTot, zona:zona, smAplicable:smAplicable, warnings:warnings};
    renderDesglose();
  }

  function sline(l,v){ return '<div style="display:flex;justify-content:space-between;padding:5px 0">'+esc(l)+'<b>'+mny(v)+'</b></div>'; }
  function desgloseTablaHtml(R){
    const body = R.det.map(function(d){
      const rowStyle = d.belowMin ? ' style="background:rgba(220,53,69,.14);color:var(--danger)"' : '';
      return '<tr'+rowStyle+'><td>'+esc(d.puesto||'—')+'</td><td class="num-r">'+d.num+'</td>'+
        '<td class="num-r">'+mny(d.salario)+'</td><td class="num-r">'+mny(d.sdi)+'</td>'+
        '<td class="num-r">'+mny(d.cuota)+'</td><td class="num-r">'+mny(d.isn)+'</td>'+
        '<td class="num-r">'+mny(d.costo)+'</td>'+
        '<td class="num-r">'+mny(d.isr||0)+'</td><td class="num-r">'+mny(d.neto!=null?d.neto:d.salario)+'</td></tr>';
    }).join('');
    const totRow = '<tr style="font-weight:700;background:var(--cream)"><td>Totales</td><td class="num-r">'+R.numTot+'</td>'+
      '<td></td><td></td><td class="num-r">'+mny(R.cuotaTot)+'</td><td class="num-r">'+mny(R.isnTot)+'</td><td class="num-r">'+mny(R.subtotal)+'</td><td></td><td></td></tr>';
    return '<div style="overflow-x:auto"><table><thead><tr>'+
      '<th>Puesto</th><th class="num-r">Nº</th><th class="num-r">Salario</th><th class="num-r">SDI</th>'+
      '<th class="num-r">Cuota IMSS+Inf</th><th class="num-r">ISN</th><th class="num-r">Costo mensual</th>'+
      '<th class="num-r">ISR retención (mensual)</th><th class="num-r">Neto aprox. trabajador</th>'+
      '</tr></thead><tbody>'+body+totRow+'</tbody></table></div>'+
      '<div style="font-size:11px;color:var(--muted);margin-top:6px">ISR conforme a tarifa mensual Art. 96 LISR vigente 2026 (Anexo 8 RMF). Retención del trabajador — referencia informativa; el costo patronal no incluye ISR del trabajador.</div>';
  }
  function warningsHtml(R){
    if(!R || !R.warnings || !R.warnings.length) return '';
    return R.warnings.map(function(w){
      return '<div style="background:rgba(220,53,69,.12);border:1px solid var(--danger);color:var(--danger);border-radius:8px;padding:10px 12px;margin:8px 0;font-weight:700">'+esc(w)+'</div>';
    }).join('');
  }
  function renderDesglose(){
    const R = window.__cocResult;
    const out = g('coc_desglose');
    if(!R){ out.innerHTML=''; return; }
    out.innerHTML =
      warningsHtml(R)+
      '<div class="card"><h3>Desglose</h3><div class="body">'+
        '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">Zona salario mínimo: '+esc(R.zona||'General')+' — mínimo diario aplicable '+mny(R.smAplicable||0)+'</div>'+
        desgloseTablaHtml(R)+'</div></div>'+
      '<div class="card"><h3>Resumen</h3><div class="body">'+
        sline('Subtotal costo', R.subtotal)+
        sline('Honorario despacho', R.honorario)+
        sline('IVA', R.iva)+
        '<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid var(--navy);font-weight:800;font-size:22px;margin-top:6px">Total mensual<span style="color:var(--gold)">'+mny(R.total)+'</span></div>'+
      '</div></div>';
  }

  g('coc_calc').onclick = calc;

  g('coc_pdf').onclick = async function(){
    calc();
    const R = window.__cocResult;
    const cliente = (g('coc_cliente') && g('coc_cliente').value) || '';
    const rp = (g('coc_rp') && g('coc_rp').value) || '';
    const estado = (g('coc_estado') && g('coc_estado').value) || '';
    const prom = (g('coc_prom') && g('coc_prom').value) || '';
    const actividad = (g('coc_actividad') && g('coc_actividad').value) || '';
    const primaPatron = (g('coc_prima_patron') && g('coc_prima_patron').value) || '';
    const tipoContrato = (g('coc_tipocontrato') && g('coc_tipocontrato').value) || '';
    const periodicidad = (g('coc_periodicidad') && g('coc_periodicidad').value) || '';
    const zonaSel = (R && R.zona) || (((g('coc_zona') && g('coc_zona').value)==='frontera') ? 'Zona Libre Frontera Norte' : 'General');
    let n = 1;
    try{
      const res = await sb.from('solicitudes').select('id',{count:'exact',head:true}).eq('tipo','cotizacion');
      if(res && typeof res.count==='number') n = res.count + 1;
    }catch(e){}
    const folio = 'COT-PRM-' + String(n).padStart(4,'0');
    const fecha = new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'});
    c.innerHTML =
      '<div style="max-width:900px;margin:0 auto;padding:10px">'+
      '<div style="display:flex;gap:8px;margin-bottom:16px" class="no-print">'+
        '<button class="btn2" id="coc_print">🖨 Imprimir / Guardar PDF</button>'+
        '<button class="btn2 ghost" id="coc_volver">← Volver</button>'+
      '</div>'+
      '<div style="border-bottom:3px solid var(--navy);padding-bottom:12px;margin-bottom:18px">'+
        '<div style="font-size:22px;font-weight:800;color:var(--navy)">PR&amp;M Business Group</div>'+
        '<div style="font-size:14px;color:var(--gold);font-weight:700">Cotización de nómina</div>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;font-size:13px">'+
        '<div><b>Folio:</b> '+esc(folio)+'<br><b>Fecha:</b> '+esc(fecha)+'</div>'+
        '<div><b>Cliente:</b> '+esc(cliente||'—')+'<br><b>Registro patronal:</b> '+esc(rp||'—')+'<br><b>Estado:</b> '+esc(estado||'—')+'<br><b>Promotor:</b> '+esc(prom||'—')+'</div>'+
        '<div><b>Actividad principal:</b> '+esc(actividad||'—')+'<br><b>Prima de riesgo del patrón:</b> '+esc(primaPatron?primaPatron+' %':'—')+'<br><b>Tipo de contrato:</b> '+esc(tipoContrato||'—')+'<br><b>Periodicidad de pago:</b> '+esc(periodicidad||'—')+'<br><b>Zona salario mínimo:</b> '+esc(zonaSel)+'</div>'+
      '</div>'+
      warningsHtml(R)+
      '<div style="font-weight:700;color:var(--navy);margin-bottom:8px">Desglose de puestos</div>'+
      desgloseTablaHtml(R)+
      '<div style="max-width:360px;margin-left:auto;margin-top:18px">'+
        sline('Subtotal costo', R.subtotal)+
        sline('Honorario despacho', R.honorario)+
        sline('IVA', R.iva)+
        '<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid var(--navy);font-weight:800;font-size:20px">Total mensual<span style="color:var(--gold)">'+mny(R.total)+'</span></div>'+
      '</div>'+
      '<div style="margin-top:26px;font-size:11px;color:var(--muted);border-top:1px solid var(--line);padding-top:10px">Tasas estándar 2026 sujetas a verificación. Documento generado por PRM 360.</div>'+
      '</div>';
    g('coc_print').onclick = function(){ window.print(); };
    g('coc_volver').onclick = function(){ viewCotizador(c); };
  };

  g('coc_save').onclick = async function(){
    const msg = g('coc_msg');
    if(!window.__cocResult) calc();
    const R = window.__cocResult;
    const cliente = (g('coc_cliente') && g('coc_cliente').value) || 'Cliente';
    const desc = cliente + ' - Total mensual ' + mny(R.total);
    msg.style.color='var(--muted)'; msg.textContent='Guardando…';
    g('coc_save').disabled = true;
    let ok = false, lastErr = null;
    const intentos = [{tipo:'cotizacion', descripcion:desc}, {descripcion:desc}];
    for(let i=0;i<intentos.length;i++){
      try{
        const {error} = await sb.from('solicitudes').insert(intentos[i]);
        if(!error){ ok = true; break; }
        lastErr = error;
      }catch(e){ lastErr = e; }
    }
    g('coc_save').disabled = false;
    if(ok){ msg.style.color='var(--ok)'; msg.textContent='✓ Cotización guardada.'; }
    else { msg.style.color='var(--danger)'; msg.textContent='No se pudo guardar'+(lastErr&&lastErr.message?(': '+lastErr.message):'.'); }
  };
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

/* ===== Módulos en vivo (lectura de tablas Supabase) ===== */
const mny = n => n==null ? '—' : '$'+Number(n).toLocaleString('es-MX',{maximumFractionDigits:0});

async function viewClientesFiscal(c){
  const {data,error}=await sb.from('clientes_fiscal').select('razon_social,rfc,grupo,alias,fecha_ingreso').order('razon_social').limit(300);
  if(error) throw error;
  const rows=data||[];
  const draw=list=>list.map(x=>`<tr><td>${esc(x.razon_social||'')}</td><td>${esc(x.rfc||'')}</td><td>${esc(x.grupo||'')}</td><td>${esc(x.fecha_ingreso||'')}</td></tr>`).join('')||'<tr><td colspan=4 class="empty">Sin clientes</td></tr>';
  c.innerHTML='<h1 class="pg">Clientes (fiscal)</h1><div class="pgsub">'+rows.length+' registros (máx 300)</div>'+
    '<div class="card"><div class="body"><input id="cf_q" class="mini" placeholder="Buscar por razón social…" style="min-width:260px"></div>'+
    '<table><thead><tr><th>Razón social</th><th>RFC</th><th>Grupo</th><th>Ingreso</th></tr></thead><tbody id="cf_tb">'+draw(rows)+'</tbody></table></div>';
  const q=document.getElementById('cf_q'), tb=document.getElementById('cf_tb');
  q.onkeyup=()=>{ const t=q.value.trim().toLowerCase(); tb.innerHTML=draw(rows.filter(x=>((x.razon_social||'')+' '+(x.rfc||'')+' '+(x.alias||'')).toLowerCase().indexOf(t)>-1)); };
}

async function viewContratos(c){
  const {data,error}=await sb.from('contratos').select('folio,tipo,estatus,titulo,firmado_en,fecha_cierta').order('creado_en',{ascending:false}).limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>{
    const cls=x.estatus==='firmado'?'on':(x.estatus==='borrador'?'off':'');
    return `<tr><td>${esc(x.folio||'')}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.titulo||'')}</td><td><span class="tag ${cls}">${esc(x.estatus||'')}</span></td><td>${esc(x.firmado_en||'')}</td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Contratos</h1><div class="pgsub">'+(data?data.length:0)+' contratos</div>'+
    '<div class="card"><table><thead><tr><th>Folio</th><th>Tipo</th><th>Título</th><th>Estatus</th><th>Firmado</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=5 class="empty">Sin contratos</td></tr>')+'</tbody></table></div>';
}

async function viewJuicios(c){
  const {data,error}=await sb.from('juicios').select('contribuyente,materia,ejercicio,monto,autoridad,expediente,etapa,estatus,proximo_plazo').order('proximo_plazo',{ascending:true,nullsFirst:false});
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.contribuyente||'')}</td><td>${esc(x.materia||'')}</td><td>${esc(String(x.ejercicio==null?'':x.ejercicio))}</td><td class="num-r">${mny(x.monto)}</td><td>${esc(x.autoridad||'')}</td><td>${esc(x.etapa||'')}</td><td>${esc(x.proximo_plazo||'')}</td><td><span class="tag">${esc(x.estatus||'')}</span></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Juicios / defensa fiscal</h1><div class="pgsub">'+(data?data.length:0)+' asuntos</div>'+
    '<div class="card"><table><thead><tr><th>Contribuyente</th><th>Materia</th><th>Ejercicio</th><th class="num-r">Monto</th><th>Autoridad</th><th>Etapa</th><th>Próximo plazo</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=8 class="empty">Sin juicios</td></tr>')+'</tbody></table></div>';
}

async function viewRenovaciones(c){
  const today=new Date().toISOString().slice(0,10);
  const {data,error}=await sb.from('renovaciones').select('empresa,tipo_autorizacion,entidad,registro_folio,vigencia,estatus').order('vigencia',{ascending:true,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>{
    const venc=x.vigencia&&x.vigencia<today;
    const vig=x.vigencia?`<span class="tag ${venc?'off':'on'}">${esc(x.vigencia)}</span>`:'—';
    return `<tr><td>${esc(x.empresa||'')}</td><td>${esc(x.tipo_autorizacion||'')}</td><td>${esc(x.entidad||'')}</td><td>${esc(x.registro_folio||'')}</td><td>${vig}</td><td>${esc(x.estatus||'')}</td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Renovaciones</h1><div class="pgsub">'+(data?data.length:0)+' autorizaciones</div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Autorización</th><th>Entidad</th><th>Folio</th><th>Vigencia</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin renovaciones</td></tr>')+'</tbody></table></div>';
}

async function viewPrevisionSocial(c){
  const {data,error}=await sb.from('prevision_social').select('empresa_rfc,vigencia,ultima_actualizacion,estatus,notas').order('ultima_actualizacion',{ascending:false,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.empresa_rfc||'')}</td><td>${esc(x.vigencia||'')}</td><td>${esc(x.ultima_actualizacion||'')}</td><td><span class="tag">${esc(x.estatus||'')}</span></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Plan de previsión social</h1><div class="pgsub">'+(data?data.length:0)+' empresas</div>'+
    '<div class="card"><table><thead><tr><th>Empresa (RFC)</th><th>Vigencia</th><th>Últ. actualización</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin registros</td></tr>')+'</tbody></table></div>';
}

async function viewAdhesiones(c){
  const {data,error}=await sb.from('prevision_adhesiones').select('trabajador_nombre,empresa_rfc,firmada,fecha_firma').order('fecha_firma',{ascending:false,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.trabajador_nombre||'')}</td><td>${esc(x.empresa_rfc||'')}</td><td><span class="tag ${x.firmada?'on':'off'}">${x.firmada?'Sí':'No'}</span></td><td>${esc(x.fecha_firma||'')}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Adhesiones (previsión social)</h1><div class="pgsub">'+(data?data.length:0)+' adhesiones</div>'+
    '<div class="card"><table><thead><tr><th>Trabajador</th><th>Empresa (RFC)</th><th>Firmada</th><th>Fecha firma</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin adhesiones registradas</td></tr>')+'</tbody></table></div>';
}

async function viewMovBancarios(c){
  const cols='fecha,banco,empresa,cuenta,concepto,cargo,abono,saldo,contraparte';
  const draw=list=>(list||[]).map(x=>`<tr><td>${esc(x.fecha||'')}</td><td>${esc(x.banco||'')}</td><td>${esc(x.empresa||'')}</td><td>${esc(x.concepto||'')}</td><td class="num-r" style="color:var(--danger)">${x.cargo?mny(x.cargo):'—'}</td><td class="num-r" style="color:var(--ok)">${x.abono?mny(x.abono):'—'}</td><td class="num-r">${mny(x.saldo)}</td></tr>`).join('')||'<tr><td colspan=7 class="empty">Sin movimientos</td></tr>';
  const {data,error}=await sb.from('movimientos_bancarios').select(cols).order('fecha',{ascending:false}).limit(300);
  if(error) throw error;
  c.innerHTML='<h1 class="pg">Movimientos bancarios</h1><div class="pgsub">'+(data?data.length:0)+' movimientos (máx 300, usa el buscador)</div>'+
    '<div class="card"><div class="body"><input id="mb_q" class="mini" placeholder="Buscar por concepto o empresa…" style="min-width:280px"></div>'+
    '<table><thead><tr><th>Fecha</th><th>Banco</th><th>Empresa</th><th>Concepto</th><th class="num-r">Cargo</th><th class="num-r">Abono</th><th class="num-r">Saldo</th></tr></thead><tbody id="mb_tb">'+draw(data)+'</tbody></table></div>';
  const q=document.getElementById('mb_q'), tb=document.getElementById('mb_tb');
  q.onkeyup=async()=>{
    const t=q.value.trim();
    let r;
    if(!t){ ({data:r}=await sb.from('movimientos_bancarios').select(cols).order('fecha',{ascending:false}).limit(300)); }
    else { ({data:r}=await sb.from('movimientos_bancarios').select(cols).or('concepto.ilike.%'+t+'%,empresa.ilike.%'+t+'%').order('fecha',{ascending:false}).limit(300)); }
    tb.innerHTML=draw(r);
  };
}

async function viewCuentas(c){
  const {data,error}=await sb.from('tesoreria_cuentas').select('clave,nombre,tipo,banco,moneda,activa').order('nombre').limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.clave||'')}</td><td>${esc(x.nombre||'')}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.banco||'')}</td><td>${esc(x.moneda||'')}</td><td><span class="tag ${x.activa?'on':'off'}">${x.activa?'Activa':'Inactiva'}</span></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Cuentas (tesorería)</h1><div class="pgsub">'+(data?data.length:0)+' cuentas</div>'+
    '<div class="card"><table><thead><tr><th>Clave</th><th>Nombre</th><th>Tipo</th><th>Banco</th><th>Moneda</th><th>Activa</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin cuentas</td></tr>')+'</tbody></table></div>';
}

async function viewPagos(c){
  const {data,error}=await sb.from('pagos').select('monto,fecha,referencia,registrado_por').order('fecha',{ascending:false,nullsFirst:false}).limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.fecha||'')}</td><td class="num-r">${mny(x.monto)}</td><td>${esc(x.referencia||'')}</td><td>${esc(x.registrado_por||'')}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Pagos</h1><div class="pgsub">'+(data?data.length:0)+' pagos</div>'+
    '<div class="card"><table><thead><tr><th>Fecha</th><th class="num-r">Monto</th><th>Referencia</th><th>Registró</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin pagos registrados</td></tr>')+'</tbody></table></div>';
}

async function viewFlujo(c){
  const {data,error}=await sb.from('movimientos_bancarios').select('fecha,abono,cargo,saldo,empresa').order('fecha',{ascending:false}).limit(1000);
  if(error) throw error;
  const rows=data||[];
  const abonos=rows.reduce((s,x)=>s+(Number(x.abono)||0),0);
  const cargos=rows.reduce((s,x)=>s+(Number(x.cargo)||0),0);
  const neto=abonos-cargos;
  const recientes=rows.slice(0,20).map(x=>`<tr><td>${esc(x.fecha||'')}</td><td>${esc(x.empresa||'')}</td><td class="num-r" style="color:var(--ok)">${x.abono?mny(x.abono):'—'}</td><td class="num-r" style="color:var(--danger)">${x.cargo?mny(x.cargo):'—'}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Flujo de efectivo</h1><div class="pgsub">Con base en los '+rows.length+' movimientos más recientes (máx 1000)</div>'+
    '<div class="kpis">'+tile(mny(abonos),'Ingresos','var(--ok)')+tile(mny(cargos),'Egresos','var(--danger)')+tile(mny(neto),'Neto','var(--navy)')+'</div>'+
    '<div class="card"><h3>Movimientos recientes</h3><table><thead><tr><th>Fecha</th><th>Empresa</th><th class="num-r">Ingreso</th><th class="num-r">Egreso</th></tr></thead><tbody>'+
    (recientes||'<tr><td colspan=4 class="empty">Sin movimientos</td></tr>')+'</tbody></table></div>';
}

async function viewSustancia(c){
  const {data,error}=await sb.from('compliance_empresa').select('empresa_rfc,aplica,cumplido,fecha_limite,notas').eq('aplica',true).order('fecha_limite',{ascending:true,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=data||[];
  const ok=rows.filter(x=>x.cumplido).length, pend=rows.length-ok;
  const body=rows.map(x=>`<tr><td>${esc(x.empresa_rfc||'')}</td><td><span class="tag ${x.cumplido?'on':'off'}">${x.cumplido?'Sí':'No'}</span></td><td>${esc(x.fecha_limite||'')}</td><td>${esc(x.notas||'')}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Sustancia / cumplimiento</h1><div class="pgsub">'+ok+' cumplidas · '+pend+' pendientes ('+rows.length+' obligaciones)</div>'+
    '<div class="card"><table><thead><tr><th>Empresa (RFC)</th><th>Cumplido</th><th>Fecha límite</th><th>Notas</th></tr></thead><tbody>'+
    (body||'<tr><td colspan=4 class="empty">Sin obligaciones</td></tr>')+'</tbody></table></div>';
}

async function viewBoletin(c){
  const {data,error}=await sb.from('boletines').select('asunto,contenido,destinatarios,estatus,enviado_en').order('enviado_en',{ascending:false,nullsFirst:false}).limit(100);
  if(error) throw error;
  const lista=data||[];
  const rows=lista.map(x=>{
    const cls=x.estatus==='enviado'?'on':'off';
    const fecha=x.enviado_en?String(x.enviado_en).slice(0,10):'—';
    return '<tr><td><b>'+esc(x.asunto||'')+'</b></td><td class="num-r">'+(x.destinatarios==null?'—':x.destinatarios)+'</td><td><span class="tag '+cls+'">'+esc(x.estatus||'')+'</span></td><td>'+esc(fecha)+'</td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">Boletín (PR&amp;M Perspectivas)</h1><div class="pgsub">'+lista.length+' boletines (máx 100) · redacta, registra y deja listo el texto para enviar</div>'+
    '<div class="card"><h3>Nuevo boletín</h3><div class="body">'+
      '<div class="frm"><label style="flex:1;min-width:260px">Asunto<input id="bn_asunto" style="width:100%"></label></div>'+
      '<div class="frm"><label style="flex:1;min-width:260px">Contenido<textarea id="bn_cont" rows="8" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px;font-family:inherit;resize:vertical"></textarea></label></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
        '<button class="btn2 ghost" id="bn_count">Contar destinatarios</button>'+
        '<button class="btn2" id="bn_draft">Guardar borrador</button>'+
        '<button class="btn2" id="bn_send">Marcar enviado</button>'+
        '<button class="btn2 ghost" id="bn_print">🖨 Vista para envío</button>'+
        '<span id="bn_msg" style="font-size:12px"></span></div>'+
      '<div style="font-size:12px;color:var(--muted);margin-top:8px">El envío se realiza desde tu correo (Outlook) — aquí queda el registro y el texto listo para copiar.</div>'+
    '</div></div>'+
    '<div class="card"><table><thead><tr><th>Asunto</th><th class="num-r">Destinatarios</th><th>Estatus</th><th>Fecha</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin boletines</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  let nDest=null;
  g('bn_count').onclick=async()=>{
    const msg=g('bn_msg');
    msg.textContent='Contando…'; msg.style.color='var(--muted)';
    const {count,error:e}=await sb.from('clientes').select('id',{count:'exact',head:true}).not('email','is',null);
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; return; }
    nDest=count||0;
    msg.textContent=nDest+' clientes con correo'; msg.style.color='var(--ok)';
  };
  const guardar=async(estatus)=>{
    const msg=g('bn_msg');
    const asunto=g('bn_asunto').value.trim();
    if(!asunto){ msg.textContent='El asunto es obligatorio.'; msg.style.color='var(--danger)'; return; }
    msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const payload={asunto:asunto, contenido:g('bn_cont').value.trim()||null, destinatarios:nDest, estatus:estatus};
    if(estatus==='enviado') payload.enviado_en=new Date().toISOString();
    const {error:e}=await sb.from('boletines').insert(payload);
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; return; }
    viewBoletin(c);
  };
  g('bn_draft').onclick=()=>guardar('borrador');
  g('bn_send').onclick=()=>guardar('enviado');
  g('bn_print').onclick=()=>{
    const asunto=g('bn_asunto').value.trim()||'(Sin asunto)';
    const cont=g('bn_cont').value;
    c.innerHTML=
      '<div class="no-print" style="margin-bottom:12px;display:flex;gap:8px">'+
        '<button class="btn2" id="bnp_print">🖨 Imprimir</button>'+
        '<button class="btn2 ghost" id="bnp_volver">← Volver</button></div>'+
      '<div style="text-align:center;margin-bottom:18px">'+
        '<div style="font-size:20px;font-weight:800;letter-spacing:1px;color:var(--navy)">PR&amp;M Business Group</div>'+
        '<div style="font-size:14px;margin-top:2px">PR&amp;M Perspectivas · Boletín</div>'+
        '<div style="font-size:12px;color:var(--muted);margin-top:2px">'+matHoy()+'</div></div>'+
      '<h2 style="font-size:16px;color:var(--navy);margin:0 0 12px">'+esc(asunto)+'</h2>'+
      '<div style="white-space:pre-wrap;font-size:13px;line-height:1.6">'+esc(cont)+'</div>';
    document.getElementById('bnp_print').onclick=()=>window.print();
    document.getElementById('bnp_volver').onclick=()=>viewBoletin(c);
  };
}

/* ===== Documentales públicas y privadas (Jurídico · Defensa Fiscal) ===== */
async function viewDocumentales(c){
  const {data,error}=await sb.from('documentales').select('id,folio,empresa,empresa_rfc,nivel,tipo_documental,naturaleza,materia,autoridad,expediente,fecha_emision,acredita,archivo_path,archivo_nombre').order('fecha_emision',{ascending:false,nullsFirst:false}).limit(300);
  if(error) throw error;
  const lista=data||[];
  const pub=lista.filter(x=>x.naturaleza==='publica').length;
  const priv=lista.filter(x=>x.naturaleza==='privada').length;
  const n1=lista.filter(x=>x.nivel==='Nivel 1').length;
  const MATERIAS=['Laboral','Administrativa','Fiscal','Civil','Mercantil','Penal'];
  c.innerHTML='<h1 class="pg">Documentales públicas y privadas</h1>'+
    '<div class="pgsub">Registro de documentales públicas y privadas — estructura de tu Base Madre (Defensa Fiscal). Cada documental indica qué acredita de la operación.</div>'+
    '<div class="kpis">'+
      tile(lista.length,'Total','var(--navy)')+
      tile(pub,'Públicas','var(--ok)')+
      tile(priv,'Privadas','var(--plum)')+
      tile(n1,'Nivel 1','var(--gold)')+
    '</div>'+
    '<div class="card no-print"><h3>Filtrar</h3><div class="body"><div class="frm" style="margin-bottom:0">'+
      '<label>Naturaleza<select id="doc_fnat"><option value="">Todas</option><option value="publica">Públicas</option><option value="privada">Privadas</option></select></label>'+
      '<label>Materia<select id="doc_fmat"><option value="">Todas</option>'+MATERIAS.map(m=>'<option>'+m+'</option>').join('')+'</select></label>'+
    '</div></div></div>'+
    '<div class="card"><h3>Registrar documental</h3><div class="body"><div class="frm">'+
      '<label>Empresa<input id="doc_emp" style="min-width:200px"></label>'+
      '<label>Nivel<select id="doc_nivel"><option>Nivel 1</option><option>Nivel 2</option><option>Nivel 3</option></select></label>'+
      '<label>Tipo documental<input id="doc_tipo" style="min-width:240px" placeholder="Demanda, contrato con ente público, acta, dictamen…"></label>'+
      '<label>Naturaleza<select id="doc_nat"><option value="publica">Pública</option><option value="privada">Privada</option></select></label>'+
      '<label>Materia<select id="doc_mat">'+MATERIAS.map(m=>'<option>'+m+'</option>').join('')+'</select></label>'+
      '<label>Autoridad<input id="doc_aut" style="min-width:170px"></label>'+
      '<label>Expediente<input id="doc_expd"></label>'+
      '<label>Fecha emisión<input id="doc_fecha" type="date"></label>'+
      '<label style="flex:1;min-width:280px">Descripción<input id="doc_desc" style="width:100%"></label>'+
      '<label style="flex:1;min-width:280px">¿Qué acredita de la operación?<input id="doc_acr" style="width:100%"></label>'+
      '<label>Contraparte<input id="doc_contra" style="min-width:170px"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="doc_save">Guardar</button> <span id="doc_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Folio</th><th>Empresa</th><th>Nivel</th><th>Tipo</th><th>Naturaleza</th><th>Materia</th><th>Autoridad</th><th>Expediente</th><th>Fecha</th><th>Acredita</th><th>📎</th></tr></thead><tbody id="doc_tbody"></tbody></table></div>';
  const g=id=>document.getElementById(id);
  const paint=()=>{
    const fn=g('doc_fnat').value, fm=g('doc_fmat').value;
    const vis=lista.filter(x=>(!fn||x.naturaleza===fn)&&(!fm||x.materia===fm));
    const rows=vis.map(x=>{
      const natCls=x.naturaleza==='publica'?'on':'repse';
      const acr=String(x.acredita||'');
      const acrTx=acr.length>40?acr.slice(0,40)+'…':acr;
      const archivo=x.archivo_path
        ? '<a href="#" class="doc-dl" data-path="'+esc(x.archivo_path)+'">📎 '+esc(x.archivo_nombre||'archivo')+'</a>'
        : '<input type="file" class="doc-file" data-id="'+x.id+'" style="font-size:11px;max-width:170px">';
      return '<tr><td><b>'+esc(x.folio||'')+'</b></td>'+
        '<td>'+esc(x.empresa||'')+(x.empresa_rfc?' <span style="color:var(--muted);font-size:11px">('+esc(x.empresa_rfc)+')</span>':'')+'</td>'+
        '<td><span class="tag">'+esc(x.nivel||'')+'</span></td>'+
        '<td>'+esc(x.tipo_documental||'')+'</td>'+
        '<td><span class="tag '+natCls+'">'+esc(x.naturaleza||'')+'</span></td>'+
        '<td>'+esc(x.materia||'')+'</td>'+
        '<td>'+esc(x.autoridad||'')+'</td>'+
        '<td>'+esc(x.expediente||'')+'</td>'+
        '<td>'+esc(x.fecha_emision||'')+'</td>'+
        '<td title="'+esc(acr)+'">'+esc(acrTx)+'</td>'+
        '<td>'+archivo+'</td></tr>';
    }).join('');
    const tb=g('doc_tbody');
    tb.innerHTML=rows||'<tr><td colspan=11 class="empty">Sin documentales con ese filtro</td></tr>';
    tb.querySelectorAll('input.doc-file').forEach(inp=>inp.onchange=async()=>{
      const file=inp.files&&inp.files[0]; if(!file) return;
      inp.disabled=true;
      let nombre=file.name.split('').filter(ch=>/[a-zA-Z0-9._-]/.test(ch)).join('');
      if(!nombre) nombre='archivo';
      const path='materialidad/doc_'+inp.dataset.id+'_'+nombre;
      try{
        const up=await sb.storage.from('expedientes').upload(path, file);
        if(up.error) throw up.error;
        const {error:e2}=await sb.from('documentales').update({archivo_path:path, archivo_nombre:file.name}).eq('id',inp.dataset.id);
        if(e2) throw e2;
        viewDocumentales(c);
      }catch(err){
        alert('No se pudo subir (permisos de almacén): '+((err&&err.message)||err));
        inp.disabled=false;
      }
    });
    tb.querySelectorAll('a.doc-dl').forEach(a=>a.onclick=async(ev)=>{
      ev.preventDefault();
      try{
        const {data:d2,error:e3}=await sb.storage.from('expedientes').createSignedUrl(a.dataset.path, 3600);
        if(e3) throw e3;
        window.open(d2.signedUrl);
      }catch(err){ alert('No se pudo abrir el archivo (permisos de almacén): '+((err&&err.message)||err)); }
    });
  };
  g('doc_fnat').onchange=paint;
  g('doc_fmat').onchange=paint;
  paint();
  g('doc_save').onclick=async()=>{
    const msg=g('doc_msg');
    const emp=g('doc_emp').value.trim(), tipo=g('doc_tipo').value.trim();
    if(!emp||!tipo){ msg.textContent='Empresa y tipo documental son obligatorios.'; msg.style.color='var(--danger)'; return; }
    g('doc_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    try{
      const n=await cnt('documentales');
      const folio='DOC-'+String(n+1).padStart(4,'0');
      const {error:e}=await sb.from('documentales').insert({folio:folio, empresa:emp, nivel:g('doc_nivel').value, tipo_documental:tipo, naturaleza:g('doc_nat').value, materia:g('doc_mat').value, autoridad:g('doc_aut').value.trim()||null, expediente:g('doc_expd').value.trim()||null, fecha_emision:g('doc_fecha').value||null, descripcion:g('doc_desc').value.trim()||null, acredita:g('doc_acr').value.trim()||null, contraparte:g('doc_contra').value.trim()||null});
      if(e) throw e;
      viewDocumentales(c);
    }catch(err){
      msg.textContent='Error: '+((err&&err.message)||err); msg.style.color='var(--danger)'; g('doc_save').disabled=false;
    }
  };
}

/* ===== Organigrama, puestos y funciones (PRM-ADM-008 · julio 2026) ===== */
const ORG=[
  {area:'DIRECCIÓN GENERAL', plazas:'2 plazas', color:'#14303D', desc:'Estrategia, clientes Nivel 1, asignación de asuntos, control de calidad final y firma. Etapas 1, 2 y 5 del flujo.', puestos:[
    {puesto:'Director General (Titular)', funciones:'Estrategia y crecimiento · atención a clientes Nivel 1 · firma de dictámenes y entregables · control de calidad final · decisiones de personal y precios · representación de la firma.', actividades:'Despacho y asignación de asuntos (diario) · revisión técnica y firma (24–48 h) · comité operativo semanal · revisión del tablero de compliance (semanal).'},
    {puesto:'Coordinador de Dirección y Control de Gestión', funciones:'Brazo operativo de la DG: seguimiento de folios y fechas compromiso · agenda y priorización · enlace entre departamentos.', actividades:'Apertura de folio (mismo día) · seguimiento diario y semáforo de vencimientos · minuta del comité semanal · reporte de gestión mensual (días 1–3).'}
  ]},
  {area:'JURÍDICA', plazas:'2 plazas', color:'#7a5aa6', desc:'', puestos:[
    {puesto:'Abogado Responsable — Defensa Fiscal y Laboral', funciones:'Estrategia de defensa fiscal · litigio y medios de defensa · previsión social y terminaciones · criterio jurídico · supervisión del abogado corporativo.', actividades:'Control de términos semanal · terminaciones y finiquitos por evento · expediente de materialidad preventivo (1 entidad Nivel 1 por semana) · revisión jurídica de entregables (48–72 h).'},
    {puesto:'Abogado Corporativo', funciones:'Vida corporativa de las 68 entidades: actas, asambleas, poderes, libros · contratos con clientes y proveedores · convenios y renovaciones.', actividades:'Contratos y renovaciones (45 min con IA vs 240 manual) · actas y poderes (5–15 días hábiles) · libros corporativos (trimestral) · asambleas ordinarias (marzo–abril).'}
  ]},
  {area:'CONTABLE-FISCAL', plazas:'4 plazas (escalable a 3)', color:'#2e6f7e', desc:'', puestos:[
    {puesto:'Contador Responsable de Área', funciones:'Responsable técnico de cierres y declaraciones · criterio fiscal · revisión de auxiliares · dictámenes de deducibilidad · interlocución con SAT.', actividades:'Cierre multiempresa (días 1–10) · papeles de trabajo (día 12) · provisionales y DIOT (día 17) · dictamen de deducción (3–5 días) · anuales PM (marzo).'},
    {puesto:'Auxiliares Contables (3)', funciones:'Registro por bloque de sociedades (15–20 entidades c/u) · conciliaciones · expedientes contables.', actividades:'Captura y validación de CFDI (diaria, con IA de horas a minutos) · conciliaciones bancarias (30 min por entidad con IA vs 6 h) · balanzas (día 10).'}
  ]},
  {area:'OPERACIONES DE NÓMINA', plazas:'3 plazas', color:'#1d4152', desc:'', puestos:[
    {puesto:'Coordinador de Operaciones de Nómina', funciones:'Ciclo de nómina punta a punta · calendario de quincenas · relación con clientes de nómina · calidad del timbrado.', actividades:'Cálculo y timbrado (5 min por nómina con IA vs 30) · cierre ≤1.5 días tras fin de periodo · control de nóminas sin timbrar (meta cero) · reporte quincenal a DG.'},
    {puesto:'Analista de Afiliación y Conciliación IMSS', funciones:'Altas/bajas/modificaciones IMSS (NOMEN) · SUA/IDSE/SIPARE · conciliación nómina vs IMSS.', actividades:'Movimientos afiliatorios (diario en quincena) · confronta IDSE–SUA (mensual) · requerimientos IMSS/Infonavit (por evento).'},
    {puesto:'Analista de Facturación y Pre-dispersión', funciones:'Facturación del servicio de nómina · layouts de dispersión · primera llave del pago.', actividades:'CFDI de servicio por pagadora (quincenal) · complementos de pago (mensual) · layout validado vs nómina timbrada → Tesorería (mismo día).'}
  ]},
  {area:'COMPLIANCE Y CONTROL', plazas:'1 plaza', color:'#b8442f', desc:'', puestos:[
    {puesto:'Coordinador de Compliance', funciones:'Verificación de cumplimiento de cada entregable · tracker de 68 entidades · 69-B, REPSE, PLD · renovaciones · evidencia de materialidad.', actividades:'Verificación pre-firma (24 h por folio) · alertas y tablero (viernes) · ICSOE/SISUB (ene·may·sep) · verificación de domicilios 41 reactivos 69-B (semestral) · semáforo de riesgo a DG (semanal).'}
  ]},
  {area:'ADMINISTRACIÓN Y FINANZAS', plazas:'2 plazas', color:'#A8843C', desc:'', puestos:[
    {puesto:'Director de Administración y Finanzas', funciones:'Finanzas internas · flujo y presupuesto · facturación y cobranza a clientes · proveedores · políticas internas y RH administrativo.', actividades:'Facturación (días 1–3) · cortes de cobranza (quincenal) · conciliaciones internas (primeros 5 días) · reporte financiero a DG (mensual).'},
    {puesto:'Coordinador de Tesorería y Servicios Generales', funciones:'Ejecución de pagos y dispersiones autorizadas (segunda llave) · bancos · gestoría · respaldo de información.', actividades:'Dispersión cuatro ojos (por quincena, mismo día del layout) · pagos e impuestos (día 17) · gestoría diaria · respaldo NAS+nube (semanal).'}
  ]},
  {area:'COMERCIAL Y VINCULACIÓN', plazas:'2 plazas', color:'#3f8f5b', desc:'', puestos:[
    {puesto:'Ejecutivo Comercial Senior', funciones:'Meta de ventas y reactivación · prospección y cierre · alianzas · precios con DG · pipeline documentado.', actividades:'Campaña de reactivación (lista de 20 contactos semanal) · propuestas en 48 h con IA · reporte de conversión semanal · cobranza comercial 90 días.'},
    {puesto:'Ejecutivo de Vinculación y Atención', funciones:'Ventanilla única de solicitudes (etapa 1) · experiencia del cliente · cross-sell sobre cartera activa.', actividades:'Registro de solicitudes con folio (mismo día) · bitácora de solicitudes · encuestas de satisfacción (mensual) · coordinación de entregas.'}
  ]}
];

async function viewOrganigrama(c){
  const bloque=p=>'<div style="border:1px solid var(--line);border-radius:8px;margin-top:8px;overflow:hidden">'+
    '<div class="org-p" style="padding:8px 11px;font-weight:700;font-size:12.5px;color:var(--navy);cursor:pointer;background:var(--cream);display:flex;justify-content:space-between;gap:8px"><span>'+esc(p.puesto)+'</span><span style="color:var(--muted);font-weight:400">▾</span></div>'+
    '<div style="display:none;padding:9px 11px;font-size:12px;line-height:1.55;border-top:1px solid var(--line)">'+
      '<div><b>Funciones:</b> '+esc(p.funciones)+'</div>'+
      '<div style="margin-top:6px"><b>Actividades:</b> '+esc(p.actividades)+'</div></div></div>';
  const cardArea=a=>'<div class="card" style="margin-bottom:0">'+
    '<h3 style="background:'+a.color+';color:#fff;border-bottom:0;display:flex;justify-content:space-between;gap:8px;letter-spacing:.5px"><span>'+esc(a.area)+'</span><span style="font-weight:600;opacity:.85">'+esc(a.plazas)+'</span></h3>'+
    '<div class="body">'+(a.desc?'<div style="font-size:12px;color:var(--muted)">'+esc(a.desc)+'</div>':'')+a.puestos.map(bloque).join('')+'</div></div>';
  c.innerHTML='<h1 class="pg">Organigrama, puestos y funciones (PRM-ADM-008 · julio 2026)</h1>'+
    '<div class="pgsub">PRM-ADM-008 · julio 2026 — estructura oficial. Documento confidencial de Dirección.</div>'+
    '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">'+
      tile('33','Plantilla actual: 33 personas · ~$566 mil/mes','var(--navy)')+
      tile('16','Estructura propuesta: 16 plazas (−52%)','var(--ok)')+
      tile('4 ojos','Regla intocable: dispersión a cuatro ojos','var(--danger)')+
    '</div>'+
    '<div style="max-width:640px;margin:0 auto 16px">'+cardArea(ORG[0])+'</div>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start;margin-bottom:20px">'+ORG.slice(1).map(cardArea).join('')+'</div>'+
    '<div class="card"><h3>Criterios de transición (33 → 16)</h3><div class="body" style="font-size:13px;line-height:1.6">'+
      '<div><b>1. Medición primero</b> — evaluar carga real y desempeño con datos antes de cualquier decisión.</div>'+
      '<div><b>2. Capacitación y compromiso</b> — dar a cada persona la oportunidad de adoptar las herramientas de IA.</div>'+
      '<div><b>3. Reubicar antes que liquidar</b> — privilegiar movimientos internos hacia las áreas con carga de trabajo.</div>'+
      '<div><b>4. Segregación innegociable</b> — nunca una sola persona calcula, factura y dispersa.</div>'+
      '<div><b>5. Gradualidad medible</b> — transición por etapas con métricas, sin cortes abruptos.</div>'+
      '<div style="margin-top:10px;font-size:12px;color:var(--muted)">La decisión sobre personas concretas es exclusiva de la Dirección General.</div>'+
    '</div></div>';
  c.querySelectorAll('.org-p').forEach(h=>h.onclick=()=>{
    const d=h.nextElementSibling;
    d.style.display = d.style.display==='none' ? 'block' : 'none';
  });
}

async function viewActas(c){
  const {data,error}=await sb.from('actas_poderes').select('empresa,tipo_acto,instrumento,notario,fecha_acto,apoderado,tipo_poder,vigencia,estatus').order('fecha_acto',{ascending:false,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>{
    const e=(x.estatus||'').toLowerCase();
    const cls=e==='vigente'?'on':e==='revocado'?'off':'';
    return `<tr><td>${esc(x.empresa||'')}</td><td>${esc(x.tipo_acto||'')}</td><td>${esc(x.instrumento||'')}</td><td>${esc(x.notario||'')}</td><td>${esc(x.fecha_acto||'')}</td><td>${esc(x.apoderado||'')}</td><td>${esc(x.tipo_poder||'')}</td><td>${esc(x.vigencia||'')}</td><td><span class="tag ${cls}">${esc(x.estatus||'')}</span></td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Actas y poderes</h1><div class="pgsub">'+(data?data.length:0)+' registros</div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Tipo de acto</th><th>Instrumento</th><th>Notario</th><th>Fecha</th><th>Apoderado</th><th>Tipo de poder</th><th>Vigencia</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=9 class="empty">Sin actas ni poderes capturados</td></tr>')+'</tbody></table></div>';
}

async function viewMovimientos(c){
  const {data,error}=await sb.from('operaciones_movimientos').select('fecha,empresa,tramite,movimiento,responsable,estatus,referencia').order('fecha',{ascending:false,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>{
    const cls=x.estatus==='Confirmado'?'on':'off';
    return `<tr><td>${esc(x.fecha||'')}</td><td>${esc(x.empresa||'')}</td><td>${esc(x.tramite||'')}</td><td>${esc(x.movimiento||'')}</td><td>${esc(x.responsable||'')}</td><td><span class="tag ${cls}">${esc(x.estatus||'')}</span></td><td>${esc(x.referencia||'')}</td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Movimientos (Operaciones)</h1><div class="pgsub">'+(data?data.length:0)+' movimientos (máx 300)</div>'+
    '<div class="card"><table><thead><tr><th>Fecha</th><th>Empresa</th><th>Trámite</th><th>Movimiento</th><th>Responsable</th><th>Estatus</th><th>Referencia</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=7 class="empty">Sin movimientos</td></tr>')+'</tbody></table></div>';
}

async function viewOnboarding(c){
  const {data,error}=await sb.from('onboarding_cliente').select('referencia,razon_social,rfc,contacto,correo,giro,estatus,creado_en').order('creado_en',{ascending:false,nullsFirst:false}).limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.referencia||'')}</td><td>${esc(x.razon_social||'')}</td><td>${esc(x.rfc||'')}</td><td>${esc(x.contacto||'')}</td><td>${esc(x.correo||'')}</td><td>${esc(x.giro||'')}</td><td><span class="tag">${esc(x.estatus||'')}</span></td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Onboarding / KYC</h1><div class="pgsub">'+(data?data.length:0)+' expedientes</div>'+
    '<div class="card"><table><thead><tr><th>Referencia</th><th>Razón social</th><th>RFC</th><th>Contacto</th><th>Correo</th><th>Giro</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=7 class="empty">Sin expedientes de onboarding aún — listo para capturar</td></tr>')+'</tbody></table></div>';
}

async function viewDocumentos(c){
  const {data,error}=await sb.from('documentos_expediente').select('empresa,tipo,nombre,vigencia,estatus,fecha').order('fecha',{ascending:false,nullsFirst:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>{
    const e=(x.estatus||'').toLowerCase();
    const cls=e==='vigente'?'on':(e==='faltante'||e==='por_actualizar')?'off':'';
    return `<tr><td>${esc(x.empresa||'')}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.nombre||'')}</td><td>${esc(x.vigencia||'')}</td><td><span class="tag ${cls}">${esc(x.estatus||'')}</span></td><td>${esc(x.fecha||'')}</td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Documentos del expediente</h1><div class="pgsub">'+(data?data.length:0)+' documentos</div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Tipo</th><th>Nombre</th><th>Vigencia</th><th>Estatus</th><th>Fecha</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin documentos cargados aún</td></tr>')+'</tbody></table></div>';
}

async function viewDescargas(c){
  const {data,error}=await sb.from('descarga_solicitudes').select('rfc,tipo,fecha_inicio,fecha_fin,estado,num_cfdis,solicitada_en').order('solicitada_en',{ascending:false,nullsFirst:false}).limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>`<tr><td>${esc(x.rfc||'')}</td><td>${esc(x.tipo||'')}</td><td>${esc((x.fecha_inicio||'')+' a '+(x.fecha_fin||''))}</td><td><span class="tag">${esc(x.estado||'')}</span></td><td class="num-r">${x.num_cfdis==null?'—':x.num_cfdis}</td><td>${esc(x.solicitada_en||'')}</td></tr>`).join('');
  c.innerHTML='<h1 class="pg">Descargas SAT / CFDI</h1><div class="pgsub">'+(data?data.length:0)+' solicitudes</div>'+
    '<div class="card"><table><thead><tr><th>RFC</th><th>Tipo</th><th>Periodo</th><th>Estado</th><th class="num-r">No. CFDI</th><th>Solicitada</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin solicitudes de descarga SAT aún</td></tr>')+'</tbody></table></div>';
}

async function viewCalendario(c){
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  const [r1,r2,r3,r4]=await Promise.all([
    sb.from('renovaciones').select('empresa,tipo_autorizacion,vigencia,estatus').not('vigencia','is',null),
    sb.from('alertas_repse').select('razon_social,folio_repse,vigencia_repse,estado_alerta').not('vigencia_repse','is',null),
    sb.from('compliance_empresa').select('empresa_rfc,fecha_limite,notas').eq('aplica',true).eq('cumplido',false).not('fecha_limite','is',null),
    sb.from('materialidad_expedientes').select('folio,cliente,fecha_limite,estatus').eq('estatus','abierto').not('fecha_limite','is',null)
  ]);
  const items=[];
  (r1.data||[]).forEach(x=>items.push({fecha:x.vigencia,fuente:'Renovación',empresa:x.empresa||'',detalle:x.tipo_autorizacion||'',estatus:x.estatus||''}));
  (r2.data||[]).forEach(x=>items.push({fecha:x.vigencia_repse,fuente:'REPSE',empresa:x.razon_social||'',detalle:x.folio_repse||'',estatus:x.estado_alerta||''}));
  (r3.data||[]).forEach(x=>items.push({fecha:x.fecha_limite,fuente:'Compliance',empresa:x.empresa_rfc||'',detalle:x.notas||'',estatus:''}));
  (r4.data||[]).forEach(x=>items.push({fecha:x.fecha_limite,fuente:'Materialidad',empresa:x.cliente||'',detalle:'Cierre expediente '+(x.folio||''),estatus:x.estatus||''}));
  items.sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
  const list=items.slice(0,120);
  const diasDe=f=>{const d=new Date(f); d.setHours(0,0,0,0); return Math.round((d-hoy)/86400000);};
  const vencidos=list.filter(x=>diasDe(x.fecha)<0).length;
  const rows=list.map(x=>{
    const dias=diasDe(x.fecha);
    const diasTx = dias<0 ? '<span style="color:var(--danger)">vencido hace '+(-dias)+' d</span>' : 'en '+dias+' d';
    return `<tr><td>${esc(x.fecha||'')}</td><td><span class="tag">${esc(x.fuente)}</span></td><td>${esc(x.empresa)}</td><td>${esc(x.detalle)}</td><td>${diasTx}</td><td>${esc(x.estatus)}</td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Calendario de vencimientos</h1><div class="pgsub">'+list.length+' vencimientos · '+vencidos+' vencidos</div>'+
    '<div class="card"><table><thead><tr><th>Fecha</th><th>Fuente</th><th>Empresa</th><th>Detalle</th><th>Días</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin vencimientos próximos</td></tr>')+'</tbody></table></div>';
}

boot();

/* ===== Menus con submenus (pestanas) ===== */
function comboTabs(c, title, tabs){
  c.innerHTML='<h1 class="pg">'+title+'</h1>'+
    '<div style="display:flex;gap:6px;margin:0 0 16px;border-bottom:1px solid var(--line);flex-wrap:wrap">'+
    tabs.map(function(t,i){return '<button class="cbtab" data-i="'+i+'" style="border:0;background:none;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;color:'+(i===0?'var(--navy)':'var(--muted)')+';border-bottom:3px solid '+(i===0?'var(--gold)':'transparent')+'">'+t.label+'</button>';}).join('')+
    '</div><div id="combobody"><div class="loader">Cargando…</div></div>';
  var body=document.getElementById('combobody');
  var btns=c.querySelectorAll('.cbtab');
  function sel(i){ btns.forEach(function(b,j){ b.style.color=(j==i)?'var(--navy)':'var(--muted)'; b.style.borderBottom='3px solid '+((j==i)?'var(--gold)':'transparent'); }); try{ tabs[i].fn(body); }catch(e){ body.innerHTML='<div class="empty">Error: '+(e.message||e)+'</div>'; } }
  btns.forEach(function(b){ b.onclick=function(){ sel(+b.dataset.i); }; });
  sel(0);
}
async function viewClientesCombo(c){ comboTabs(c,'Clientes',[{label:'Expediente / Vinculación',fn:viewVinculacion},{label:'Datos fiscales',fn:viewClientesFiscal},{label:'Contratos',fn:viewContratos},{label:'Servicios',fn:viewServicios},{label:'Documentos',fn:viewDocumentos}]); }
async function viewContratosCombo(c){ comboTabs(c,'Contratos',[{label:'Contrato',fn:viewContratos},{label:'Contrato individual de trabajo',fn:viewContratoIndividual}]); }
async function viewContratoIndividual(c){
  const {data,error}=await sb.from('trabajadores').select('nombre,cliente_nombre,puesto,tipo_contrato,jornada,fecha_alta,salario_diario,estatus').order('nombre').limit(300);
  if(error) throw error;
  const rows=(data||[]).map(function(x){return '<tr><td>'+esc(x.nombre||'')+'</td><td>'+esc(x.cliente_nombre||'')+'</td><td>'+esc(x.puesto||'')+'</td><td>'+esc(x.tipo_contrato||'—')+'</td><td>'+esc(x.jornada||'—')+'</td><td>'+esc(x.fecha_alta||'')+'</td><td class="num-r">'+mny(x.salario_diario)+'</td><td><span class="tag '+(x.estatus==='activo'?'on':'off')+'">'+esc(x.estatus||'')+'</span></td></tr>';}).join('');
  c.innerHTML='<div class="pgsub">'+((data?data.length:0))+' contratos individuales de trabajo (máx 300)</div>'+
    '<div class="card"><table><thead><tr><th>Trabajador</th><th>Empresa</th><th>Puesto</th><th>Tipo contrato</th><th>Jornada</th><th>Ingreso</th><th class="num-r">Salario diario</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=8 class="empty">Sin trabajadores</td></tr>')+'</tbody></table></div>';
}

/* ===== Tableros por área ===== */
async function viewTabGen(c){
  c.innerHTML='<h1 class="pg">Tablero General</h1><div class="pgsub">Vista de mando · integra todos los departamentos</div>';
  const [emp,repse,cli,trab,alr,ren,con,jui,tar,mov]=await Promise.all([
    cnt('empresas'), cnt('empresas',[['repse',true]]), cnt('clientes'),
    cnt('trabajadores',[['estatus','activo']]), cnt('alertas_repse'), cnt('renovaciones'),
    cnt('contratos'), cnt('juicios'), cnt('tareas'), cnt('movimientos_bancarios')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(emp,'Empresas','var(--navy)')+
    tile(repse,'Empresas REPSE','var(--teal)')+
    tile(cli,'Clientes','var(--navy)')+
    tile(trab,'Trabajadores activos','var(--ok)')+
    tile(alr,'Alertas REPSE',sem(alr,'alert'))+
    tile(ren,'Renovaciones','var(--wait)')+
    tile(con,'Contratos','var(--navy)')+
    tile(jui,'Juicios','var(--navy)')+
    tile(tar,'Tareas',sem(tar,'alert'))+
    tile(mov,'Mov. bancarios','var(--teal)')+
    '</div>';
}
async function viewTabCom(c){
  c.innerHTML='<h1 class="pg">Tablero Comercial</h1><div class="pgsub">Prospección, cotización y cartera de clientes</div>';
  const [sol,serv,cli,cot]=await Promise.all([
    cnt('solicitudes'), cnt('servicios'), cnt('clientes'), cnt('solicitudes')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(sol,'Solicitudes','var(--navy)')+
    tile(serv,'Servicios','var(--teal)')+
    tile(cli,'Clientes','var(--navy)')+
    tile(cot,'Cotizaciones','var(--wait)')+
    '</div>';
}
async function viewTabVinc(c){
  c.innerHTML='<h1 class="pg">Tablero Vinculación</h1><div class="pgsub">Expediente, IMSS y onboarding de clientes</div>';
  const [cli,trab,onb,con]=await Promise.all([
    cnt('clientes'), cnt('trabajadores',[['estatus','activo']]), cnt('onboarding_cliente'), cnt('contratos')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(cli,'Clientes','var(--navy)')+
    tile(trab,'Trabajadores activos','var(--ok)')+
    tile(onb,'Onboarding','var(--wait)')+
    tile(con,'Contratos','var(--navy)')+
    '</div>';
}
async function viewTabOp(c){
  c.innerHTML='<h1 class="pg">Tablero Operaciones</h1><div class="pgsub">Trámites, movimientos y descargas SAT</div>';
  const [tar,mov,des,bit,matAb]=await Promise.all([
    cnt('tareas'), cnt('operaciones_movimientos'), cnt('descarga_solicitudes'), cnt('bitacora'),
    cnt('materialidad_expedientes',[['estatus','abierto']])
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(tar,'Tareas',sem(tar,'alert'))+
    tile(mov,'Movimientos','var(--teal)')+
    tile(des,'Descargas SAT','var(--wait)')+
    tile(bit,'Bitácora','var(--navy)')+
    tile(matAb,'Expedientes materialidad abiertos', matAb>0?'var(--wait)':'var(--ok)')+
    '</div>';
}
async function viewTabJur(c){
  c.innerHTML='<h1 class="pg">Tablero Jurídico</h1><div class="pgsub">Contratos, juicios y gobierno corporativo</div>';
  const [con,jui,act]=await Promise.all([
    cnt('contratos'), cnt('juicios'), cnt('actas_poderes')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(con,'Contratos','var(--navy)')+
    tile(jui,'Juicios','var(--danger)')+
    tile(act,'Actas y poderes','var(--navy)')+
    '</div>';
}
async function viewTabCont(c){
  c.innerHTML='<h1 class="pg">Tablero Contable</h1><div class="pgsub">Pólizas, bancos y conciliación</div>';
  const [mov,cta]=await Promise.all([
    cnt('movimientos_bancarios'), cnt('tesoreria_cuentas')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(mov,'Mov. bancarios','var(--teal)')+
    tile(cta,'Cuentas','var(--navy)')+
    '</div>';
}
async function viewTabFisc(c){
  c.innerHTML='<h1 class="pg">Tablero Fiscal</h1><div class="pgsub">Cumplimiento, REPSE y previsión social</div>';
  const tot=await cnt('compliance_empresa',[['aplica',true]]);
  const ok=await cnt('compliance_empresa',[['aplica',true],['cumplido',true]]);
  const pct=tot?Math.round(ok/tot*100):0;
  const [alr,ren,prev]=await Promise.all([
    cnt('alertas_repse'), cnt('renovaciones'), cnt('prevision_social')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(pct+'%','Cumplimiento',sem(pct,'pct'))+
    tile(alr,'Alertas REPSE',sem(alr,'alert'))+
    tile(ren,'Renovaciones','var(--wait)')+
    tile(prev,'Previsión social','var(--navy)')+
    '</div>';
}
async function viewTabTes(c){
  c.innerHTML='<h1 class="pg">Tablero Tesorería</h1><div class="pgsub">Cuentas, cobranza y pagos</div>';
  const [cta,cob,pag]=await Promise.all([
    cnt('tesoreria_cuentas'), cnt('cobranza'), cnt('pagos')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(cta,'Cuentas','var(--navy)')+
    tile(cob,'Cobranza','var(--teal)')+
    tile(pag,'Pagos','var(--wait)')+
    '</div>';
}
async function viewTabAdm(c){
  c.innerHTML='<h1 class="pg">Tablero Administración</h1><div class="pgsub">Empresas del grupo, gastos y personal interno</div>';
  const [emp,gas,per,ofi]=await Promise.all([
    cnt('empresas'), cnt('gastos'), cnt('perfiles'), cnt('oficinas')
  ]);
  c.innerHTML += '<div class="kpis">'+
    tile(emp,'Empresas','var(--navy)')+
    tile(gas,'Gastos','var(--teal)')+
    tile(per,'Personal','var(--navy)')+
    tile(ofi,'Oficinas','var(--wait)')+
    '</div>';
}

function exportContentCSV(){
  var t=document.querySelector('#content table');
  if(!t){ alert('No hay tabla para exportar en esta vista.'); return; }
  var NL=String.fromCharCode(10);
  var BOM=String.fromCharCode(65279);
  var csv=[];
  t.querySelectorAll('tr').forEach(function(tr){
    var cells=[].slice.call(tr.querySelectorAll('th,td')).map(function(td){
      var s=(td.innerText||'');
      s=s.split(String.fromCharCode(13)).join(' ');
      s=s.split(String.fromCharCode(10)).join(' ');
      s=s.split(String.fromCharCode(9)).join(' ');
      while(s.indexOf('  ')>=0){ s=s.split('  ').join(' '); }
      s=s.trim();
      s=s.split('"').join('""');
      return '"'+s+'"';
    });
    csv.push(cells.join(','));
  });
  var blob=new Blob([BOM+csv.join(NL)],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url; a.download='PRM360_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

async function viewBusqueda(c, term){
  term=(term||'').trim();
  if(!term){ c.innerHTML='<h1 class="pg">Búsqueda</h1><div class="empty">Escribe un RFC o nombre y presiona Enter.</div>'; return; }
  var sources=[
    { t:'Clientes', head:['Razón social','RFC','Grupo'], cols:['razon_social','rfc','grupo'],
      p:sb.from('clientes').select('razon_social,rfc,grupo').or('razon_social.ilike.%'+term+'%,rfc.ilike.%'+term+'%').limit(20) },
    { t:'Clientes (fiscal)', head:['Razón social','RFC','Grupo'], cols:['razon_social','rfc','grupo'],
      p:sb.from('clientes_fiscal').select('razon_social,rfc,grupo').or('razon_social.ilike.%'+term+'%,rfc.ilike.%'+term+'%').limit(20) },
    { t:'Trabajadores', head:['Nombre','NSS','RFC','Cliente'], cols:['nombre','nss','rfc','cliente_nombre'],
      p:sb.from('trabajadores').select('nombre,nss,rfc,cliente_nombre').or('nombre.ilike.%'+term+'%,rfc.ilike.%'+term+'%,nss.ilike.%'+term+'%').limit(20) },
    { t:'Empresas', head:['Razón social','RFC','Estatus'], cols:['razon_social','rfc','estatus'],
      p:sb.from('empresas').select('razon_social,rfc,estatus').or('razon_social.ilike.%'+term+'%,rfc.ilike.%'+term+'%').limit(20) },
    { t:'Contratos', head:['Folio','Título','Estatus'], cols:['folio','titulo','estatus'],
      p:sb.from('contratos').select('folio,titulo,estatus').or('folio.ilike.%'+term+'%,titulo.ilike.%'+term+'%').limit(20) }
  ];
  var results=await Promise.all(sources.map(function(s){
    return s.p.then(function(r){ return { s:s, rows:(r&&r.data)||[] }; }).catch(function(){ return { s:s, rows:[] }; });
  }));
  var html='<h1 class="pg">Resultados: "'+esc(term)+'"</h1>';
  var any=false;
  results.forEach(function(res){
    if(!res.rows.length) return;
    any=true;
    html+='<div class="card"><h3>'+esc(res.s.t)+'</h3><div class="body"><table><tr>';
    res.s.head.forEach(function(h){ html+='<th>'+esc(h)+'</th>'; });
    html+='</tr>';
    res.rows.forEach(function(row){
      html+='<tr>';
      res.s.cols.forEach(function(col){ html+='<td>'+esc(row[col])+'</td>'; });
      html+='</tr>';
    });
    html+='</table></div></div>';
  });
  if(!any) html+='<div class="empty">Sin coincidencias</div>';
  c.innerHTML=html;
}

/* ===== Combos por área ===== */
async function viewTrabajadoresCombo(c){ comboTabs(c,'Trabajadores · IMSS',[{label:'Ficha / IMSS',fn:viewTrabajadores},{label:'Contrato individual',fn:viewContratoIndividual},{label:'NOM-035',fn:viewNom035},{label:'Plan de previsión (firmado)',fn:viewAdhesiones}]); }
async function viewTramitesCombo(c){ comboTabs(c,'Trámites',[{label:'Tablero',fn:viewTablero},{label:'Tareas / entregables',fn:viewTareas},{label:'Bitácora',fn:viewBitacora},{label:'Captura',fn:viewCaptura},{label:'Movimientos',fn:viewMovimientos}]); }
async function viewCorporativoCombo(c){ comboTabs(c,'Corporativo',[{label:'Actas y poderes',fn:viewActas},{label:'Contratos',fn:viewContratos}]); }
async function viewBancosCombo(c){ comboTabs(c,'Bancos',[{label:'Movimientos bancarios',fn:viewMovBancarios},{label:'Cuentas',fn:viewCuentas}]); }
async function viewCumplimientoCombo(c){ comboTabs(c,'Cumplimiento',[{label:'Cumplimiento / REPSE',fn:viewCompliance},{label:'Renovaciones',fn:viewRenovaciones}]); }
async function viewPrevisionCombo(c){ comboTabs(c,'Previsión social',[{label:'Plan por empresa',fn:viewPrevisionSocial},{label:'Adhesiones firmadas',fn:viewAdhesiones}]); }
async function viewEmpresasCombo(c){ comboTabs(c,'Empresas del grupo',[{label:'Empresas',fn:viewEmpresas},{label:'Plan de previsión social',fn:viewPrevisionSocial},{label:'Sustancia / cumplimiento',fn:viewSustancia}]); }
async function viewGastosCombo(c){ comboTabs(c,'Gastos y costeo',[{label:'Gastos',fn:viewGastos},{label:'Catálogo',fn:viewCatalogoGastos}]); }

/* ===== Leaf views nuevas ===== */
async function viewNom035(c){
  const {data,error}=await sb.from('nom035_respuestas').select('folio,area,fecha,total,nivel,guia').order('fecha',{ascending:false,nullsFirst:false}).limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>'<tr><td>'+esc(x.folio||'')+'</td><td>'+esc(x.area||'')+'</td><td>'+esc(x.fecha||'')+'</td><td class="num-r">'+(x.total==null?'—':x.total)+'</td><td><span class="tag">'+esc(x.nivel||'')+'</span></td><td>'+esc(x.guia||'')+'</td></tr>').join('');
  c.innerHTML='<h1 class="pg">NOM-035</h1><div class="pgsub">'+(data?data.length:0)+' cuestionarios (máx 200)</div>'+
    '<div class="card"><table><thead><tr><th>Folio</th><th>Área</th><th>Fecha</th><th class="num-r">Total</th><th>Nivel</th><th>Guía</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin cuestionarios NOM-035</td></tr>')+'</tbody></table></div>';
}
async function viewCatalogoGastos(c){
  const {data,error}=await sb.from('gastos_catalogo').select('clave,nombre,tipo,activo').order('nombre').limit(200);
  if(error) throw error;
  const rows=(data||[]).map(x=>'<tr><td>'+esc(x.clave||'')+'</td><td>'+esc(x.nombre||'')+'</td><td><span class="tag '+(x.tipo==='fijo'?'on':'off')+'">'+esc(x.tipo||'')+'</span></td><td><span class="tag '+(x.activo?'on':'off')+'">'+(x.activo?'Sí':'No')+'</span></td></tr>').join('');
  c.innerHTML='<h1 class="pg">Catálogo de gastos</h1><div class="pgsub">'+(data?data.length:0)+' conceptos (máx 200)</div>'+
    '<div class="card"><table><thead><tr><th>Clave</th><th>Nombre</th><th>Tipo</th><th>Activo</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin catálogo</td></tr>')+'</tbody></table></div>';
}

async function viewFacturacion(c){
  const {data,error}=await sb.from('facturacion_conceptos').select('id,folio,cliente,servicio,concepto,metodo_pago,subtotal,iva,total,estatus,creado_en').order('creado_en',{ascending:false}).limit(200);
  if(error) throw error;
  const tagEst=e=> e==='timbrado'?'on':(e==='validado'?'repse':'off');
  const rows=(data||[]).map(x=>{
    const conc=x.concepto||''; const concT=conc.length>60?conc.slice(0,60)+'…':conc;
    return `<tr><td><b>${esc(x.folio||'')}</b></td><td>${esc(x.cliente||'')}</td><td>${esc(x.servicio||'')}</td><td>${esc(concT)}</td><td><span class="tag ${x.metodo_pago==='PUE'?'on':''}">${esc(x.metodo_pago||'')}</span></td><td class="num-r">${mny(x.subtotal)}</td><td class="num-r">${mny(x.iva)}</td><td class="num-r"><b>${mny(x.total)}</b></td><td><span class="tag ${tagEst(x.estatus)}">${esc(x.estatus||'')}</span></td><td>${x.estatus==='borrador'?`<button class="mini fc-val" data-id="${x.id}">Validar</button>`:''}</td></tr>`;
  }).join('');
  c.innerHTML='<h1 class="pg">Facturación</h1><div class="pgsub">Constructor de concepto — valida antes de timbrar (flujo V4/V7). El timbrado se hace en tu sistema de facturación.</div>'+
    '<div class="card"><h3>Nuevo concepto</h3><div class="body"><div class="frm">'+
      '<label>Cliente<input id="fc_cliente" style="min-width:220px"></label>'+
      '<label>RFC<input id="fc_rfc" maxlength="13"></label>'+
      '<label>Servicio<select id="fc_serv"><option>Fiscal</option><option>Contable</option><option>Nómina y timbrado</option><option>REPSE / especializados</option><option>Materialidad</option><option>Jurídico</option><option>Otro</option></select></label>'+
      '<label>Concepto de facturación<input id="fc_concepto" style="min-width:320px"></label>'+
      '<label>Método de pago<select id="fc_metodo"><option value="PPD" selected>PPD</option><option value="PUE">PUE</option></select></label>'+
      '<label>Subtotal<input id="fc_sub" type="number" step="0.01" min="0" style="width:120px"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="fc_save">Guardar concepto</button> <span id="fc_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><h3>Conceptos ('+(data?data.length:0)+')</h3><table><thead><tr><th>Folio</th><th>Cliente</th><th>Servicio</th><th>Concepto</th><th>Método</th><th class="num-r">Subtotal</th><th class="num-r">IVA</th><th class="num-r">Total</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=10 class="empty">Sin conceptos de facturación</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('fc_save').onclick=async()=>{
    const msg=g('fc_msg');
    const cliente=g('fc_cliente').value.trim(), rfc=g('fc_rfc').value.trim(), concepto=g('fc_concepto').value.trim();
    const sub=Number(g('fc_sub').value);
    if(!cliente||!concepto){ msg.textContent='Cliente y concepto son obligatorios.'; msg.style.color='var(--danger)'; return; }
    if(!(sub>0)){ msg.textContent='Captura un subtotal mayor a cero.'; msg.style.color='var(--danger)'; return; }
    g('fc_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const tot=await cnt('facturacion_conceptos');
    const folio='FAC-'+String(tot+1).padStart(4,'0');
    const iva=Math.round(sub*0.16*100)/100;
    const total=Math.round((sub+iva)*100)/100;
    const {error:e}=await sb.from('facturacion_conceptos').insert({folio, cliente, cliente_rfc:rfc||null, servicio:g('fc_serv').value, concepto, metodo_pago:g('fc_metodo').value, subtotal:sub, iva, total, estatus:'borrador'});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('fc_save').disabled=false; return; }
    viewFacturacion(c);
  };
  c.querySelectorAll('button.fc-val').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('facturacion_conceptos').update({estatus:'validado'}).eq('id',b.dataset.id);
    if(e){ alert('Error al validar: '+e.message); b.disabled=false; return; }
    viewFacturacion(c);
  });
}

/* ===== Expediente de Materialidad · módulo ampliado ===== */
const MAT_TIPOS={repse:'REPSE / especializados',honorarios:'Honorarios',maquila_dispersion:'Maquila / dispersión'};
function matHoy(){ return new Date().toISOString().slice(0,10); }
function matDias(f){ if(!f) return null; const hoy=new Date(); hoy.setHours(0,0,0,0); const d=new Date(String(f).slice(0,10)+'T00:00:00'); if(isNaN(d)) return null; return Math.round((d-hoy)/86400000); }
function matDot(color){ return '<span style="color:'+color+';font-size:15px;line-height:1">●</span>'; }
function matSemColor(exp, evDone, evTotal, cadDone){
  if(evTotal>0 && evDone===evTotal && cadDone===8) return '#2f9e6b';
  const dias=matDias(exp.fecha_limite);
  if(dias!==null && (dias<0 || (dias<=7 && evDone<evTotal))) return '#c0392b';
  return '#c8952a';
}
function matRiskCol(v, good, bad){ if(good.indexOf(v)>=0) return '#2f9e6b'; if(bad.indexOf(v)>=0) return '#c0392b'; return '#8a8f98'; }
function matRiesgoMini(x){
  return '<b style="color:'+matRiskCol(x.riesgo_32d,['positiva'],['negativa'])+'" title="Opinión 32-D: '+esc(x.riesgo_32d||'pendiente')+'">D</b> '+
    '<b style="color:'+matRiskCol(x.riesgo_69b,['limpio'],['listado'])+'" title="69-B: '+esc(x.riesgo_69b||'pendiente')+'">B</b> '+
    '<b style="color:'+matRiskCol(x.riesgo_repse,['vigente','no_aplica'],['vencido'])+'" title="REPSE: '+esc(x.riesgo_repse||'pendiente')+'">R</b>';
}
function matTagExp(e){ return e==='completo'?'on':(e==='cerrado'?'off':'repse'); }
function matSelOpts(opts, cur){ const v=cur||'pendiente'; return opts.map(o=>'<option value="'+o[0]+'"'+(v===o[0]?' selected':'')+'>'+o[1]+'</option>').join(''); }

async function viewMaterialidad(c){
  comboTabs(c,'Expediente de Materialidad',[{label:'Expedientes',fn:matListado},{label:'Kit mensual 27-V',fn:matKit}]);
}
async function viewMaterialidadDet(c, id){ return matDetalle(c, id); }

async function matListado(body){
  body.innerHTML='<div class="loader">Cargando…</div>';
  const [r1,r2,r3]=await Promise.all([
    sb.from('materialidad_expedientes').select('id,folio,cliente,cliente_rfc,tipo_servicio,fecha_apertura,fecha_limite,estatus,riesgo_32d,riesgo_69b,riesgo_repse').order('creado_en',{ascending:false}).limit(200),
    sb.from('materialidad_evidencias').select('expediente_id,cumplida'),
    sb.from('materialidad_cadena').select('expediente_id,cumplido')
  ]);
  if(r1.error) throw r1.error;
  const exps=r1.data||[];
  const prog={}, cad={};
  (r2.data||[]).forEach(ev=>{ const p=prog[ev.expediente_id]||(prog[ev.expediente_id]={done:0,total:0}); p.total++; if(ev.cumplida) p.done++; });
  (r3.data||[]).forEach(cl=>{ const p=cad[cl.expediente_id]||(cad[cl.expediente_id]={done:0}); if(cl.cumplido) p.done++; });
  const rows=exps.map(x=>{
    const p=prog[x.id]||{done:0,total:0};
    const cd=(cad[x.id]||{done:0}).done;
    const dias=matDias(x.fecha_limite);
    let limTx=esc(x.fecha_limite||'—');
    if(dias!==null) limTx += dias<0
      ? ' <span style="color:#c0392b;font-size:11px">vencido hace '+(-dias)+' d</span>'
      : ' <span style="color:var(--muted);font-size:11px">en '+dias+' d</span>';
    return '<tr>'+
      '<td>'+matDot(matSemColor(x,p.done,p.total,cd))+'</td>'+
      '<td><b>'+esc(x.folio||'')+'</b></td>'+
      '<td>'+esc(x.cliente||'')+'</td>'+
      '<td>'+esc(MAT_TIPOS[x.tipo_servicio]||x.tipo_servicio||'')+'</td>'+
      '<td>'+limTx+'</td>'+
      '<td><span class="tag '+(p.total>0&&p.done===p.total?'on':'off')+'">'+p.done+'/'+p.total+'</span></td>'+
      '<td><span class="tag '+(cd===8?'on':'off')+'">'+cd+'/8</span></td>'+
      '<td>'+matRiesgoMini(x)+'</td>'+
      '<td><span class="tag '+matTagExp(x.estatus)+'">'+esc(x.estatus||'')+'</span></td>'+
      '<td><button class="mini mt-ver" data-id="'+x.id+'">Ver</button></td>'+
      '</tr>';
  }).join('');
  body.innerHTML=
    '<div class="pgsub">'+exps.length+' expedientes (máx 200) · checklist de evidencias + cadena de trazabilidad + matriz de riesgo</div>'+
    '<div class="card"><h3>Abrir expediente</h3><div class="body"><div class="frm">'+
      '<label>Cliente<input id="mt_cliente" style="min-width:220px"></label>'+
      '<label>RFC<input id="mt_rfc" maxlength="13"></label>'+
      '<label>Tipo de servicio<select id="mt_tipo"><option value="repse">REPSE / especializados (11 evidencias)</option><option value="honorarios">Honorarios (9 evidencias)</option><option value="maquila_dispersion">Maquila / dispersión (7 evidencias)</option></select></label>'+
      '<label>Folio (opcional)<input id="mt_folio"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="mt_save">Abrir expediente + checklist</button> <span id="mt_msg" style="font-size:12px;margin-left:8px"></span></div>'+
    '<div style="font-size:12px;color:var(--muted);margin-top:6px">Al abrir, el checklist de evidencias y la cadena de 8 eslabones se generan solos; cierre a 30 días.</div></div></div>'+
    '<div class="card"><table><thead><tr><th></th><th>Folio</th><th>Cliente</th><th>Tipo</th><th>Límite</th><th>Evidencias</th><th>Cadena</th><th>Riesgo</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=10 class="empty">Sin expedientes de materialidad</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('mt_save').onclick=async()=>{
    const msg=g('mt_msg');
    const cliente=g('mt_cliente').value.trim(), rfc=g('mt_rfc').value.trim(), folio=g('mt_folio').value.trim();
    if(!cliente){ msg.textContent='El cliente es obligatorio.'; msg.style.color='var(--danger)'; return; }
    g('mt_save').disabled=true; msg.textContent='Abriendo expediente…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.rpc('materialidad_crear',{p_cliente:cliente, p_rfc:rfc||null, p_tipo:g('mt_tipo').value, p_folio:folio||null});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('mt_save').disabled=false; return; }
    matListado(body);
  };
  body.querySelectorAll('button.mt-ver').forEach(b=>b.onclick=()=>matDetalle(body, b.dataset.id));
}

async function matDetalle(body, id){
  body.innerHTML='<div class="loader">Cargando expediente…</div>';
  const [r1,r2,r3]=await Promise.all([
    sb.from('materialidad_expedientes').select('id,folio,cliente,cliente_rfc,tipo_servicio,fecha_apertura,fecha_limite,estatus,notas,riesgo_32d,riesgo_69b,riesgo_repse').eq('id',id).maybeSingle(),
    sb.from('materialidad_evidencias').select('id,orden,evidencia,responsable,frecuencia,ubicacion,cumplida,fecha_cumplida,archivo_path,archivo_nombre,notas').eq('expediente_id',id).order('orden'),
    sb.from('materialidad_cadena').select('id,orden,eslabon,etiqueta,cumplido,referencia,fecha,notas').eq('expediente_id',id).order('orden')
  ]);
  if(r1.error) throw r1.error; if(r2.error) throw r2.error; if(r3.error) throw r3.error;
  const exp=r1.data;
  if(!exp){ body.innerHTML='<div class="empty">No se encontró el expediente.</div>'; return; }
  const evs=r2.data||[], cadL=r3.data||[];
  const done=evs.filter(x=>x.cumplida).length;
  const cadDone=cadL.filter(x=>x.cumplido).length;
  const allDone=evs.length>0&&done===evs.length;
  const bandera = exp.riesgo_69b==='listado' || exp.riesgo_32d==='negativa' || exp.riesgo_repse==='vencido';
  const dias=matDias(exp.fecha_limite);
  const diasTx = dias===null ? '' : (dias<0 ? ' · <span style="color:#c0392b">vencido hace '+(-dias)+' d</span>' : ' · en '+dias+' d');

  const cadRows=cadL.map(x=>
    '<tr><td>'+(x.orden!=null?x.orden:'')+'</td>'+
    '<td><input type="checkbox" class="mc-chk" data-id="'+x.id+'"'+(x.cumplido?' checked':'')+'></td>'+
    '<td>'+esc(x.etiqueta||x.eslabon||'')+'</td>'+
    '<td><input class="mc-ref" data-id="'+x.id+'" value="'+esc(x.referencia||'')+'" placeholder="Folio / referencia" style="min-width:160px"></td>'+
    '<td>'+esc(x.fecha||'')+'</td></tr>'
  ).join('');

  const evRows=evs.map(x=>{
    const archivo = x.archivo_path
      ? '<a href="#" class="me-dl" data-path="'+esc(x.archivo_path)+'">📎 '+esc(x.archivo_nombre||'archivo')+'</a>'
      : '<input type="file" class="me-file" data-id="'+x.id+'" style="font-size:11px;max-width:190px">';
    return '<tr><td>'+(x.orden!=null?x.orden:'')+'</td>'+
      '<td><input type="checkbox" class="me-chk" data-id="'+x.id+'"'+(x.cumplida?' checked':'')+'></td>'+
      '<td>'+esc(x.evidencia||'')+'</td>'+
      '<td><input class="me-resp" data-id="'+x.id+'" value="'+esc(x.responsable||'')+'" placeholder="Responsable" style="min-width:120px"></td>'+
      '<td>'+esc(x.fecha_cumplida||'')+'</td>'+
      '<td>'+archivo+'</td></tr>';
  }).join('');

  body.innerHTML=
    '<div class="no-print" style="margin-bottom:10px"><button class="btn2 ghost" id="mt_volver">← Volver</button></div>'+
    '<div class="card"><h3>'+matDot(matSemColor(exp,done,evs.length,cadDone))+' Expediente '+esc(exp.folio||'')+'</h3><div class="body">'+
      '<div style="font-size:13px">'+esc(exp.cliente||'')+(exp.cliente_rfc?(' · '+esc(exp.cliente_rfc)):'')+' · '+esc(MAT_TIPOS[exp.tipo_servicio]||exp.tipo_servicio||'')+
      ' · apertura '+esc(exp.fecha_apertura||'—')+' · límite '+esc(exp.fecha_limite||'—')+diasTx+
      ' · <span class="tag '+matTagExp(exp.estatus)+'">'+esc(exp.estatus||'')+'</span>'+
      ' · evidencias '+done+'/'+evs.length+' · cadena '+cadDone+'/8</div></div></div>'+
    '<div class="card"><h3>Matriz de riesgo</h3><div class="body">'+
      (bandera?'<div style="background:#fdecea;border:1px solid #c0392b;color:#c0392b;padding:8px 12px;border-radius:6px;font-weight:700;margin-bottom:10px">⚠ Bandera roja: revisar antes de timbrar/operar.</div>':'')+
      '<div class="frm">'+
      '<label>Opinión 32-D<select id="mtr_32d">'+matSelOpts([['positiva','Positiva'],['negativa','Negativa'],['pendiente','Pendiente']],exp.riesgo_32d)+'</select></label>'+
      '<label>Listado 69-B<select id="mtr_69b">'+matSelOpts([['limpio','Limpio'],['listado','Listado 69-B'],['pendiente','Pendiente']],exp.riesgo_69b)+'</select></label>'+
      '<label>REPSE<select id="mtr_repse">'+matSelOpts([['vigente','Vigente'],['no_aplica','No aplica'],['vencido','Vencido'],['pendiente','Pendiente']],exp.riesgo_repse)+'</select></label>'+
      '</div><div style="font-size:12px;color:var(--muted);margin-top:6px">Se guarda al cambiar cada campo.</div></div></div>'+
    '<div class="card"><h3>Cadena de trazabilidad · '+cadDone+'/8 eslabones</h3><table><thead><tr><th>#</th><th>Cumplido</th><th>Eslabón</th><th>Referencia</th><th>Fecha</th></tr></thead><tbody>'+
      (cadRows||'<tr><td colspan=5 class="empty">Sin cadena registrada</td></tr>')+'</tbody></table></div>'+
    '<div class="card"><h3>Checklist de evidencias · '+done+'/'+evs.length+'</h3><table><thead><tr><th>#</th><th>Cumplida</th><th>Evidencia</th><th>Responsable</th><th>Fecha</th><th>Archivo</th></tr></thead><tbody>'+
      (evRows||'<tr><td colspan=6 class="empty">Sin evidencias en el checklist</td></tr>')+'</tbody></table></div>'+
    '<div class="no-print" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">'+
      '<button class="btn2" id="mt_hoja">Hoja de cierre (PDF)</button>'+
      '<button class="btn2" id="mt_carpeta">Carpeta de defensa (índice)</button>'+
      (allDone&&exp.estatus!=='completo'?'<button class="btn2" id="mt_completo">Marcar completo</button>':'')+
    '</div>';

  document.getElementById('mt_volver').onclick=()=>matListado(body);
  document.getElementById('mt_hoja').onclick=()=>matHojaCierre(body, exp, evs, cadL);
  document.getElementById('mt_carpeta').onclick=()=>matCarpetaDefensa(body, exp, evs, cadL);
  const btnC=document.getElementById('mt_completo');
  if(btnC) btnC.onclick=async()=>{
    btnC.disabled=true;
    const {error:e}=await sb.from('materialidad_expedientes').update({estatus:'completo'}).eq('id',id);
    if(e){ alert('Error: '+e.message); btnC.disabled=false; return; }
    matDetalle(body, id);
  };

  const bindSel=(elId, campo)=>{
    const s=document.getElementById(elId);
    if(!s) return;
    s.onchange=async()=>{
      s.disabled=true;
      const payload={}; payload[campo]=s.value;
      const {error:e}=await sb.from('materialidad_expedientes').update(payload).eq('id',id);
      if(e){ alert('Error: '+e.message); s.disabled=false; return; }
      matDetalle(body, id);
    };
  };
  bindSel('mtr_32d','riesgo_32d'); bindSel('mtr_69b','riesgo_69b'); bindSel('mtr_repse','riesgo_repse');

  body.querySelectorAll('input.mc-chk').forEach(ch=>ch.onchange=async()=>{
    ch.disabled=true;
    const payload=ch.checked?{cumplido:true, fecha:matHoy()}:{cumplido:false, fecha:null};
    const {error:e}=await sb.from('materialidad_cadena').update(payload).eq('id',ch.dataset.id);
    if(e){ alert('Error: '+e.message); ch.checked=!ch.checked; ch.disabled=false; return; }
    matDetalle(body, id);
  });
  body.querySelectorAll('input.mc-ref').forEach(inp=>inp.onchange=async()=>{
    const {error:e}=await sb.from('materialidad_cadena').update({referencia:inp.value.trim()||null}).eq('id',inp.dataset.id);
    if(e){ alert('Error: '+e.message); return; }
    inp.style.borderColor='#2f9e6b';
  });
  body.querySelectorAll('input.me-chk').forEach(ch=>ch.onchange=async()=>{
    ch.disabled=true;
    const payload=ch.checked?{cumplida:true, fecha_cumplida:matHoy()}:{cumplida:false, fecha_cumplida:null};
    const {error:e}=await sb.from('materialidad_evidencias').update(payload).eq('id',ch.dataset.id);
    if(e){ alert('Error: '+e.message); ch.checked=!ch.checked; ch.disabled=false; return; }
    matDetalle(body, id);
  });
  body.querySelectorAll('input.me-resp').forEach(inp=>inp.onchange=async()=>{
    const {error:e}=await sb.from('materialidad_evidencias').update({responsable:inp.value.trim()||null}).eq('id',inp.dataset.id);
    if(e){ alert('Error: '+e.message); return; }
    inp.style.borderColor='#2f9e6b';
  });
  body.querySelectorAll('input.me-file').forEach(inp=>inp.onchange=async()=>{
    const file=inp.files&&inp.files[0]; if(!file) return;
    inp.disabled=true;
    let nombre=file.name.split('').filter(ch=>/[a-zA-Z0-9._-]/.test(ch)).join('');
    if(!nombre) nombre='archivo';
    const path='materialidad/'+id+'/'+inp.dataset.id+'_'+nombre;
    try{
      const up=await sb.storage.from('expedientes').upload(path, file);
      if(up.error) throw up.error;
      const {error:e2}=await sb.from('materialidad_evidencias').update({archivo_path:path, archivo_nombre:file.name}).eq('id',inp.dataset.id);
      if(e2) throw e2;
      matDetalle(body, id);
    }catch(err){
      alert('No se pudo subir (permisos de almacén): '+((err&&err.message)||err));
      inp.disabled=false;
    }
  });
  body.querySelectorAll('a.me-dl').forEach(a=>a.onclick=async(ev)=>{
    ev.preventDefault();
    try{
      const {data,error}=await sb.storage.from('expedientes').createSignedUrl(a.dataset.path, 3600);
      if(error) throw error;
      window.open(data.signedUrl);
    }catch(err){ alert('No se pudo abrir el archivo (permisos de almacén): '+((err&&err.message)||err)); }
  });
}

function matPrintHead(exp, subtitulo){
  return '<div style="text-align:center;margin-bottom:14px">'+
    '<div style="font-size:18px;font-weight:800;letter-spacing:1px">PR&amp;M Business Group</div>'+
    '<div style="font-size:14px;margin-top:2px">'+subtitulo+'</div></div>'+
    '<table style="margin-bottom:14px"><tbody>'+
    '<tr><td><b>Folio</b></td><td>'+esc(exp.folio||'')+'</td><td><b>Cliente</b></td><td>'+esc(exp.cliente||'')+(exp.cliente_rfc?(' ('+esc(exp.cliente_rfc)+')'):'')+'</td></tr>'+
    '<tr><td><b>Tipo de servicio</b></td><td>'+esc(MAT_TIPOS[exp.tipo_servicio]||exp.tipo_servicio||'')+'</td><td><b>Apertura / límite</b></td><td>'+esc(exp.fecha_apertura||'—')+' / '+esc(exp.fecha_limite||'—')+'</td></tr>'+
    '<tr><td><b>Estatus</b></td><td>'+esc(exp.estatus||'')+'</td><td><b>Fecha de emisión</b></td><td>'+matHoy()+'</td></tr>'+
    '</tbody></table>';
}
function matPrintBtns(body, exp){
  return '<div class="no-print" style="margin-bottom:12px;display:flex;gap:8px">'+
    '<button class="btn2" id="mp_print">🖨 Imprimir</button>'+
    '<button class="btn2 ghost" id="mp_volver">← Volver</button></div>';
}
function matPrintBind(body, exp){
  document.getElementById('mp_print').onclick=()=>window.print();
  document.getElementById('mp_volver').onclick=()=>matDetalle(body, exp.id);
}

function matHojaCierre(body, exp, evs, cad){
  const evRows=evs.map(x=>'<tr><td>'+esc(x.evidencia||'')+'</td><td>'+(x.cumplida?'Sí':'No')+'</td><td>'+esc(x.fecha_cumplida||'')+'</td><td>'+esc(x.responsable||'')+'</td></tr>').join('');
  const cadRows=cad.map(x=>'<tr><td>'+(x.orden!=null?x.orden:'')+'</td><td>'+esc(x.etiqueta||x.eslabon||'')+'</td><td>'+(x.cumplido?'Sí':'No')+'</td><td>'+esc(x.referencia||'')+'</td><td>'+esc(x.fecha||'')+'</td></tr>').join('');
  const firma=t=>'<div style="width:30%;text-align:center;padding-top:46px"><div style="border-top:1px solid #333;padding-top:6px;font-size:12px">'+t+'</div></div>';
  body.innerHTML=
    matPrintBtns(body, exp)+
    matPrintHead(exp,'Hoja de cierre de expediente de materialidad')+
    '<h3 style="font-size:14px;margin:14px 0 6px">Checklist de evidencias</h3>'+
    '<table><thead><tr><th>Evidencia</th><th>Cumplida</th><th>Fecha</th><th>Responsable</th></tr></thead><tbody>'+
    (evRows||'<tr><td colspan=4 class="empty">Sin evidencias</td></tr>')+'</tbody></table>'+
    '<h3 style="font-size:14px;margin:14px 0 6px">Cadena de trazabilidad</h3>'+
    '<table><thead><tr><th>#</th><th>Eslabón</th><th>Cumplido</th><th>Referencia</th><th>Fecha</th></tr></thead><tbody>'+
    (cadRows||'<tr><td colspan=5 class="empty">Sin cadena</td></tr>')+'</tbody></table>'+
    '<div style="display:flex;justify-content:space-between;margin-top:44px">'+firma('Elaboró')+firma('Revisó')+firma('Autorizó — Dirección')+'</div>'+
    '<div style="margin-top:18px;font-size:12px;color:#555">Fecha: '+matHoy()+'</div>';
  matPrintBind(body, exp);
}

function matCarpetaDefensa(body, exp, evs, cad){
  const rl=v=>esc(v||'pendiente');
  const cadRows=cad.map(x=>'<tr><td>'+(x.orden!=null?x.orden:'')+'</td><td>'+esc(x.etiqueta||x.eslabon||'')+'</td><td>'+esc(x.referencia||'')+'</td><td>'+esc(x.fecha||'')+'</td></tr>').join('');
  const evRows=evs.map(x=>'<tr><td>'+esc(x.evidencia||'')+'</td><td>'+esc(x.archivo_nombre||'—')+'</td><td>'+esc(x.fecha_cumplida||'')+'</td><td>'+esc(x.responsable||'')+'</td></tr>').join('');
  body.innerHTML=
    matPrintBtns(body, exp)+
    matPrintHead(exp,'Índice de carpeta de defensa')+
    '<h3 style="font-size:14px;margin:14px 0 6px">Matriz de riesgo</h3>'+
    '<table><tbody>'+
    '<tr><td><b>Opinión 32-D</b></td><td>'+rl(exp.riesgo_32d)+'</td></tr>'+
    '<tr><td><b>Listado 69-B</b></td><td>'+rl(exp.riesgo_69b)+'</td></tr>'+
    '<tr><td><b>REPSE</b></td><td>'+rl(exp.riesgo_repse)+'</td></tr>'+
    '</tbody></table>'+
    '<h3 style="font-size:14px;margin:14px 0 6px">Cadena de trazabilidad</h3>'+
    '<table><thead><tr><th>#</th><th>Eslabón</th><th>Referencia</th><th>Fecha</th></tr></thead><tbody>'+
    (cadRows||'<tr><td colspan=4 class="empty">Sin cadena</td></tr>')+'</tbody></table>'+
    '<h3 style="font-size:14px;margin:14px 0 6px">Evidencias documentales</h3>'+
    '<table><thead><tr><th>Evidencia</th><th>Archivo</th><th>Fecha cumplida</th><th>Responsable</th></tr></thead><tbody>'+
    (evRows||'<tr><td colspan=4 class="empty">Sin evidencias</td></tr>')+'</tbody></table>'+
    '<div style="margin-top:20px;font-size:12px;color:#555;border-top:1px solid #ccc;padding-top:8px">Documentos resguardados en el expediente digital PRM 360.</div>';
  matPrintBind(body, exp);
}

async function matKit(body){
  body.innerHTML='<div class="loader">Cargando…</div>';
  const {data,error}=await sb.from('kit_mensual').select('id,cliente,cliente_rfc,periodo,entregado,fecha_entrega,medio,notas').order('periodo',{ascending:false}).limit(200);
  if(error) throw error;
  const medioLbl={correo:'Correo',portal:'Portal',fisico:'Físico'};
  const rows=(data||[]).map(x=>
    '<tr><td><b>'+esc(x.periodo||'')+'</b></td><td>'+esc(x.cliente||'')+'</td><td>'+esc(x.cliente_rfc||'')+'</td><td>'+esc(medioLbl[x.medio]||x.medio||'')+'</td>'+
    '<td><span class="tag '+(x.entregado?'on':'off')+'">'+(x.entregado?'Sí':'No')+'</span></td><td>'+esc(x.fecha_entrega||'')+'</td></tr>'
  ).join('');
  body.innerHTML=
    '<div class="pgsub">'+((data&&data.length)||0)+' kits (máx 200) · entrega mensual de soporte de materialidad al cliente</div>'+
    '<div class="card"><h3>Registrar kit mensual (art. 27-V LISR)</h3><div class="body"><div class="frm">'+
      '<label>Cliente<input id="kt_cliente" style="min-width:220px"></label>'+
      '<label>RFC<input id="kt_rfc" maxlength="13"></label>'+
      '<label>Periodo<input id="kt_per" type="month"></label>'+
      '<label>Medio<select id="kt_medio"><option value="correo">Correo</option><option value="portal">Portal</option><option value="fisico">Físico</option></select></label>'+
      '<label>Entregado<input id="kt_ent" type="checkbox" style="width:18px;height:18px"></label>'+
      '<label>Notas<input id="kt_notas" style="min-width:200px"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="kt_save">Guardar kit</button> <span id="kt_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Periodo</th><th>Cliente</th><th>RFC</th><th>Medio</th><th>Entregado</th><th>Fecha entrega</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin kits registrados</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('kt_save').onclick=async()=>{
    const msg=g('kt_msg');
    const cliente=g('kt_cliente').value.trim(), rfc=g('kt_rfc').value.trim(), per=g('kt_per').value, notas=g('kt_notas').value.trim();
    const entregado=g('kt_ent').checked;
    if(!cliente||!per){ msg.textContent='Cliente y periodo son obligatorios.'; msg.style.color='var(--danger)'; return; }
    g('kt_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('kit_mensual').insert({cliente:cliente, cliente_rfc:rfc||null, periodo:per, medio:g('kt_medio').value, entregado:entregado, fecha_entrega:entregado?matHoy():null, notas:notas||null});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('kt_save').disabled=false; return; }
    matKit(body);
  };
}

/* ===== Cuentas por pagar (Tesorería) ===== */
async function viewCxP(c){
  const {data,error}=await sb.from('cuentas_por_pagar').select('id,proveedor,concepto,empresa,monto,fecha_factura,fecha_vence,estatus,fecha_pago').order('fecha_vence',{ascending:true,nullsFirst:false}).limit(200);
  if(error) throw error;
  const lista=data||[]; const hoy=new Date().toISOString().slice(0,10);
  const totPend=lista.filter(x=>x.estatus!=='pagado').reduce((s,x)=>s+(Number(x.monto)||0),0);
  const vencidas=lista.filter(x=>x.fecha_vence&&String(x.fecha_vence).slice(0,10)<hoy&&x.estatus!=='pagado').length;
  const pagadas=lista.filter(x=>x.estatus==='pagado').length;
  const tagEst=e=> e==='pagado'?'on':(e==='programado'?'repse':'off');
  const rows=lista.map(x=>{
    const d=matDias(x.fecha_vence);
    let extra='';
    if(d!==null&&x.estatus!=='pagado'){ extra=d<0?'<div style="font-size:11px;color:#c0392b;font-weight:700">vencido hace '+(-d)+' d</div>':'<div style="font-size:11px;color:'+(d<=7?'#e67e22':'#2f9e6b')+'">en '+d+' d</div>'; }
    const btns=(x.estatus==='pendiente'?'<button class="mini cxp-prog" data-id="'+x.id+'">Programar</button> ':'')+
      (x.estatus!=='pagado'?'<button class="mini cxp-pay" data-id="'+x.id+'">Pagar</button>':'');
    return '<tr><td><b>'+esc(x.proveedor||'')+'</b></td><td>'+esc(x.concepto||'')+'</td><td>'+esc(x.empresa||'')+'</td><td class="num-r">'+mny(x.monto)+'</td><td>'+esc(x.fecha_vence||'—')+extra+'</td><td><span class="tag '+tagEst(x.estatus)+'">'+esc(x.estatus||'')+'</span></td><td>'+btns+'</td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">Cuentas por pagar</h1><div class="pgsub">'+lista.length+' cuentas (máx 200) · programa y registra pagos a proveedores</div>'+
    '<div class="kpis">'+
      tile(mny(totPend),'Total pendiente','var(--navy)')+
      tile(vencidas,'Vencidas',vencidas>0?'#c0392b':'var(--ok)')+
      tile(pagadas,'Pagadas','var(--ok)')+
    '</div>'+
    '<div class="card"><h3>Nueva cuenta por pagar</h3><div class="body"><div class="frm">'+
      '<label>Proveedor<input id="cxp_prov" style="min-width:200px"></label>'+
      '<label>Concepto<input id="cxp_conc" style="min-width:220px"></label>'+
      '<label>Empresa<input id="cxp_emp"></label>'+
      '<label>Monto<input id="cxp_monto" type="number" step="0.01" min="0" style="width:120px"></label>'+
      '<label>Fecha factura<input id="cxp_ff" type="date"></label>'+
      '<label>Vence<input id="cxp_fv" type="date"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="cxp_save">Guardar</button> <span id="cxp_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Proveedor</th><th>Concepto</th><th>Empresa</th><th class="num-r">Monto</th><th>Vence</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=7 class="empty">Sin cuentas por pagar</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('cxp_save').onclick=async()=>{
    const msg=g('cxp_msg');
    const prov=g('cxp_prov').value.trim(), conc=g('cxp_conc').value.trim(), monto=Number(g('cxp_monto').value);
    if(!prov||!(monto>0)){ msg.textContent='Proveedor y monto mayor a cero son obligatorios.'; msg.style.color='var(--danger)'; return; }
    g('cxp_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('cuentas_por_pagar').insert({proveedor:prov, concepto:conc||null, empresa:g('cxp_emp').value.trim()||null, monto:monto, fecha_factura:g('cxp_ff').value||null, fecha_vence:g('cxp_fv').value||null, estatus:'pendiente'});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('cxp_save').disabled=false; return; }
    viewCxP(c);
  };
  c.querySelectorAll('button.cxp-prog').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('cuentas_por_pagar').update({estatus:'programado'}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    viewCxP(c);
  });
  c.querySelectorAll('button.cxp-pay').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('cuentas_por_pagar').update({estatus:'pagado', fecha_pago:new Date().toISOString().slice(0,10)}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    viewCxP(c);
  });
}

/* ===== Bitácora de firmas (Jurídico) ===== */
async function viewBitacoraFirmas(c){
  const {data,error}=await sb.from('bitacora_firmas').select('id,documento,tipo,empresa,cliente,firmante,cargo,fecha_firma,medio,folio,estatus').order('fecha_firma',{ascending:false}).limit(200);
  if(error) throw error;
  const lista=data||[];
  const rows=lista.map(x=>{
    const quien=esc(x.firmante||'')+(x.cargo?' <span style="color:var(--muted);font-size:11px">('+esc(x.cargo)+')</span>':'');
    const empCli=[x.empresa,x.cliente].filter(Boolean).map(esc).join(' / ');
    return '<tr><td>'+esc(x.fecha_firma||'')+'</td><td><b>'+esc(x.documento||'')+'</b></td><td>'+esc(x.tipo||'')+'</td><td>'+empCli+'</td><td>'+quien+'</td><td><span class="tag '+(x.medio==='mifiel'?'repse':'off')+'">'+esc(x.medio||'')+'</span></td><td>'+esc(x.folio||'')+'</td><td><span class="tag '+(x.estatus==='firmado'?'on':'off')+'">'+esc(x.estatus||'')+'</span></td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">Bitácora de firmas</h1><div class="pgsub">'+lista.length+' firmas registradas (máx 200) · control de documentos firmados</div>'+
    '<div class="card"><h3>Registrar firma</h3><div class="body"><div class="frm">'+
      '<label>Documento<input id="bf_doc" style="min-width:220px"></label>'+
      '<label>Tipo<input id="bf_tipo"></label>'+
      '<label>Empresa<input id="bf_emp"></label>'+
      '<label>Cliente<input id="bf_cli"></label>'+
      '<label>Firmante<input id="bf_fir" style="min-width:180px"></label>'+
      '<label>Cargo<input id="bf_cargo"></label>'+
      '<label>Fecha firma<input id="bf_fecha" type="date"></label>'+
      '<label>Medio<select id="bf_medio"><option value="autografa">Autógrafa</option><option value="mifiel">MiFiel</option><option value="otro">Otro</option></select></label>'+
      '<label>Folio<input id="bf_folio"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="bf_save">Guardar</button> <span id="bf_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Fecha</th><th>Documento</th><th>Tipo</th><th>Empresa/Cliente</th><th>Firmante</th><th>Medio</th><th>Folio</th><th>Estatus</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=8 class="empty">Sin firmas registradas</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('bf_save').onclick=async()=>{
    const msg=g('bf_msg');
    const doc=g('bf_doc').value.trim(), fir=g('bf_fir').value.trim();
    if(!doc||!fir){ msg.textContent='Documento y firmante son obligatorios.'; msg.style.color='var(--danger)'; return; }
    g('bf_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('bitacora_firmas').insert({documento:doc, tipo:g('bf_tipo').value.trim()||null, empresa:g('bf_emp').value.trim()||null, cliente:g('bf_cli').value.trim()||null, firmante:fir, cargo:g('bf_cargo').value.trim()||null, fecha_firma:g('bf_fecha').value||new Date().toISOString().slice(0,10), medio:g('bf_medio').value, folio:g('bf_folio').value.trim()||null, estatus:'firmado'});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('bf_save').disabled=false; return; }
    viewBitacoraFirmas(c);
  };
}

/* ===== Validación + KYC (Vinculación) ===== */
async function viewKyc(c){
  const {data,error}=await sb.from('kyc_validaciones').select('id,cliente,cliente_rfc,csf,opinion_32d,lista_69b,lista_69,beneficiario_controlador,fecha_validacion,vigencia,resultado').order('creado_en',{ascending:false}).limit(200);
  if(error) throw error;
  const lista=data||[];
  const rojo='<span class="tag" style="background:#c0392b;color:#fff">';
  const t32=v=> v==='positiva'?'<span class="tag on">positiva</span>':(v==='negativa'?rojo+'negativa</span>':'<span class="tag repse">'+esc(v||'pendiente')+'</span>');
  const t69b=v=> v==='limpio'?'<span class="tag on">limpio</span>':(v==='definitivo'?rojo+'definitivo</span>':(v==='presunto'?'<span class="tag off">presunto</span>':'<span class="tag repse">'+esc(v||'pendiente')+'</span>'));
  const t69=v=> v==='limpio'?'<span class="tag on">limpio</span>':(v==='listado'?rojo+'listado</span>':'<span class="tag repse">'+esc(v||'pendiente')+'</span>');
  const tRes=v=> v==='aprobado'?'on':(v==='rechazado'?'off':'repse');
  const rows=lista.map(x=>
    '<tr><td><b>'+esc(x.cliente||'')+'</b></td><td>'+esc(x.cliente_rfc||'')+'</td><td>'+(x.csf?'Sí':'No')+'</td><td>'+t32(x.opinion_32d)+'</td><td>'+t69b(x.lista_69b)+'</td><td>'+t69(x.lista_69)+'</td><td>'+(x.beneficiario_controlador?'Sí':'No')+'</td><td>'+esc(x.vigencia||'')+'</td><td><span class="tag '+tRes(x.resultado)+'">'+esc(x.resultado||'pendiente')+'</span></td></tr>'
  ).join('');
  c.innerHTML='<h1 class="pg">Validación + KYC</h1><div class="pgsub">Regla de oro: no se timbra sin expediente verificado.</div>'+
    '<div class="card"><h3>Nueva validación</h3><div class="body"><div class="frm">'+
      '<label>Cliente<input id="ky_cli" style="min-width:220px"></label>'+
      '<label>RFC<input id="ky_rfc" maxlength="13"></label>'+
      '<label>CSF verificada<input id="ky_csf" type="checkbox" style="width:18px;height:18px"></label>'+
      '<label>Opinión 32-D<select id="ky_32d"><option value="pendiente">pendiente</option><option value="positiva">positiva</option><option value="negativa">negativa</option></select></label>'+
      '<label>Lista 69-B<select id="ky_69b"><option value="pendiente">pendiente</option><option value="limpio">limpio</option><option value="presunto">presunto</option><option value="definitivo">definitivo</option></select></label>'+
      '<label>Lista 69<select id="ky_69"><option value="pendiente">pendiente</option><option value="limpio">limpio</option><option value="listado">listado</option></select></label>'+
      '<label>Beneficiario controlador (32-B)<input id="ky_ben" type="checkbox" style="width:18px;height:18px"></label>'+
      '<label>Vigencia<input id="ky_vig" type="date"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="ky_save">Guardar</button> <span id="ky_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><h3>Validaciones ('+lista.length+')</h3><table><thead><tr><th>Cliente</th><th>RFC</th><th>CSF</th><th>32-D</th><th>69-B</th><th>69</th><th>Benef.</th><th>Vigencia</th><th>Resultado</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=9 class="empty">Sin validaciones</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('ky_save').onclick=async()=>{
    const msg=g('ky_msg');
    const cli=g('ky_cli').value.trim(), rfc=g('ky_rfc').value.trim();
    if(!cli){ msg.textContent='El cliente es obligatorio.'; msg.style.color='var(--danger)'; return; }
    const csf=g('ky_csf').checked, o32=g('ky_32d').value, l69b=g('ky_69b').value, l69=g('ky_69').value;
    let resultado='pendiente';
    if(o32==='negativa'||l69b==='definitivo') resultado='rechazado';
    else if(csf&&o32==='positiva'&&l69b==='limpio'&&l69==='limpio') resultado='aprobado';
    g('ky_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('kyc_validaciones').insert({cliente:cli, cliente_rfc:rfc||null, csf:csf, opinion_32d:o32, lista_69b:l69b, lista_69:l69, beneficiario_controlador:g('ky_ben').checked, fecha_validacion:new Date().toISOString().slice(0,10), vigencia:g('ky_vig').value||null, resultado:resultado});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('ky_save').disabled=false; return; }
    viewKyc(c);
  };
}

/* ===== Calendario fiscal ===== */
async function viewCalFiscal(c){
  const {data,error}=await sb.from('calendario_fiscal').select('id,fecha,obligacion,aplica_a,tipo,estatus').order('fecha',{ascending:true}).limit(300);
  if(error) throw error;
  const lista=data||[]; const hoy=new Date().toISOString().slice(0,10);
  const prox7=lista.filter(x=>{const d=matDias(x.fecha); return x.estatus==='pendiente'&&d!==null&&d>=0&&d<=7;}).length;
  const vencSin=lista.filter(x=>x.fecha&&String(x.fecha).slice(0,10)<hoy&&x.estatus==='pendiente').length;
  const present=lista.filter(x=>x.estatus==='presentado').length;
  const tagEst=e=> e==='presentado'?'on':(e==='vencido'?'off':'repse');
  const rows=lista.map(x=>{
    const d=matDias(x.fecha);
    let dias='—';
    if(d!==null){ dias=d<0?'<span style="color:#c0392b;font-weight:700">vencido hace '+(-d)+' d</span>':'<span style="color:'+(d<=7?'#e67e22':'#2f9e6b')+'">en '+d+' d</span>'; }
    const btn=x.estatus!=='presentado'?'<button class="mini cf-pres" data-id="'+x.id+'">Presentado</button>':'';
    return '<tr><td>'+esc(x.fecha||'')+'</td><td><b>'+esc(x.obligacion||'')+'</b></td><td>'+esc(x.aplica_a||'')+'</td><td>'+dias+'</td><td><span class="tag '+tagEst(x.estatus)+'">'+esc(x.estatus||'')+'</span></td><td>'+btn+'</td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">Calendario fiscal</h1><div class="pgsub">'+lista.length+' obligaciones (máx 300) · declaraciones y pagos por vencer</div>'+
    '<div class="kpis">'+
      tile(prox7,'Próximos 7 días',prox7>0?'#e67e22':'var(--ok)')+
      tile(vencSin,'Vencidas sin presentar',vencSin>0?'#c0392b':'var(--ok)')+
      tile(present,'Presentadas','var(--ok)')+
    '</div>'+
    '<div class="card"><h3>Nueva obligación</h3><div class="body"><div class="frm">'+
      '<label>Fecha<input id="cf_fecha" type="date"></label>'+
      '<label>Obligación<input id="cf_obl" style="min-width:260px"></label>'+
      '<label>Aplica a<input id="cf_apl" style="min-width:180px"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="cf_save">Guardar</button> <span id="cf_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Fecha</th><th>Obligación</th><th>Aplica a</th><th>Días</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin obligaciones registradas</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('cf_save').onclick=async()=>{
    const msg=g('cf_msg');
    const fecha=g('cf_fecha').value, obl=g('cf_obl').value.trim();
    if(!fecha||!obl){ msg.textContent='Fecha y obligación son obligatorias.'; msg.style.color='var(--danger)'; return; }
    g('cf_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('calendario_fiscal').insert({fecha:fecha, obligacion:obl, aplica_a:g('cf_apl').value.trim()||null, estatus:'pendiente'});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('cf_save').disabled=false; return; }
    viewCalFiscal(c);
  };
  c.querySelectorAll('button.cf-pres').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('calendario_fiscal').update({estatus:'presentado'}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    viewCalFiscal(c);
  });
}

/* ===== Importador de reportes (Administración) ===== */
async function viewImportador(c){
  const IMP_DEFS={
    cobranza:{label:'Cartera de facturas → Cobranza', table:'cobranza', cols:['cliente','detalle','monto','dias_vencido','estatus']},
    incidencias:{label:'Incidencias → Trabajadores', table:'trabajador_incidencias', cols:['trabajador_nss','tipo','ramo','fecha_inicio','fecha_fin','dias','folio']},
    gastos:{label:'Gastos → Gastos y costeo', table:'gastos', cols:['fecha','concepto','monto','tipo','proveedor','empresa_rfc','folio']}
  };
  c.innerHTML='<h1 class="pg">Importador de reportes</h1><div class="pgsub">Carga masiva desde Excel o CSV hacia los módulos de PRM 360</div>'+
    '<div class="card"><h3>Importar archivo</h3><div class="body">'+
    '<div style="font-size:12.5px;color:var(--muted);margin-bottom:8px">Sube un Excel/CSV y elige a qué módulo cargar. Descarga la plantilla para ver las columnas mínimas.</div>'+
    '<div class="frm">'+
      '<label>Destino<select id="imp_tipo">'+Object.keys(IMP_DEFS).map(k=>'<option value="'+k+'">'+IMP_DEFS[k].label+'</option>').join('')+'</select></label>'+
    '</div>'+
    '<div style="margin-top:8px"><button class="btn2 ghost" id="imp_tpl">⬇ Plantilla</button> <button class="btn2" id="imp_pick">📄 Elegir archivo</button>'+
    '<input type="file" id="imp_file" accept=".xlsx,.xls,.csv" style="display:none">'+
    ' <span id="imp_msg" style="font-size:12px;margin-left:8px"></span></div>'+
    '</div></div>'+
    '<div id="imp_prev"></div>';
  const g=id=>document.getElementById(id);
  let parsed=[]; let parsedTipo='';
  g('imp_tpl').onclick=()=>{
    const tipo=g('imp_tipo').value, def=IMP_DEFS[tipo];
    const NL=String.fromCharCode(10);
    const blob=new Blob([def.cols.join(',')+NL],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='plantilla_'+tipo+'.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
  };
  g('imp_pick').onclick=()=>g('imp_file').click();
  g('imp_file').onchange=async(ev)=>{
    const f=ev.target.files[0]; if(!f) return;
    const msg=g('imp_msg'); msg.textContent='Leyendo archivo…'; msg.style.color='var(--muted)';
    try{
      const buf=await f.arrayBuffer();
      const wb=XLSX.read(buf,{type:'array',cellDates:true});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const raw=XLSX.utils.sheet_to_json(ws,{defval:''});
      const tipo=g('imp_tipo').value, def=IMP_DEFS[tipo];
      const norm=v=>{ if(v instanceof Date) return v.toISOString().slice(0,10); if(typeof v==='string') return v.trim(); return v; };
      parsed=raw.map(r=>{
        const low={}; Object.keys(r).forEach(k=>{ low[String(k).trim().toLowerCase()]=norm(r[k]); });
        const o={}; def.cols.forEach(cn=>{ const v=low[cn]; o[cn]=(v===undefined?'':v); });
        return o;
      }).filter(o=>def.cols.some(cn=>o[cn]!==''&&o[cn]!==null&&o[cn]!==undefined));
      parsedTipo=tipo;
      ev.target.value='';
      if(!parsed.length){ msg.textContent='No se encontraron filas con datos. Revisa que los encabezados coincidan con la plantilla.'; msg.style.color='var(--danger)'; g('imp_prev').innerHTML=''; return; }
      msg.textContent='';
      const head=def.cols.map(cn=>'<th>'+esc(cn)+'</th>').join('');
      const prevRows=parsed.slice(0,10).map(o=>'<tr>'+def.cols.map(cn=>'<td>'+esc(o[cn])+'</td>').join('')+'</tr>').join('');
      g('imp_prev').innerHTML='<div class="card"><h3>Vista previa · '+parsed.length+' registro(s) — '+esc(def.label)+'</h3>'+
        '<table><thead><tr>'+head+'</tr></thead><tbody>'+prevRows+'</tbody></table>'+
        (parsed.length>10?'<div style="font-size:12px;color:var(--muted);margin-top:6px">Mostrando 10 de '+parsed.length+'</div>':'')+
        '<div style="margin-top:10px"><button class="btn2" id="imp_load">Cargar '+parsed.length+' registros</button> <span id="imp_load_msg" style="font-size:12px;margin-left:8px"></span></div></div>';
      g('imp_load').onclick=async()=>{
        const lm=g('imp_load_msg'); const btn=g('imp_load');
        btn.disabled=true; lm.textContent='Preparando carga…'; lm.style.color='var(--muted)';
        try{
          let nssMap={};
          if(parsedTipo==='incidencias'){
            lm.textContent='Resolviendo trabajadores por NSS…';
            const {data:tr,error:te}=await sb.from('trabajadores').select('id,nss');
            if(te) throw te;
            (tr||[]).forEach(t=>{ if(t.nss) nssMap[String(t.nss).trim()]=t.id; });
          }
          const payloads=parsed.map(o=>{
            if(parsedTipo==='cobranza') return {cliente:String(o.cliente||'').trim()||null, detalle:String(o.detalle||'').trim()||null, monto:Number(o.monto)||0, dias_vencido:parseInt(o.dias_vencido,10)||0, estatus:String(o.estatus||'').trim()||'pendiente'};
            if(parsedTipo==='incidencias'){ const nss=String(o.trabajador_nss||'').trim(); return {trabajador_id:(nss&&nssMap[nss])?nssMap[nss]:null, tipo:String(o.tipo||'').trim()||null, ramo:String(o.ramo||'').trim()||null, fecha_inicio:o.fecha_inicio||null, fecha_fin:o.fecha_fin||null, dias:parseInt(o.dias,10)||0, folio:String(o.folio||'').trim()||null}; }
            return {fecha:o.fecha||null, concepto:String(o.concepto||'').trim()||null, monto:Number(o.monto)||0, tipo:String(o.tipo||'').trim()||null, empresa_rfc:String(o.empresa_rfc||'').trim()||null, folio:String(o.folio||'').trim()||null, proveedor:String(o.proveedor||'').trim()||null};
          });
          const tabla=IMP_DEFS[parsedTipo].table;
          let ok=0, mal=0; const errores=[];
          for(let i=0;i<payloads.length;i+=100){
            const batch=payloads.slice(i,i+100);
            lm.textContent='Cargando '+Math.min(i+batch.length,payloads.length)+' de '+payloads.length+'…';
            const {error:be}=await sb.from(tabla).insert(batch);
            if(be){ mal+=batch.length; errores.push(be.message); } else ok+=batch.length;
          }
          lm.textContent='✔ '+ok+' cargados, '+mal+' con error'+(errores.length?(' · '+errores[0]):'');
          lm.style.color=mal>0?'var(--danger)':'var(--ok)';
          if(mal===0) btn.textContent='Carga completada';
          else btn.disabled=false;
        }catch(err){
          lm.textContent='Error al cargar: '+(err.message||err); lm.style.color='var(--danger)'; btn.disabled=false;
        }
      };
    }catch(err){
      msg.textContent='No se pudo leer el archivo: '+(err.message||err)+'. Verifica que sea un Excel o CSV válido.'; msg.style.color='var(--danger)';
      g('imp_prev').innerHTML='';
    }
  };
}

/* ===== Solicitud de servicio (PDF / editable) · Comercial ===== */
async function viewSolicitudPdf(c){
  const g=id=>document.getElementById(id);
  const hoy=new Date().toISOString().slice(0,10);
  c.innerHTML='<h1 class="pg">Solicitud (PDF / editable)</h1>'+
    '<div class="pgsub">Captura la solicitud de servicio, guárdala y genera el PDF con membrete.</div>'+
    '<div class="card"><h3>Solicitud de servicio / cotización</h3><div class="body"><div class="frm">'+
      '<label>Fecha<input id="sp_fecha" type="date" value="'+hoy+'"></label>'+
      '<label>Empresa solicitante<input id="sp_emp" style="min-width:240px"></label>'+
      '<label>RFC<input id="sp_rfc" maxlength="13"></label>'+
      '<label>Contacto<input id="sp_contacto" style="min-width:200px"></label>'+
      '<label>Correo<input id="sp_correo" type="email" style="min-width:200px"></label>'+
      '<label>Teléfono<input id="sp_tel"></label>'+
      '<label>Servicio solicitado<select id="sp_serv"><option>Fiscal</option><option>Contable</option><option>Nómina y timbrado</option><option>REPSE / especializados</option><option>Materialidad</option><option>Jurídico</option><option>Otro</option></select></label>'+
      '<label style="flex:1">Descripción de la solicitud<input id="sp_desc" style="min-width:320px"></label>'+
      '<label style="flex:1">Observaciones<input id="sp_obs" style="min-width:320px"></label>'+
    '</div><div style="margin-top:8px">'+
      '<button class="btn2" id="sp_save">Guardar solicitud</button> '+
      '<button class="btn2 ghost" id="sp_pdf">Generar PDF</button> '+
      '<span id="sp_msg" style="font-size:12px;margin-left:8px"></span>'+
    '</div></div></div>';
  function capturar(){
    return {
      fecha:g('sp_fecha').value||hoy,
      emp:g('sp_emp').value.trim(), rfc:g('sp_rfc').value.trim(),
      contacto:g('sp_contacto').value.trim(), correo:g('sp_correo').value.trim(),
      tel:g('sp_tel').value.trim(), serv:g('sp_serv').value,
      desc:g('sp_desc').value.trim(), obs:g('sp_obs').value.trim()
    };
  }
  g('sp_save').onclick=async()=>{
    const msg=g('sp_msg'); const d=capturar();
    if(!d.emp||!d.desc){ msg.textContent='Empresa solicitante y descripción son obligatorias.'; msg.style.color='var(--danger)'; return; }
    g('sp_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const resumen='Solicitud de servicio · '+d.emp+(d.rfc?' ('+d.rfc+')':'')+' · '+d.serv+' · '+d.desc+
      (d.obs?' · Obs: '+d.obs:'')+(d.contacto?' · Contacto: '+d.contacto:'')+(d.correo?' '+d.correo:'')+(d.tel?' '+d.tel:'')+' · Fecha: '+d.fecha;
    let ok=false, lastErr=null;
    const intentos=[{tipo:'solicitud', descripcion:resumen},{descripcion:resumen}];
    for(let i=0;i<intentos.length;i++){
      try{
        const {error}=await sb.from('solicitudes').insert(intentos[i]);
        if(!error){ ok=true; break; }
        lastErr=error;
      }catch(e){ lastErr=e; }
    }
    g('sp_save').disabled=false;
    if(ok){ msg.style.color='var(--ok)'; msg.textContent='✓ Solicitud guardada.'; }
    else { msg.style.color='var(--danger)'; msg.textContent='No se pudo guardar'+(lastErr&&lastErr.message?(': '+lastErr.message):'.'); }
  };
  g('sp_pdf').onclick=async()=>{
    const d=capturar();
    let n=1;
    try{
      const res=await sb.from('solicitudes').select('id',{count:'exact',head:true});
      if(res&&typeof res.count==='number') n=res.count+1;
    }catch(e){}
    const folio='SOL-'+String(n).padStart(4,'0');
    const fila=(a,b)=>'<tr><td style="width:32%;font-weight:700;color:var(--navy);padding:7px 10px;border:1px solid var(--line)">'+a+'</td><td style="padding:7px 10px;border:1px solid var(--line)">'+esc(b||'—')+'</td></tr>';
    c.innerHTML=
      '<div style="max-width:860px;margin:0 auto;padding:10px">'+
      '<div style="display:flex;gap:8px;margin-bottom:16px" class="no-print">'+
        '<button class="btn2" id="sp_print">🖨 Imprimir</button>'+
        '<button class="btn2 ghost" id="sp_volver">← Volver</button>'+
      '</div>'+
      '<div style="border-bottom:3px solid var(--navy);padding-bottom:12px;margin-bottom:18px">'+
        '<div style="font-size:22px;font-weight:800;color:var(--navy)">PR&amp;M Business Group</div>'+
        '<div style="font-size:14px;color:var(--gold);font-weight:700">Solicitud de servicio</div>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px;font-size:13px">'+
        '<div><b>Folio:</b> '+esc(folio)+'</div><div><b>Fecha:</b> '+esc(d.fecha)+'</div>'+
      '</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:13px">'+
        fila('Empresa solicitante', d.emp)+
        fila('RFC', d.rfc)+
        fila('Contacto', d.contacto)+
        fila('Correo', d.correo)+
        fila('Teléfono', d.tel)+
        fila('Servicio solicitado', d.serv)+
        fila('Descripción de la solicitud', d.desc)+
        fila('Observaciones', d.obs)+
      '</table>'+
      '<div style="margin-top:70px;max-width:340px">'+
        '<div style="border-top:1px solid #333;padding-top:6px;font-size:12px;text-align:center">Nombre y firma del solicitante</div>'+
      '</div>'+
      '<div style="margin-top:26px;font-size:11px;color:var(--muted);border-top:1px solid var(--line);padding-top:10px">Documento generado por PRM 360 · '+esc(d.fecha)+'</div>'+
      '</div>';
    g('sp_print').onclick=function(){ window.print(); };
    g('sp_volver').onclick=function(){ viewSolicitudPdf(c); };
  };
}

/* ===== Control de entregables (Vinculación) ===== */
async function viewEntregables(c){
  const {data,error}=await sb.from('entregables').select('id,cliente,folio,entregable,area,fecha_compromiso,entregado,fecha_entrega,medio').order('fecha_compromiso',{ascending:true,nullsFirst:false}).limit(300);
  if(error) throw error;
  const lista=data||[]; const hoy=new Date().toISOString().slice(0,10);
  const pend=lista.filter(x=>!x.entregado).length;
  const venc=lista.filter(x=>!x.entregado&&x.fecha_compromiso&&String(x.fecha_compromiso).slice(0,10)<hoy).length;
  const entreg=lista.filter(x=>x.entregado).length;
  const rows=lista.map(x=>{
    const d=matDias(x.fecha_compromiso);
    let extra='';
    if(d!==null&&!x.entregado){ extra=d<0?'<div style="font-size:11px;color:#c0392b;font-weight:700">vencido hace '+(-d)+' d</div>':'<div style="font-size:11px;color:'+(d<=7?'#e67e22':'#2f9e6b')+'">en '+d+' d</div>'; }
    const btn=x.entregado?'':'<button class="mini ent-done" data-id="'+x.id+'">Entregar</button>';
    return '<tr><td><b>'+esc(x.cliente||'')+'</b></td><td>'+esc(x.folio||'')+'</td><td>'+esc(x.entregable||'')+'</td><td>'+esc(x.area||'')+'</td><td>'+esc(x.fecha_compromiso||'—')+extra+'</td><td>'+esc(x.medio||'')+'</td><td><span class="tag '+(x.entregado?'on':'off')+'">'+(x.entregado?'entregado':'pendiente')+'</span></td><td>'+btn+'</td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">Control de entregables</h1><div class="pgsub">'+lista.length+' entregables (máx 300) · compromisos con clientes y su entrega</div>'+
    '<div class="kpis">'+
      tile(pend,'Pendientes',pend>0?'#e67e22':'var(--ok)')+
      tile(venc,'Vencidos',venc>0?'#c0392b':'var(--ok)')+
      tile(entreg,'Entregados','var(--ok)')+
    '</div>'+
    '<div class="card"><h3>Nuevo entregable</h3><div class="body"><div class="frm">'+
      '<label>Cliente<input id="en_cli" style="min-width:200px"></label>'+
      '<label>Folio<input id="en_folio"></label>'+
      '<label>Entregable<input id="en_ent" style="min-width:240px"></label>'+
      '<label>Área<select id="en_area"><option>Fiscal</option><option>Contable</option><option>Nómina</option><option>REPSE</option><option>Jurídico</option><option>Otro</option></select></label>'+
      '<label>Fecha compromiso<input id="en_fc" type="date"></label>'+
      '<label>Medio<select id="en_medio"><option value="correo">Correo</option><option value="portal">Portal</option><option value="fisico">Físico</option></select></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="en_save">Guardar</button> <span id="en_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Cliente</th><th>Folio</th><th>Entregable</th><th>Área</th><th>Compromiso</th><th>Medio</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=8 class="empty">Sin entregables</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('en_save').onclick=async()=>{
    const msg=g('en_msg');
    const cli=g('en_cli').value.trim(), ent=g('en_ent').value.trim();
    if(!cli||!ent){ msg.textContent='Cliente y entregable son obligatorios.'; msg.style.color='var(--danger)'; return; }
    g('en_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('entregables').insert({cliente:cli, folio:g('en_folio').value.trim()||null, entregable:ent, area:g('en_area').value, fecha_compromiso:g('en_fc').value||null, medio:g('en_medio').value, entregado:false});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('en_save').disabled=false; return; }
    viewEntregables(c);
  };
  c.querySelectorAll('button.ent-done').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('entregables').update({entregado:true, fecha_entrega:new Date().toISOString().slice(0,10)}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    viewEntregables(c);
  });
}

/* ===== Contraloría (Administración · solo lectura) ===== */
async function viewContraloria(c){
  const hoy=new Date().toISOString().slice(0,10);
  const [tareas,renov,emps,comp,fact,mat,cxp,calf]=await Promise.all([
    sb.from('tareas').select('estatus,prioridad,vence').then(r=>r.data||[]).catch(()=>[]),
    sb.from('renovaciones').select('estatus').then(r=>r.data||[]).catch(()=>[]),
    sb.from('empresas').select('estatus').then(r=>r.data||[]).catch(()=>[]),
    sb.from('compliance_empresa').select('aplica,cumplido').eq('aplica',true).then(r=>r.data||[]).catch(()=>[]),
    sb.from('facturacion_conceptos').select('estatus,total').then(r=>r.data||[]).catch(()=>[]),
    sb.from('materialidad_expedientes').select('estatus,fecha_limite').then(r=>r.data||[]).catch(()=>[]),
    sb.from('cuentas_por_pagar').select('estatus,fecha_vence').then(r=>r.data||[]).catch(()=>[]),
    sb.from('calendario_fiscal').select('estatus,fecha').then(r=>r.data||[]).catch(()=>[])
  ]);
  const cerradas=['cerrada','cancelada','completada'];
  const tPend=tareas.filter(x=>cerradas.indexOf(String(x.estatus||''))<0).length;
  const rVenc=renov.filter(x=>String(x.estatus||'').toLowerCase().indexOf('venc')>=0).length;
  const eAct=emps.filter(x=>x.estatus==='activa').length, eTot=emps.length;
  const cTot=comp.length, cCum=comp.filter(x=>x.cumplido).length, cFal=cTot-cCum;
  const pct=cTot>0?Math.round(cCum*100/cTot):100;
  const fBorr=fact.filter(x=>x.estatus==='borrador').length;
  const mAb=mat.filter(x=>x.estatus==='abierto').length;
  const cxpV=cxp.filter(x=>x.fecha_vence&&String(x.fecha_vence).slice(0,10)<hoy&&x.estatus!=='pagado').length;
  const oVenc=calf.filter(x=>x.fecha&&String(x.fecha).slice(0,10)<hoy&&x.estatus==='pendiente').length;
  const ambar=n=> n>0?'#e67e22':'var(--ok)';
  const exc=[];
  if(tPend>0) exc.push('⚠ '+tPend+' tarea(s) pendientes abiertas — Operación diaria');
  if(rVenc>0) exc.push('⚠ '+rVenc+' renovaciones vencidas — Jurídico');
  if(cFal>0) exc.push('⚠ '+cFal+' obligaciones de compliance sin cumplir ('+pct+'% de cumplimiento) — Compliance');
  if(fBorr>0) exc.push('⚠ '+fBorr+' conceptos de facturación en borrador sin validar — Operaciones');
  if(mAb>0) exc.push('⚠ '+mAb+' expedientes de materialidad abiertos — Operaciones');
  if(cxpV>0) exc.push('⚠ '+cxpV+' cuentas por pagar vencidas — Tesorería');
  if(oVenc>0) exc.push('⚠ '+oVenc+' obligaciones fiscales vencidas — Fiscal');
  const excHtml=exc.length
    ? exc.map(t=>'<div style="padding:8px 4px;border-bottom:1px solid var(--line);font-size:13px">'+t+'</div>').join('')
    : '<div class="empty">Sin excepciones — todo en orden</div>';
  c.innerHTML='<h1 class="pg">Contraloría</h1><div class="pgsub">Estado consolidado del despacho · lectura directa de los módulos</div>'+
    '<div class="kpis">'+
      tile(tPend,'Pendientes abiertos',tPend>10?'#c0392b':ambar(tPend))+
      tile(rVenc,'Renovaciones vencidas',sem(rVenc,'alert'))+
      tile(eAct+'/'+eTot,'Empresas activas','var(--navy)')+
      tile(pct+'%','Cumplimiento',sem(pct,'pct'))+
      tile(fBorr,'Facturación sin validar',ambar(fBorr))+
      tile(mAb,'Materialidad abiertos',ambar(mAb))+
      tile(cxpV,'CxP vencidas',sem(cxpV,'alert'))+
      tile(oVenc,'Obligaciones fiscales vencidas',sem(oVenc,'alert'))+
    '</div>'+
    '<div class="card"><h3>Excepciones que requieren atención</h3><div class="body">'+excHtml+'</div></div>';
}

/* ===== Calendario REPSE (ICSOE / SISUB) ===== */
async function viewCalRepse(c, ftipo, fcuat){
  ftipo=ftipo||''; fcuat=fcuat||'';
  let q=sb.from('repse_informativas').select('id,registro_patronal,tipo,cuatrimestre,anio,estatus,fecha_presentacion,acuse,notas')
    .order('anio').order('cuatrimestre').order('notas').limit(300);
  if(ftipo) q=q.eq('tipo',ftipo);
  if(fcuat) q=q.eq('cuatrimestre',Number(fcuat));
  const {data,error}=await q;
  if(error) throw error;
  const lista=data||[];
  const porP=lista.filter(x=>x.estatus==='por_presentar').length;
  const venc=lista.filter(x=>x.estatus==='vencida_revisar').length;
  const pres=lista.filter(x=>x.estatus==='presentada').length;
  const tagEst=e=> e==='presentada'?'on':(e==='vencida_revisar'?'off':'repse');
  const lblEst=e=> e==='vencida_revisar'?'vencida · revisar':(e==='por_presentar'?'por presentar':e);
  const rows=lista.map(x=>{
    const btn=x.estatus!=='presentada'?'<button class="mini rp-pres" data-id="'+x.id+'">Presentada</button>':'';
    return '<tr><td><b>'+esc(x.notas||'')+'</b></td><td>'+esc(x.registro_patronal||'')+'</td>'+
      '<td><span class="tag repse">'+esc(x.tipo||'')+'</span></td>'+
      '<td>C'+esc(x.cuatrimestre)+' · '+esc(x.anio)+'</td>'+
      '<td><span class="tag '+tagEst(x.estatus)+'">'+esc(lblEst(x.estatus||''))+'</span></td>'+
      '<td>'+esc(x.fecha_presentacion||'—')+'</td>'+
      '<td><input class="rp-acuse" data-id="'+x.id+'" value="'+esc(x.acuse||'')+'" placeholder="Acuse" style="width:130px"></td>'+
      '<td>'+btn+'</td></tr>';
  }).join('');
  const selTipo='<label>Tipo<select id="rp_tipo"><option value="">Todos</option>'+
    '<option value="ICSOE"'+(ftipo==='ICSOE'?' selected':'')+'>ICSOE</option>'+
    '<option value="SISUB"'+(ftipo==='SISUB'?' selected':'')+'>SISUB</option></select></label>';
  const selCuat='<label>Cuatrimestre<select id="rp_cuat"><option value="">Todos</option>'+
    [1,2,3].map(n=>'<option value="'+n+'"'+(String(fcuat)===String(n)?' selected':'')+'>C'+n+'</option>').join('')+'</select></label>';
  c.innerHTML='<h1 class="pg">Calendario REPSE (ICSOE / SISUB)</h1>'+
    '<div class="pgsub">ICSOE (IMSS) y SISUB (Infonavit) cuatrimestrales por empresa REPSE — se siembran automáticamente.</div>'+
    '<div class="kpis">'+
      tile(porP,'Por presentar',porP>0?'#e67e22':'var(--ok)')+
      tile(venc,'Vencidas por revisar',venc>0?'#c0392b':'var(--ok)')+
      tile(pres,'Presentadas','var(--ok)')+
    '</div>'+
    '<div class="card"><div class="body"><div class="frm">'+selTipo+selCuat+'</div></div></div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>RFC</th><th>Tipo</th><th>Cuatrimestre</th><th>Estatus</th><th>Fecha presentación</th><th>Acuse</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=8 class="empty">Sin informativas registradas</td></tr>')+'</tbody></table></div>';
  const rerender=()=>viewCalRepse(c, document.getElementById('rp_tipo').value, document.getElementById('rp_cuat').value);
  document.getElementById('rp_tipo').onchange=rerender;
  document.getElementById('rp_cuat').onchange=rerender;
  c.querySelectorAll('input.rp-acuse').forEach(i=>i.onblur=async()=>{
    const {error:e}=await sb.from('repse_informativas').update({acuse:i.value.trim()||null}).eq('id',i.dataset.id);
    if(e) alert('Error: '+e.message);
  });
  c.querySelectorAll('button.rp-pres').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('repse_informativas').update({estatus:'presentada',fecha_presentacion:matHoy()}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    rerender();
  });
}

/* ===== Checklist de documentos (catálogo editable) ===== */
async function viewChecklistDocs(c){
  comboTabs(c,'Checklist de documentos',[
    {label:'Expediente (Vinculación)',fn:function(b){ chkDocsAmbito(b,'expediente'); }},
    {label:'Cotización (Comercial)',fn:function(b){ chkDocsAmbito(b,'cotizacion'); }}
  ]);
}
async function chkDocsAmbito(body, ambito){
  body.innerHTML='<div class="loader">Cargando…</div>';
  const {data,error}=await sb.from('checklist_documentos').select('id,orden,documento,obligatorio,activo').eq('ambito',ambito).eq('activo',true).order('orden');
  if(error){ body.innerHTML='<div class="empty">Error: '+esc(error.message)+'</div>'; return; }
  const lista=data||[];
  const rows=lista.map(x=>'<tr><td>'+(x.orden!=null?x.orden:'')+'</td>'+
    '<td><input class="cd-doc" data-id="'+x.id+'" value="'+esc(x.documento||'')+'" style="min-width:280px;width:100%"></td>'+
    '<td style="text-align:center"><input type="checkbox" class="cd-obl" data-id="'+x.id+'"'+(x.obligatorio?' checked':'')+'></td>'+
    '<td><button class="mini cd-del" data-id="'+x.id+'">Quitar</button></td></tr>').join('');
  body.innerHTML='<div class="pgsub">Catálogo editable — ajústalo a tu checklist oficial; los cambios aplican de inmediato.</div>'+
    '<div class="card"><table><thead><tr><th>#</th><th>Documento</th><th>Obligatorio</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Sin documentos en este checklist</td></tr>')+'</tbody></table>'+
    '<div class="body"><div class="frm"><label>Nuevo documento<input id="cd_new" style="min-width:280px"></label></div>'+
    '<div style="margin-top:8px"><button class="btn2" id="cd_add">➕ Agregar</button> <span id="cd_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>';
  body.querySelectorAll('input.cd-doc').forEach(i=>i.onblur=async()=>{
    const v=i.value.trim(); if(!v) return;
    const {error:e}=await sb.from('checklist_documentos').update({documento:v}).eq('id',i.dataset.id);
    if(e) alert('Error: '+e.message);
  });
  body.querySelectorAll('input.cd-obl').forEach(i=>i.onchange=async()=>{
    const {error:e}=await sb.from('checklist_documentos').update({obligatorio:i.checked}).eq('id',i.dataset.id);
    if(e) alert('Error: '+e.message);
  });
  body.querySelectorAll('button.cd-del').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('checklist_documentos').update({activo:false}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    chkDocsAmbito(body, ambito);
  });
  document.getElementById('cd_add').onclick=async()=>{
    const msg=document.getElementById('cd_msg');
    const v=document.getElementById('cd_new').value.trim();
    if(!v){ msg.textContent='Escribe el nombre del documento.'; msg.style.color='var(--danger)'; return; }
    const next=lista.reduce((m,x)=>Math.max(m,Number(x.orden)||0),0)+1;
    msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('checklist_documentos').insert({ambito:ambito, orden:next, documento:v, obligatorio:true, activo:true});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; return; }
    chkDocsAmbito(body, ambito);
  };
}

/* ===== Reportes ejecutivos ===== */
function repLetterhead(titulo){
  const f=new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'});
  return '<div style="text-align:center;margin-bottom:16px">'+
    '<div style="font-size:18px;font-weight:800;letter-spacing:1px">PR&amp;M Business Group</div>'+
    '<div style="font-size:14px;margin-top:2px">'+titulo+'</div>'+
    '<div style="font-size:12px;color:#555;margin-top:2px">'+f+'</div></div>';
}
function repBtns(){
  return '<div class="no-print" style="margin-bottom:12px;display:flex;gap:8px">'+
    '<button class="btn2" id="rep_print">🖨 Imprimir</button>'+
    '<button class="btn2 ghost" id="rep_volver">← Volver</button></div>';
}
function repBind(c){
  document.getElementById('rep_print').onclick=()=>window.print();
  document.getElementById('rep_volver').onclick=()=>viewReportes(c);
}
async function viewReportes(c){
  c.innerHTML='<h1 class="pg">Reportes ejecutivos</h1><div class="pgsub">Reportes imprimibles para juntas de dirección y seguimiento semanal</div>'+
    '<div class="card"><h3>Generar reporte</h3><div class="body" style="display:flex;gap:8px;flex-wrap:wrap">'+
    '<button class="btn2" id="rep_sem">📄 Reporte ejecutivo semanal</button>'+
    '<button class="btn2" id="rep_dir">📄 Reporte de dirección (KPIs)</button>'+
    '</div></div>';
  document.getElementById('rep_sem').onclick=()=>repSemanal(c);
  document.getElementById('rep_dir').onclick=()=>repDireccion(c);
}
async function repSemanal(c){
  c.innerHTML='<div class="loader">Generando reporte…</div>';
  const hoy=new Date().toISOString().slice(0,10);
  const [tareas,renov,emps,comp,fact,mat,cxp,calf]=await Promise.all([
    sb.from('tareas').select('estatus,prioridad,vence').then(r=>r.data||[]).catch(()=>[]),
    sb.from('renovaciones').select('estatus').then(r=>r.data||[]).catch(()=>[]),
    sb.from('empresas').select('estatus').then(r=>r.data||[]).catch(()=>[]),
    sb.from('compliance_empresa').select('aplica,cumplido').eq('aplica',true).then(r=>r.data||[]).catch(()=>[]),
    sb.from('facturacion_conceptos').select('estatus,total').then(r=>r.data||[]).catch(()=>[]),
    sb.from('materialidad_expedientes').select('estatus,fecha_limite').then(r=>r.data||[]).catch(()=>[]),
    sb.from('cuentas_por_pagar').select('estatus,fecha_vence').then(r=>r.data||[]).catch(()=>[]),
    sb.from('calendario_fiscal').select('estatus,fecha').then(r=>r.data||[]).catch(()=>[])
  ]);
  const cerradas=['cerrada','cancelada','completada'];
  const tPend=tareas.filter(x=>cerradas.indexOf(String(x.estatus||''))<0).length;
  const rVenc=renov.filter(x=>String(x.estatus||'').toLowerCase().indexOf('venc')>=0).length;
  const eAct=emps.filter(x=>x.estatus==='activa').length, eTot=emps.length;
  const cTot=comp.length, cCum=comp.filter(x=>x.cumplido).length, cFal=cTot-cCum;
  const pct=cTot>0?Math.round(cCum*100/cTot):100;
  const fBorr=fact.filter(x=>x.estatus==='borrador').length;
  const mAb=mat.filter(x=>x.estatus==='abierto').length;
  const cxpV=cxp.filter(x=>x.fecha_vence&&String(x.fecha_vence).slice(0,10)<hoy&&x.estatus!=='pagado').length;
  const oVenc=calf.filter(x=>x.fecha&&String(x.fecha).slice(0,10)<hoy&&x.estatus==='pendiente').length;
  const inds=[
    ['Pendientes abiertos',tPend],
    ['Renovaciones vencidas',rVenc],
    ['Empresas activas',eAct+' de '+eTot],
    ['Cumplimiento',pct+'%'],
    ['Facturación sin validar',fBorr],
    ['Expedientes de materialidad abiertos',mAb],
    ['Cuentas por pagar vencidas',cxpV],
    ['Obligaciones fiscales vencidas',oVenc]
  ];
  const exc=[];
  if(tPend>0) exc.push('⚠ '+tPend+' tarea(s) pendientes abiertas — Operación diaria');
  if(rVenc>0) exc.push('⚠ '+rVenc+' renovaciones vencidas — Jurídico');
  if(cFal>0) exc.push('⚠ '+cFal+' obligaciones de compliance sin cumplir ('+pct+'% de cumplimiento) — Compliance');
  if(fBorr>0) exc.push('⚠ '+fBorr+' conceptos de facturación en borrador sin validar — Operaciones');
  if(mAb>0) exc.push('⚠ '+mAb+' expedientes de materialidad abiertos — Operaciones');
  if(cxpV>0) exc.push('⚠ '+cxpV+' cuentas por pagar vencidas — Tesorería');
  if(oVenc>0) exc.push('⚠ '+oVenc+' obligaciones fiscales vencidas — Fiscal');
  c.innerHTML=repBtns()+repLetterhead('Reporte ejecutivo semanal')+
    '<h3 style="font-size:14px;margin:14px 0 6px">Indicadores</h3>'+
    '<table><tbody>'+inds.map(x=>'<tr><td>'+x[0]+'</td><td class="num-r"><b>'+x[1]+'</b></td></tr>').join('')+'</tbody></table>'+
    '<h3 style="font-size:14px;margin:14px 0 6px">Excepciones que requieren atención</h3>'+
    (exc.length
      ? exc.map(t=>'<div style="padding:6px 4px;border-bottom:1px solid #eee;font-size:13px">'+t+'</div>').join('')
      : '<div class="empty">Sin excepciones — todo en orden</div>')+
    '<div style="margin-top:24px;font-size:12px;color:#555">Generado desde PRM 360 · Contraloría</div>';
  repBind(c);
}
async function repDireccion(c){
  c.innerHTML='<div class="loader">Generando reporte…</div>';
  const [empT,empA,repse,cli,trab]=await Promise.all([
    cnt('empresas'), cnt('empresas',[['estatus','activa']]), cnt('empresas',[['repse',true]]),
    cnt('clientes'), cnt('trabajadores',[['estatus','activo']])
  ]);
  const [comp,fact,renov,calf]=await Promise.all([
    sb.from('compliance_empresa').select('aplica,cumplido').eq('aplica',true).then(r=>r.data||[]).catch(()=>[]),
    sb.from('facturacion_conceptos').select('estatus,total').then(r=>r.data||[]).catch(()=>[]),
    sb.from('renovaciones').select('estatus').then(r=>r.data||[]).catch(()=>[]),
    sb.from('calendario_fiscal').select('estatus,fecha').then(r=>r.data||[]).catch(()=>[])
  ]);
  const cTot=comp.length, cCum=comp.filter(x=>x.cumplido).length;
  const pct=cTot>0?Math.round(cCum*100/cTot):100;
  const fSum=fact.reduce((s,x)=>s+(Number(x.total)||0),0);
  const rVenc=renov.filter(x=>String(x.estatus||'').toLowerCase().indexOf('venc')>=0).length;
  const prox7=calf.filter(x=>{const d=matDias(x.fecha); return x.estatus==='pendiente'&&d!==null&&d>=0&&d<=7;}).length;
  const kpis=[
    ['Empresas activas',empA+' / '+empT],
    ['Empresas REPSE',repse],
    ['Clientes',cli],
    ['Trabajadores activos',trab],
    ['Cumplimiento',pct+'%'],
    ['Facturación (conceptos)',fact.length+' · '+mny(fSum)],
    ['Renovaciones vencidas',rVenc],
    ['Obligaciones fiscales próximas 7 días',prox7]
  ];
  c.innerHTML=repBtns()+repLetterhead('Reporte de dirección (KPIs)')+
    '<table><thead><tr><th>Indicador</th><th class="num-r">Valor</th></tr></thead><tbody>'+
    kpis.map(x=>'<tr><td>'+x[0]+'</td><td class="num-r"><b>'+x[1]+'</b></td></tr>').join('')+
    '</tbody></table>'+
    '<div style="margin-top:24px;font-size:12px;color:#555">Generado desde PRM 360 · Administración</div>';
  repBind(c);
}

/* ===== Costeo por cliente (prorrateo por ingresos) ===== */
async function viewCosteo(c){
  const {data,error}=await sb.rpc('costeo_por_cliente');
  if(error) throw error;
  const d=data||{};
  const gastos=Number(d.gastos_totales)||0, ing=Number(d.ingresos_totales)||0;
  const margen=ing-gastos;
  const clientes=Array.isArray(d.clientes)?d.clientes:[];
  const rows=clientes.map(x=>'<tr><td><b>'+esc(x.razon_social||'')+'</b></td>'+
    '<td class="num-r">'+mny(x.honorario)+'</td>'+
    '<td class="num-r">'+mny(x.costo_asignado)+'</td>'+
    '<td class="num-r"'+(Number(x.margen)<0?' style="color:#c0392b;font-weight:700"':'')+'>'+mny(x.margen)+'</td></tr>').join('');
  c.innerHTML='<h1 class="pg">Costeo por cliente (prorrateo por ingresos)</h1>'+
    '<div class="pgsub">Fase 2 del costeo: los gastos se prorratean entre clientes según su peso en los ingresos.</div>'+
    '<div class="kpis">'+
      tile(mny(gastos),'Gastos totales','var(--navy)')+
      tile(mny(ing),'Ingresos (honorarios activos)','var(--teal)')+
      tile(mny(margen),'Margen global',margen>0?'var(--ok)':(margen<0?'#c0392b':'var(--navy)'))+
    '</div>'+
    (clientes.length
      ? '<div class="card"><table><thead><tr><th>Cliente</th><th class="num-r">Honorario</th><th class="num-r">Costo asignado</th><th class="num-r">Margen</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      : '<div class="empty">Aún sin servicios activos capturados — en cuanto Captura registre honorarios y Gastos tenga movimientos, este reporte se calcula solo.</div>');
}

/* ===== Biblioteca de documentos (plantillas / presentaciones / organigrama) ===== */
async function viewBiblioteca(c, seccion, titulo){
  const {data,error}=await sb.from('biblioteca').select('id,nombre,descripcion,archivo_path,archivo_nombre,creado_en').eq('seccion',seccion).order('creado_en',{ascending:false}).limit(300);
  if(error) throw error;
  const rows=(data||[]).map(x=>'<tr><td><b>'+esc(x.nombre||'')+'</b></td><td>'+esc(x.descripcion||'')+'</td>'+
    '<td>'+(x.archivo_path?'<a href="#" class="bib-dl" data-path="'+esc(x.archivo_path)+'">📎 '+esc(x.archivo_nombre||'archivo')+'</a>':'—')+'</td>'+
    '<td>'+esc((x.creado_en||'').slice(0,10))+'</td></tr>').join('');
  c.innerHTML='<h1 class="pg">'+esc(titulo)+'</h1>'+
    '<div class="pgsub">Biblioteca de documentos del despacho — sube y consulta desde aquí.</div>'+
    '<div class="card"><h3>Subir documento</h3><div class="body"><div class="frm">'+
      '<label>Nombre<input id="bib_nombre" placeholder="Nombre del documento"></label>'+
      '<label>Descripción<input id="bib_desc" placeholder="Descripción (opcional)"></label>'+
      '<label>&nbsp;<button class="btn2" id="bib_btn">📄 Subir archivo</button></label>'+
      '<input type="file" id="bib_file" style="display:none">'+
    '</div><div class="mini" id="bib_msg" style="margin-top:6px"></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Nombre</th><th>Descripción</th><th>Archivo</th><th>Fecha</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=4 class="empty">Aún sin documentos — sube el primero.</td></tr>')+'</tbody></table></div>';
  const msg=document.getElementById('bib_msg');
  const fileInp=document.getElementById('bib_file');
  document.getElementById('bib_btn').onclick=()=>fileInp.click();
  fileInp.onchange=async()=>{
    const file=fileInp.files&&fileInp.files[0]; if(!file) return;
    const nombre=(document.getElementById('bib_nombre').value||'').trim()||file.name;
    const desc=(document.getElementById('bib_desc').value||'').trim()||null;
    msg.style.color=''; msg.textContent='Subiendo '+file.name+'…';
    let limpio=file.name.split('').filter(ch=>/[a-zA-Z0-9._-]/.test(ch)).join('');
    if(!limpio) limpio='archivo';
    const path='biblioteca/'+seccion+'/'+Date.now()+'_'+limpio;
    try{
      const up=await sb.storage.from('expedientes').upload(path, file);
      if(up.error) throw up.error;
      const {error:e2}=await sb.from('biblioteca').insert({seccion:seccion, nombre:nombre, descripcion:desc, archivo_path:path, archivo_nombre:file.name, subido_por:window.__email||null});
      if(e2) throw e2;
      viewBiblioteca(c, seccion, titulo);
    }catch(err){
      msg.style.color='#c0392b';
      msg.textContent='No se pudo subir el documento (revisa permisos del almacén o la tabla biblioteca): '+((err&&err.message)||err);
      fileInp.value='';
    }
  };
  c.querySelectorAll('a.bib-dl').forEach(a=>a.onclick=async(ev)=>{
    ev.preventDefault();
    try{
      const {data:d2,error:e3}=await sb.storage.from('expedientes').createSignedUrl(a.dataset.path, 3600);
      if(e3) throw e3;
      window.open(d2.signedUrl);
    }catch(err){ alert('No se pudo abrir el archivo (permisos de almacén): '+((err&&err.message)||err)); }
  });
}

/* ===== Cuestionario NOM-035 · Guía de Referencia II (16 a 50 trabajadores) ===== */
const N35_OPTS=['Siempre','Casi siempre','Algunas veces','Casi nunca','Nunca'];
const N35_SECS=[
  {h:'Para responder las preguntas siguientes considere las condiciones de su centro de trabajo, así como la cantidad y ritmo de trabajo.', items:[
    [1,'Mi trabajo me exige hacer mucho esfuerzo físico'],
    [2,'Me preocupa sufrir un accidente en mi trabajo'],
    [3,'Considero que las actividades que realizo son peligrosas'],
    [4,'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno'],
    [5,'Por la cantidad de trabajo que tengo debo trabajar sin parar'],
    [6,'Considero que es necesario mantener un ritmo de trabajo acelerado'],
    [7,'Mi trabajo exige que esté muy concentrado'],
    [8,'Mi trabajo requiere que memorice mucha información'],
    [9,'Mi trabajo exige que atienda varios asuntos al mismo tiempo']
  ]},
  {h:'Las preguntas siguientes están relacionadas con las actividades que realiza en su trabajo y las responsabilidades que tiene.', items:[
    [10,'En mi trabajo soy responsable de cosas de mucho valor'],
    [11,'Respondo ante mi jefe por los resultados de toda mi área de trabajo'],
    [12,'En mi trabajo me dan órdenes contradictorias'],
    [13,'Considero que en mi trabajo me piden hacer cosas innecesarias']
  ]},
  {h:'Las preguntas siguientes están relacionadas con el tiempo destinado a su trabajo y sus responsabilidades familiares.', items:[
    [14,'Trabajo horas extras más de tres veces a la semana'],
    [15,'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana'],
    [16,'Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales'],
    [17,'Pienso en las actividades familiares o personales cuando estoy en mi trabajo']
  ]},
  {h:'Las preguntas siguientes están relacionadas con las decisiones que puede tomar en su trabajo.', items:[
    [18,'Mi trabajo permite que desarrolle nuevas habilidades'],
    [19,'En mi trabajo puedo aspirar a un mejor puesto'],
    [20,'Durante mi jornada de trabajo puedo tomar pausas cuando las necesito'],
    [21,'Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo'],
    [22,'Puedo cambiar el orden de las actividades que realizo en mi trabajo']
  ]},
  {h:'Las preguntas siguientes están relacionadas con la capacitación e información que recibe sobre su trabajo.', items:[
    [23,'Me informan con claridad cuáles son mis funciones'],
    [24,'Me explican claramente los resultados que debo obtener en mi trabajo'],
    [25,'Me informan con quién puedo resolver problemas o asuntos de trabajo'],
    [26,'Me permiten asistir a capacitaciones relacionadas con mi trabajo'],
    [27,'Recibo capacitación útil para hacer mi trabajo']
  ]},
  {h:'Las preguntas siguientes se refieren a las relaciones con sus compañeros de trabajo y su jefe.', items:[
    [28,'Mi jefe tiene en cuenta mis puntos de vista y opiniones'],
    [29,'Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo'],
    [30,'Puedo confiar en mis compañeros de trabajo'],
    [31,'Cuando tenemos que realizar trabajo de equipo los compañeros colaboran'],
    [32,'Mis compañeros de trabajo me ayudan cuando tengo dificultades'],
    [33,'En mi trabajo puedo expresarme libremente sin interrupciones'],
    [34,'Recibo críticas constantes a mi persona y/o trabajo'],
    [35,'Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones'],
    [36,'Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones'],
    [37,'Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador'],
    [38,'Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores'],
    [39,'Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo'],
    [40,'He presenciado actos de violencia en mi centro de trabajo']
  ]}
];
const N35_S7={g:'En mi trabajo debo brindar servicio a clientes o usuarios:', items:[
  [41,'Atiendo clientes o usuarios muy enojados'],
  [42,'Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas'],
  [43,'Para hacer mi trabajo debo demostrar sentimientos distintos a los míos']
]};
const N35_S8={g:'Soy jefe de otros trabajadores:', items:[
  [44,'Comunican tarde los asuntos de trabajo'],
  [45,'Dificultan el logro de los resultados del trabajo'],
  [46,'Ignoran las sugerencias para mejorar su trabajo']
]};
const N35_CATS=[
  {key:'ambiente_trabajo', label:'Ambiente de trabajo', items:[1,2,3], cuts:[3,5,7,9]},
  {key:'factores_actividad', label:'Factores propios de la actividad', items:[4,5,6,7,8,9,10,11,12,13,18,19,20,21,22,26,27,41,42,43], cuts:[10,20,30,40]},
  {key:'organizacion_tiempo', label:'Organización del tiempo de trabajo', items:[14,15,16,17], cuts:[4,6,9,12]},
  {key:'liderazgo_relaciones', label:'Liderazgo y relaciones en el trabajo', items:[23,24,25,28,29,30,31,32,33,34,35,36,37,38,39,40,44,45,46], cuts:[10,18,28,38]}
];
function n35Score(num, idx){ return (num>=18&&num<=33) ? idx : (4-idx); }
function n35Nivel(v, cuts){ if(v<cuts[0]) return 'Nulo'; if(v<cuts[1]) return 'Bajo'; if(v<cuts[2]) return 'Medio'; if(v<cuts[3]) return 'Alto'; return 'Muy alto'; }
function n35Color(n){ return (n==='Nulo'||n==='Bajo') ? '#2f9e6b' : (n==='Medio' ? '#d68910' : '#c0392b'); }
function n35Item(it){
  const opts=N35_OPTS.map((o,j)=>'<label style="font-weight:400;display:inline-flex;align-items:center;gap:4px;margin:0;cursor:pointer"><input type="radio" name="n35_i'+it[0]+'" value="'+j+'">'+o+'</label>').join('');
  return '<div id="n35_row'+it[0]+'" style="padding:8px 0;border-bottom:1px solid var(--line)">'+
    '<div style="font-size:13px;margin-bottom:6px"><b>'+it[0]+'.</b> '+esc(it[1])+'</div>'+
    '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px">'+opts+'</div></div>';
}
async function viewNom035Cuest(c){
  c.innerHTML='<h1 class="pg">Cuestionario NOM-035</h1>'+
    '<div class="pgsub">Identificación de factores de riesgo psicosocial · aplicación individual</div>'+
    '<div class="card"><h3>Cuestionario de factores de riesgo psicosocial · NOM-035-STPS-2018 · Guía de Referencia II</h3><div class="body">'+
      '<div style="font-size:13px;margin-bottom:12px">Tus respuestas son confidenciales y se usan solo para identificar factores de riesgo psicosocial. No hay respuestas buenas o malas.</div>'+
      '<div class="frm">'+
        '<label>Folio del trabajador<input id="n35_folio" placeholder="TRB-018"></label>'+
        '<label>Área o departamento (opcional)<input id="n35_area" placeholder="Área o departamento"></label>'+
      '</div>'+
      '<label style="display:flex;align-items:center;gap:8px;margin-top:12px;font-size:13px;cursor:pointer"><input type="checkbox" id="n35_acepta"> Acepto responder de forma voluntaria y sincera</label>'+
      '<div style="margin-top:12px"><button class="btn2" id="n35_start" disabled>Comenzar</button></div>'+
      '<div class="mini" id="n35_introMsg" style="margin-top:6px"></div>'+
    '</div></div>'+
    '<div id="n35_form"></div>';
  const chk=document.getElementById('n35_acepta');
  const btn=document.getElementById('n35_start');
  chk.onchange=()=>{ btn.disabled=!chk.checked; };
  btn.onclick=()=>{
    const folio=(document.getElementById('n35_folio').value||'').trim();
    const area=(document.getElementById('n35_area').value||'').trim();
    const im=document.getElementById('n35_introMsg');
    if(!folio){ im.style.color='#c0392b'; im.textContent='Indica el folio del trabajador para comenzar.'; return; }
    im.textContent='';
    n35Form(c, folio, area);
  };
}
function n35Form(c, folio, area){
  const romanos=['I','II','III','IV','V','VI'];
  const secHtml=N35_SECS.map((s,i)=>
    '<div class="card"><h3>Sección '+romanos[i]+'</h3><div class="body">'+
    '<div style="font-size:13px;font-weight:700;margin-bottom:6px">'+esc(s.h)+'</div>'+
    s.items.map(n35Item).join('')+'</div></div>').join('');
  const gate=(id, texto, sec, items)=>
    '<div class="card"><h3>Sección '+sec+'</h3><div class="body">'+
    '<div style="font-size:13px;font-weight:700;margin-bottom:6px">'+esc(texto)+'</div>'+
    '<div style="display:flex;gap:16px;font-size:13px;margin-bottom:6px">'+
      '<label style="font-weight:400;display:inline-flex;align-items:center;gap:4px;margin:0;cursor:pointer"><input type="radio" name="'+id+'" value="si"> Sí</label>'+
      '<label style="font-weight:400;display:inline-flex;align-items:center;gap:4px;margin:0;cursor:pointer"><input type="radio" name="'+id+'" value="no"> No</label>'+
    '</div>'+
    '<div id="'+id+'_blk" style="display:none">'+items.map(n35Item).join('')+'</div>'+
    '</div></div>';
  c.innerHTML='<h1 class="pg">Cuestionario NOM-035 · Guía de Referencia II</h1>'+
    '<div class="pgsub">Folio '+esc(folio)+(area?(' · '+esc(area)):'')+' · responde todas las preguntas de cada sección.</div>'+
    secHtml+
    gate('n35_srv', N35_S7.g, 'VII', N35_S7.items)+
    gate('n35_jefe', N35_S8.g, 'VIII', N35_S8.items)+
    '<div class="no-print" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0 10px">'+
      '<button class="btn2" id="n35_calc">Calcular y guardar</button>'+
      '<span class="mini" id="n35_msg"></span>'+
    '</div>'+
    '<div class="mini" style="color:var(--muted)">Reactivos conforme a la Guía de Referencia II de la NOM-035-STPS-2018 (centros de 16 a 50 trabajadores). El resultado orienta la identificación; las acciones se definen conforme a la Norma.</div>';
  const gateVal=id=>{ const r=c.querySelector('input[name="'+id+'"]:checked'); return r?r.value:null; };
  const bindGate=id=>{ c.querySelectorAll('input[name="'+id+'"]').forEach(r=>r.onchange=()=>{ document.getElementById(id+'_blk').style.display = (gateVal(id)==='si') ? '' : 'none'; }); };
  bindGate('n35_srv'); bindGate('n35_jefe');
  document.getElementById('n35_calc').onclick=async()=>{
    const msg=document.getElementById('n35_msg');
    msg.style.color='#c0392b';
    const srv=gateVal('n35_srv'), jefe=gateVal('n35_jefe');
    if(!srv){ msg.textContent='Falta responder: "En mi trabajo debo brindar servicio a clientes o usuarios" (Sí/No).'; return; }
    if(!jefe){ msg.textContent='Falta responder: "Soy jefe de otros trabajadores" (Sí/No).'; return; }
    let visibles=[]; for(let n=1;n<=40;n++) visibles.push(n);
    if(srv==='si') visibles=visibles.concat([41,42,43]);
    if(jefe==='si') visibles=visibles.concat([44,45,46]);
    const resp={};
    for(const n of visibles){
      const r=c.querySelector('input[name="n35_i'+n+'"]:checked');
      if(!r){
        msg.textContent='Falta responder la pregunta '+n+'.';
        const row=document.getElementById('n35_row'+n);
        if(row) row.scrollIntoView({behavior:'smooth',block:'center'});
        return;
      }
      resp[n]=n35Score(n, Number(r.value));
    }
    msg.style.color=''; msg.textContent='Calculando…';
    let total=0; visibles.forEach(n=>{ total+=resp[n]; });
    const nivel=n35Nivel(total,[20,45,70,90]);
    const categorias={};
    const catRows=N35_CATS.map(cat=>{
      let s=0; cat.items.forEach(n=>{ if(resp[n]!=null) s+=resp[n]; });
      const nv=n35Nivel(s, cat.cuts);
      categorias[cat.key]={label:cat.label, puntos:s, nivel:nv};
      return '<tr><td>'+esc(cat.label)+'</td><td class="num-r">'+s+'</td>'+
        '<td><span class="tag" style="color:'+n35Color(nv)+';border-color:'+n35Color(nv)+'">'+nv+'</span></td></tr>';
    }).join('');
    let guardado='Resultado guardado en el histórico NOM-035.';
    try{
      const {error:e}=await sb.from('nom035_respuestas').insert({
        folio:folio, area:area||null, fecha:new Date().toISOString().slice(0,10),
        total:total, max:184, nivel:nivel, guia:'II', categorias:categorias
      });
      if(e) throw e;
    }catch(err){
      guardado='El resultado se calculó pero no se pudo guardar: '+((err&&err.message)||err);
    }
    c.innerHTML='<h1 class="pg">Resultado · Cuestionario NOM-035 · Guía de Referencia II</h1>'+
      '<div class="pgsub">Folio '+esc(folio)+(area?(' · '+esc(area)):'')+' · '+new Date().toISOString().slice(0,10)+'</div>'+
      '<div class="card"><h3>Calificación final</h3><div class="body">'+
        '<div style="font-size:14px">Puntuación total: <b>'+total+'</b> de 184</div>'+
        '<div style="font-size:30px;font-weight:800;margin:8px 0;color:'+n35Color(nivel)+'">'+nivel+'</div>'+
        '<div style="font-size:12px;color:var(--muted)">Nivel de riesgo psicosocial conforme a los puntos de corte de la Guía de Referencia II.</div>'+
      '</div></div>'+
      '<div class="card"><h3>Resultado por categoría</h3><table><thead><tr><th>Categoría</th><th class="num-r">Puntos</th><th>Nivel</th></tr></thead><tbody>'+catRows+'</tbody></table></div>'+
      '<div class="mini" style="margin:6px 0">'+esc(guardado)+'</div>'+
      '<div class="no-print" style="display:flex;gap:8px;margin-top:8px">'+
        '<button class="btn2" id="n35_print">🖨 Imprimir resultado</button>'+
        '<button class="btn2 ghost" id="n35_new">Nuevo cuestionario</button>'+
      '</div>'+
      '<div class="mini" style="color:var(--muted);margin-top:10px">Reactivos conforme a la Guía de Referencia II de la NOM-035-STPS-2018 (centros de 16 a 50 trabajadores). El resultado orienta la identificación; las acciones se definen conforme a la Norma.</div>';
    document.getElementById('n35_print').onclick=()=>window.print();
    document.getElementById('n35_new').onclick=()=>viewNom035Cuest(c);
  };
}

/* ===== Gobierno y Padrones (empadronamientos + licitaciones) ===== */
async function viewPadrones(c){
  comboTabs(c,'Gobierno y Padrones',[{label:'Plan de empadronamiento',fn:padPlan},{label:'Matriz empresa × entidad',fn:padMatriz},{label:'Trámites y kit documental',fn:padTramites}]);
}
function padNivelTag(n){ return n==='A'?'on':(n==='B'?'repse':'off'); }
function padEstTag(e){ return e==='vigente'?'on':(e==='por_vencer'?'repse':'off'); }
function padEstLbl(e){ return e==='por_vencer'?'por vencer':(e==='sin_registro'?'sin registro':(e||'—')); }
function padVigTx(f){
  if(!f) return '';
  const dias=matDias(f);
  let tx=' · '+esc(String(f).slice(0,10));
  if(dias===null) return tx;
  if(dias<0) return tx+' <span style="color:#c0392b;font-size:11px">vencido hace '+(-dias)+' d</span>';
  if(dias<=30) return tx+' <span style="color:#e67e22;font-size:11px">en '+dias+' d</span>';
  return tx+' <span style="color:var(--muted);font-size:11px">en '+dias+' d</span>';
}

async function padPlan(body, fnivel){
  fnivel=fnivel||'';
  body.innerHTML='<div class="loader">Cargando…</div>';
  const {data,error}=await sb.from('padron_empresas')
    .select('id,ranking,empresa,rfc,nivel,padron_estatus,padron_vigencia,repse_estatus,criticos,altos,kit_pendientes,accion_inmediata')
    .order('ranking');
  if(error) throw error;
  const lista=data||[];
  const nivA=lista.filter(x=>x.nivel==='A').length;
  const crit=lista.reduce((s,x)=>s+(Number(x.criticos)||0),0);
  const altos=lista.reduce((s,x)=>s+(Number(x.altos)||0),0);
  const vencPV=lista.filter(x=>x.padron_estatus==='vencido'||x.padron_estatus==='por_vencer').length;
  const vis=fnivel?lista.filter(x=>x.nivel===fnivel):lista;
  const rows=vis.map(x=>
    '<tr><td>'+(x.ranking!=null?x.ranking:'')+'</td>'+
    '<td><b>'+esc(x.empresa||'')+'</b>'+(x.rfc?'<div style="font-size:11px;color:var(--muted)">'+esc(x.rfc)+'</div>':'')+'</td>'+
    '<td><span class="tag '+padNivelTag(x.nivel)+'">'+esc(x.nivel||'—')+'</span></td>'+
    '<td><span class="tag '+padEstTag(x.padron_estatus)+'">'+esc(padEstLbl(x.padron_estatus))+'</span>'+padVigTx(x.padron_vigencia)+'</td>'+
    '<td>'+esc(x.repse_estatus||'—')+'</td>'+
    '<td class="num-r">'+(Number(x.criticos)>0?'<b style="color:#c0392b">'+x.criticos+'</b>':(x.criticos!=null?x.criticos:0))+'</td>'+
    '<td class="num-r">'+(Number(x.altos)>0?'<b style="color:#e67e22">'+x.altos+'</b>':(x.altos!=null?x.altos:0))+'</td>'+
    '<td class="num-r">'+(x.kit_pendientes!=null?x.kit_pendientes:0)+'</td>'+
    '<td style="font-size:12px">'+esc(x.accion_inmediata||'')+'</td></tr>'
  ).join('');
  body.innerHTML=
    '<div class="pgsub">Plan de empadronamientos — sembrado de tu documento oficial (corte 12-jul-2026). Nivel A = empadronable de inmediato · D = requiere reactivación integral.</div>'+
    '<div class="kpis">'+
      tile(lista.length,'Empresas en plan','var(--navy)')+
      tile(nivA,'Nivel A · listas ya','var(--ok)')+
      tile(crit,'Críticos',crit>0?'#c0392b':'var(--ok)')+
      tile(altos,'Altos',altos>0?'#e67e22':'var(--ok)')+
      tile(vencPV,'Padrones vencidos/por vencer',vencPV>0?'#c0392b':'var(--ok)')+
    '</div>'+
    '<div class="card"><div class="body"><div class="frm"><label>Nivel<select id="pp_nivel"><option value="">Todos</option>'+
      ['A','B','C','D'].map(n=>'<option value="'+n+'"'+(fnivel===n?' selected':'')+'>'+n+'</option>').join('')+
    '</select></label></div></div></div>'+
    '<div class="card"><table><thead><tr><th>#</th><th>Empresa</th><th>Nivel</th><th>Padrón</th><th>REPSE</th><th class="num-r">Crít.</th><th class="num-r">Altos</th><th class="num-r">Kit</th><th>Acción inmediata</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=9 class="empty">Sin empresas en el plan</td></tr>')+'</tbody></table></div>';
  document.getElementById('pp_nivel').onchange=()=>padPlan(body, document.getElementById('pp_nivel').value);
}

const PAD_MX_ESTATUS=[['empadronada','Empadronada'],['en_tramite','En trámite'],['por_renovar','Por renovar'],['vencida','Vencida'],['no_aplica','No aplica'],['no_iniciado','No iniciado']];
const PAD_MX_BG={empadronada:'#e6f2ea',en_tramite:'#fbf1dc',por_renovar:'#fdf3e2',vencida:'#f7e6e0',no_aplica:'#eef1f2',no_iniciado:'#fff'};

async function padMatriz(body){
  body.innerHTML='<div class="loader">Cargando…</div>';
  const [r1,r2,r3]=await Promise.all([
    sb.from('padron_empresas').select('id,empresa,ranking').order('ranking').limit(35),
    sb.from('padron_entidades').select('clave,nombre').eq('activo',true).order('clave'),
    sb.from('padron_matriz').select('id,padron_empresa_id,entidad_clave,estatus')
  ]);
  if(r1.error) throw r1.error; if(r2.error) throw r2.error; if(r3.error) throw r3.error;
  const emps=r1.data||[], ents=r2.data||[];
  const mapa={};
  (r3.data||[]).forEach(m=>{ mapa[m.padron_empresa_id+'|'+m.entidad_clave]=m; });
  const head='<tr><th>Empresa</th>'+ents.map(e=>'<th title="'+esc(e.nombre||'')+'">'+esc(e.clave)+'</th>').join('')+'</tr>';
  const rows=emps.map(emp=>{
    const nom=String(emp.empresa||'');
    const corto=nom.length>24?esc(nom.slice(0,24))+'…':esc(nom);
    const celdas=ents.map(ent=>{
      const m=mapa[emp.id+'|'+ent.clave];
      const est=(m&&m.estatus)||'no_iniciado';
      const opts=PAD_MX_ESTATUS.map(o=>'<option value="'+o[0]+'"'+(est===o[0]?' selected':'')+'>'+o[1]+'</option>').join('');
      return '<td style="padding:2px"><select class="px-cel" data-emp="'+emp.id+'" data-ent="'+esc(ent.clave)+'"'+(m?' data-mid="'+m.id+'"':'')+
        ' style="font-size:11px;max-width:110px;border:1px solid var(--line);border-radius:4px;padding:2px;background:'+(PAD_MX_BG[est]||'#fff')+'">'+opts+'</select></td>';
    }).join('');
    return '<tr><td title="'+esc(nom)+'"><b>'+corto+'</b></td>'+celdas+'</tr>';
  }).join('');
  body.innerHTML=
    '<div class="pgsub">La cuadrícula de tu Excel: estatus de cada empresa en cada padrón. Cambia el estatus directo en la celda.</div>'+
    '<div class="card" style="overflow-x:auto"><table><thead>'+head+'</thead><tbody>'+
    (rows||'<tr><td class="empty">Sin empresas en el plan</td></tr>')+'</tbody></table></div>';
  body.querySelectorAll('select.px-cel').forEach(s=>s.onchange=async()=>{
    s.disabled=true;
    const est=s.value;
    let e=null;
    if(s.dataset.mid){
      e=(await sb.from('padron_matriz').update({estatus:est}).eq('id',s.dataset.mid)).error;
    }else{
      const ins=await sb.from('padron_matriz').insert({padron_empresa_id:s.dataset.emp, entidad_clave:s.dataset.ent, estatus:est}).select('id').single();
      e=ins.error;
      if(!e && ins.data) s.dataset.mid=ins.data.id;
    }
    if(e){ alert('Error: '+e.message); s.disabled=false; return; }
    s.style.background=PAD_MX_BG[est]||'#fff';
    s.disabled=false;
  });
}

function padTramTag(e){ return e==='resuelto'?'on':(e==='presentado'?'repse':'off'); }

async function padTramites(body){
  body.innerHTML='<div class="loader">Cargando…</div>';
  const [r1,r2,r3,r4]=await Promise.all([
    sb.from('padron_empresas').select('id,empresa,ranking').order('ranking'),
    sb.from('padron_entidades').select('clave,nombre').eq('activo',true).order('clave'),
    sb.from('padron_tramites').select('id,padron_empresa_id,entidad_clave,estatus,fecha_inicio').order('fecha_inicio',{ascending:false}),
    sb.from('padron_kit').select('tramite_id,cumplido')
  ]);
  if(r1.error) throw r1.error; if(r2.error) throw r2.error; if(r3.error) throw r3.error; if(r4.error) throw r4.error;
  const emps=r1.data||[], ents=r2.data||[], trams=r3.data||[];
  const nomEmp={}; emps.forEach(x=>{ nomEmp[x.id]=x.empresa; });
  const kit={};
  (r4.data||[]).forEach(k=>{ const p=kit[k.tramite_id]||(kit[k.tramite_id]={done:0,total:0}); p.total++; if(k.cumplido) p.done++; });
  const rows=trams.map(t=>{
    const p=kit[t.id]||{done:0,total:10};
    return '<tr><td><b>'+esc(nomEmp[t.padron_empresa_id]||'—')+'</b></td>'+
      '<td>'+esc(t.entidad_clave||'')+'</td>'+
      '<td>'+esc(t.fecha_inicio||'—')+'</td>'+
      '<td><span class="tag '+(p.total>0&&p.done===p.total?'on':'off')+'">'+p.done+'/'+(p.total||10)+'</span></td>'+
      '<td><span class="tag '+padTramTag(t.estatus)+'">'+esc(t.estatus||'')+'</span></td>'+
      '<td><button class="mini pt-ver" data-id="'+t.id+'">Ver kit</button></td></tr>';
  }).join('');
  body.innerHTML=
    '<div class="pgsub">Abre un trámite por empresa y entidad: el kit de 10 documentos se genera solo y la matriz queda en trámite.</div>'+
    '<div class="card"><h3>Abrir trámite de empadronamiento</h3><div class="body"><div class="frm">'+
      '<label>Empresa<select id="pt_emp" style="min-width:220px">'+emps.map(x=>'<option value="'+x.id+'">'+esc(x.empresa||'')+'</option>').join('')+'</select></label>'+
      '<label>Entidad / padrón<select id="pt_ent">'+ents.map(x=>'<option value="'+esc(x.clave)+'">'+esc(x.clave)+' · '+esc(x.nombre||'')+'</option>').join('')+'</select></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="pt_abrir">Abrir trámite + kit de 10 documentos</button> <span id="pt_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Entidad</th><th>Inicio</th><th>Kit</th><th>Estatus</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=6 class="empty">Sin trámites abiertos</td></tr>')+'</tbody></table></div>';
  document.getElementById('pt_abrir').onclick=async()=>{
    const btn=document.getElementById('pt_abrir'), msg=document.getElementById('pt_msg');
    btn.disabled=true; msg.textContent='Abriendo trámite…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.rpc('padron_abrir_tramite',{p_empresa:document.getElementById('pt_emp').value, p_entidad:document.getElementById('pt_ent').value});
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; btn.disabled=false; return; }
    padTramites(body);
  };
  body.querySelectorAll('button.pt-ver').forEach(b=>b.onclick=()=>padKitDetalle(body, b.dataset.id));
}

async function padKitDetalle(body, id){
  body.innerHTML='<div class="loader">Cargando trámite…</div>';
  const [r1,r2]=await Promise.all([
    sb.from('padron_tramites').select('id,padron_empresa_id,entidad_clave,estatus,fecha_inicio,notas').eq('id',id).maybeSingle(),
    sb.from('padron_kit').select('id,orden,documento,cumplido,fecha,archivo_path,archivo_nombre').eq('tramite_id',id).order('orden')
  ]);
  if(r1.error) throw r1.error; if(r2.error) throw r2.error;
  const tr=r1.data;
  if(!tr){ body.innerHTML='<div class="empty">No se encontró el trámite.</div>'; return; }
  const remp=await sb.from('padron_empresas').select('empresa').eq('id',tr.padron_empresa_id).maybeSingle();
  const empresa=(remp.data&&remp.data.empresa)||'—';
  const kitL=r2.data||[];
  const done=kitL.filter(x=>x.cumplido).length;
  const kitRows=kitL.map(x=>{
    const archivo = x.archivo_path
      ? '<a href="#" class="pk-dl" data-path="'+esc(x.archivo_path)+'">📎 '+esc(x.archivo_nombre||'archivo')+'</a>'
      : '<input type="file" class="pk-file" data-id="'+x.id+'" style="font-size:11px;max-width:190px">';
    return '<tr><td>'+(x.orden!=null?x.orden:'')+'</td>'+
      '<td><input type="checkbox" class="pk-chk" data-id="'+x.id+'"'+(x.cumplido?' checked':'')+'></td>'+
      '<td>'+esc(x.documento||'')+'</td>'+
      '<td>'+esc(x.fecha||'')+'</td>'+
      '<td>'+archivo+'</td></tr>';
  }).join('');
  body.innerHTML=
    '<div class="no-print" style="margin-bottom:10px"><button class="btn2 ghost" id="pk_volver">← Volver</button></div>'+
    '<div class="card"><h3>Trámite '+esc(empresa)+' · '+esc(tr.entidad_clave||'')+'</h3><div class="body">'+
      '<div style="font-size:13px">Inicio '+esc(tr.fecha_inicio||'—')+' · <span class="tag '+padTramTag(tr.estatus)+'">'+esc(tr.estatus||'')+'</span> · kit '+done+'/'+kitL.length+'</div>'+
      '<div class="no-print" style="display:flex;gap:8px;margin-top:8px">'+
        (tr.estatus==='abierto'?'<button class="btn2" id="pk_pres">Presentado</button>':'')+
        (tr.estatus!=='resuelto'?'<button class="btn2" id="pk_res">Resuelto</button>':'')+
      '</div></div></div>'+
    '<div class="card"><h3>Kit documental · '+done+'/'+kitL.length+'</h3><table><thead><tr><th>#</th><th>Cumplido</th><th>Documento</th><th>Fecha</th><th>Archivo</th></tr></thead><tbody>'+
    (kitRows||'<tr><td colspan=5 class="empty">Sin documentos en el kit</td></tr>')+'</tbody></table></div>';
  document.getElementById('pk_volver').onclick=()=>padTramites(body);
  const bindEst=(elId, est)=>{
    const b=document.getElementById(elId);
    if(!b) return;
    b.onclick=async()=>{
      b.disabled=true;
      const {error:e}=await sb.from('padron_tramites').update({estatus:est}).eq('id',id);
      if(e){ alert('Error: '+e.message); b.disabled=false; return; }
      padKitDetalle(body, id);
    };
  };
  bindEst('pk_pres','presentado'); bindEst('pk_res','resuelto');
  body.querySelectorAll('input.pk-chk').forEach(ch=>ch.onchange=async()=>{
    ch.disabled=true;
    const payload=ch.checked?{cumplido:true, fecha:matHoy()}:{cumplido:false, fecha:null};
    const {error:e}=await sb.from('padron_kit').update(payload).eq('id',ch.dataset.id);
    if(e){ alert('Error: '+e.message); ch.checked=!ch.checked; ch.disabled=false; return; }
    padKitDetalle(body, id);
  });
  body.querySelectorAll('input.pk-file').forEach(inp=>inp.onchange=async()=>{
    const file=inp.files&&inp.files[0]; if(!file) return;
    inp.disabled=true;
    let nombre=file.name.split('').filter(ch=>/[a-zA-Z0-9._-]/.test(ch)).join('');
    if(!nombre) nombre='archivo';
    const path='materialidad/padron_'+id+'_'+inp.dataset.id+'_'+nombre;
    try{
      const up=await sb.storage.from('expedientes').upload(path, file);
      if(up.error) throw up.error;
      const {error:e2}=await sb.from('padron_kit').update({archivo_path:path, archivo_nombre:file.name}).eq('id',inp.dataset.id);
      if(e2) throw e2;
      padKitDetalle(body, id);
    }catch(err){
      alert('No se pudo subir (permisos de almacén): '+((err&&err.message)||err));
      inp.disabled=false;
    }
  });
  body.querySelectorAll('a.pk-dl').forEach(a=>a.onclick=async(ev)=>{
    ev.preventDefault();
    try{
      const {data,error}=await sb.storage.from('expedientes').createSignedUrl(a.dataset.path, 3600);
      if(error) throw error;
      window.open(data.signedUrl);
    }catch(err){ alert('No se pudo abrir el archivo (permisos de almacén): '+((err&&err.message)||err)); }
  });
}

/* ===== Licitaciones y contratos ===== */
const LIC_ETAPAS=[['interesado','Interesado'],['propuesta','Propuesta'],['fallo','Fallo'],['contrato','Contrato'],['entrega','Entrega'],['cobrado','Cobrado']];
function licBg(e){ if(e==='cobrado'||e==='entrega'||e==='contrato') return '#e6f2ea'; if(e==='fallo') return '#fbf1dc'; return '#fff'; }

async function viewLicitaciones(c){
  const {data,error}=await sb.from('licitaciones')
    .select('id,empresa,entidad,dependencia,folio_compranet,objeto,monto,etapa,fecha_limite')
    .order('fecha_limite',{ascending:true,nullsFirst:false}).limit(300);
  if(error) throw error;
  const lista=data||[];
  const ganadas=lista.filter(x=>x.etapa==='contrato'||x.etapa==='entrega'||x.etapa==='cobrado');
  const activas=lista.length-ganadas.length;
  const enProp=lista.filter(x=>x.etapa==='propuesta').length;
  const enJuego=lista.filter(x=>x.etapa==='interesado'||x.etapa==='propuesta'||x.etapa==='fallo').reduce((s,x)=>s+(Number(x.monto)||0),0);
  const rows=lista.map(x=>{
    const obj=String(x.objeto||'');
    const objTx=obj.length>50?esc(obj.slice(0,50))+'…':esc(obj);
    const dias=matDias(x.fecha_limite);
    let limTx=esc(x.fecha_limite||'—');
    if(dias!==null) limTx += dias<0
      ? ' <span style="color:#c0392b;font-size:11px">hace '+(-dias)+' d</span>'
      : ' <span style="color:var(--muted);font-size:11px">en '+dias+' d</span>';
    const opts=LIC_ETAPAS.map(o=>'<option value="'+o[0]+'"'+(x.etapa===o[0]?' selected':'')+'>'+o[1]+'</option>').join('');
    return '<tr><td><b>'+esc(x.empresa||'')+'</b></td>'+
      '<td>'+esc(x.dependencia||'')+(x.entidad?'<div style="font-size:11px;color:var(--muted)">'+esc(x.entidad)+'</div>':'')+'</td>'+
      '<td>'+esc(x.folio_compranet||'—')+'</td>'+
      '<td title="'+esc(obj)+'">'+objTx+'</td>'+
      '<td class="num-r">'+mny(x.monto)+'</td>'+
      '<td>'+limTx+'</td>'+
      '<td><select class="lc-etapa" data-id="'+x.id+'" style="font-size:12px;border:1px solid var(--line);border-radius:4px;padding:2px 4px;background:'+licBg(x.etapa)+'">'+opts+'</select></td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">Licitaciones y contratos</h1>'+
    '<div class="pgsub">Pipeline de gobierno: de interesado a cobrado.</div>'+
    '<div class="kpis">'+
      tile(activas,'Activas','var(--navy)')+
      tile(enProp,'En propuesta','var(--gold)')+
      tile(ganadas.length,'Contratos ganados','var(--ok)')+
      tile(mny(enJuego),'Monto en juego','var(--teal)')+
    '</div>'+
    '<div class="card"><h3>Nueva licitación</h3><div class="body"><div class="frm">'+
      '<label>Empresa<input id="lc_emp" style="min-width:200px"></label>'+
      '<label>Dependencia<input id="lc_dep" style="min-width:200px"></label>'+
      '<label>Entidad<input id="lc_ent" style="min-width:120px"></label>'+
      '<label>Folio COMPRASMX<input id="lc_folio"></label>'+
      '<label>Objeto<input id="lc_obj" style="min-width:240px"></label>'+
      '<label>Monto<input id="lc_monto" type="number" step="0.01"></label>'+
      '<label>Fecha límite<input id="lc_lim" type="date"></label>'+
    '</div><div style="margin-top:8px"><button class="btn2" id="lc_save">Guardar</button> <span id="lc_msg" style="font-size:12px;margin-left:8px"></span></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Dependencia</th><th>Folio</th><th>Objeto</th><th class="num-r">Monto</th><th>Límite</th><th>Etapa</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=7 class="empty">Sin licitaciones registradas</td></tr>')+'</tbody></table></div>';
  const g=id=>document.getElementById(id);
  g('lc_save').onclick=async()=>{
    const msg=g('lc_msg');
    const empresa=g('lc_emp').value.trim();
    if(!empresa){ msg.textContent='La empresa es obligatoria.'; msg.style.color='var(--danger)'; return; }
    g('lc_save').disabled=true; msg.textContent='Guardando…'; msg.style.color='var(--muted)';
    const {error:e}=await sb.from('licitaciones').insert({
      empresa:empresa, dependencia:g('lc_dep').value.trim()||null, entidad:g('lc_ent').value.trim()||null,
      folio_compranet:g('lc_folio').value.trim()||null, objeto:g('lc_obj').value.trim()||null,
      monto:g('lc_monto').value?Number(g('lc_monto').value):null,
      fecha_limite:g('lc_lim').value||null, etapa:'interesado'
    });
    if(e){ msg.textContent='Error: '+e.message; msg.style.color='var(--danger)'; g('lc_save').disabled=false; return; }
    viewLicitaciones(c);
  };
  c.querySelectorAll('select.lc-etapa').forEach(s=>s.onchange=async()=>{
    s.disabled=true;
    const {error:e}=await sb.from('licitaciones').update({etapa:s.value}).eq('id',s.dataset.id);
    if(e){ alert('Error: '+e.message); s.disabled=false; return; }
    viewLicitaciones(c);
  });
}

/* ===== Sucursales (Base Madre) ===== */
async function viewSucursales(c){
  const {data,error}=await sb.from('sucursales').select('id,empresa,tipo,entidad,domicilio,aviso_sat').order('empresa',{ascending:true}).limit(300);
  if(error) throw error;
  const lista=data||[];
  const matrices=lista.filter(x=>x.tipo==='Matriz').length;
  const sucs=lista.filter(x=>x.tipo==='Sucursal').length;
  const plazas=new Set(lista.map(x=>String(x.entidad||'').trim().toLowerCase()).filter(x=>x)).size;
  const draw=(arr)=>arr.map(x=>{
    const dom=String(x.domicilio||'');
    const domFull=esc(dom).split('"').join('&quot;');
    const domTx=dom.length>70?esc(dom.slice(0,70))+'…':esc(dom);
    return '<tr><td><b>'+esc(x.empresa||'')+'</b></td>'+
      '<td><span class="tag '+(x.tipo==='Matriz'?'on':'off')+'">'+esc(x.tipo||'')+'</span></td>'+
      '<td>'+esc(x.entidad||'')+'</td>'+
      '<td title="'+domFull+'">'+(domTx||'—')+'</td>'+
      '<td>'+(x.aviso_sat?esc(x.aviso_sat):'—')+'</td></tr>';
  }).join('');
  const vacio='<tr><td colspan=5 class="empty">Sin sucursales que coincidan</td></tr>';
  c.innerHTML='<h1 class="pg">Sucursales</h1><div class="pgsub">Registro de matrices y sucursales — cargado de tu Base Madre (108 registros).</div>'+
    '<div class="kpis">'+
      tile(lista.length,'Total','var(--navy)')+
      tile(matrices,'Matrices','var(--gold)')+
      tile(sucs,'Sucursales','var(--teal)')+
      tile(plazas,'Plazas','var(--plum)')+
    '</div>'+
    '<div class="card"><div class="body"><div class="frm"><label>Buscar<input id="suc_q" placeholder="Empresa o entidad" autocomplete="off" style="min-width:260px"></label></div></div></div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Tipo</th><th>Entidad/Municipio</th><th>Domicilio</th><th>Aviso SAT</th></tr></thead><tbody id="suc_tb">'+
    (draw(lista)||vacio)+'</tbody></table></div>';
  const q=document.getElementById('suc_q'), tb=document.getElementById('suc_tb');
  q.onkeyup=()=>{
    const t=q.value.trim().toLowerCase();
    const fil=lista.filter(x=>((x.empresa||'')+' '+(x.entidad||'')).toLowerCase().indexOf(t)>-1);
    tb.innerHTML=draw(fil)||vacio;
  };
}

/* ===== e.firmas SAT (control de reactivación) ===== */
async function viewEfirmas(c){
  const {data,error}=await sb.from('efirmas').select('id,empresa,estatus,vencimiento,notas').order('vencimiento',{ascending:true,nullsFirst:false}).limit(200);
  if(error) throw error;
  const lista=data||[];
  const conVenc=lista.filter(x=>x.vencimiento).length;
  const sinFecha=lista.length-conVenc;
  const prox=lista.filter(x=>{const d=matDias(x.vencimiento); return d!==null&&d>=0&&d<180;}).length;
  const rows=lista.map(x=>{
    const d=matDias(x.vencimiento);
    let vtx='—';
    if(x.vencimiento){
      vtx=esc(String(x.vencimiento).slice(0,10));
      if(d!==null){
        vtx+=d<0
          ?' <span style="color:#c0392b;font-weight:700">vencida hace '+(-d)+' d</span>'
          :' <span style="color:'+(d<180?'#e67e22':'#2f9e6b')+'">en '+d+' d</span>';
      }
    }
    const activa=x.estatus==='activa';
    const btn=activa?'':'<button class="mini ef-act" data-id="'+x.id+'">Activada</button>';
    return '<tr><td><b>'+esc(x.empresa||'')+'</b></td>'+
      '<td><span class="tag '+(activa?'on':'off')+'">'+esc(x.estatus||'inactiva')+'</span></td>'+
      '<td>'+vtx+'</td>'+
      '<td>'+esc(x.notas||'')+'</td>'+
      '<td>'+btn+'</td></tr>';
  }).join('');
  c.innerHTML='<h1 class="pg">e.firmas (control)</h1><div class="pgsub">e.firmas SAT reportadas INACTIVAS en tu Base Madre — contrólalas aquí conforme se reactiven.</div>'+
    '<div class="kpis">'+
      tile(lista.length,'Registradas','var(--navy)')+
      tile(conVenc,'Con vencimiento','var(--teal)')+
      tile(prox,'Próximas a vencer (<180 días)',prox>0?'#e67e22':'var(--ok)')+
      tile(sinFecha,'Sin fecha','#7f8c8d')+
    '</div>'+
    '<div class="card"><table><thead><tr><th>Empresa</th><th>Estatus</th><th>Vencimiento</th><th>Notas</th><th></th></tr></thead><tbody>'+
    (rows||'<tr><td colspan=5 class="empty">Sin e.firmas registradas</td></tr>')+'</tbody></table></div>';
  c.querySelectorAll('button.ef-act').forEach(b=>b.onclick=async()=>{
    b.disabled=true;
    const {error:e}=await sb.from('efirmas').update({estatus:'activa'}).eq('id',b.dataset.id);
    if(e){ alert('Error: '+e.message); b.disabled=false; return; }
    viewEfirmas(c);
  });
}
