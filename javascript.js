// Animación de aparición (Scroll Reveal)
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.1 });
reveals.forEach(r => io.observe(r));

// Lógica del Chat interactivo
const sendAudio = document.getElementById("sound-send");
const receiveAudio = document.getElementById("sound-receive");
let selectedImageBase64 = null;

function toggleChat() {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.style.display = (chatContainer.style.display === "none" || chatContainer.style.display === "") ? "flex" : "none";
}

function handleKeyPress(event) {
    if (event.key === "Enter") sendMessage();
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        selectedImageBase64 = e.target.result;
        document.getElementById("img-preview").src = selectedImageBase64;
        document.getElementById("preview-container").style.display = "flex";
    }
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    selectedImageBase64 = null;
    document.getElementById("file-input").value = "";
    document.getElementById("preview-container").style.display = "none";
}

async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const message = inputField.value.trim();
    
    if (!message && !selectedImageBase64) return;

    let userMessageHTML = `<div class="message user-message">`;
    if (selectedImageBase64) {
        userMessageHTML += `<img src="${selectedImageBase64}" class="chat-img" />`;
    }
    if (message) {
        userMessageHTML += `<p style="margin: 5px 0 0 0;">${message}</p>`;
    }
    userMessageHTML += `</div>`;
    
    chatBox.innerHTML += userMessageHTML;
    
    const imageToSend = selectedImageBase64;
    clearImagePreview();
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try { sendAudio.play(); } catch(err) {}

    try {
        const response = await fetch('https://chat-de-productos-naturales-3.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                image: imageToSend 
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const serverMsg = errorData.reply || errorData.error || `Código: ${response.status}`;
            chatBox.innerHTML += `<div class="message bot-message" style="color:#d9534f;">Error: ${serverMsg}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            return;
        }

        const data = await response.json();
        
        if (data.reply) {
            chatBox.innerHTML += `<div class="message bot-message">${data.reply}</div>`;
            try { receiveAudio.play(); } catch(err) {}
        } else {
            chatBox.innerHTML += `<div class="message bot-message" style="color:#d9534f;">Error en formato de respuesta del servidor.</div>`;
        }
    } catch (error) {
        chatBox.innerHTML += `<div class="message bot-message" style="color:#d9534f;">Error técnico de conexión: ${error.message}</div>`;
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ── CARRUSEL FILOSOFÍA ──
let currentSlide = 0;
const totalSlides = 3;

function moveCarousel(dir) {
  currentSlide = (currentSlide + dir + totalSlides) % totalSlides;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

// Auto-avance cada 4 segundos
setInterval(() => moveCarousel(1), 4000);

async function registrarEmail(event) {
    event.preventDefault(); // Evita que la página se recargue por completo
    
    const emailInput = document.getElementById("nl-email");
    const email = emailInput.value.trim();

    if (!email) return;

    try {
        // CAMBIA 'TU_URL_DE_RENDER_AQUÍ' por tu enlace real, dejando el /api/subscribe al final
        const response = await fetch('https://ecoglow-gmail.onrender.com/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("¡Te suscribiste con éxito a la Comunidad Ecoglow! 🌿");
            emailInput.value = ""; // Limpia el casillero de correo si salió todo bien
        } else {
            alert("Hubo un problema: " + (data.error || "Inténtalo de nuevo."));
        }
    } catch (error) {
        console.error("Error de conexión con el boletín:", error);
        alert("Error técnico al conectar con el servidor de Ecoglow.");
    }
}

// NUEVA FUNCIÓN: Abre el chat, escribe el prompt automático y lo envía de una.
function enviarPromptChat(texto) {
    const chatContainer = document.getElementById("chat-container");
    // Si el chat está cerrado, lo forzamos a abrirse
    if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
        toggleChat();
    }
    
    // Ponemos el texto en el input del usuario
    const inputField = document.getElementById("user-input");
    inputField.value = texto;
    
    // Ejecutamos tu función nativa sendMessage() para que se envíe directo al backend
    sendMessage();
}
