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

var postersNotReady;
var videosNotReady;

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

////////////////////////// common

function getId(x, y) {
    return y + "_" + x;
}

function getPos(id) {
    z = id.split("_");
    return { "x": parseInt(z[1]), "y": parseInt(z[0]) };
}

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
            operation(xtile, ytile, id);
        }
    }
}

//initializes every video container

function initialize(xtile, ytile, id) {
    $("#" + id).attr("mediagroup", "main");
    var video = videojs(id, { loop: true, loadingSpinner: false, autoplay: false, controls: false });
    //video.width(tileSize);
    //  video.height(tileSize);

    if (useVideos) {
        //   video.on(['waiting', 'pause'], handleVideoPaused);
        video.on('playing', handleVideoPlaying);
    }
}

function handleVideoPlaying() {
    var id = this.id();
    if (players.indexOf(id) > -1) {
        if (videosUpdated = true) $("#" + id).css("display", "block");
        //   console.log("playing");
    }
}

/////////////////

//changes video and poster src depending on xTilePos and yTilePos, for tileUpdate

function updatePoster(xtile, ytile, id) {

    var x = xtile + xTilePos;
    var y = ytile + yTilePos;

    if (!validTile(x, y, zoomLevel)) return;

    postersNotReady += 1;

    var imageElement = $("#" + id + "_image");
    var iconElement = $("#" + id + "_icon");

    iconElement.hide();
    imageElement.hide();

    var iconSrc = getIconSrc(getImageFile(x, y, zoomLevel));
    var fileSrc = getFileSrc(getImageFile(x, y, zoomLevel));

    var srcPromise2 = function(src) {

        imageElement.css("background-image", 'url("' + src + '")');
        imageElement.show();

        var buffer = $('<img>');
        buffer.attr('src', src);
        $("#buffering").append(buffer);
        // setBackgroundImage('url("' + src + '")');
        // videojs(id).poster(src);
        postersNotReady -= 1;

        console.log("not ready: " + postersNotReady);

        if (postersNotReady == 0) {
            if (useVideos && !videosUpdated) {
                videosNotReady = 0;
                players = [];
                var timeNow = new Date().getTime();
                var timePassed = Math.max(0,1000-(timeNow-timeLast));
                videosUpdated = true;
                setTimeout(function() { 
                    tileUpdate(updateVideo);
                    console.log(timePassed);
                }, timePassed);
                timeLast = timeNow;
            }
        }
    };

    var srcPromise1 = function(src) {
        iconElement.css("background-image", 'url("' + src + '")');
        iconElement.show();
        var buffer = $('<img>');
        buffer.attr('src', src);
        $("#buffering").append(buffer);
        //  videojs(id).poster(src);
        retrieveFile(fileSrc, srcPromise2);
    };

    retrieveFile(iconSrc, srcPromise1);

}

function updateVideo(xtile, ytile, id) {


    var x = xtile + xTilePos;
    var y = ytile + yTilePos;



    if (!validTile(x, y, zoomLevel)) return;

    videosNotReady += 1;

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

        //iconElement.hide();
        //imageElement.hide();

        videosNotReady -= 1;
        if (videosNotReady == 0) $("#info").hide();
    };

    if (retrieveFile(fileSrc, srcPromise) === false) {
        console.error(xtile, ytile);
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

function changeTilesSrc() {

    videosUpdated = false;

    timeBefore = videojs("0_0").currentTime();

    nearestSecond = ((timeBefore) % 8) || 0;


    videos.css("display", "none");
    $("#info").show();

    stopAllBuffering();

    postersNotReady = 0;

    tileUpdate(updatePoster);


    // if (useVideos) {
    //     videosReady = 0;
    //     players = [];
    //     tileUpdate(updateVideo);
    // } 

    css();

}

var buffer = function() {
    //if (useBuffer) bufferEveryPoster();
};

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

$(document).on("startPanorama", function() {
    //console.log("test");
    tileUpdate(initialize);
    videos = $(".video-js");
    setPosition(xpos, ypos, zoom);
    $(document).trigger("controls");
    if (useSync) { $(document).trigger("sync"); }
});