# EE tiles-count test

Test project replicating some issues I've had with the EE JavaScript API. This has been tested against v0.1.146.

## 1. Some public API methods are missing in [ee_api_js.js](https://github.com/google/earthengine-api/blob/master/javascript/build/ee_api_js.js)
For instance, [AbstractOverlay.getLoadingTilesCount()](https://github.com/google/earthengine-api/blob/master/javascript/src/layers/abstractoverlay.js#L127)
is part of the public API, but not present in `ee_api_js`. It is in `ee_api_js_debug.js` and `ee_api_js_npm.js` through.

## 2. Tile counts are returned for multiple zoom-levels
Tile counts can be retrieved through the `AbstractOverlay.getXXXTilesCount()` methods.
When displaying an EE image on a map, I use these counts to display progress for my users. 
When zooming in and out, these tile counts can contain counts for multiple zoom-levels, which is isn't helpful for my
use-case. I'd expect to get values for the current zoom-level only.

I believe this didn't use to be a problem some versions ago.

To get the expected counts, I have implemented a workaround using private methods. 
A simple [script](static/script.js) replicates this behaviour.

## Build and run
```
npm install
npm start
```  
Go to [http://localhost:8080](http://localhost:8080), authenticate and start zooming. Ignore the map error and look at 
the console logs. You'll see larger counts when zooming using the Public API.

Make sure third-party cookies are not blocked in your browser. If they are, the authentication silently fails.