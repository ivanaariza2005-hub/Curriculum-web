const API = 'https://curriculumapi-production.up.railway.app/api/experiencias';
const AUTH_API = 'https://curriculumapi-production.up.railway.app/api/auth';

let todasLasExp = [];
let filtroActual = '';
let currentUser = null;

window.onload = async () => {
  const token = getToken();
  if (token) await verificarSesionSilenciosa();
  actualizarUI();
  await cargar();
};

function getToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

function isLoggedIn() {
  return !!getToken();
}

async function verificarSesionSilenciosa() {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`${AUTH_API}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const user = await res.json();
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    currentUser = null;
  }
}

function mostrarLogin() {
  document.getElementById('loginModal').style.display = 'flex';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginPersona').value = '';
  document.getElementById('loginPassword').focus();
}

function ocultarLogin() {
  document.getElementById('loginModal').style.display = 'none';
}

async function login() {
  const username = document.getElementById('loginPersona').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!username || !password) {
    errorEl.textContent = 'Selecciona tu perfil e ingresa tu contraseña';
    return;
  }

  try {
    const res = await fetch(`${AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.mensaje || 'Credenciales incorrectas';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    currentUser = data.user;
    ocultarLogin();
    actualizarUI();
    toast(`Bienvenido, ${data.user.nombre}`, 'success');
  } catch {
    errorEl.textContent = 'El servidor de autenticación no está disponible. Usa el modo sin inicio de sesión.';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  currentUser = null;
  cancelarEdicion();
  actualizarUI();
  toast('Sesión cerrada', 'success');
}

function actualizarUI() {
  const loggedIn = isLoggedIn();
  const user = getCurrentUser();

  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const loginBtn = document.getElementById('loginBtnHeader');
  const authBanner = document.getElementById('authBanner');
  const formActions = document.getElementById('formActions');
  const formBody = document.getElementById('formBody');
  const personaGroup = document.getElementById('personaGroup');
  const personaFixed = document.getElementById('personaFixed');
  const personaDisplay = document.getElementById('personaDisplay');

  if (loggedIn && user) {
    userInfo.style.display = 'flex';
    userName.textContent = user.nombre;
    userAvatar.textContent = user.persona.charAt(0);
    userAvatar.style.background = getAvatarColor(user.persona);
    if (loginBtn) loginBtn.style.display = 'none';
    authBanner.style.display = 'none';
    formActions.style.display = 'block';
    personaGroup.style.display = 'none';
    personaFixed.style.display = 'block';
    personaDisplay.textContent = user.persona;
    habilitarForm(true);
  } else {
    userInfo.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'flex';
    authBanner.style.display = 'none';
    formActions.style.display = 'block';
    personaGroup.style.display = 'block';
    personaFixed.style.display = 'none';
    habilitarForm(true);
  }
}

function getAvatarColor(persona) {
  const colores = { Daniela: '#6c63ff', Ivan: '#ff6584', Keila: '#43e97b', Yeison: '#f7971e' };
  return colores[persona] || '#6c63ff';
}

function habilitarForm(habilitado) {
  const campos = ['empresa', 'cargo', 'fechaInicio', 'fechaFin', 'ciudad', 'descripcion'];
  campos.forEach(id => {
    document.getElementById(id).disabled = !habilitado;
  });
  document.getElementById('persona').disabled = !habilitado;
  document.getElementById('trabajoActual').disabled = !habilitado;
}

async function cargar() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    todasLasExp = data.experiencias || [];
    actualizarStats();
    renderizar(filtroActual ? todasLasExp.filter(e => e.persona === filtroActual) : todasLasExp);
  } catch (e) {
    document.getElementById('lista').innerHTML = `
      <div class="empty">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p>No se pudo conectar a la API.<br/>Verifica tu conexión a internet.</p>
      </div>`;
  }
}

function renderizar(lista) {
  const el = document.getElementById('lista');

  if (!lista.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    </div><p>No hay experiencias todavía.<br/>¡Crea la primera!</p></div>`;
    return;
  }

  el.innerHTML = lista.map(e => `
    <div class="exp-card">
      <div class="card-header">
        <div>
          <div class="card-title">${e.cargo}</div>
          <div class="card-empresa">${e.empresa}</div>
        </div>
        <div class="card-actions">
          <button class="btn-icon edit-btn" onclick="editar('${e._id}')" title="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon del-btn"  onclick="eliminar('${e._id}')" title="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
      <div class="card-meta">
        <span class="tag persona-tag">${e.persona}</span>
        <span class="tag">📅 ${formatFecha(e.fechaInicio)} — ${e.trabajoActual ? 'Presente' : formatFecha(e.fechaFin)}</span>
        ${e.ciudad ? `<span class="tag">📍 ${e.ciudad}</span>` : ''}
        ${e.trabajoActual ? '<span class="tag actual-tag">● Actual</span>' : ''}
      </div>
      <div class="card-desc">${e.descripcion}</div>
    </div>
  `).join('');
}

async function guardar() {
  const id = document.getElementById('edit-id').value;
  const token = getToken();
  const user = getCurrentUser();

  const body = {
    empresa:       document.getElementById('empresa').value,
    cargo:         document.getElementById('cargo').value,
    fechaInicio:   document.getElementById('fechaInicio').value,
    fechaFin:      document.getElementById('trabajoActual').checked ? null : document.getElementById('fechaFin').value,
    trabajoActual: document.getElementById('trabajoActual').checked,
    descripcion:   document.getElementById('descripcion').value,
    ciudad:        document.getElementById('ciudad').value,
  };

  if (token && user) {
    body.persona = user.persona;
  } else {
    body.persona = document.getElementById('persona').value;
  }

  if (!body.persona || !body.empresa || !body.cargo || !body.fechaInicio || !body.descripcion) {
    toast('Completa todos los campos obligatorios', 'error'); return;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      logout();
      toast('Sesión expirada. Inicia sesión de nuevo.', 'error');
      return;
    }
    if (res.status === 403) {
      toast('No tienes permiso para modificar esta experiencia', 'error');
      return;
    }
    if (!res.ok) throw new Error();

    toast(id ? 'Experiencia actualizada' : 'Experiencia creada', 'success');
    limpiarForm();
    await cargar();
  } catch {
    toast('Error al guardar', 'error');
  }
}

function editar(id) {
  const e = todasLasExp.find(x => x._id === id);
  if (!e) return;

  document.getElementById('edit-id').value      = e._id;
  document.getElementById('persona').value      = e.persona;
  document.getElementById('empresa').value      = e.empresa;
  document.getElementById('cargo').value        = e.cargo;
  document.getElementById('fechaInicio').value  = e.fechaInicio?.split('T')[0] || '';
  document.getElementById('fechaFin').value     = e.fechaFin?.split('T')[0] || '';
  document.getElementById('trabajoActual').checked = e.trabajoActual;
  document.getElementById('descripcion').value  = e.descripcion;
  document.getElementById('ciudad').value       = e.ciudad || '';

  document.getElementById('form-title').textContent = 'Editar Experiencia';
  document.getElementById('form-badge').textContent = 'PUT';
  document.getElementById('form-badge').className   = 'badge edit';
  toggleFechaFin();

  document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
}

async function eliminar(id) {
  if (!confirm('¿Seguro que deseas eliminar esta experiencia?')) return;

  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (res.status === 401) {
      logout();
      toast('Sesión expirada. Inicia sesión de nuevo.', 'error');
      return;
    }
    if (res.status === 403) {
      toast('No tienes permiso para eliminar esta experiencia', 'error');
      return;
    }
    if (!res.ok) throw new Error();

    toast('Experiencia eliminada', 'success');
    await cargar();
  } catch {
    toast('Error al eliminar', 'error');
  }
}

function filtrar(persona, btn) {
  filtroActual = persona;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const lista = persona ? todasLasExp.filter(e => e.persona === persona) : todasLasExp;
  renderizar(lista);
}

function actualizarStats() {
  document.getElementById('stat-total').textContent   = todasLasExp.length;
  document.getElementById('stat-daniela').textContent = todasLasExp.filter(e => e.persona === 'Daniela').length;
  document.getElementById('stat-ivan').textContent    = todasLasExp.filter(e => e.persona === 'Ivan').length;
  document.getElementById('stat-keila').textContent   = todasLasExp.filter(e => e.persona === 'Keila' || e.persona === 'Yeison').length;
}

function formatFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { year: 'numeric', month: 'short' });
}

function toggleFechaFin() {
  document.getElementById('fechaFin').disabled = document.getElementById('trabajoActual').checked;
}

function limpiarForm() {
  ['edit-id','empresa','cargo','fechaInicio','fechaFin','descripcion','ciudad'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('persona').value = '';
  document.getElementById('trabajoActual').checked = false;
  document.getElementById('form-title').textContent = 'Nueva Experiencia';
  document.getElementById('form-badge').textContent = 'POST';
  document.getElementById('form-badge').className   = 'badge';
  document.getElementById('fechaFin').disabled = false;
}

function cancelarEdicion() { limpiarForm(); }

function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}
