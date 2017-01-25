'use strict';

(function () {
  var profileId = document.querySelector('#profile-id') || null;
  var profileUsername = document.querySelector('#profile-username') || null;
  var displayName = document.querySelectorAll('.display-name') || null;
  var profileRepos = document.querySelector('#profile-repos') || null;
  var apiUrl = appUrl + '/api/:id';

  function updateHtmlElement(data, element, property){
      element.innerHTML = data[property];
  }

  // Returns data refered to the account of the user
  // if more than one, returns first it gets (not current one, warning here)
  function getAccount(userJson){
    for (var key in userJson){
      if (userJson[key] && typeof userJson[key] == 'object') return userJson[key];
    }
  }

  ajaxFunctions.ready(ajaxFunctions.ajaxRequest("GET", apiUrl, function(data){
    var userObject = JSON.parse(data);
    var userAccount = getAccount(userObject);

    if (displayName !== null){
      for (var i = 0; i < displayName.length; i++) {
        updateHtmlElement(userAccount, displayName[i], "displayName");
      }
    }
    if (profileId !== null){
      updateHtmlElement(userAccount, profileId, "id");
    }
    if (profileUsername !== null){
      updateHtmlElement(userAccount, profileUsername, "username");
    }
    if (profileRepos !== null){
      updateHtmlElement(userAccount, profileRepos, "publicRepos");
    }
  }));

})();
