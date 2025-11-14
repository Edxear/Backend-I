const socket = io();
const input = document.getElementById('box');
const chatContainer = document.getElementById('app-chat');
let user = '';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

Swal.fire({
  title: 'Identificate',
  input: 'text',
  text: 'Ingresa tu nombre de usuario',
  allowOutsideClick: false,
  inputValidator: (value) => {
    return !value && 'Necesitas identificarte para ingresar a la sala';
  }
}).then(result => {
  if (!result || !result.value) return;
  user = result.value;
  input?.focus();

  input?.addEventListener('keyup', evt => {
    if (evt.key === 'Enter') {
      const text = input.value.trim();
      if (text.length > 0) {
        socket.emit('message', { user, message: text });
        input.value = '';
      }
    }
  });
});

socket.on('messageLogs', data => {
  if (!Array.isArray(data)) return;
  if (!chatContainer) return;
  chatContainer.innerHTML = data.map(m =>
    `<p><strong>${escapeHtml(m.user)}</strong> dice: ${escapeHtml(m.message)}</p>`
  ).join('');
});
