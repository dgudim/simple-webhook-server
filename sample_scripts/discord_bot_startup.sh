if [ "$#" -lt 1 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

cd $1
if [[ -z $2 ]]; then
    ERR_FLAG=$2
else
    ERR_FLAG=$(echo $RANDOM | md5sum | head -c 32);
fi

keepalive.sh ts-node index.ts $ERR_FLAG
