console.log("esto deberia de verse en consola - pantalla socket")
const socket = io(); // establece la conexion del cliente hacia el server 
const box = document.querySelector('#box')
const app = document.querySelector('#app-chat')
const teclaEnter = 'Enter'

let user = '';

Swal.fire({
    title: 'Quien sos?',
    input: 'text',
    text: 'Ingresa un nick para identificarte en la sala',
    allowOutsideClick: false,
    inputValidator: (value) => {
        return !value && 'necesitas un nick para poder chatear'
    }
}).then(nick => {
    user = nick.value
})

box.addEventListener('keyup', (e) => {
    const { key, target } = e
    if (key === teclaEnter && target.value !== '') {
        // enviar al servidor el mensaje con el usuario
        socket.emit('mensaje', { user, mensaje: target.value })
        box.value = '';
    }
})

socket.on('lista_de_mensaje_actualizada', (data) => { // mensajes -> BBDD
    // cree la card o la fila
    app.innerHTML = ''
    data.forEach(chat => {
        const p = document.createElement('p')
        p.innerText = `${chat.user}: ${chat.mensaje}`
        app.appendChild(p)
    })

})