javascript: (() => {

    sq2kml(17);

    function download(filename, text) {
        var e = document.createElement('a');
        e.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        e.setAttribute('download', filename);
        e.style.display = 'none';
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    }

    function sq2kml(level, dwnld = true) {
        const header = "<?xml version=\"1.0\"?><kml><Document><Folder>",
            tail = "</Folder></Document></kml>",
            lstart = "<Placemark><LineString><coordinates>",
            lend = "</coordinates></LineString></Placemark>",
            unexplored = [];

        var line = "";

        const bounds = squadrats.map.getBounds();
        let a, b;
        if (squadrats.google) {
            const ne = bounds.getNorthEast(),
                sw = bounds.getSouthWest();
            a = {
                lat: ne.lat(),
                lng: sw.lng()
            };
            b = {
                lat: sw.lat(),
                lng: ne.lng()
            }
        } else {
            a = bounds.getNorthWest();
            b = bounds.getSouthEast();
        }

        lata = MAP.CONVERSIONS.lat2squadrat(a.lat, level);
        lona = MAP.CONVERSIONS.lon2squadrat(a.lng, level);
        latb = MAP.CONVERSIONS.lat2squadrat(b.lat, level);
        lonb = MAP.CONVERSIONS.lon2squadrat(b.lng, level);

        for (let x = lona; x <= lonb; x++) {
            for (let y = lata; y <= latb; y++) {
                unexplored.push(x + '-' + y);
            }
        }

        for (const squadrat of unexplored) {
            if (!squadrats.raw[level].has(squadrat)) {
                const [x, y] = squadrat.split('-');

                line += lstart + MAP.CONVERSIONS.squadrat2lon(+x, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y, level) + ' ' +
                    +MAP.CONVERSIONS.squadrat2lon(+x + 1, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y, level) + ' '
                    + MAP.CONVERSIONS.squadrat2lon(+x + 1, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y + 1, level) + ' ' +
                    +MAP.CONVERSIONS.squadrat2lon(+x, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y + 1, level) + ' ' +
                    +MAP.CONVERSIONS.squadrat2lon(+x, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y, level) + lend;
            }
        }

        if (dwnld)
            download('sq.kml', header + line + tail);
        else
            return (header + line + tail);
    }

})();
