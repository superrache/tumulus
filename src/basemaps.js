export const basemaps = {
    default: {
        label: "Plan",
        selected: true,
        color: "CornflowerBlue",
        icon: 'default.png',
        url: 'https://api.jawg.io/styles/77df562c-113e-451b-bc77-1634aedeee25.json?access-token=UG9wQV1RcEgsXwkTX9M9qfBUV0ZckAfUhlqa3W4hK16gVbTFDUSMXrn60H1hEE6d'
    },
    stamen: {
        label: "Stamen",
        selected: false,
        color: "orange",
        icon: 'stamen.png',
        sources: {
            stamen: {
                type: 'raster',
                tiles: [
                    'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
                ],
                tileSize: 256,
                attribution: "<a href='http://maps.stamen.com/watercolor/' title='Stamen Watercolor' target='_blank' class='jawg-attrib'>&copy; <b>Stamen</b> Watercolor</a>"
            }
        },
        layers: [
            {
                id: 'tiles',
                type: 'raster',
                source: 'stamen',
                minzoom: 0,
                maxzoom: 22
            }
        ],
        replaceUntilLayerId: 'road-oneway',
        except: ['building']
    },
    bdortho: {
        label: "IGN BDOrtho",
        selected: false,
        color: "green",
        icon: 'bdortho.png',
        sources: {
            bdortho: {
                type: 'raster',
                tiles: ['https://wxs.ign.fr/pratique/geoportail/wmts?'+
                        '&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&TILEMATRIXSET=PM'+
                        '&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg'+
                        '&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}'
                ],
                'tileSize': 256,
                attribution: "<a href='https://geoservices.ign.fr/bdortho' title='BD ORTHO®' target='_blank' class='jawg-attrib'>&copy; <b>IGN</b> BD ORTHO®</a>"
            }
        },
        layers: [
            {
                id: 'tiles',
                type: 'raster',
                source: 'bdortho',
                minzoom: 0,
                maxzoom: 22
            }
        ],
        replaceUntilLayerId: 'road-oneway',
        except: ['building'],
        forcePaint: {
            'text-color': '#fff'
        }
    }
}