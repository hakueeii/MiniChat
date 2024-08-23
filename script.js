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
        const { message, user, timestamp, file } = data;
        const item = document.createElement('li');
        item.className = 'message';

        if (file) {
          if (file.type.startsWith('image/')) {
            item.innerHTML = `
              <span class="timestamp">${timestamp}</span>
              <span class="username">${user}:</span>
              <span class="text">${message || ''}</span>
              <img src="${file.url}" alt="Imagem" class="message-img">
              <a href="${file.url}" download>${file.name}</a>
            `;
          } else if (file.type.startsWith('video/')) {
            item.innerHTML = `
              <span class="timestamp">${timestamp}</span>
              <span class="username">${user}:</span>
              <span class="text">${message || ''}</span>
              <video controls src="${file.url}" class="message-video"></video>
              <a href="${file.url}" download>${file.name}</a>
            `;
          }
        } else {
          item.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="username">${user}:</span>
            <span class="text">${message}</span>
          `;
        }

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

      document.getElementById('file-input').addEventListener('change', handleFileSelect);

      function sendMessage() {
        const input = document.getElementById('message-input');
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        
        if (input.value.trim() || file) {
          const timestamp = new Date().toLocaleTimeString();
          if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
              socket.emit('chat message', { 
                message: input.value, 
                user: nickname, 
                timestamp, 
                file: { 
                  url: event.target.result, 
                  name: file.name,
                  type: file.type 
                } 
              });
              fileInput.value = ''; // Clear file input after sending
            };
            reader.readAsDataURL(file);
          } else {
            socket.emit('chat message', { 
              message: input.value, 
              user: nickname, 
              timestamp 
            });
          }
          input.value = ''; // Clear message input after sending
        }
      }

      function handleFileSelect(event) {
        // Apenas exibe o nome do arquivo, não é necessário alterar o preview
        const file = event.target.files[0];
        if (file) {
          console.log('Arquivo selecionado:', file.name);
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
