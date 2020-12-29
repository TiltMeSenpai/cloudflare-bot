const CommandList = require("./CommandList");
(async () => {
    switch(process.argv[2]){
        case "list":
            console.log(await CommandList.list(process.env.DISCORD_APPID))
            break
        case "push":
            Promise.all((await CommandList.parse("commands.js")).map(async (command) => {
                const cmd_status = await CommandList.put(process.env.DISCORD_APPID, command)
                if(cmd_status.ok){
                    console.log(`Pushed ${command.name}`)
                }
                else{
                    console.log(await cmd_status.json())
                }
            }))
            break
        case "clean":
            const app_list = await CommandList.list(process.env.DISCORD_APPID)
            const cmd_list = CommandList.filter_names(await CommandList.parse("commands.js"))
            Promise.all(
                app_list.map(async (command) => {
                    if(!cmd_list.includes(command.name)){
                        const del_status = await CommandList.del(process.env.DISCORD_APPID, command.id)
                        if(del_status.ok)
                            console.log(`Deleted ${command.name}`)
                    }
                })
            )
            break
        default:
            console.log(`Unrecognized option ${process.argv[2]}`)
    }
})()