/**
 * Simple ping command
 * @param {Object} arg
 * @param {string} arg.pong - Reply string
 */
function ping({pong}){
    return `Ping! ${pong}`
}

/**
 * Repeat a phrase some number of times
 * @param {Object} arg
 * @param {string} arg.phrase - Phrase to repeat
 * @param {number} arg.number - How many times to repeat the phrase
 */
function repeat({phrase, number}){
    return phrase.repeat(number)
}


module.exports = {
    ping,
    repeat
}