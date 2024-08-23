const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = []; // Lista de usuários conectados

app.use(express.static('public')); // Servir arquivos estáticos

io.on('connection', (socket) => {
  let currentUser = '';

  socket.on('user joined', (nickname, callback) => {
    if (users.includes(nickname)) {
      callback({ error: 'Esse nickname já está em uso' });
    } else {
      currentUser = nickname;
      users.push(nickname);
      io.emit('user list', users); // Atualizar lista de usuários conectados
      callback({ success: true });
    }
  });

  socket.on('user left', (nickname) => {
    if (currentUser === nickname) {
      users = users.filter(user => user !== nickname);
      io.emit('user list', users); // Atualizar lista de usuários conectados
    }
  });

  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    if (currentUser) {
      users = users.filter(user => user !== currentUser);
      io.emit('user list', users); // Atualizar lista de usuários conectados
    }
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
