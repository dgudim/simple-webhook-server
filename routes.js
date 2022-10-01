const express = require('express');
const bodyParser = require('body-parser');
const exec = require('child_process').exec;

const router = express.Router();

function process_hook(body, script) {
 const commit_message =body.head_commit.message;
  const commit_author = body.head_commit.committer.name;
  const modified_files = body.head_commit.modified;
  const repo_name = body.repository.name;
  console.log(`[${repo_name}] got commit ${commit_message} from ${commit_author}, modified files: ${modified_files}`);
  if(commit_message.startsWith("[build]")) {
    console.log("Triggering rebuild");
    exec(script,
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
    });
  } else {
    console.log("Skipping rebuild");
  }
}

router.post("/baka-rebuild", bodyParser.raw({type: 'application/json'}), function(req, res) {
  res.send("Baka rebuild Successfully received");
  process_hook(req.body, "/scripts/baka_rebuild.sh");
});

router.post("/minerank-rebuild", bodyParser.raw({type: 'application/json'}), function(req, res) {
  res.send("Baka rebuild Successfully received");
  process_hook(req.body, "/scripts/minerank_rebuild.sh");
});

module.exports = router;
