let pinger = [];
pinger.utility = [];
// Config
pinger.config = {
    'tickspeed': 1, // This is in seconds
    'popularity': 0.2,
    'callProbability': 0.1,
    'chances': {
        'notification': 45,
        'mute': 20,
        'join': 20,
        'leave': 20,
        'call': 5,
    },
    'easteregg': {
        'call': 0.1
    },
    'callOnly': ['mute', 'leave', 'join'],
    'ringTimeout': 30000, // This is in milliseconds
    'callTimout': 30000
}
pinger.active = false;
pinger.inCall = false;
pinger.lastCall = 0;
pinger.latestRing = 0;

pinger.isRinging = function() {
    const time = Date.now() - pinger.latestRing;
    if (time < pinger.config.ringTimeout) { return true }
    else { return false }
};

// Sounds and the paths
pinger.sounds = {
    'notification': 'assets/notification.mp3',
    'mute': 'assets/mute.mp3',
    'join': 'assets/join.mp3',
    'leave': 'assets/leave.mp3',
    'call': 'assets/call.mp3',
    'call-easteregg': 'assets/call-easteregg.mp3',
}

pinger.play = function() {
    function playSound(option) {
        if (pinger.config.easteregg.hasOwnProperty(option)) {
            if ((Math.random() < pinger.config.easteregg[option]) ? true : false)
            option += '-easteregg'
        }
        if (option === 'call') { pinger.latestRing = Date.now(); pinger.call.logic() }
        const path = pinger.sounds[option]
        const audio = new Audio(path)
        audio.play()
        console.log('[ Pinger ] Played ' + option)
    }

    console.log('[ Pinger ] Tick')
    pinger.webhook.send()

    const stop = (Math.random() < pinger.config.popularity) ? false : true;
    if (stop) { return }

    let options = []
    for (const [key, value] of Object.entries(pinger.config.chances)) {
        if (key === 'call' && pinger.isRinging()) { continue }
        if (pinger.config.callOnly.includes(key) && pinger.inCall === false) { continue }
        for (let i = 0; i < value; i++) {
            options.push(key)
        }
    }
    const option = options[Math.floor(Math.random() * options.length)]
    playSound(option)
}

pinger.start = function() {
    if (pinger.active === true) { console.log('[ Pinger ] Already active'); return }
    pinger.active = true;
    pinger.clock = setInterval(pinger.play, pinger.config.tickspeed * 1000)
    console.log('[ Pinger ] Started with tickspeed of ' + pinger.config.tickspeed + ' seconds')
}

pinger.stop = function() {
    if (pinger.active === false) { console.log('[ Pinger ] Already inactive'); return }
    clearInterval(pinger.clock)
    console.log('[ Pinger ] Stopped')
    pinger.active = false;
}

pinger.toggle = function() {
    if (pinger.active === false) { pinger.start(); return };
    if (pinger.active === true) { pinger.stop(); return };
}

pinger.update = [];
pinger.update.tickspeed = function(tickspeed) {
    console.log('[ Pinger ] Updated tickspeed to ' + tickspeed + ' ms')
    pinger.config.tickspeed = tickspeed
    if(pinger.active === false) { return };
    clearInterval(pinger.clock);
    pinger.clock = setInterval(pinger.play, pinger.config.tickspeed * 1000)
}

/* Smart call taking */
pinger.call = [];

pinger.call.take = function() {
    const path = pinger.sounds.join;
    const audio = new Audio(path);
    audio.play();
    pinger.inCall = true;
};

pinger.call.hang = function() {
    pinger.lastCall = Date.now();
    const path = pinger.sounds.leave;
    const audio = new Audio(path);
    audio.play();
    pinger.inCall = false;
};

pinger.call.logic = function () {
    if (pinger.call.conditions()) { return; }
    if (Math.random() < pinger.config.popularity) { return }
    pinger.call.take();
    setTimeout(pinger.call.hang, 60000)
};

pinger.call.conditions = function() {
    let conditions = []
    if (pinger.inCall === true) { conditions.push('call') };
    if (Date.now() - pinger.lastCall < pinger.callTimout) { conditions.push('timout') };
    console.log(conditions)

    if (conditions.length !== 0) { return true }
}


/* Real Discord pings */
pinger.webhook = [];
pinger.webhook.config = {
    'url': '',
    'message': '',
    'probability': 0
}

pinger.webhook.send = function() {
    if ((Math.random() < pinger.webhook.config.probability) ? false : true) { return }
    if (pinger.webhook.config.url === '') { return }
    if (pinger.webhook.config.message === '') {pinger.webhook.config.message = 'You just got PINGED by DiscordPinger'}
    const request = new XMLHttpRequest();
    request.open('POST', pinger.webhook.config.url);
    request.setRequestHeader('Content-type', 'application/json');
    const params = {
        username: 'DiscordPinger',
        content: pinger.webhook.config.message
    }
    request.send(JSON.stringify(params))
}