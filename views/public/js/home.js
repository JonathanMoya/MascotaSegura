function hover(algo){
    $(algo).find("p").css("opacity", "1")
    $(algo).find("img").css("filter", "blur(2px)");
}

function donthover(algo){
    $(algo).find("p").css("opacity", "0")
    $(algo).find("img").css("filter", "blur(0px)");
}

function redimensionar(){
    var width = $(window).width();
    if(width>=1093){
        $('#PC').show();
        $('#movil').hide();
    }else{
        $('#PC').hide();
        $('#movil').show();
    }
}

$( document ).ready(function() {
    redimensionar();
});

$( window ).resize(function() {
    redimensionar();
});
