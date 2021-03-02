let pinger = []
// Config
pinger.config = {
    'tickspeed': 1000,
    'chances': {
        'notification': 20,
        'mute': 20,
        'join': 20,
        'leave': 20,
        'call': 20,
    },
    'eastereggs': {
        'call-remix': 0.1
    }
}

// Sounds and the paths
pinger.sounds = {
    'notification': 'assets/notification.mp3',
    'mute': 'assets/mute.mp3',
    'join': 'assets/join.mp3',
    'leave': 'assets/leave.mp3',
    'call': 'assets/call.mp3',
    'call-remix': 'assets/call-remix.mp3',
}

pinger.play = function() {
    let options = []
    for (const [key, value] of Object.entries(pinger.config.chances)) {
        for (let i = 0; i < value; i++) {
            options.push(key)
        }
    }
    const option = options[Math.floor(Math.random() * options.length)]
}

pinger.start = function() {
    pinger.clock = setInterval(pinger.play, pinger.config.tickspeed)
}

pinger.stop = function() {
    clearInterval(pinger.clock)
}