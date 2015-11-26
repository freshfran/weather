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

  $(buttonLoad).prop("disabled",true);       //Incluido - Francisco Palma: Control de errores, por defecto, Cargar y Borrar están disabled 
  $(buttonClear).prop("disabled",true);
  
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
    clearCard();                              //Incluida TEST!!!!!
    //clearCityWeather(cityWeather);          //Incluida TEST!!!!!
    loadSavedCities(event);
  });
  //buttonClear.on("click", clearCities);     //Comentado - Francisco Palma
  buttonClear.on("click", function() {        //Incluido - Francisco Palma
    $(this).prop("disabled",true);
    clearCities(event);
  });


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

    /*Aclaración - Francisco Palma: Comentario 1*/    
    $loader.hide();
    $body.append(clone);
  }

  function addNewCity(event) {
    event.preventDefault();
                                                //Incluido - Francisco Palma: Control de errores para el caso de data-input="cityAdd" vacio
    if (nombreNuevaCiudad.val() != "") {                                     
      $(buttonLoad).prop("disabled",false);     //Incluido - Francisco Palma: Cuando volvamos a incluir ciudad, activamos buttonLoad
      $(buttonClear).prop("disabled",false);    //Incluido - Francisco Palma: Cuando volvamos a incluir ciudad, activamos buttonClear
    $.getJSON(API_WEATHER_URL + "q=" + nombreNuevaCiudad.val(), getWeatherCity);
    }
    else
    {
      alert("Debes incluir una nueva ciudad");
    }
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
      localStorage.setItem("cities", JSON.stringify(cities));
    });
  }

  function loadSavedCities(event) {
    event.preventDefault();

    var a = new Array(), m = 0, acum = 0;

    function renderCities(cities){
      //alert("Entramos en renderCities");

      if (cities != null){                  //Modificado - Francisco Palma: Salvamos el caso de que cities venga vacio en el forEach
        cities.forEach(function(city) {  
          //alert("Dentro de forEach()");
          //alert(city.zone);
          if (acum == 0){
            a[m] = city.zone;     
            //alert(a[m]);              
            acum++;   
            renderTemplate(city);  
          }          
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
      else
      {
        alert("Las ciudades han sido borradas: No es posible mostrarlas.");        
      }
    };
    //Código ya hecho antes, cogemos el string de LS, lo parseamos a JSON, y lo ponemos en array cities[]
    var cities = JSON.parse( localStorage.getItem("cities") );  
    // for (var i in cities){
    //   alert(cities[i].zone);
    // }
    renderCities(cities);                     
  }

  function clearCities(event) {                 //Incluido - Francisco Palma: Con esta función, limpiamos el localstorage
    event.preventDefault();                     //por medio de su clave. Dejo comentadas otras formas de hacerlo, y la 
    localStorage.removeItem('cities');          //comprobación de que la localstorage queda vacia.
    cities.length = 0;                          //Limpiamos array 'cities', de forma que cuando hayamos limpiado la pantalla, 
                                                //no estemos acumulando resultados anteriores, que mostraríamos en la nueva lista de ciudades

    $(".card").remove();                        //Con esta función, limpiamos clase 'card'
    navigator.geolocation.getCurrentPosition(getCoords, errorFound);  
                                                //Cargamos nuevamente posición geolocalizada por browser, restablecemos situación inicio
  }

  function clearCard(){
    $(".card").remove();
  } 

  function clearVectorCities(cities){         //Incluido - Francisco Palma 26/11/15: Limpiamos array 'cities', de forma que cuando hayamos
    cities.length = 0;                        //limpiado la pantalla, no estemos acumulando resultados anteriores, que mostraríamos en la 
  }                                           //nueva lista de ciudades.

})();

/*
Comentario 1
Inicialmente, antes de declarar aparte las variables, teníamos esto Con Jquery
    //$(".loader").hide();      Seleccionamos con JQuery la clase 'loader', y le decimos que se esconda 
    //$("body").append(clone);  Decimos que añada el contenido de clone sobre el DOM
                                
    Como buena práctica, para no estar cargando cada vez las variables, declaramos como variable la carga de JQuery,
    de esta forma: $body = $("body"). De esta forma, cuando estemos haciendo el 'append', solo estaremos cargando la variable
    ya declarada.

    Hacemos lo mismo con $loader.

    Otra forma de hacerlo es:
    $( $loader).hide();
    $( $body).append(clone);


Comentario 2
Intentos fallidos de limpiar el contenido del ID template--city
    //$("#template--city").remove(); con JQUERY
    //$("#template--city").remove(".card");
    //$("#template--city").clearQueue();
    //$(".card").empty(); CASI
    //$(".card").clearQueue();

*/
