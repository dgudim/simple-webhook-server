import { Router } from "express";
import bodyparser from "body-parser";
import { exec } from "child_process";
import { EmbedBuilder, WebhookClient } from "discord.js";
import config from "./config.json" assert { type: "json" };

const webhookClient = new WebhookClient({ id: config.webhookId, token: config.webhookToken });

const router = Router();

function process_hook(body, script) {
  const commit_message = body.head_commit.message;
  const commit_author = body.head_commit.committer.name;
  const modified_files = body.head_commit.modified;
  const repo_name = body.repository.name;
  console.log(`[${repo_name}] got commit ${commit_message} from ${commit_author}, modified files: ${modified_files}`);
  if (commit_message.startsWith("[build]")) {
    console.log("Triggering rebuild");
    exec(script,
      function (error, stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        if (error) {
          console.log("exec error: " + error);

          const embed = new EmbedBuilder()
            .setTitle(error)
            .setDescription(`${commit_message} \n modified files: ${modified_files} (${stderr.trim()})`)
            .setColor(0xFF3333);

          webhookClient.send({
            content: "Deploy error",
            username: "deploy-bot",
            avatarURL: "https://i.imgur.com/IjBUMir.png",
            embeds: [embed],
          });

          if (config.ntfyEndpoint) {
            try {
              fetch(`https://ntfy.sh/${config.ntfyEndpoint}`, {
                method: "POST", // PUT works too
                body: error,
                headers: {
                  "Title": "Bot deploy error",
                  "Priority": "urgent",
                  "Tags": "warning"
                }
              });
            } catch (e) {
              console.error(e);
            }
          }
          
        } else {

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

          if (config.ntfyEndpoint) {
            try {
              fetch(`https://ntfy.sh/${config.ntfyEndpoint}`, {
                method: "POST", // PUT works too
                body: `${commit_message} \n modified files: ${modified_files} (${stderr.trim()})`,
                headers: {
                  "Title": "Bot deploy success!",
                  "Priority": "normal"
                }
              });
            } catch (e) {
              console.error(e);
            }
          }

        }
      });
  } else {
    console.log("Skipping rebuild");
  }
}

router.post("/baka-rebuild", bodyparser.raw({ type: "application/json" }), function (req, res) {
  res.send("Baka rebuild Successfully received");
  process_hook(req.body, "/scripts/baka_rebuild.sh");
});

router.post("/minerank-rebuild", bodyparser.raw({ type: "application/json" }), function (req, res) {
  res.send("Baka rebuild Successfully received");
  process_hook(req.body, "/scripts/minerank_rebuild.sh");
});

export default router;
