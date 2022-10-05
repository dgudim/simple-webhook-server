import { Router } from "express";
import bodyparser from "body-parser";

import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);

import { EmbedBuilder, WebhookClient } from "discord.js";
import config from "./config.json" assert { type: "json" };

const webhookClient = new WebhookClient({ id: config.webhookId, token: config.webhookToken });

const router = Router();

async function process_hook(body, script) {
  const commit_message = body.head_commit.message;
  const commit_author = body.head_commit.committer.name;
  const modified_files = body.head_commit.modified;
  const repo_name = body.repository.name;
  console.log(`[${repo_name}] got commit ${commit_message} from ${commit_author}, modified files: ${modified_files}`);
  if (commit_message.startsWith("[build]")) {
    console.log("Triggering rebuild");
    try {
      const { stdout, stderr } = await execPromise(script);

      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      
      const embed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription(`${commit_message} \n modified files: ${modified_files} (${stderr.trim()})`)
        .setColor(0x88FF88);

      webhookClient.send({
        content: "Sucessfully deployed",
        username: "deploy-bot",
        avatarURL: "https://i.imgur.com/IjBUMir.png",
        embeds: [embed],
      });

    } catch (error) {
      console.log(`exec error: stdout: ${error.stdout} \n  ${error.stderr}`);

      const embed = new EmbedBuilder()
        .setTitle(`Error deploying`)
        .setDescription(`${commit_message} \n modified files: ${modified_files} (${error.stderr.trim()})`)
        .setColor(0xFF3333);

      webhookClient.send({
        content: "Deploy error",
        username: "deploy-bot",
        avatarURL: "https://i.imgur.com/IjBUMir.png",
        embeds: [embed],
      });
    }
  } else {
    console.log("Skipping rebuild");
  }
}

router.post("/baka-rebuild", bodyparser.raw({ type: "application/json" }), function (req, res) {
  res.send("Baka rebuild Successfully received");
  process_hook(req.body, "/scripts/discord_bot_rebuild.sh BAKA_BOT /bots/Discord_baka_bot");
});

router.post("/minerank-rebuild", bodyparser.raw({ type: "application/json" }), function (req, res) {
  res.send("Minerank rebuild Successfully received");
  process_hook(req.body, "/scripts/discord_bot_rebuild.sh RANK_BOT /bots/Discord_rank_bot");
});

export default router;
