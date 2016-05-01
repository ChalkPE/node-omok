var os = require('os');
var chalk = require('chalk');
var keypress = require('keypress');

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('keypress', (ch, key) => {
    if(key && key.ctrl && key.name == 'c'){
        clear(); flush();
        process.stdin.pause();
        process.exit(0);
    }

    switch(ch){
        case 'w': cursor.w(); break;
        case 'd': cursor.d(); break;
        case 's': cursor.s(); break;
        case 'a': cursor.a(); break;

        default: if(key) switch(key.name){
            case 'up':    cursor.w(); break;
            case 'right': cursor.d(); break;
            case 'down':  cursor.s(); break;
            case 'left':  cursor.a(); break;
            default: return;
        }
    }

    drawPane();
});

const Stone = {
    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,
};

const Colors = {
    BORDER: chalk.bgBlack,
    PANE_BACKGROUND: chalk.bgCyan,
    BLACK_STONE: (x, y) => (x === cursor.x && y === cursor.y) ? chalk.bgCyan.magenta : chalk.bgCyan.black,
    WHITE_STONE: (x, y) => (x === cursor.x && y === cursor.y) ? chalk.bgCyan.yellow : chalk.bgCyan.white
};

const Symbols = {
    STONE: '⏺', //'●',
    BORDER_TOP: '▄',
    BORDER_BOTTOM: '▀'
};

const PANE_SIZE = 19;
const PANE_DISPLAY_WIDTH = PANE_SIZE * 2 + 1;
const PANE_DISPLAY_HEIGHT = PANE_SIZE;

var buffer = '';

var write = (text) => buffer += text;
var flush = () => {
    process.stdout.write(buffer);
    buffer = '';
};

var clear = () => write('\033c');
var newLine = () => write(os.EOL);
var moveCursor = (n, m) => write('\033[' + [n, m].map(i => i || '1').join(';') + 'H');
var repeat = (count, text) => count < 0 ? null : Array.apply(null, Array(count)).forEach(() => typeof text === 'function' ? text() : write(text));

var consoleWidth = () => process.stdout.columns;
var consoleHeight = () => process.stdout.rows;

var pane = Array.apply(null, Array(PANE_SIZE)).map(() => Array.apply(null, Array(PANE_SIZE)).map(() => 1 + Math.floor(Math.random() * 2)));

var cursor = {
    x: Math.floor(PANE_SIZE / 2),
    y: Math.floor(PANE_SIZE / 2),
    w: () => cursor.y = Math.max(0, cursor.y - 1),
    d: () => cursor.x = Math.min(PANE_SIZE - 1, cursor.x + 1),
    s: () => cursor.y = Math.min(PANE_SIZE - 1, cursor.y + 1),
    a: () => cursor.x = Math.max(0, cursor.x - 1)
}

var drawPane = () => {
    moveCursor();

    if(consoleHeight() < PANE_DISPLAY_HEIGHT || consoleWidth() <  PANE_DISPLAY_WIDTH){
        write(chalk.red("YOUR TERMINAL IS TOO SMALL TO PLAY")); flush(); return;
    }

    var topMargin = Math.round((consoleHeight() - PANE_DISPLAY_HEIGHT) / 2);
    var leftMargin = Math.round((consoleWidth() - PANE_DISPLAY_WIDTH) / 2);

    repeat(topMargin, () => {
        repeat(consoleWidth(), Colors.BORDER(' '));
        newLine();
    });

    for(var y = 0; y < PANE_SIZE; y++){
        repeat(leftMargin, Colors.BORDER(' '));
        write(Colors.PANE_BACKGROUND(' '));

        for(var x = 0; x < PANE_SIZE; x++){
            switch(pane[x][y]){
                case Stone.EMPTY:
                    write(Colors.PANE_BACKGROUND('  '));
                    break;
                case Stone.BLACK:
                    write(Colors.BLACK_STONE(x, y)(Symbols.STONE + ' '));
                    break;
                case Stone.WHITE:
                    write(Colors.WHITE_STONE(x, y)(Symbols.STONE + ' '));
                    break;
            }
        }

        repeat(consoleWidth() - leftMargin - PANE_DISPLAY_WIDTH, Colors.BORDER(' '));
        if(y + 1 !== PANE_SIZE) newLine();
    }

    repeat(consoleHeight() - topMargin - PANE_DISPLAY_HEIGHT, () => repeat(consoleWidth(), Colors.BORDER(' ')));
    flush();
};

clear(); process.stdout.on('resize', drawPane); drawPane();
