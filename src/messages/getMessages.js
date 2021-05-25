const getMessage = (msg, side, username) => {
    if(!username){
        username = ''
    }
    return {
        text: msg,
        createdAt: new Date().getTime(),
        side,
        username
    }
}

const getLocationMessage = (url, username) => {
    return {
        url,
        createdAt: new Date().getTime(),
        username
    }
}

module.exports = {
    getMessage,
    getLocationMessage
}