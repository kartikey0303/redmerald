var normal = document.getElementById("nav-menu");
var reverse = document.getElementById("nav-menu-left");
var icon = normal !== null ? normal : reverse;

// Toggle the "menu-open" % "menu-opn-left" classes
function toggle() {
	  var navRight = document.getElementById("nav");
	  var navLeft = document.getElementById("nav-left");
	  var nav = navRight !== null ? navRight : navLeft;

	  var button = document.getElementById("menu");
	  var site = document.getElementById("wrap");
	  
	  if (nav.className == "menu-open" || nav.className == "menu-open-left") {
	  	  nav.className = "";
	  	  button.className = "";
	  	  site.className = "";
	  } else if (reverse !== null) {
	  	  nav.className += "menu-open-left";
	  	  button.className += "btn-close";
	  	  site.className += "fixed";
	  } else {
	  	  nav.className += "menu-open";
	  	  button.className += "btn-close";
	  	  site.className += "fixed";
	    }
}



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
	
	// Clears the header navigation elements when they exist.
	if ( document.getElementsByClassName('blog-nav')[0] ){
		getElement('header').removeChild(document.getElementsByClassName('blog-nav')[0]);
	}
	if ( document.getElementsByClassName('blog-nav')[0] ){
		getElement('header').removeChild(document.getElementsByClassName('blog-nav')[0]);
	}
	
	if ( document.querySelector('#header span') ){
		getElement('header').removeChild( document.querySelector('#header span') );
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
	if ( postData.next != null ){
		a = createElement('a', '', '&laquo; ' + postData.next[1], getElement('header'));
		a.href = siteRoot + postData.next[0];
		a.className = 'blog-nav';
		a.title = 'Go to the next post'
		listenerAttacher( a );
	}
	if ( postData.previous != null && postData.next != null){
		createElement( 'span', '', ' - ', getElement('header') );
	}
	if ( postData.previous != null ){
		a = createElement('a', '', postData.previous[1] + ' &raquo;', getElement('header'));
		a.href = siteRoot + postData.previous[0];
		a.title = 'Go to the previous post';
		a.className = 'blog-nav';
		listenerAttacher( a );
	}
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
	
	// Adds the event listener for the menu
	if ( document.addEventListener && icon !== null ) {
		icon.addEventListener( 'click', function(e){ 
			e.preventDefault();
			toggle();
		}, false );
	} 
	else if (document.attachEvent && icon !== null ) {
		icon.attachEvent( 'onclick', function(e){
			e.preventDefault();
			toggle();
		});
	}
	
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
	window.addEventListener('keydown', function(e){
		if ( e.keyCode == 37){
			// Left arrow
			console.log( 'Not implemented yet! ');
		}
		else if ( e.keyCode == 39){
			// Right arrow
			console.log( 'Not implemented yet! ');
		}
	}, false);

})();
