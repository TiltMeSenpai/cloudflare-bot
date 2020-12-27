/**
 * Simple ping command
 * @param {Object} arg
 * @param {string} arg.pong - Reply string
 */
function ping({pong}){
    return `Ping! ${pong}`
}

/**
 * @enum {string}
 */
var rgb = {
    RED: "Red",
    GREEN: "Green",
    BLUE: "Blue"
}

/**
 * Return a color
 * @param {Object} arg
 * @param {rgb} arg.rgb - A choice of red, blue or green
 * @param {boolean} [arg.is_color] - Is it a color?
 */
function color({rgb, is_color=false}){
    if(is_color)
        return `${rgb} is a color`
    else
        return `${rgb} is not a color`
}

module.exports = {
    ping,
    color
}