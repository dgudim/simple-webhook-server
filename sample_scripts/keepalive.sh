if [ "$#" -lt 2 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

COMMAND=${@:1:$#-1} # all parameters except the last
ERROR_FLAG=${@:$#} # last parameter

while :
do
  # loop infinitely
  echo Executing $COMMAND
  $COMMAND
  echo An error ocurred, creating $ERROR_FLAG
  touch $ERROR_FLAG
done
