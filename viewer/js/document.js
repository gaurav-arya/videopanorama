/*jshint multistr: true */



var xtilesWindow = parseInt(urlParams.xtiles || 4);
var ytilesWindow = parseInt(urlParams.ytiles || 3);

var xtilesView;
var ytilesView;

var pixelTileSize;

var defPixelTileSize; //default pixel tile size 

var videos;




$(document).ready(function() {
    defPixelTileSize = $(window).width() / (xtilesWindow-1);
    pixelTileSize = defPixelTileSize;
    xtilesView = $(window).width()/pixelTileSize;
    ytilesView = $(window).height()/pixelTileSize;
    tiles();
    $("#videoContainer").css("height", Math.round(pixelTileSize * ytilesView)).css("width", Math.round(pixelTileSize * xtilesView));
   $("#videos td").css("width", pixelTileSize).css("height", pixelTileSize);
    $(".video-js").on('contextmenu', function(e) {
    e.preventDefault();

 });
    $(document).trigger("startPanorama");
});

function tiles() {
    var content = "";
    for (var ytile = 0; ytile < ytilesWindow; ytile++) {
        content += "<tr>";
        for (var xtile = 0; xtile < xtilesWindow; xtile++) {
            id = ytile + "_" + xtile;
            var videoElement = '<video id="' + id + '" class="video-js e" muted></video>';
            var imageElement = '<div id="' + id + '_image" class="background e"></div>';
            var iconElement = '<div id="' + id + '_icon" class="background e"></div>';
            content += '<td>' + iconElement + imageElement + videoElement + '</td>';
        }
        content += "</tr>";
    }
    $("#videos").append(content);

}

//$(window).on('beforeunload', function() { $(".video-js").hide(); });