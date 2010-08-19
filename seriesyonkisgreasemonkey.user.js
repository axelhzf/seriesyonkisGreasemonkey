// ==UserScript==
// @name          SeriesYonkis GreaseMonkey Script
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @include       http://www.seriesyonkis.com/*
// ==/UserScript==

// Append some text to the element with id someText using the jQuery library.


var $mirrorList;

$(function(){
    callFunctionByLocation();
});

function callFunctionByLocation(){
    var path = window.location.pathname;
    var splitPath = path.split('/');
    
    if(splitPath.length > 2){
        var firstFolder = splitPath[1];
        if(firstFolder == 'capitulo'){
            capitulo();
        }else if(firstFolder == 'serie'){
            serie();
        }else{
            console.log('Pagina no controlada');
        }
    }else{
        principal();
    }
}

function capitulo(){
    initMirrorList();

    //Seleccionar la tabla con los enlaces
    //FIX: selector sensible
    $tabla = $('table:first');

    //Descar la cabecera
    $filas = $tabla.find('tr').not(':first');


    $filas.each(function(i, elemento){
        console.log(i);
        $elemento = $(elemento);
        var enlace = $elemento.find('a[target="peli"]').attr('href');
        var idioma = $elemento.find('td:eq(2) span').html()
        var subs   = $elemento.find('td:eq(3) span').html()

        var name = 'Mirror ' + i;
        addMirror(name, enlace, idioma, subs);

    });

    
    replaceBody($mirrorList.html());
}

function principal(){

    $listaSeries = $('<ol/>');
    $items = $('li.page_item').appendTo($listaSeries);
        
    replaceBody($listaSeries);
}

function serie(){
   
    $listaCapitulos = $('<ol/>');
    $items = $('h5').appendTo($listaCapitulos);
    console.log($listaCapitulos);
    replaceBody($listaCapitulos);
}

function initMirrorList(){
    $mirrorList = $('<ul/>');
}

function replaceBody(element){
    style();
    $container = $('<div id="container"/>').append(element);
    $('body').html('').append($container);
}

function addMirror(name, enlace, idioma, subs){
    $('<li><a href="'+ enlace +'">' + name + ' - ' + idioma +' Subs:' + subs + ' </a></li>').appendTo($mirrorList);
}

function style(){
    var $body = $('body');
    $body.removeAttr('id');
    $body.removeAttr('style');
    $body.removeAttr('class');

    var style = (<r><![CDATA[

                 body {background-color: #F6F3ED}

#container {
border:1px solid;
font-family:Helvetica,Arial,Geneva,sans-serif;
font-size:20px;
margin:50px auto auto;
padding:20px 50px;
width:700px;
-moz-border-radius: 20px;
	-webkit-border-radius: 20px;
	border-radius: 20px;
        text-shadow:1px 1px 0 #FFFFFF;
}

               ]]></r>).toString();


        addGlobalStyle(style);
 }

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) {
            return;
        }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
