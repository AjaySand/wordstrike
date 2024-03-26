import './style.css'

import setupGame from './game.js'

document.querySelector('#app').innerHTML = `
    <div>
        <canvas id="counter"></canvas>
    </div>
`

const canvas = document.querySelector('#counter')
if (canvas) {
    setupGame(canvas)
}
