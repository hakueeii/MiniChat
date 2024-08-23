let socket;
let nickname;

function enterAsVisitor() {
  nickname = document.getElementById('nickname').value;

  if (nickname.trim()) {
    initializeSocket(nickname);
  } else {
    alert('Por favor, insira um apelido.');
  }
}

function initializeSocket(nickname) {
  socket = io();

  socket.emit('user joined', nickname, (response) => {
    if (response.error) {
      alert(response.error); // Exibir mensagem de erro
    } else {
      document.getElementById('chat-container').classList.remove('hidden');
      document.getElementById('login-container').classList.add('hidden');

      socket.on('chat message', (data) => {
        const { message, user, timestamp } = data;
        const item = document.createElement('li');
        item.className = 'message';
        item.innerHTML = `
          <span class="timestamp">${timestamp}</span>
          <span class="username">${user}:</span>
          <span class="text">${message}</span>
        `;
        document.getElementById('messages').appendChild(item);
      });

      socket.on('user list', (users) => {
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';
        users.forEach(user => {
          const li = document.createElement('li');
          li.textContent = user;
          userList.appendChild(li);
        });
      });

      document.getElementById('send-button').addEventListener('click', () => {
        sendMessage();
      });

      document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      function sendMessage() {
        const input = document.getElementById('message-input');
        if (input.value.trim()) {
          const timestamp = new Date().toLocaleTimeString();
          socket.emit('chat message', { message: input.value, user: nickname, timestamp });
          input.value = '';
        }
      }
    }
  });
}

function logout() {
  if (socket) {
    socket.emit('user left', nickname); // Notifica o servidor que o usuário está saindo
    socket.disconnect(); // Desconectar o socket
  }
  document.getElementById('chat-container').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');
}
