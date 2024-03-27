const WORD_SET = new Set([
    'hello',
    'world',
    'the',
    'have',
    'you',
    'know',
    'how',
    'to',
    'code',
    'with',
    'reset',
    'test',
    'game',
    'start',
    'stop',
    'reset',
])

const ENEMY_SPEED = 2
const SPAWN_RATE = 2000 // every 2 seconds

const ENTER_KEY = 13
const BACKSPACE_KEY = 8
const ESCAPE_KEY = 27
const SPACE_KEY = 32
const A_KEY = 65
const Z_KEY = 90
const HIGHTLIGHT_COLOR = 'blue'
const DEFAULT_COLOR = 'white'

const DEBUG = false

const OFFSET_FROM_TOP = 70

function getRandomItem(set) {
    const items = Array.from(set)
    return items[Math.floor(Math.random() * items.length)]
}

class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = null

        this.wordSet = WORD_SET
        this.wordsInPlay = []
        this.score = 0

        this.lastTimeWordAdded = null
        this.delay = SPAWN_RATE
        this.enemySpeed = ENEMY_SPEED

        this.playerInput = ""

        this.fps
        this.fpsInterval
        this.startTime
        this.now
        this.then
        this.elapsed
    }

    reset() {
        this.wordsInPlay = []
        this.score = 0
        this.lastTimeWordAdded = null
        this.delay = SPAWN_RATE
        this.enemySpeed = ENEMY_SPEED

        this.wordSet = WORD_SET
        this.playerInput = ''

        this.fps = 60
        this.fpsInterval = 1000 / this.fps
        this.then = Date.now()
        this.startTime = this.then
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.wordsInPlay.forEach(word => word.draw(this.ctx, this.playerInput))

        this.ctx.fillStyle = DEFAULT_COLOR // default letter color
        this.ctx.font = '48px "Roboto Mono", monospace'


        this.ctx.fillStyle = "gray"
        this.ctx.fillRect((this.canvas.width / 2) - 150, 0, 300, 50)
        this.ctx.fillStyle = DEFAULT_COLOR
        this.ctx.fillText(': ' + this.playerInput, (this.canvas.width / 2) - 150, 39, 300)
        this.ctx.font = '24px "Roboto Mono", monospace'
        this.ctx.fillText('Score: ' + this.score, 0, 25, 150)

        if (DEBUG) {
            this.ctx.font = '14px "Roboto Mono", monospace'
            this.ctx.fillText('delay: ' + this.delay, 0, 50, 150)
            this.ctx.fillText('enemy delay: ' + this.enemySpeed, 0, 65, 150)
        }
    }

    update() {
        if (this.lastTimeWordAdded === null || this.lastTimeWordAdded < Date.now() - this.delay) {
            const word = new Word(getRandomItem(this.wordSet), (Math.random() * (this.canvas.height - OFFSET_FROM_TOP)) + OFFSET_FROM_TOP)

            this.wordsInPlay.push(word)
            this.wordSet.delete(word.word)
            this.lastTimeWordAdded = Date.now()
        }

        this.wordsInPlay.forEach(word => word.update())

        // remove words that have gone off the screen
        const wordsToRemove = this.wordsInPlay.filter(word => word.x > this.canvas.width)
        if (wordsToRemove.length > 0) {
            this.wordsInPlay = this.wordsInPlay.filter(word => !wordsToRemove.includes(word))
            this.wordSet.add(wordsToRemove[0].word)

            // TODO: decrease player health
        }

        this.delay = this._calculateDelay(this.score)
        this.enemySpeed = this._calculateEnemySpeed(this.score)

        this.playerInput = this.playerInput.trim()
        const found = this.wordsInPlay.find(word => word.word === this.playerInput)
        if (found) {
            this.score += 1
            this.playerInput = ''

            this.wordSet.add(found.word)
            this.wordsInPlay = this.wordsInPlay.filter(word => word.word !== found.word)
        }
    }

    _calculateDelay(score) {
        if (score === 0) {
            return SPAWN_RATE
        } else if (score < 25) {
            return SPAWN_RATE * 0.90
        } else if (score < 50) {
            return SPAWN_RATE * 0.85
        } else if (score < 100) {
            return SPAWN_RATE * 0.65
        } else {
            return SPAWN_RATE * 0.50
        }
    }

    _calculateEnemySpeed(score) {
        if (score < 5) {
            return ENEMY_SPEED
        } else if (score < 25) {
            return ENEMY_SPEED * 1.15
        } else if (score < 50) {
            return ENEMY_SPEED * 1.25
        } else {
            return ENEMY_SPEED * 1.35
        }
    }

    handleInput(event, _this) {
        if (event === undefined) return

        const { keyCode, key } = event

        if (!(keyCode === BACKSPACE_KEY
            || keyCode === ESCAPE_KEY
            || (keyCode >= A_KEY && keyCode <= Z_KEY))
        ) {
            return
        }


        if (keyCode === BACKSPACE_KEY && event.ctrlKey) {
            _this.playerInput = ''
            return
        } else if (keyCode === BACKSPACE_KEY) {
            _this.playerInput = _this.playerInput.slice(0, -1)
            return
        }

        if (key.length === 1) {
            _this.playerInput += event.key
            _this.playerInput = _this.playerInput.trim()
        }
    }

    init() {
        this.ctx = this.canvas.getContext('2d')

        this.reset()

        this.loop()
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this))

        this.update()


        this.now = Date.now()
        this.elapsed = this.now - this.then
        if (this.elapsed > this.fpsInterval) {
            this.then = this.now - (this.elapsed % this.fpsInterval)

            this.ctx.fillStyle = "white"
            this.draw()
        }
    }
}

class Word {
    constructor(word, y) {
        this.word = word
        this.y = y
        this.x = 0
    }

    draw(ctx, userInput) {
        if (!(this.word && this.word.length)) return

        ctx.font = '48px "Roboto Mono", monospace'

        let matching = true
        for (let i = 0; i < this.word.length; i++) {
            let letter = this.word.charAt(i)

            if (matching && userInput.charAt(i) === letter) {
                ctx.fillStyle = HIGHTLIGHT_COLOR
            } else {
                ctx.fillStyle = "white"
                matching = false
            }

            ctx.fillText(letter, this.x + (i * 25), this.y)
        }
    }

    update(speed = ENEMY_SPEED) {
        this.move(speed)
    }

    move(speed = ENEMY_SPEED) {
        this.x += speed
    }
}

function setupGame(canvas) {
    const ctx = canvas.getContext('2d')

    // setup width and height
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const game = new Game(canvas)
    game.init()

    // event listener to get and handle key presses
    window.addEventListener('keydown', event => game.handleInput(event, game), {
        capture: false,
    });
}

export default setupGame

