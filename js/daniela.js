// ===== AUDIO AUTOMÁTICO AL CARGAR LA PÁGINA =====
window.addEventListener("load", () => {
    const audio = document.getElementById("audioFondo");
    audio.play().catch(() => {
        document.body.addEventListener("autoplay", () => {
            audio.play();
        }, { once: true });
    });
});

// ===== FUNCIÓN MOSTRAR INFORMACIÓN ADICIONAL =====
function mostrarInfo(tipo) {
    const infoDiv = document.getElementById('infoAdicional');
    const informacion = {
        sena: `
            <h3><i class="fa-solid fa-certificate"></i> Certificaciones SENA</h3>
            <ul>
                <li>English Does Work – Level 1 | 2025</li>
                <li>English Does Work – Level 2 | 2025</li>
                <li>Aprendiz Digital | 2025</li>
                <li>Reconocimiento de la ciencia y la innovación | 2021</li>
            </ul>
        `,
        universidad: `
            <h3><i class="fa-solid fa-building-columns"></i> Universidad de Cartagena</h3>
            <p><strong>Carrera:</strong> Ingeniería de Software</p>
            <p><strong>Semestre actual:</strong> 4to semestre</p>
            <p><strong>Logros:</strong> Promedio académico normal</p>
        `,
        contacto: `
            <h3><i class="fa-solid fa-envelope"></i> Contacto rápido</h3>
            <p><strong>Email:</strong> <a href="mailto:dpaeza@unicartagena.edu.co" class="link-contacto">dpaeza@unicartagena.edu.co</a></p>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/573218392265" target="_blank" class="link-contacto">321 839 2265</a></p>
            <p><strong>Disponibilidad:</strong> Inmediata para prácticas profesionales</p>
        `
    };
    infoDiv.innerHTML = informacion[tipo];
    infoDiv.style.display = 'block';
    infoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== VALIDACIÓN Y ENVÍO DEL FORMULARIO CON JQUERY =====
$(document).ready(function () {

    // Animación al hacer focus en los campos
    $('.form-control').focus(function () {
        $(this).parent().addClass('foco-animado');
    }).blur(function () {
        $(this).parent().removeClass('foco-animado');
    });

    // Envío del formulario con EmailJS
    $('#formContacto').submit(function (event) {
        event.preventDefault();

        let esValido = true;

        function mostrarError(campo, mensaje) {
            const input = $(campo);
            input.addClass('is-invalid');
            const feedback = input.siblings('.invalid-feedback');
            feedback.text(mensaje);
            feedback.slideDown(300);
            esValido = false;
        }

        function limpiarError(campo) {
            const input = $(campo);
            input.removeClass('is-invalid');
            input.siblings('.invalid-feedback').slideUp(200);
        }

        const nombre = $('#nombre').val().trim();
        if (nombre === '') mostrarError('#nombre', 'El nombre completo es obligatorio.');
        else limpiarError('#nombre');

        const email = $('#email').val().trim();
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (email === '') mostrarError('#email', 'El correo electrónico es obligatorio.');
        else if (!emailRegex.test(email)) mostrarError('#email', 'Ingresa un correo válido (ej: usuario@dominio.com).');
        else limpiarError('#email');

        const telefono = $('#telefono').val().trim();
        const telefonoRegex = /^\d{7,15}$/;
        if (telefono !== '' && !telefonoRegex.test(telefono)) mostrarError('#telefono', 'El teléfono debe contener solo números (mínimo 7 dígitos).');
        else limpiarError('#telefono');

        const asunto = $('#asunto').val().trim();
        if (asunto === '') mostrarError('#asunto', 'El asunto es obligatorio.');
        else limpiarError('#asunto');

        const mensaje = $('#mensaje').val().trim();
        if (mensaje === '') mostrarError('#mensaje', 'El mensaje no puede estar vacío.');
        else limpiarError('#mensaje');

        if (!esValido) return;

        const form = $(this);

        $('#btnEnviarFormulario').prop('disabled', true).html('<i class="fa-regular fa-spinner fa-spin"></i> Enviando...');

        emailjs.send("service_8oafjqd", "template_9gttt6a", {
            name:     nombre,
            email:    email,
            telefono: telefono,
            title:    asunto,
            message:  mensaje
        })
        .then(function () {
            $('#modalHeader').removeClass('bg-danger').addClass('bg-success');
            $('#modalExitoLabel').html('<i class="fa-regular fa-circle-check"></i> Mensaje enviado');
            $('#modalBody').html(`
                <div class="text-center">
                    <i class="fa-regular fa-circle-check fa-3x text-success mb-3"></i>
                    <p>¡Mensaje enviado exitosamente!</p>
                    <p>Te responderé a la brevedad.</p>
                    <button id="btnVolver" class="btn btn-primary mt-2">Volver a mi hoja de vida</button>
                </div>
            `);
            $('#modalExito').modal('show');
            form[0].reset();
            $('.form-control').removeClass('is-invalid');
            $('.invalid-feedback').hide();
        })
        .catch(function (error) {
            $('#modalHeader').removeClass('bg-success').addClass('bg-danger');
            $('#modalExitoLabel').html('<i class="fa-regular fa-circle-xmark"></i> Error');
            $('#modalBody').html(`
                <div class="text-center">
                    <i class="fa-regular fa-circle-xmark fa-3x text-danger mb-3"></i>
                    <p>Hubo un error al enviar el mensaje.</p>
                    <p class="small text-muted">Detalle: ${error.text}</p>
                    <button class="btn btn-secondary mt-2" data-bs-dismiss="modal">Cerrar</button>
                </div>
            `);
            $('#modalExito').modal('show');
            $('#btnEnviarFormulario').prop('disabled', false).html('<i class="fa-regular fa-paper-plane"></i> Enviar mensaje');
        });
    });
});