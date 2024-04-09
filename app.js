import {h} from './lib/h.js'
import {bogbot} from './bogbot.js' 
import {prompter} from './prompter.js'
import {render, avatar} from './render.js'
import {settings} from './settings.js'
import {connect, gossip} from './connect.js'


if (!window.location.hash) { window.location = '#' }

const server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host

connect(server)

const screen = h('div', {id: 'screen'})

const navbar = h('div', {id: 'navbar'}, [
  await avatar(await bogbot.pubkey()),
  h('button', {onclick: () => {
    window.location.hash = '#'
    window.scrollTo(0, document.body.scrollHeight)
  }}, ['Home']),
  h('button', {
    onclick: () => {
      window.location.hash = '#settings'
    }
  }, ['Settings'])
])

screen.appendChild(navbar)

document.body.appendChild(screen)

const route = async () => {
  const src = window.location.hash.substring(1)
  if (src.length === 43) {
    window.location.hash = src + '='
  }
  screen.appendChild(await prompter(src))
  const scroller = h('div', {id: 'scroller'})
  screen.appendChild(scroller)

  if (src === 'settings') { 
    scroller.appendChild(settings)    
  } else {
    const log = await bogbot.query(src)

    if (log && log[0]) {
      for (const msg of log) {
        const got = document.getElementById(msg.hash)

        if (!got) {
          const rendered = await render(msg)
          scroller.appendChild(rendered)
        }
      }
    } else if (src.length === 44) {
      gossip(src)
    }

    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight)
    }, 50)

  }
}

window.onhashchange = () => {
  const promptdiv = document.getElementById('prompter')
  if (promptdiv) {
    promptdiv.remove()
  }
  const scroller = document.getElementById('scroller')
  if (scroller) {
    scroller.remove()
  }
  route() 
}

route() 
