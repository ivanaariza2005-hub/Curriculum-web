// ── Configuración ──────────────────────────────
const API = 'https://curriculumapi-production.up.railway.app/api/experiencias';

// ── Estado ────────────────────────────────────
let todasLasExp = [];
let filtroActual = '';

// ── Al cargar ─────────────────────────────────
window.onload = () => cargar();

// ── Cargar todas ──────────────────────────────
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
        <div class="empty-icon">⚠️</div>
        <p>No se pudo conectar a la API.<br/>Verifica tu conexión a internet.</p>
      </div>`;
  }
}

// ── Renderizar cards ───────────────────────────
function renderizar(lista) {
  const el = document.getElementById('lista');
  if (!lista.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><p>No hay experiencias todavía.<br/>¡Crea la primera!</p></div>`;
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
          <button class="btn-icon edit-btn" onclick="editar('${e._id}')" title="Editar">✏️</button>
          <button class="btn-icon del-btn"  onclick="eliminar('${e._id}')" title="Eliminar">🗑️</button>
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

// ── Guardar (POST o PUT) ───────────────────────
async function guardar() {
  const id = document.getElementById('edit-id').value;
  const body = {
    persona:       document.getElementById('persona').value,
    empresa:       document.getElementById('empresa').value,
    cargo:         document.getElementById('cargo').value,
    fechaInicio:   document.getElementById('fechaInicio').value,
    fechaFin:      document.getElementById('trabajoActual').checked ? null : document.getElementById('fechaFin').value,
    trabajoActual: document.getElementById('trabajoActual').checked,
    descripcion:   document.getElementById('descripcion').value,
    ciudad:        document.getElementById('ciudad').value,
  };

  if (!body.persona || !body.empresa || !body.cargo || !body.fechaInicio || !body.descripcion) {
    toast('⚠️ Completa todos los campos obligatorios', 'error'); return;
  }

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error();
    toast(id ? '✅ Experiencia actualizada' : '✅ Experiencia creada', 'success');
    limpiarForm();
    cargar();
  } catch {
    toast('❌ Error al guardar', 'error');
  }
}

// ── Editar ─────────────────────────────────────
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

// ── Eliminar ───────────────────────────────────
async function eliminar(id) {
  if (!confirm('¿Seguro que deseas eliminar esta experiencia?')) return;
  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    toast('🗑️ Experiencia eliminada', 'success');
    cargar();
  } catch {
    toast('❌ Error al eliminar', 'error');
  }
}

// ── Filtrar ────────────────────────────────────
function filtrar(persona, btn) {
  filtroActual = persona;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const lista = persona ? todasLasExp.filter(e => e.persona === persona) : todasLasExp;
  renderizar(lista);
}

// ── Stats ──────────────────────────────────────
function actualizarStats() {
  document.getElementById('stat-total').textContent   = todasLasExp.length;
  document.getElementById('stat-daniela').textContent = todasLasExp.filter(e => e.persona === 'Daniela').length;
  document.getElementById('stat-ivan').textContent    = todasLasExp.filter(e => e.persona === 'Ivan').length;
  document.getElementById('stat-keila').textContent   = todasLasExp.filter(e => e.persona === 'Keila' || e.persona === 'Yeison').length;
}

// ── Helpers ────────────────────────────────────
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
