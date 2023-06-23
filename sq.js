
function download(filename, text) {
    var e = document.createElement('a');
    e.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    e.setAttribute('download', filename);
    e.style.display = 'none';
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
}

function getUnexplored(level) {
    const unexplored = [];

    const bounds = squadrats.map.getBounds();
    let a, b;
    if (squadrats.google) {
        const ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest();
        a = {
            lat: ne.lat(),
            lng: sw.lng()
        },
            b = {
                lat: sw.lat(),
                lng: ne.lng()
            }
    } else {
        a = bounds.getNorthWest(),
            b = bounds.getSouthEast();
    }

    let lata = MAP.CONVERSIONS.lat2squadrat(a.lat, level),
        lona = MAP.CONVERSIONS.lon2squadrat(a.lng, level),
        latb = MAP.CONVERSIONS.lat2squadrat(b.lat, level),
        lonb = MAP.CONVERSIONS.lon2squadrat(b.lng, level);

    for (let x = lona; x <= lonb; x++) {
        for (let y = lata; y <= latb; y++) {
            unexplored.push(x+'-'+y);
        }
    }
    return unexplored;
}

function sq2kml(level, dwnld = true) {
    const header = "<?xml version=\"1.0\"?><kml><Document><Folder>",
        tail = "</Folder></Document></kml>",
        lstart = "<Placemark><LineString><coordinates>",
        lend = "</coordinates></LineString></Placemark>";

    var line = "";

    const unexplored = getUnexplored(level);

    for (const squadrat of unexplored) {
        if (!squadrats.raw[level].has(squadrat)) {
            const [x, y] = squadrat.split('-');

            line += lstart + MAP.CONVERSIONS.squadrat2lon(+x, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y, level) + ' '+
                + MAP.CONVERSIONS.squadrat2lon(+x + 1, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y, level) + ' '
                + MAP.CONVERSIONS.squadrat2lon(+x + 1, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y + 1, level) + ' ' +
                + MAP.CONVERSIONS.squadrat2lon(+x, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y + 1, level) + ' ' +
                + MAP.CONVERSIONS.squadrat2lon(+x, level) + ',' + MAP.CONVERSIONS.squadrat2lat(+y, level) + lend;
        }
    }

    if (dwnld)
        download('sq.kml',header+line+tail);
    else
        return (header+line+tail);
}

let cmap;
let nodes;
let ways;

function sq2osm(level, dwnld = true) {
    cmap = new Map();
    nodes = "<?xml version=\"1.0\"?><osm version=\"0.6\">";
    ways = "";

    const unexplored = getUnexplored(level);
    let tc = 0;

    for (const squadrat of unexplored) {
        if (!squadrats.raw[level].has(squadrat)) {
            const [x, y] = squadrat.split('-');

            ways += '<way id="' + --tc + '" visible="true">';

            let lat1 = MAP.CONVERSIONS.squadrat2lat(+y, level);
            let lat2 = MAP.CONVERSIONS.squadrat2lat(+y + 1, level);
            let lon1 = MAP.CONVERSIONS.squadrat2lon(+x, level);
            let lon2 = MAP.CONVERSIONS.squadrat2lon(+x + 1, level);
            let first = addNode(lat1, lon1, --tc);
            addNode(lat1, lon2, --tc);
            addNode(lat2, lon2, --tc);
            addNode(lat2, lon1, --tc);

            ways += '<nd ref="' + first + '"/><tag k="highway" v="primary"/></way>';

        }
    }

    nodes += nodes + ways + '</osm>';

    if (dwnld)
        download('uth.osm', nodes);
    else
        return (nodes);
}

function addNode(lat, lon, id) {
    let k = "" + lat + lon;
    let v = cmap.get(k);
    if (v === undefined) {
        cmap.set(k, id);
        nodes += '<node id="' + id + '" visible="true" lat="' + lat + '" lon="' + lon + '"/>';
    } else id = v;
    ways += '<nd ref="' + id + '"/>';
    return id;
}