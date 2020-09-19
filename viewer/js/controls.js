var mousePos = { "x": 0, "y": 0 };

$(document).on("controls", function() {

    var el = document.getElementById("videoContainer");

    var mc = new Hammer.Manager(el);

    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

    mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(mc.get('pan'));

    mc.add(new Hammer.Tap)

    mc.on("panstart panmove",
        function(e) { changePosition(-e.deltaX / 300, -e.deltaY / 300, 0, 0, 0); });

    mc.on("pinch", function(e) {
        zchange = Math.log(e.scale) / 3;
        center = e.center;
        changePosition(0, 0, zchange, center.x, center.y);
    });

    var holding;

    var keysPressed = {};

    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    $(document).keydown(function(e) {
        keysPressed[e.which] = true;

        var ychange = 0;
        var xchange = 0;
        var zchange = 0;


        if (40 in keysPressed) { //down function
            ychange += 1;
        }
        if (37 in keysPressed) { //left function
            xchange -= 1;
        }
        if (39 in keysPressed) { //right function
            xchange += 1;
        }
        if (38 in keysPressed) { //up function
            ychange -= 1;
        }

        if (81 in keysPressed) { //q function
            zchange += 1;
        }
        if (87 in keysPressed) { //w function
            zchange -= 1;
        }

        if (xchange !== 0 || ychange !== 0 || zchange !== 0) {
            changePosition(xchange, ychange, zchange, mousePos.x, mousePos.y);
        }
    });

    $(document).keyup(function(e) {
        delete keysPressed[e.which];
    });

    $("body").mousemove(function(e) {
        mousePos.x = e.pageX;
        mousePos.y = e.pageY;
    });

    var zoom;

    $("#videoContainer").on("wheel", function(e) {
        e.preventDefault();
        //console.log(e);
        var zchange;
        if (e.originalEvent.deltaY < 0) zchange = Math.min(1, -e.originalEvent.deltaY / 30);
        else zchange = -Math.min(1, e.originalEvent.deltaY / 30);
        //console.log(zchange);
        changePosition(0, 0, zchange, e.pageX, e.pageY);
    });

    $("#reset").on("click",function(){setPosition(0,0,1);});



});