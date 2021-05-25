const users = []

const addUser = (id, username, room) => {
    username = username.toLowerCase().trim()
    const duplicateUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(duplicateUser){
        return { error: 'This username is already taken!'}
    }

    const idCheck = users.findIndex((user) => user.id === id )

    if (idCheck !== -1) {
        return { error: 'User id is already existing'}
    }

    const user = { id, username, room}
    users.push(user)
    return user
}

const getUser = (id) => {
    const Matchedindex = users.findIndex((user) => user.id === id)
    if (Matchedindex === -1){
        return { error: 'No user Found!'}
    }
    const User = users[Matchedindex]
    return User
}

const getUsers = (room) => {
    const roomUsers = users.filter((user) => user.room === room)
    return roomUsers
}

const deleteUser = (id) => {
    const userMatchedIndex = users.findIndex((user) => user.id === id)
    if (userMatchedIndex === -1){
        return { error: 'No user Found!'}
    }
    const removedUser = users.splice(userMatchedIndex, 1)
    return removedUser[0]
}

module.exports = {
    addUser,
    getUser,
    getUsers,
    deleteUser
}