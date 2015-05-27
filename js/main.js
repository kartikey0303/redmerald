var icon = document.getElementById("nav-menu");

// Toggle the "menu-open" class
function toggle() {
	  var nav = document.getElementById("nav");
	  var button = document.getElementById("menu");
	  var site = document.getElementById("wrap");
	  
	  if (nav.className == "menu-open") {
	  	  nav.className = "";
	  	  button.className = "";
	  	  site.className = "";
	  } else {
	  	  nav.className += "menu-open";
	  	  button.className += "btn-close";
	  	  site.className += "fixed";
	    }
	}

// Ensures backward compatibility with IE old versions
function menuClick() {
	if (document.addEventListener) {
		icon.addEventListener('click', toggle);
	} else if (document.attachEvent) {
		icon.attachEvent('onclick', toggle);
	}
}

menuClick();

function getElement( id ){
	// A simple shorthand for document.getElementById
	// Useful to have cleaner and shorter code.
	return document.getElementById(id);
}

function parseArgs( parameter, value ){
	// Checks whether @parameter is defined; 
	// If it isn't, returns @value
	if ( typeof parameter === 'undefined' ){
		return value;
	}
	else {
		return parameter;
	}
}

function createElement(type, id, inner, parent){
	var element = document.createElement(type);
	if (id != undefined && id != ''){ element.id = id; }
	if (inner != undefined && inner != ''){ element.innerHTML = inner;}
	if (parent != undefined){ parent.appendChild(element);}
	return element;
}

function loadHTML( resource, async, method, postage, callback ){
	// Handles AJAX requests to html or plain text
	// 
	// The default call is a synchronous GET with no params or callback.
	// @resource: URL of the resource. It is the only required parameter.
	//            If it's a GET request, then it should include HTTP params as well.
	// @async: whether the call is synchronous ar asynchronous.
	// @method: the HTTP method
	// @postage: POST parameters. Only used in POST calls.
	// @callback: Callback function. Only used in async calls.
	
	
	var filename = resource;
	if ( typeof resource === 'undefined' ){
		console.error( 'No resource has been defined!' );
	}
	
	// Checks which arguments have been passed, and sets to default value
	// those that have been not.
	async = parseArgs( async, false );
	method = parseArgs( method, 'GET' );
	callback = parseArgs( callback, function(){
		if ( this.readyState == 4 ){
			if ( this.status == 200 ){
				console.log( this.responseText );
			}
		}
	});
	postage = parseArgs( postage, null );

	// Creates the xmlHTTP object
	var xmlhttp;
	if ( window.XMLHttpRequest ){
		xmlhttp = new XMLHttpRequest();
	}
	else {
		// IE support
		try {
			xmlhttp = new ActiveXObject( "Microsoft.XMLHTTP" );
		}
		catch (e){
			try {
				xmlhttp = new ActiveXObject( "Msxml2.XMLHTTP" );
			}
			catch (e){
				console.error(e);
			}
		}
	}
	

	// GET or POST
	if ( method == 'GET' ){
		xmlhttp.open( "GET",filename, async );
		xmlhttp.send();
	}
	else {
		xmlhttp.open( "POST", filename, async );
		xmlhttp.setRequestHeader( "Content-type","application/x-www-form-urlencoded" );
		xmlhttp.send( postage );
	}
	
	
	// Async or sync
	if ( async == true ){
		xmlhttp.onload = callback;
	}
	else {
		if ( xmlhttp.status == 200 ){
			return xmlhttp.responseText;
		}
	}
}

function getCookie(cookieName){
	var name = cookieName + '=';
    var ca = document.cookie.split(';');
    for ( var i = 0; i < ca.length; i++ ) {
        var c = ca[i];
        while ( c.charAt(0) == ' ' ) { 
			c = c.substring(1); 
		}
        if ( c.indexOf(name) == 0 ){ 
			return c.substring( name.length,c.length );
		}
    }
    return '';
}

function updatePage(json){
	// Updates the page with the post data.
	var postData;
	var main;
	var article;
	var div;
	var title;
	var url;
	var a;
	
	postData = JSON.parse(json);
	console.log(postData);
	
	var siteRoot = getCookie('site-root');
	
    
    
	// Update URL and document.title
	url = siteRoot + postData.url;
	title = postData.title + ' · A simple Jekyll theme';
	document.title = title;
	
	// Push the state if it's not a popevent.
	if ( !history.state || history.state.page != url ){
		history.pushState({ "page": url }, title, url);
	}
	
	// Clear the main.
	main = document.getElementsByTagName('main')[0];
	main.innerHTML = '';
	
	// Pagination does not always exist.
	if ( document.getElementsByClassName('pagination')[0] ){
		getElement('container').removeChild( document.getElementsByClassName('pagination')[0] );
	}
	
	// Updates the page elements
	document.getElementsByTagName('h1')[0].innerHTML = postData.title;
	article = createElement('article', 'post-page', '', main);
	div = createElement('time', '', postData.date, article);
	div.dateTime = postData.date;
	div.className = 'by-line';
	div = createElement('div', '', postData.content, article)
	div.className = 'content';
	
	//
	a = createElement('a', '', postData.next, getElement('header'));
	a.href = siteRoot + postData.next;
	listenerAttacher( a );
	a = createElement('a', '', postData.previous, getElement('header'));
	a.href = siteRoot + postData.previous;
	listenerAttacher( a );
}


function loadPost( resource ){
	// Loads post data through AJAX
	loadHTML( resource, true, 'GET', null,  function(){
		updatePage( this.responseText );
	});
}

function listenerAttacher( element ){
	// Adds a click listener to @element. 
	// NOTE: this has nothing to do with the Explorer function!
	element.addEventListener('click', function(e){
		e.preventDefault();
		loadPost( this.href +'.json' );
	}, 
	false);
}


(function(){
	// Init function - performs init tasks.
	console.log('calling init');
	console.log('Location: ' + window.location.href);
	
	// Set a cookie
    var d = new Date();
    d.setTime(d.getTime() + (365*24*60*60));
    var expires = "expires="+d.toUTCString();
    document.cookie = "site-root=" + window.location.href + "; " + expires;
	
	
	// Adds the event listener to all elements that require it.
	// Also prevents hrefs to fire.
	var posts = document.querySelectorAll('.h2');
	for (var i = 0; i < posts.length; i++){
		listenerAttacher( posts[i] );
	}
	
	// Adds a popstate listener for backwards navigation.
	window.addEventListener('popstate', function(e){
		if ( e.state == null ){
			window.location = 'http://localhost/redmerald';
		}
		else {
			//console.log( 'popevent' );
			loadPost( e.state.page + '.json' );
		}
	}, false);
	
	// Keyboard events

})();
