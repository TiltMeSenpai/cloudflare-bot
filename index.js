const DiscordSig = new (require("./crypto").DiscordSig)()
const commands = require("./commands")

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request){
    const pubkey = Buffer.from(DISCORD_PUBKEY || "", "hex")
    const timestamp = Buffer.from(request.headers.get("X-Signature-Timestamp") || "")
    const sig = Buffer.from(request.headers.get("X-Signature-Ed25519") || "", "hex")

    const body = await request.text()
    const hashbody = Buffer.concat([timestamp, Buffer.from(body)])
    const sig_ok = await DiscordSig.verify(pubkey, sig, hashbody)

    if(sig_ok){
        const payload = JSON.parse(body)
        const response = JSON.stringify(await handlePayload(payload))
        console.log(`Command response: ${response}`)
        return new Response(response, {headers: {"Content-Type": "application/json"}, status: 200})
    }
    else {
        return new Response("Signature Validation Failed", {status: 401})
    }
}

async function handlePayload(payload){
    console.log(`Got payload type: ${payload.type}`)
    switch(payload.type){
        case 1: return {type: 1}
        case 2:
            return {type: 4, data: await handleInteraction(payload)}
    }
}

async function handleInteraction(payload) {
    const args = {}
    payload.data.options.forEach(option => {
        args[option.name] = option.value
    });
    const resp = commands[payload.data.name](args)
    console.log(`Payload Args: ${args}`)
    console.log(`Payload data: ${JSON.stringify(payload.data)}`)
    if (typeof resp == "object") {
        return resp
    }
    else
        return {
            content: resp
        }
}