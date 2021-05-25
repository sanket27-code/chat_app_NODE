const socket = io()
const $message_form = document.querySelector('#message_form')
const $message_form_input = document.querySelector('input')
const $send_location = document.querySelector('#send_location')
const $messages = document.querySelector('#messages')
const $userListSide = document.querySelector('#userList_side')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const usersTemplate = document.querySelector('#users-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // new Message element
    const $newMessage = $messages.lastElementChild

    // height of new meassage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginTop)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', ({text, createdAt, side, username}) => {
    if (text.trim().length !== 0) {
        const createdAt_format = moment(createdAt).format("h:mm a")
        const html = Mustache.render(messageTemplate, { message:text, createdAt:createdAt_format, side, username })
        $messages.insertAdjacentHTML('beforeend', html)

        autoscroll()
    }
})

socket.on('roomData', ({room, users}) => {
    if (window.innerWidth <= 340 && room.length >= 20){
        room = room.substring(0,8) + '...'
    }
    else if (window.innerWidth < 800 && room.length >= 20){
        room = room.substring(0,8) + '...'
    }
    else if (window.innerWidth <= 980 && room.length >= 20){
        room = room.substring(0,12) + '...'
    }
    else if (window.innerWidth > 980 && room.length >= 20){
        room = room.substring(0,15) + '...'
    }
    const html = Mustache.render(usersTemplate, {room, users})
    $userListSide.innerHTML = html
})

socket.on('locationMessage', ({url, createdAt, username}) => {
    console.log(url)
    const createdAt_format = moment(createdAt).format("h:mm a")
    const html = Mustache.render(locationTemplate, { url, createdAt: createdAt_format, username })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('userTyping', (username) => {
    const text = username + ' is typing...'
    document.getElementById("Typing").innerHTML = text
    setTimeout(()=>{
        document.querySelector('#Typing').innerHTML = ''
    },800)
})

document.querySelector('#message_form').addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message_input.value
    socket.emit('send_message', message, (notify) => {
        $message_form_input.value = ''
        $message_form_input.focus()
    })
})
$message_form_input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter'){
        socket.emit('typing', { username, room })
    }
})
$send_location.addEventListener('click', ()=>{
    if (!navigator.geolocation) {
        return alert('GeoLocation is not supported by your browser')
    }
    $send_location.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        socket.emit('send_location', {latitude, longitude}, () => {
            setTimeout(()=>{
                $send_location.removeAttribute('disabled')
            }, 3000)
        })
    })
})

socket.emit('join', { username, room })