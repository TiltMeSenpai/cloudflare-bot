const CommandList = require("./CommandList");
const {computeType,validateSnowflake,resolveAll} = require("./utils.js");
require("dotenv").config();
let bot_config = {global: true, guilds: {}}
try{
    bot_config = require("../bot_config")
}
catch {}

function beautify(x){
    return `
    APPLICATION ID : ${process.env.DISCORD_APPID} ${process.argv[3] ==="guild"?` in GUILD ${process.argv[4]}`:''}
    Command Count : ${x.length ||"0"} ( max 50 )
    --------------------------------------
    ${x.length?x.map(command=>`
        ${command.name} ( ID : ${command.id} ) - ${command.description}
        Options : 
            ${command.options.map(option=>`${option.name} ( Type ${computeType(option.type)} ) : ${option.description.slice(0,25)}, ${option.default?"DEFAULT; ":""}${option.required?"REQUIRED":"OPTIONAL"} ${option.options||option.choices?"Uses OPTIONS or CHOICES, run again with name/ID to show.":""}
        `).join("\n            ")}
        `).join("\n    "):'. . .'}
    `
}
function showCmd(cmds,query){
    const cmd = cmds.find(x=>x.id===query||x.name===query)
    if(!cmd) return "No command matched your query."
    return `
    Command ${cmd.name} ( ID : ${cmd.id} ) - ${cmd.description}
    --------------------------------------
    Options : 
        ${cmd.options.map(option=>`${option.name} ( Type ${computeType(option.type)} ) : ${option.description.slice(0,25)}
        ${option.default?"DEFAULT; ":""}${option.required?"REQUIRED":"OPTIONAL"}
        ${option.choices?`Choices : 
            - NAME : VALUE
            - ${option.choices.map(choice=>`${choice.name} : ${choice.value}`).join("\n            - ")}
            `:""}
            ${option.options?"TODO":""}
        `).join("\n    ")}
    `
}
(async () => {
    let verbose,index=process.argv.indexOf('log-error');
        if(index!==-1) {
            verbose=true
            process.argv.splice(index,1);
        }
    try{
        
        switch(process.argv[2]){
            case "list":
                if(process.argv[3] ==="guild"){
                    if(!validateSnowflake(process.argv[4])) throw new Error("Invalid ID");
                    console.log(beautify(await CommandList.list(process.env.DISCORD_APPID,process.argv[4])));
                }
                else if (process.argv[3]==="id"){
                    console.log(showCmd(await CommandList.list(process.env.DISCORD_APPID),process.argv[4]));
                }
                else console.log(beautify(await CommandList.list(process.env.DISCORD_APPID)));
                break
            case "push":
                let commands = {};
                (await CommandList.parse("commands.js")).forEach(cmd => {
                    commands[cmd.name] = cmd
                })
                if(bot_config.global === true){
                    await resolveAll(commands.values().map(async (command) => {
                        try{
                        const cmd_status = await CommandList.put(process.env.DISCORD_APPID, command)
                        if(cmd_status.ok){
                            console.log(`Pushed ${command.name}`)
                        }
                        else{
                            console.log(`Error whilst trying to push ${command.name}. 
                            Reason : ${await cmd_status.json()}`)
                        }}catch(e){
                            if(verbose) console.error(e);
                            console.log(`Error whilst trying to push ${command.name}.`)
                        }
                    }));
                }
                else if(Array.isArray(bot_config.global)){
                    await resolveAll(bot_config.global.map(async (cmd) => {
                        let command = commands[cmd]
                        try{
                            const cmd_status = await CommandList.put(process.env.DISCORD_APPID, command)
                            if(cmd_status.ok){
                                console.log(`Pushed ${command.name}`)
                            }
                            else{
                                console.log(`Error whilst trying to push ${command.name}. 
                                Reason : ${await cmd_status.json()}`)
                            }
                        }
                        catch(e){
                            if(verbose) console.error(e);
                            console.log(`Error whilst trying to push ${command.name}.`)
                        }
                }))};
                await resolveAll(Object.entries(bot_config.guilds).map(async ([guild, cmds]) => {
                    await resolveAll(cmds.map(async (cmd) => {
                        let command = commands[cmd]
                        try{
                            const cmd_status = await CommandList.put(process.env.DISCORD_APPID, command, guild)
                            if(cmd_status.ok){
                                console.log(`Pushed ${command.name} to ${guild}`)
                            }
                            else{
                                console.log(`Error whilst trying to push ${command.name} to ${guild}. 
                                Reason : ${await cmd_status.text()}`)
                            }
                        }
                        catch(e){
                            if(verbose) console.error(e);
                            console.log(`Error whilst trying to push ${command.name} to ${guild}.`)
                        }
                    }))
                }))
                console.log('Done!')
                break
            case "clean":
                const app_list = await CommandList.list(process.env.DISCORD_APPID)
                const cmd_list = CommandList.filter_names(await CommandList.parse("commands.js"))
                await resolveAll(
                    app_list.map(async (command) => {
                        try{
                        if(!cmd_list.includes(command.name)){
                            const del_status = await CommandList.del(process.env.DISCORD_APPID, command.id)
                            if(del_status.ok)
                                console.log(`Deleted ${command.name}`)
                        }
                    }catch(e){
                        if(verbose) console.error(e);
                        console.log(`Unable to delete ${command.name}`)
                    }
                    })
                )
                console.log('Done!')
                break
            default:
                console.log(`Unrecognized option ${process.argv[2]}. Valid options are 'list', 'push', and 'clean'.`)
        }
    }catch(e){
        if(verbose) console.error(e);
        else console.log('An Error happened while executing the command. Please try again! To see the error message, run me with log-error appended. ')
    }
})()