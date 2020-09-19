
// function Create2DArray(a, b) {
//     var x = new Array(a);
//     for (var i = 0; i < a; i++) {
//         var z = new Array(b);
//         z.fill({});
//         x[i] = jQuery.extend(true, {}, z);
//     }
//     return x;
// }

// function CreateTileArray() {
//     return Create2DArray(xtilesWindow, ytilesWindow);
// }

// function CreatePosArray() {
//     var x = new Array(levels);
//     for (var level = 0; level < levels; level++) {
//         var z = Create2DArray(xmaxLevels[level], ymaxLevels[level]);
//         x[level] = jQuery.extend(true, {}, z);
//     }
//     return x;
// }


var urlParams;

(window.onpopstate = function() {
    var match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();
