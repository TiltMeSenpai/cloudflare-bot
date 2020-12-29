class DiscordSig {
    constructor() {
        this._crypto = import("./crypto/pkg/index").then(crypto => this._crypto = crypto)
    }

    async verify(pubkey, sig, msg){
        let {verify} = await this._crypto
        return (
            pubkey.length == 32 &&
            sig.length == 64 &&
            verify(pubkey, sig, msg)
        )
    }
}

module.exports = () => new DiscordSig()