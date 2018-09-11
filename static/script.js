const CLIENT_ID = '828438231718-q0og3btpe6pdfgcp7es1repk0l40uldl.apps.googleusercontent.com'

let map

const runAnalysis = () => {
    ee.initialize()
    const image = ee.ImageCollection('COPERNICUS/S2').filterBounds(ee.Geometry.Point([150.644, -34.397])).median()
    const {mapid, token} = image.getMap({bands: 'B4, B3, B2', min: 0, max: 3000})

    const overlay = new ee.layers.ImageOverlay(
        new ee.layers.EarthEngineTileSource('https://earthengine.googleapis.com/map', mapid, token)
    )
    const logTileStats = () => {

        // These counts can contain data from multiple zoom levels, which often isn't what you'd want.
        // In addition to this, tile count methods are not available in /javascript/build/ee_api_js.js
        const stats = {
            loading: overlay.getLoadingTilesCount(),
            loaded: overlay.getLoadedTilesCount(),
            failed: overlay.getFailedTilesCount()
        }
        stats.count = stats.loading + stats.loaded + stats.failed
        console.log('Stats\n-----')
        console.log('Public API', JSON.stringify(stats))
        console.log('Workaround', JSON.stringify(workaroundStats()), '\n\n')
    }

    // My workaround, but it's using the private overlay.tilesById
    const workaroundStats = () => {
        const tileStatuses = overlay.tilesById.getValues()
            .filter(tile => tile.zoom === map.getZoom())
            .map(tile => tile.getStatus())
        const Status = ee.layers.AbstractTile.Status

        const loading = tileStatuses.filter(status => status === Status.LOADING).length
            + tileStatuses.filter(status => status === Status.NEW).length
            + tileStatuses.filter(status => status === Status.THROTTLED).length
        const loaded = tileStatuses.filter(status => status === Status.LOADED).length
        const failed = tileStatuses.filter(status => status === Status.FAILED).length
            + tileStatuses.filter(status => status === Status.ABORTED).length

        return {
            loading,
            loaded,
            failed,
            count: loading + loaded + failed,
        }
    }

    map.addListener('bounds_changed', logTileStats) // This always include multiple zoom levels
    overlay.addTileCallback(logTileStats) // This can include multiple zoom-levels if zooming in/out quickly

    map.overlayMapTypes.setAt(0, overlay)
}

$(document).ready(() => {
    map = new google.maps.Map($('.map').get(0), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 12
    })

    const onImmediateFailed = () => {
        $('.g-sign-in').removeClass('hidden')
        $('.g-sign-in .button').click(() => {
            ee.data.authenticateViaPopup(() => {
                $('.g-sign-in').addClass('hidden')
                runAnalysis()
            })
        })
    }

    ee.data.authenticate(CLIENT_ID, runAnalysis, null, null, onImmediateFailed)
})

