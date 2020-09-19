function getImageFile(x, y, level) {
    return 'mipmap_' + level + '_' + y + '_' + x + '.jpg';
}

function getVideoFile(x, y, level) {
    return 'mipmap_' + level + '_' + y + '_' + x + '.mp4';
}

function getFileSrc(file) {
    return 'data/' + viewer_data + '/' + file;
}

function getIconSrc(file) {
    return 'images/' + viewer_data + '/' + file;
}

function ajaxRequest(file, promise) {

    var req = new XMLHttpRequest();
    req.open('GET', file, true);
    req.responseType = 'blob';
    filesLoading[file] = req;

    req.onload = function() {

        if (this.status === 200) {
            delete filesLoading[file];
            var blob = this.response;
            var url = URL.createObjectURL(blob);
            promise(url);

        } else {
            console.error(file + " failed");
        }
    };
    req.onerror = function() {
        console.error(file + "failed");
    };

    req.send();
}

//loading

var filesLoading = {};
var filesLoaded = {};

function retrieveFile(fileSrc, srcPromise) {

    if (!srcPromise) {
        srcPromise = function() { return; };
    }

    var loading = filesLoading.hasOwnProperty(fileSrc);
    var loaded = filesLoaded.hasOwnProperty(fileSrc);

    if (loading) return false;
    if (loaded) return srcPromise(filesLoaded[fileSrc]);

    var promise = function(src) {
        filesLoaded[fileSrc] = src;
        srcPromise(src);
    };

    ajaxRequest(fileSrc, promise);

}

////////////////////////// buffering

function stopBuffering(file) {

    if (!(file in bufferedPostersLoading) || !(file in bufferedVideosLoading)) {
        return false;
    }

    var img = $('#' + file);
    img.remove();


}

function stopAllBuffering() {
    for (var file in filesLoading) filesLoading[file].abort();
    window.stop();
    filesLoading = {};
}



// loads every image

function bufferEveryPoster() {
    var srcPromise = function(src) {
        var buffer = $('<img>');
        buffer.attr('src', src);
        $("#buffering").append(buffer);
    };
    for (var level = 0; level < levels; level++) {
        for (var ytile = 0; ytile < y_tiles[level]; ytile++) {
            for (var xtile = 0; xtile < x_tiles[level]; xtile++) {
                retrieveFile(getImageFile(xtile, ytile, level),srcPromise);
            }
        }

    }
}

function bufferEveryIcon() {
    var srcPromise = function(src) {
        var buffer = $('<img>');
        buffer.attr('src', src);
        $("#buffering").append(buffer);
    };
    for (var level = 0; level < levels; level++) {
        for (var ytile = 0; ytile < y_tiles[level]; ytile++) {
            for (var xtile = 0; xtile < x_tiles[level]; xtile++) {
                retrieveFile(getIconSrc(getImageFile(xtile, ytile, level)),srcPromise);
            }
        }

    }
}

// loads every video

function bufferEveryVideo() {
    var srcPromise = function(src) {
        var buffer = $('<video />', { src: src });
        $("#buffering").append(buffer);
    };
    for (var level = 0; level < levels; level++) {
        for (var ytile = 0; ytile < y_tiles[level]; ytile++) {
            for (var xtile = 0; xtile < x_tiles[level]; xtile++) {
                retrieveFile(getVideoFile(xtile, ytile, level),srcPromise);
            }
        }

    }
}
