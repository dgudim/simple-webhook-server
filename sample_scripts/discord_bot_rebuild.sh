if [ "$#" -ne 2 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

SCREEN_NAME=$1
STARTUP_SCRIPT=/scripts/discord_bot_startup.sh
BOT_ROOT=$2
RUNUSER=kloud
ERR_FLAG=$(echo $RANDOM | md5sum | head -c 32);

stop_bot () {
  screen -X -S $SCREEN_NAME quit
}

start_bot () {
  screen -d -m -S $SCREEN_NAME bash $STARTUP_SCRIPT $BOT_ROOT $ERR_FLAG
}

echo backing up current version
cp -r $BOT_ROOT ${BOT_ROOT}_old
cd $BOT_ROOT

echo Pulling latest version
runuser -u $RUNUSER -- git restore .
runuser -u $RUNUSER -- git pull
runuser -u $RUNUSER -- npm install

echo Restarting

if [[ -f $ERR_FLAG ]]; then
    rm $ERR_FLAG
fi

stop_bot
start_bot

sleep 10

if [[ -f $ERR_FLAG ]]; then
    rm $ERR_FLAG
    echo Error, rolling back
    stop_bot
    rm -r $BOT_ROOT
    mv -r ${BOT_ROOT}_old $BOT_ROOT
    start_bot
    exit 1
else
    rm -r ${BOT_ROOT}_old
    echo Done
fi

