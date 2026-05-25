// Intersection Observer para las animaciones fade-in y barras de habilidades
document.addEventListener('DOMContentLoaded', () => {
    // Animación Fade-In
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));

    // Animación de las barras de progreso (habilidades)
    const skillFills = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    skillFills.forEach(el => skillObserver.observe(el));

    // Descargar PDF
    const btnPDF = document.getElementById('btnPDF');
    if (btnPDF) {
        btnPDF.addEventListener('click', () => {
            const element = document.getElementById('cv');
            const opt = {
                margin:       10,
                filename:     'CV_Ivan_Ariza.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }
    
    // Contador de caracteres para el mensaje
    const fMensaje = document.getElementById('fMensaje');
    const charCount = document.getElementById('charCount');
    if (fMensaje && charCount) {
        fMensaje.addEventListener('input', () => {
            const length = fMensaje.value.length;
            charCount.textContent = `${length} / 500`;
            if (length >= 500) {
                charCount.classList.add('over');
                charCount.classList.remove('warn');
            } else if (length >= 450) {
                charCount.classList.add('warn');
                charCount.classList.remove('over');
            } else {
                charCount.classList.remove('warn', 'over');
            }
        });
    }

    // Simulación de envío del formulario
    const btnEnviar = document.getElementById('btnEnviar');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', () => {
            const fNombre = document.getElementById('fNombre').value.trim();
            const fEmail = document.getElementById('fEmail').value.trim();
            const fMensajeVal = fMensaje ? fMensaje.value.trim() : '';

            if (fNombre === '' || fEmail === '' || fMensajeVal === '') {
                mostrarToast('Por favor completa los campos requeridos', 'error');
                return;
            }

            // Simular envío
            mostrarToast('Mensaje enviado correctamente', 'success');
            
            // Limpiar formulario
            document.getElementById('cvForm').querySelectorAll('input, textarea, select').forEach(el => {
                if (el.type === 'checkbox') {
                    el.checked = false;
                } else {
                    el.value = '';
                }
            });
            if (charCount) charCount.textContent = '0 / 500';
        });
    }
});

// Función para reproducir el sonido
function reproducirSonido() {
    const audio = document.getElementById('miAudio');
    if (audio) {
        audio.play().catch(error => console.log('Error reproduciendo el audio', error));
    }
}

// Función para mostrar toast
function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `cv-toast ${tipo}`;
    
    const icon = tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    
    toast.innerHTML = `
        <i class="bi ${icon} cv-toast-icon"></i>
        <span>${mensaje}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remover después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
