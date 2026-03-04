function verDiploma() {
    const diploma = document.getElementById("diplomaContainer");
    diploma.style.display = diploma.style.display === "none" ? "block" : "none";
  }
  
  function reproducirSonido() {
    const audio = document.getElementById("miAudio");
    audio.play();
  }
  document.addEventListener("DOMContentLoaded", function() {

    const btnDiploma = document.getElementById("btnDiploma");
    const modal = document.getElementById("modalDiploma");
    const cerrar = document.querySelector(".cerrar");
  
    btnDiploma.addEventListener("click", function() {
      modal.style.display = "flex";
    });
  
    cerrar.addEventListener("click", function() {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", function(e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  
  });
  const btnPDF = document.getElementById("btnPDF");

  btnPDF.addEventListener("click", function () {
  
    const elemento = document.getElementById("cv");
  
    const opciones = {
      margin: 10,
      filename: 'Ivan_Ariza_CV.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 3,
        useCORS: true,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
  
    html2pdf().set(opciones).from(elemento).save();
  
  });