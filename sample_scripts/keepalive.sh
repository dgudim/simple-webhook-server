if [ "$#" -lt 2 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

COMMAND=${*%${!#}} # all parameters except the last
ERROR_FLAG=${@:$#} # last parameter

while :
do
  # loop infinitely
  echo Executing $COMMAND
  $COMMAND
  echo An error ocurred, creating /tmp/$ERROR_FLAG
  touch /tmp/$ERROR_FLAG
done
