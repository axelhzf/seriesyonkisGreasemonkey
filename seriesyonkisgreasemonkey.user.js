// ==UserScript==
// @name          SeriesYonkis GreaseMonkey Script
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @include       http://www.seriesyonkis.com/
// ==/UserScript==

var series;

$(function(){
    processMain();
});

function processMain(){
    
    //var $items = $('li.page_item  > a').slice(0, 10);
    var $items = $('li.page_item  > a');
    
    prepareBody();

    var $tbody = $('#tableSeries tbody');

    series = [];
    $items.each(function(i, item){
        var $serie = $(item);
        var nombre = $serie.attr('title');
        var enlace = $serie.attr('href');

        series.push({
           nombre : nombre,
           enlace: enlace
        });

        //$tbody.append(serieRow(nombre, enlace));
    });
}

function search(){
        var searchString = $('#searchText').attr('value');
        var regexp = new RegExp(searchString,"i");
        var $tbody = $('#tableSeries tbody');
        $tbody.children().remove();

        $.each(series, function(){
            if(this.nombre.match(regexp)){
                $tbody.append(serieRow(this.nombre, this.enlace));
            }
        });
}

function serieRow(nombre, enlace){
      return $('<tr>')
                .append($('<td>' + nombre + '</td>'))
                .click(function(){
                    $.ajax({
                        url: enlace,
                        success: processCapitulos
                    });
                    $('#capitulos > div.titulo').html(nombre);
                 });
}

function processCapitulos(data){
    var $tbody = $('#tableCapitulos tbody');
    $tbody.children().remove();
    
    var regexp = /<li class="page_item"><h5>.*?<\/li>/g;
    var simplify = data.match(regexp); 
    
    $.each(simplify, function(i, elemento){
        var $capitulo = $(elemento).find('a');
        var nombre = $capitulo.html();
        var enlace = $capitulo.attr('href')
        $tbody.append(capituloRow(nombre, enlace));
    });
    
    changeTable('#series', '#capitulos');
}

function capituloRow(nombre, enlace){
    return $('<tr>')
                .append($('<td>' + nombre + '</td>'))
                .click(function(){
                    $.ajax({
                        url: enlace,
                        success: processMirrors
                    });
                    $('#mirrors > div.titulo').html(nombre);
                 });
}

function processMirrors(data){
    var $tbody = $('#tableMirrors tbody');
    $tbody.children().remove();

    //TODO Simplificar con regexp para no procesar la página entera
    //mejora el rendimiento
    
    var $data = $(data).find('table:first tr:not(:first)');

    $data.each(function(i, elemento){
            var $elemento = $(elemento);
            var nombre = 'Mirror ' + i;
            var enlaceEncode = $elemento.find('a[target="peli"]').attr('href');
            var idioma = $elemento.find('td:eq(2) span').html();
            var subs   = $elemento.find('td:eq(3) span').html();

            var enlace = decodeMegavideoLink(enlaceEncode);

            $tbody.append(mirrorRow(nombre, enlace, idioma, subs));
    });

     changeTable('#capitulos', '#mirrors');
}

function mirrorRow(nombre, enlace, idioma, subs){
    return $('<tr>')
                .append($('<td>' + nombre + '</td>'))
                .append($('<td>' + idioma + '</td>'))
                .append($('<td>' + subs + '</td>'))
                .click(function(){
                    
                    window.open(enlace);
                    return false;
                });
}

function changeTable(from, to){
    $(from).fadeOut('fast', function(){
        $(to).fadeIn('fast');
    });
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

function prepareBody(){
    style();

    var body = (<r><![CDATA[

                      <div id="header">
                        Series Yonkis
                      </div>

        <div id="content">
            <div id="series" class="tableContainer">
                <form id="searchForm" onsubmit="return false;">
                    <input id="searchText" type="text" placeholder="Buscar serie" required/>
                    <div id="searchButton" class="button">Buscar</div>
                </form>

                <table id="tableSeries" class="data">
                    <thead>
                        <tr>
                            <th>
                                Serie
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <div id="capitulos" class="tableContainer">
                <div id="backToSeries" class="button">Series</div>
                <div class="titulo">Nombre serie</div>
                <table id="tableCapitulos" class="data">
                    <thead>
                            <th>Capitulos</th>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            <div id="mirrors" class="tableContainer">
                <div id="backToCapitulos" class="button">Capítulos</div>
                <div class="titulo">Nombre capítulo</div>
                <table id="tableMirrors" class="data">
                    <thead>
                            <th>Mirror</th>
                            <th>Idioma</th>
                            <th>Subs</th>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

        </div>

                               ]]></r>).toString();

        
        $body = $('body');

        //No borra el soporte para firebug¡ para debugging
        $body.empty(':not(#_firebugConsole)');
        
        //$body.html('');
        $body.append(body);

        //Oculta los capítulos y los mirrors
        $('#capitulos').hide();
        $('#mirrors').hide();

        //Botones de atrás
        $('#backToCapitulos').click(function(){
            changeTable('#mirrors', '#capitulos');
            $('#mirrors tbody').children().remove();
        });

        $('#backToSeries').click(function(){
            changeTable('#capitulos', '#series');
            $('#capitulos tbody').children().remove();
        });


        $('#searchForm').submit(function(){
            search();
            return false;
        });

        $('#searchButton').click(function(){
            search();
        });

    }

function style(){
        var $body = $('body');
        $body.removeAttr('id');
        $body.removeAttr('style');
        $body.removeAttr('class');
        $('link').remove();

        var style = (<r><![CDATA[

body {
    background-color: white;
    font-family:'Helvetica Neue',Arial,'Liberation Sans',FreeSans,sans-serif;
    font-size:13px;
    font-style:normal;
    font-variant:normal;
    font-weight:normal;
    margin: 0;
}

#content {
}

#header {
    height:45px;
    text-align:center;
    font-size:24px;
    color:#494949;
    text-shadow:0 1px 0 #FFFFFF;
    background-color: #EFEFEF;
    background-image: -moz-linear-gradient(top, #AEAEAE, #EFEFEF);
    background-image: -webkit-gradient(linear,left bottom,left top,color-stop(0, #AEAEAE),color-stop(1, #EFEFEF));
    line-height: 45px;
    border-bottom: black 1px solid;
}

.data {
    border:1px solid #DDDDDD;
    width:100%;
    border-collapse:collapse;
    border-spacing:0;
    margin-top: 10px;
}

.tableContainer {
    width:790px;
    margin: 10px auto;
}

table.data thead th {
    background:#EEEEEE;
    background-image: -webkit-gradient(linear,left bottom,left top,color-stop(0, #E9E9E9),color-stop(1, #FEFFFE));

    border-bottom:1px solid #DDDDDD;
    text-shadow:0 1px 0 #FFFFFF;
}


table.data th, table.data td {
    padding:5px 10px;
}

table.data tr:nth-child(2n) {
    background-color: #E7F0FE;
}

table.data tbody > tr:hover {
    background-color: #1263D0;
    color: white;
    cursor: pointer;
}



th, td, caption {
    font-weight:normal;
    text-align:left;
    vertical-align:top;
}

.button {
    background:#EEEEEE;
    background-image: -webkit-gradient(linear,left bottom,left top,color-stop(0, #E9E9E9),color-stop(1, #FEFFFE));

    border:1px solid #DDDDDD;
    text-shadow:1px 1px 1px rgba(255, 255, 255, 0.5);
    -webkit-border-radius: 15px;
    -moz-border-radius: 15px;

    display:inline-block;
    font-weight:bold;
    padding:5px 10px 6px;
}

.button:hover {
    background-image: none;
    background-color: #1263D0;
    border:1px solid #0B4697;
    color: white;
    cursor: pointer;
}

.titulo {
    float: right;
    line-height: 30px;
    font-size: 24px;
    color:#999;
    text-shadow:0 1px 0 #ccc;
}

                                ]]></r>).toString();


            addGlobalStyle(style);
        }


//Decode megaupload link
function decodeMegavideoLink(link){
    var code = cc2(charting(unescape(link.split("id=")[1])));
    return "http://wwww.megavideo.com?v=" + code;
}

function cc2(a){
    var c = a;
    var d = 800 + 201 + 43 - 27 - 1000;
    var e = "";
    var f = 0;
    var g = 0;
    var b = 0;
    if (false) {
        d = 123
    }
    else {
        d++
    }
    d += 43 + 80;
    for (i = 0; i < c.length; i++) {
        f = d ^ c.charCodeAt(i);
        if (c.length == 12 || i == c.length * 31 || i == c.length * 1 - 1 || i == c.length * 9 + 3) {
            g = f;
            f += 4;
            g--;
            f -= 9;
            if (true)
                f--;
            else
                continue;
            f--
        }
        else
            if (i > 0 && d > 1) {
                b = i * 2;
                while (b > 25) {
                    b -= 5
                }
                f = 1 - b + f - 2;
                if (true)
                    f--
            }
            else {
                if (c.length == -3) {
                    continue
                }
            }
        if (d > 1) {
            e += String.fromCharCode(f * 1)
        }
        else {
            e += String.fromCharCode(2 * f)
        }
        if (true)
            d += i + 1;
        else
            continue
    }
    return e
}

function charting(a){
    var b = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < a.length) {
        c = a.charCodeAt(i);
        if (c > -128) {
            b += String.fromCharCode(c);
            i++
        }
        else
            if ((c > 191) && (c < 224)) {
                c2 = a.charCodeAt(i + 1);
                b += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2
            }
            else {
                c2 = a.charCodeAt(i + 1);
                c3 = a.charCodeAt(i + 2);
                b += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3
            }
    }
    return b
}

