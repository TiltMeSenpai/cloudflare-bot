const { exec } = require("child_process");
const { env } = require("process");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);
const fetch = require('node-fetch');

(async () => {
    const {stdout} = await execFile("node_modules/.bin/jsdoc", ["-X", "commands.js"])
    const jsdoc = JSON.parse(stdout)
    let commands = []
    let choices = new Map()
    jsdoc.forEach(e => {
        if(e.kind == "function"){
            commands.push({
                name: e.name,
                options: e.params,
                description: e.description
            })
        }
        if(e.kind == "member" && e.isEnum) {
            choices[e.name] = e.properties.map((i) => {
                return {name: i.defaultvalue, value: i.name}
            })
        }
    });
    commands.forEach(command => {
        command.options = command.options.map((param) => {
            const type = ((type) => {
                switch(type) {
                    case "Object":
                        return 0
                    case "string":
                        return 3
                    case "number":
                        return 4
                    case "bool":
                    case "boolean":
                        return 5
                    case "User":
                        return 6
                    case "Channel":
                        return 7
                    case "Role":
                        return 8
                    default:
                        param.choices = choices[type]
                        return 3
                }
            })(param.type.names[0])
            if(type == 0)
                return undefined
            return {
                name: param.name.split(".")[1],
                type: type,
                choices: param.choices,
                required: !param.optional,
                description: param.description
            }
        }).filter(arg => arg) // Drop nulls
    });
    if(process.env.DISCORD_TOKEN && process.env.DISCORD_APPID){
        Promise.all(commands.map(async (command) => {
            let status = await fetch(`https://discord.com/api/v8/applications/${process.env.DISCORD_APPID}/commands`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(command)
                })
            if(status.ok){
                console.log(`Registered ${command.name}`)
            }
            else{
                console.log(`Error: ${JSON.stringify(await status.json())}`)
            }
        }))
    }
    else {
        console.log(util.inspect(commands, {depth: null}))
    }
})()