const { exec } = require("child_process");
const { env } = require("process");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);
const fetch = require('node-fetch');

async function list(appid, guild=undefined) {
    const url = (guild)?
        `https://discord.com/api/v8/applications/${appid}/guilds/${guild}/commands`:
        `https://discord.com/api/v8/applications/${appid}/commands`;
    const res = await fetch(url,
        {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }
    )
    return await res.json();

}

async function put(appid, cmd, guild=undefined){
    const url = (guild)?
        `https://discord.com/api/v8/applications/${appid}/guilds/${guild}/commands`:
        `https://discord.com/api/v8/applications/${appid}/commands`;
    const res = await fetch(url,
        {
            method: "POST",
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cmd)
        })
    return res
}

async function del(appid, cmd_id, guild=undefined){
    const url = (guild)?
        `https://discord.com/api/v8/applications/${appid}/guilds/${guild}/commands/${cmd_id}`:
        `https://discord.com/api/v8/applications/${appid}/commands/${cmd_id}`;
    const res = await fetch(url,
        {
            method: "DELETE",
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })
    return res
}

function filter_names(cmds){
    return cmds.map(cmd => cmd.name)
}

async function parse(cmd_file){
    let jsdoc_path = "./node_modules/.bin/jsdoc"
    if(process.platform == "win32")
        jsdoc_path = ".\\node_modules\\.bin\\jsdoc.cmd"
    const {stdout} = await execFile(jsdoc_path, ["-X", cmd_file])
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
            return type ? {
                name: param.name.split(".")[1],
                type: type,
                choices: param.choices,
                required: !param.optional,
                description: param.description
            } : undefined
        }).filter(arg => arg) // Drop nulls
    });
    return commands
}

module.exports = {
    list, put, del, parse, filter_names
}
