# Cloudflare Discord Bot

## To use:

- Commands go in commands.js
- Commands must take a single object
- Command documentation is pulled from JSDoc strings
- Valid recognized types are: string, number, bool, User, Channel, Role, and String mapped Enum's (also defined in commands.js)
- Subcommand/Subcommand groups and guild-specific commands TBD

## Deploy me!
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/TiltMeSenpai/cloudflare-bot)

## Post-Deploy Tasks:
- Add `DISCORD_TOKEN`, `DISCORD_APPID`, and `DISCORD_PUBKEY` secrets to your forked repository
- Customize event triggers in `.github/workflows/deploy.yml`
- Modify `commands.js` with your commands
- Add your bot to your servers