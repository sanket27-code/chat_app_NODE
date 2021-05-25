const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { getMessage, getLocationMessage } = require('./messages/getMessages')
const { addUser, getUser, getUsers, deleteUser } = require('./Users/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log('new connection found!')

    socket.on('join', ({username, room}) => {
        socket.join(room)
        const users = addUser(socket.id, username, room)
        socket.emit('message', getMessage('Welcome!', 'left', 'Admin'))
        socket.broadcast.to(room).emit('message', getMessage(`${username} has joined!`, 'admin'))
        io.to(room).emit('roomData', {
            room,
            users: getUsers(room)
        })
    })

    socket.on('send_message', (msg, callback) => {
        const filter = new Filter()
        
        const user = getUser(socket.id)
        if (filter.isProfane(msg)) {
            socket.broadcast.to(user.room).emit('message', getMessage(filter.clean(msg), 'left', user.username))
            return callback("       Pls don't use bad words")
        }
        socket.emit('message', getMessage(msg, 'right'))
        socket.broadcast.to(user.room).emit('message', getMessage(msg, 'left', user.username))
        callback("      delivered successfully!")
    })

    socket.on('send_location', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('locationMessage', getLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`, user.username))
        callback()
    })

    socket.on('typing', ({ username, room }) => {
        socket.broadcast.to(room).emit('userTyping', username)
    })

    socket.on('disconnect', () => {
        const leftUser = deleteUser(socket.id)
        socket.broadcast.to(leftUser.room).emit('message', getMessage(`${leftUser.username} left the chat!`, 'admin'))
        io.to(leftUser.room).emit('roomData', {
            room: leftUser.room,
            users: getUsers(leftUser.room)
        })
    })
})

server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})