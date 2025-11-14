const socket = io(); 
const box = document.querySelector('#box');
const app = document.querySelector('#app-chat');

let user = '';

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
    box?.focus();

    box?.addEventListener('keyup', e => {
        const { key, target } = e;
        if (key === 'Enter' && target.value.trim() !== '') {
            const text = target.value.trim();
            socket.emit('message', { user, message: text });
            box.value = '';
        }
    });
});

socket.on('messageLogs', (data) => {
    if (!Array.isArray(data) || !app) return;
    app.innerHTML = '';
    data.forEach(chat => {
        const p = document.createElement('p');
        p.innerText = `${chat.user}: ${chat.message}`;
        app.appendChild(p);
    });
});