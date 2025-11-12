const socket = io();

function appendMessage(socketId, message) {
    const messageList = document.getElementById('messageList');
    const newMessage = document.createElement('p');
    newMessage.textContent = `${socketId}: ${message}`;
    messageList.appendChild(newMessage);
}

let messagesLoaded = false;


socket.on('messageList', (messages) => {
    const messageList = document.getElementById('messageList');

    if (!messagesLoaded) {
        messageList.innerHTML = "";
        messages.forEach((message) => {
            appendMessage(message.socketId, message.message);
        });
        messagesLoaded = true;
    }
});

socket.on('newMessage', (data) => {
    appendMessage(data.socketId, data.message);
});


function sendMessage() {
    const message = document.getElementById('messageInput').value;
    socket.emit('newMessage', message);
    document.getElementById('messageInput').value = "";
}

