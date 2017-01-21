/*
The appUrl will prevent us from having to type out
the information multiple times and allow us to simply concatenate
the value of window.location.origin property with API information
in our client-side controllers.
This property will return the root URL of the current browser window
(i.e. it should always reference http://localhost:8080/).
*/
var appUrl = window.location.origin;

var ajaxFunctions = {
  ready: function ready (fn) {

     if (typeof fn !== 'function') {
        return;
     }

     if (document.readyState === 'complete') {
        return fn();
     }
     document.addEventListener('DOMContentLoaded', fn, false);
   },
   ajaxRequest: function ajaxRequest (method, url, callback) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        // 4 means that the operation (i.e. data retrieval) has been completed
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.response);
         }
      };

      xmlhttp.open(method, url, true);
      // the xmlhttp.send() method executes the previously initiated request
      //(from the open() method)
      xmlhttp.send();
    }
}
