(function() {

  var API_WORLDTIME_KEY = "d6a4075ceb419113c64885d9086d5";
  var API_WORLDTIME = "https://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&q=";
  var API_WEATHER_KEY = "80114c7878f599621184a687fc500a12";
  var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
  var IMG_WEATHER = "http://openweathermap.org/img/w/";

  var today = new Date();
  var timeNow = today.toLocaleTimeString();

  var $body = $("body");
  var $loader = $(".loader");
  var nombreNuevaCiudad = $("[data-input='cityAdd']");
  var buttonAdd = $("[data-button='add']");
  var buttonLoad = $("[data-saved-cities]");
  var buttonClear = $("[data-button-clear]"); //Incluido - Francisco Palma
  
  var cities = [];
  var cityWeather = {};
  cityWeather.zone;
  cityWeather.icon;
  cityWeather.temp;
  cityWeather.temp_max;
  cityWeather.temp_min;
  cityWeather.main;

  nombreNuevaCiudad.on("keypress", function(event) {
    if(event.which == 13) {
      addNewCity(event);
    }
  });

  buttonAdd.on("click", addNewCity);
  //buttonLoad.on("click", loadSavedCities);  //Comentado - Francisco Palma: Anterior llamada a 'loadSavedCities'
  buttonLoad.on("click", function() {         //Incluido - Francisco Palma
    $(this).prop("disabled",true);            //De esta forma, solo podemos mostrar lista ciudades 1 vez, tras insertar nueva ciudad
    loadSavedCities(event);
  });
  buttonClear.on("click", clearCities);       //Incluido - Francisco Palma

  if(navigator.geolocation) {
    //debugger;                               //Comentado - Francisco Palma
    navigator.geolocation.getCurrentPosition(getCoords, errorFound);
  } else {
    alert("Por favor, actualiza tu navegador");
  }

  function errorFound(error) {
    alert("Un error ocurrió: " + error.code);
    // 0: Error desconocido
    // 1: Permiso denegado
    // 2: Posición no está disponible
    // 3: Timeout
  };

  function getCoords(position) {
    //debugger;                               //Comentado - Francisco Palma
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    console.log("Tu posición es: " + lat + "," + lon);
    $.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon, getCurrentWeather);
  };

  function getCurrentWeather(data) {
    cityWeather.zone = data.name;
    cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
    cityWeather.temp = data.main.temp - 273.15;
    cityWeather.temp_max = data.main.temp_max - 273.15;
    cityWeather.temp_min = data.main.temp_min - 273.15;
    cityWeather.main = data.weather[0].main;

    renderTemplate(cityWeather);
  };

  function activateTemplate(id) {
    var t = document.querySelector(id);
    return document.importNode(t.content, true);
  };

  function renderTemplate(cityWeather, localtime) {  

    var clone = activateTemplate("#template--city");

    var timeToShow;
    if(localtime) {
      timeToShow = localtime.split(" ")[1];
    } else {
      timeToShow = timeNow;
    }

    clone.querySelector("[data-time]").innerHTML = timeToShow;
    clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
    clone.querySelector("[data-icon]").src = cityWeather.icon;
    clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
    clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1);
    clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);

    /*Aclaración - Francisco Palma: Inicialmente, antes de declarar aparte las variables, teníamos esto Con Jquery
    //$(".loader").hide();      Seleccionamos con JQuery la clase 'loader', y le decimos que se esconda 
    //$("body").append(clone);  Decimos que añada el contenido de clone sobre el DOM
                                
    Como buena práctica, para no estar cargando cada vez las variables, declaramos como variable la carga de JQuery,
    de esta forma: $body = $("body"). De esta forma, cuando estemos haciendo el 'append', solo estaremos cargando la variable
    ya declarada.

    Hacemos lo mismo con $loader.

    Otra forma de hacerlo es:
    $( $loader).hide();
    $( $body).append(clone);
    */
    
    $loader.hide();
    $body.append(clone);
  }

  function addNewCity(event) {
    event.preventDefault();
    $(buttonLoad).prop("disabled",false);       //Incluido - Francisco Palma: Cuando volvamos a incluir ciudad, activamos buttonLoad
    $.getJSON(API_WEATHER_URL + "q=" + nombreNuevaCiudad.val(), getWeatherCity);
  }

  function getWeatherCity(data) {

    $.getJSON(API_WORLDTIME + nombreNuevaCiudad.val(), function(response) {

      nombreNuevaCiudad.val("");

      cityWeather = {};
      cityWeather.zone = data.name;
      cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
      cityWeather.temp = data.main.temp - 273.15;
      cityWeather.temp_min = data.main.temp_min - 273.15;
      cityWeather.temp_max = data.main.temp_max - 273.15;

      //renderTemplate(cityWeather, response.data.time_zone[0].localtime); //FRAN
      //FRAN: Para que no se pinten siempre en el templaate las ciudades.

      //FRAN: Crearemos una función para comparar por nombre las ciudades que ya se han insertado en el array
      // for (var i in cities){
      //   if (cities[i] === cityWeather.zone){
      //     alert ("Esta ciudad ya estaba");
      //   }
      //   alert(cities[i]);
      // } 

      var flag = 0;                               //Incluido - Francisco Palma: Con este módulo se controla que en el array 'cities[]'
      for (i = 0; i < cities.length; i++){        //no se estén incluyendo ciudades repetidas.
        if (cities[i].zone === cityWeather.zone){
          alert("Ciudad repetida en la lista");
          flag = 1;
        }
      }
      if (flag == 0) {
        cities.push(cityWeather);
      }
      
      //FRAN: Este bucle funciona, con él, recorremos el vector de objetos 'cities', y obtenemos el nombre de cada posición por medio del atributo 'zone'.
      // for (i = 0; i < cities.length; i++){
      //   alert(cities[i].zone);
      // }
      localStorage.setItem("cities", JSON.stringify(cities));
    });
  }

  function loadSavedCities(event) {
    event.preventDefault();

    var a = new Array(), m = 0, acum = 0;

    function renderCities(cities){
      //alert("Entramos en renderCities");
      if (cities.length == 0){          //Modificado - Francisco Palma: Salvamos el caso de que cities venga vacio en el forEach
        alert("Las ciudades han sido borradas: No es posible mostrarlas.");
      }
      else
      {
        cities.forEach(function(city) {  
          //alert("Dentro de forEach()");
          //alert(city.zone);
          if (acum == 0){
            a[m] = city.zone;     
            //alert(a[m]);              
            acum++;   
            renderTemplate(city);  
          }
          //acum++;                     //Para poder controlar repeticiones, mínimo debemos haber incluido 1 item, por eso condicionamos
                                        //a partir de la 2da
          else
          {
            a[m] = city.zone;
            for (n = 0; n < (a.length -1); n++){ 
              if (a[n] == city.zone){
                break;
              }
              renderTemplate(city);
              n = a.length -1;
            }
          }          
          m++;
        });
      }
    };
    //Código ya hecho antes, cogemos el string de LS, lo parseamos a JSON, y lo ponemos en array cities[]
    var cities = JSON.parse( localStorage.getItem("cities") );  
    for (var i in cities){
      //alert(cities[i].zone);
    }
    renderCities(cities); //Llamamos a función renderCities
  }

  function clearCities(event) {                 //Incluido - Francisco Palma: Con esta función, limpiamos el localstorage
    event.preventDefault();                     //por medio de su clave. Dejo comentadas otras formas de hacerlo, y la 
    localStorage.removeItem('cities');          //comprobación de que la localstorage queda vacia.
    clearTemplate();
    //localStorage.clear(cities);               
    //return localStorage.cities = null;
    //alert(localStorage.length);
  }

  function clearTemplate(){

    //$("#template--city").remove(); con JQUERY
    $("#template--city").remove(".card");

    //alert(id);
    // var list = document.getElementsByClassName("#template--city");
    // for(var i = list.length - 1; 0 <= i; i--)
    //   if(list[i] && list[i].parentElement)
    //   list[i].parentElement.removeChild(list[i]);


    // document.getElementById(id).innerHTML ='';

    //     var element = document.getElementById(id);
    // element.outerHTML = "";
    // delete element;
    //var element = document.getElementById(id);
    //element.parentNode.removeChild(".card");
    //document.querySelector(id).remove();
    // var t = document.querySelector(id);
    // t.
    // return document.importNode(t.content, false);
    //$("#template--city").clear();
  }


})();
