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

const ENEMY_SPEED = 2;
const SPAWN_RATE = 2000; // every 2 seconds

const ENTER_KEY = 13
const BACKSPACE_KEY = 8
const ESCAPE_KEY = 27
const SPACE_KEY = 32
const A_KEY = 65
const Z_KEY = 90
const HIGHTLIGHT_COLOR = 'blue'

const OFFSET_FROM_TOP = 70

function getRandomItem(set) {
    const items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
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

        this.ctx.fillStyle = "white"; // default letter color
        this.ctx.font = '48px "Roboto Mono", monospace';


        this.ctx.fillStyle = "gray";
        this.ctx.fillRect((this.canvas.width / 2) - 150, 0, 300, 50)
        this.ctx.fillStyle = "white";
        this.ctx.fillText(': ' + this.playerInput, (this.canvas.width / 2) - 150, 39, 300);
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

        if (this.score > 0) {
            this.delay = SPAWN_RATE - (this.score * 100)
        } else if (this.score > 5) {
            this.delay = SPAWN_RATE - (this.score * 50)
        } else if (this.score > 10) {
            this.delay = SPAWN_RATE - (this.score * 25)
        } else if (this.score > 15) {
            this.delay = SPAWN_RATE - (this.score * 10)
        }
    }

    handleInput(event, _this) {
        if (event === undefined) return

        const { keyCode, key } = event

        if (!(keyCode === BACKSPACE_KEY || keyCode === ENTER_KEY || keyCode === ESCAPE_KEY || (keyCode >= A_KEY && keyCode <= Z_KEY))) {
            return
        }

        if (keyCode === ENTER_KEY) {
            if (_this.playerInput === '') return

            const found = _this.wordsInPlay.find(word => word.word === _this.playerInput)
            if (found) {
                console.log({ found })
                _this.score += 1
                _this.playerInput = ''

                _this.wordSet.add(found.word)
                _this.wordsInPlay = _this.wordsInPlay.filter(word => word.word !== found.word)
            }
        }

        if (keyCode === BACKSPACE_KEY && event.ctrlKey) {
            _this.playerInput = ''
        } else if (keyCode === BACKSPACE_KEY) {
            _this.playerInput = _this.playerInput.slice(0, -1)
        }

        if (key.length === 1) {
            _this.playerInput += event.key
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

        let matching = true
        for (let i = 0; i < this.word.length; i++) {
            let letter = this.word.charAt(i)

            if (matching && userInput.charAt(i) === letter) {
                ctx.fillStyle = "green"
            } else {
                ctx.fillStyle = "white"
                matching = false
            }

            ctx.fillText(letter, this.x + (i * 25), this.y)
        }
    }

    update() {
        this.move()
    }

    move() {
        this.x += ENEMY_SPEED
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

