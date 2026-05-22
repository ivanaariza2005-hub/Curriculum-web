// JavaScript para Hoja de Vida Yeison Chacon

$(document).ready(function() {
    // Toast notification
    function showToast(message, type = 'success') {
        const toast = $('#toast');
        const toastMessage = $('#toast-message');
        toastMessage.text(message);
        toast.css('background', type === 'success' ? '#28a745' : '#dc3545');
        toast.addClass('show');
        setTimeout(() => toast.removeClass('show'), 3000);
    }

    // Profile photo load
    const profilePreview = $('#profile-preview');
    const savedPhoto = localStorage.getItem('cv_profile_photo');
    if (savedPhoto) {
        profilePreview.attr('src', savedPhoto);
    }

    // Toggle buttons
    $('#personal-toggle').on('click', function() {
        const content = $('#personal-content');
        const isVisible = content.is(':visible');
        content.toggle();
        $(this).html(isVisible ? '<i class="fas fa-eye"></i> Ver información personal' : '<i class="fas fa-eye-slash"></i> Ocultar información');
    });

    $('#experience-toggle').on('click', function() {
        const content = $('#experience-content');
        const isVisible = content.is(':visible');
        content.toggle();
        $(this).html(isVisible ? '<i class="fas fa-briefcase"></i> Ver experiencia' : '<i class="fas fa-eye-slash"></i> Ocultar experiencia');
    });

    $('#diploma-btn').on('click', function() {
        window.open('/imagenes/diploma_yeison.pdf', '_blank');
        showToast('Abriendo diploma...');
    });

    // Copy buttons
    $('.copy-btn').on('click', function() {
        const text = $(this).data('copy');
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copiado al portapapeles');
        }).catch(() => showToast('Error al copiar', 'error'));
    });

    // Section hover effects
    $('.cv-section').hover(
        function() { $(this).css('transform', 'translateX(10px)'); },
        function() { $(this).css('transform', 'translateX(0)'); }
    );

    // Portal button
    $('#back-to-top').on('click', function() {
        window.open('https://portafolio-grupoudc.netlify.app/', '_blank');
        showToast('Abriendo portal hojas de vida');
    });
    
    console.log('✅ Hoja de Vida completa - Todos buttons working');
});

