'use strict';

(function () {
  var profileId = document.querySelector('#profile-id') || null;
  var profileUsername = document.querySelector('#profile-username') || null;
  var displayName = document.querySelector('#display-name');
  var profileRepos = document.querySelector('#profile-repos') || null;
  var apiUrl = appUrl + '/api/:id';

  function updateHtmlElement(data, element, property){
    element.innerHTML = data[property];
  }

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest("GET", apiUrl, function(data){
    var userObject = JSON.parse(data);
    updateHtmlElement(userObject, displayName, "displayName");
    console.log(userObject);
    if (profileId !== null){
      updateHtmlElement(userObject, profileId, "id");
    }
    if (profileUsername !== null){
      updateHtmlElement(userObject, profileUsername, "username");
    }
    if (profileRepos !== null){
      updateHtmlElement(userObject, profileRepos, "publicRepos");
    }
  }));

})();
