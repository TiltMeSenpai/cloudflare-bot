const CommandList = require("./CommandList");
function resolveAll(arr){
    return Promise.all(arr.map(x=>new Promise(r=>x.catch(_=>console.log("Failed doing Something.")).then(r))))

}
(async () => {
    try{
        switch(process.argv[2]){
            case "list":
                console.log(await CommandList.list(process.env.DISCORD_APPID))
                break
            case "push":
                await resolveAll((await CommandList.parse("commands.js")).map(async (command) => {
                    const cmd_status = await CommandList.put(process.env.DISCORD_APPID, command)
                    if(cmd_status.ok){
                        console.log(`Pushed ${command.name}`)
                    }
                    else{
                        console.log(await cmd_status.json())
                    }
                }));
                console.log('Done!')
                break
            case "clean":
                const app_list = await CommandList.list(process.env.DISCORD_APPID)
                const cmd_list = CommandList.filter_names(await CommandList.parse("commands.js"))
                await resolveAll(
                    app_list.map(async (command) => {
                        if(!cmd_list.includes(command.name)){
                            const del_status = await CommandList.del(process.env.DISCORD_APPID, command.id)
                            if(del_status.ok)
                                console.log(`Deleted ${command.name}`)
                        }
                    })
                )
                console.log('Done!')
                break
            default:
                console.log(`Unrecognized option ${process.argv[2]}. Valid options are 'list', 'push', and 'clean'.`)
        }
        process.exit(1);
    }catch(e){
        console.error(e);
        console.log('An Error happened whilst executing the command. Please try again! ')
    }
})()