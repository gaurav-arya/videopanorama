var levels, tile_size, frame_number, width, height, x_tiles, y_tiles;

[levels, tile_size, frame_number, width, height, x_tiles, y_tiles, min_zoom] = Object.values(configs[viewer_data]);

var startx = 0;
var starty = 0;
var startzoom = 1;


//src variables

var xTilePos; //x of current top left tile of 3x3 grid 
var yTilePos; //y of current top left tile of 3x3 grid
var zoomLevel; //level of tiles being used

//initialize continuous variables

var xpos = startx; //x of top left tile of visible 2x2, from 0 -> width
var ypos = starty; //y of top left tile of visible 2x2, from 0 -> height
var zoom = startzoom; //zoom level of current set of tiles, [1, 2^levels)

//buffer status



//players status, e.g. loaded, showing

var players;

var iconsNotReady;
var postersNotReady;
var videosNotReady;
var videoTimeout;

var allImagesReady;
var allVideosReady;

var videosUpdated;

//parameters

var useOffline = urlParams.offline == "true";
var useBuffer = true;
var useVideos = !(urlParams.video == "false");

var useSync = !(urlParams.sync == "false");

//time 

var timeBefore = 0;
var nearestSecond = 0;

var timeLast = -10000;

//DOM selections

var videos;

//checks for valid tile

function validTile(x, y, level) {

    if (level > (levels - 1)) {
        return false;
    }

    if (x > (x_tiles[level] - 1) || (x < 0)) {
        return false;
    }

    if (y > (y_tiles[level] - 1) || (y < 0)) {
        return false;
    }
    return true;
}

/////////////////////

//for loop that runs through every tile in the window and supplies videojs id

function tileUpdate(operation) {
    for (var ytile = 0; ytile < ytilesWindow; ytile++) {
        for (var xtile = 0; xtile < xtilesWindow; xtile++) {
            var id = ytile + "_" + xtile;    
            var x = xtile + xTilePos;
            var y = ytile + yTilePos;
            operation(xtile, ytile, id,x,y);
        }
    }
}

//initializes every video container

function initialize(xtile, ytile, id) {
    $("#" + id).attr("mediagroup", "main");
    var video = videojs(id, { loop: true, loadingSpinner: false, autoplay: false, controls: false });

    if (useVideos) {
        video.on('playing', handleVideoPlaying);
    }
}

/////////////////

function changeTilesSrc() {

    videosUpdated = false;

    timeBefore = videojs("0_0").currentTime();

    nearestSecond = ((timeBefore) % 8) || 0;

    $(".e").hide();
    $("#info").show();

    stopAllBuffering();
  //  clearInterval(videoTimeout);

    iconsNotReady = 0; postersNotReady = 0; videosNotReady = 0;

    players = [];

    setLoadState(0);

    tileUpdate(countIcons);
    tileUpdate(updateIcon);

    css();

}

//changes video and poster src depending on xTilePos and yTilePos, for tileUpdate

function countIcons(xtile,ytile,id,x,y) {
    if (!validTile(x, y, zoomLevel)) return;
    iconsNotReady += 1;
}

function countPosters(xtile,ytile,id,x,y) {
    if (!validTile(x, y, zoomLevel)) return;
    postersNotReady += 1;
}

function countVideos(xtile,ytile,id,x,y) {
    if (!validTile(x, y, zoomLevel)) return;
    videosNotReady += 1;
}

function updateIcon(xtile,ytile,id,x,y) {

    if (!validTile(x, y, zoomLevel)) return;

    var iconElement = $("#" + id + "_icon");
    var iconSrc = getIconSrc(getImageFile(x, y, zoomLevel));

    var srcPromise = function(src) {
        iconElement.css("background-image", 'url("' + src + '")');
        iconElement.show();
        var buffer = $('<img>');
        buffer.attr('src', src);
        $("#buffering").append(buffer);

        iconsNotReady -= 1;
        if (iconsNotReady == 0) {
            setLoadState(1);
            tileUpdate(countPosters);
            tileUpdate(updatePoster);
        }
    };

    retrieveFile(iconSrc, srcPromise);
}

function updatePoster(xtile, ytile, id,x,y) {

    if (!validTile(x, y, zoomLevel)) return;

    var imageElement = $("#" + id + "_image");
    var imageSrc = getFileSrc(getImageFile(x, y, zoomLevel));

    var srcPromise = function(src) {

        imageElement.css("background-image", 'url("' + src + '")');
        imageElement.show();

        // var buffer = $('<img>');
        // buffer.attr('src', src);
        // $("#buffering").append(buffer);

        postersNotReady -= 1;

        if (postersNotReady == 0) {
            if (useVideos && !videosUpdated) {
                var timeNow = new Date().getTime();
                var timePassed = Math.max(0,1000-(timeNow-timeLast));
               // videoTimeout = setTimeout(function() { 
                    setLoadState(2);
                    tileUpdate(countVideos);
                    tileUpdate(updateVideo);
                    videosUpdated = true;
                //}, timePassed);
                timeLast = timeNow;
            }
        }
    };

    retrieveFile(imageSrc, srcPromise);

}

function updateVideo(xtile, ytile, id,x,y) {

    if (!validTile(x, y, zoomLevel)) return;

    var video = videojs(id);    
    var imageElement = $("#" + id + "_image");
    var iconElement = $("#" + id + "_icon");

    var fileSrc = getFileSrc(getVideoFile(x, y, zoomLevel));

    var srcPromise = function(src) {
        // var buffer = $('<video />', { src: src });
        // $("#buffering").append(buffer);

        players.push(id);
        video.src({ type: "video/mp4", src: src });
        video.currentTime(timeBefore);
        video.play();

        videosNotReady -= 1;
        if (videosNotReady == 0) {setLoadState(3); //bufferEveryIcon();
        }
    };

    if (retrieveFile(fileSrc, srcPromise) === false) {
        console.error(xtile, ytile);
    }

}

function handleVideoPlaying() {
    var id = this.id();
    if (players.indexOf(id) > -1) {
        if (videosUpdated = true) $("#" + id).show()
        //   console.log("playing");
    }
}

//changes xpos and ypos and zoom via css, if video srcs needs to be changed then changeTilesSrc is runn

function setPosition(newxpos, newypos, newzoom) {

    var newzoomLevel = Math.floor(Math.log2(newzoom));

    if (newzoomLevel >= levels) {
        newzoom = Math.pow(2, levels) - 0.001;
        newxpos = xpos;
        newypos = ypos;
    }

    var zoomCutoff = Math.max(min_zoom, tile_size * Math.max(xtilesView / width, ytilesView / height));


    if (newzoom < zoomCutoff) {
        newzoom = zoomCutoff + 0.001;
        newxpos = xpos;
        newypos = ypos;
    }

    newzoomLevel = Math.floor(Math.log2(newzoom));

    var screenWidth = tile_size / newzoom * xtilesView;
    var screenHeight = tile_size / newzoom * ytilesView;

    if (newxpos < 0) {
        newxpos = 0;
    }

    if (newypos < 0) {
        newypos = 0;
    }

    if (newxpos + screenWidth > width) {
        newxpos = width - screenWidth;
    }

    if (newypos + screenHeight > height) {
        newypos = height - screenHeight;
    }

    if (newxpos < 0 || newypos < 0 || newxpos + screenWidth > width || newypos + screenHeight > height) {
        return false;
    }

    var zoomRounded = Math.pow(2, newzoomLevel);
    var tileLength = tile_size / zoomRounded;

    var newxTilePos = Math.floor(newxpos / tileLength);
    var newyTilePos = Math.floor(newypos / tileLength);

    xpos = newxpos;
    ypos = newypos;
    zoom = newzoom;

    if (newxTilePos != xTilePos || newyTilePos != yTilePos || newzoomLevel != zoomLevel) {
        xTilePos = newxTilePos;
        yTilePos = newyTilePos;
        zoomLevel = newzoomLevel;
        changeTilesSrc();
    } else {
        css();
    }
}


function css() {

    var zoomRounded = Math.pow(2, zoomLevel);

    var scaleFactor = zoom / zoomRounded;

    var tileLength = tile_size / zoomRounded;

    var xposTile = xpos / tileLength;
    var yposTile = ypos / tileLength;


    pixelTileSize = defPixelTileSize * scaleFactor;

    tileUpdate(function(xtile, ytile, id) {
        var video = videojs(id);
        video.dimensions((pixelTileSize), (pixelTileSize));
    });

    $("#videos td").css("width", (pixelTileSize)).css("height", (pixelTileSize));
    $("#videos tr").css("width", xtilesWindow * (pixelTileSize)).css("height", (pixelTileSize));

    // position css

    var right = xposTile - xTilePos;
    $("#videos").css("right", (right * pixelTileSize));

    var bottom = yposTile - yTilePos;
    $("#videos").css("bottom", (bottom * pixelTileSize));

}

////////////////////

function changePosition(xchange, ychange, zoomchange, mouseX, mouseY) {
    var zoomStep = 0.03;
    var posStep = 30;
    var zdelta = zoomchange * zoomStep;
    var tileLength = tile_size / Math.pow(2, zoomLevel);
    var xdelta = (mouseX / pixelTileSize * tileLength) * zdelta * (1) / (1 + zdelta);
    var ydelta = (mouseY / pixelTileSize * tileLength) * zdelta * (1) / (1 + zdelta);

    setPosition(xpos + xchange * posStep / zoom + xdelta, ypos + ydelta + ychange * posStep / zoom, zoom * (1 + zdelta));
}

var loadState;

function setLoadState(state) {
    console.log(state);
    loadState = state;
    var states = ["Posters","Images","Videos"];
    if (state < 3) {
        $("#state").text(states[state]);
        $("#info").show();
    }
    else $("#info").hide();
}

$(document).on("startPanorama", function() {
    alert("scroll: zoom\nq: zoom in\nw: zoom out\narrow keys: pan");
    //console.log("test");
    tileUpdate(initialize);
    //videos = $(".video-js");
    setPosition(xpos, ypos, zoom);
    $(document).trigger("controls");
    if (useSync) { $(document).trigger("sync"); }
});