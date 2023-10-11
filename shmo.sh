#!/bin/sh
# retrieves bmapstr from www.shmo.de/EveryTile and updates settings directly on Garmin device (using etupdate to modify binary file)


if [ "$1" == "" -o "$2" == "" ]; then
    echo "lat/lon param missing"
    exit 1
fi

KMLFILE="~/Downloads/unexplored_tiles.kml"
SETFILE='/Volumes/GARMIN/Garmin/Apps/SETTINGS/D8NJ2203.SET'

hlat=`echo $1 | sed -e 's|,|.|g'`
hlon=`echo $2 | sed -e 's|,|.|g'`
bmapstr=`curl -s -F "hlat=$hlat" -F "hlon=$hlon" -F "kmlfile=@$KMLFILE" http://www.shmo.de/EveryTile/process_kml.php | grep "<textarea" | sed -e 's|.*readonly>\(.*\)</text.*|\1|g'`

if [ -z $bmapstr ]; then
    echo "Failed to get bmapstr."
    exit 1
fi

etupdate $hlat $hlon $bmapstr $SETFILE

exit 0
