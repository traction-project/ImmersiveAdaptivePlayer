/**
 * @author isaac.fraile@i2cat.net
 */

/************************************************************************************
    
    VideoController.js  
        * Library used to manage audovisual contents

    This library needs to use external libs:
        * dash.all.min.js
        * hls.js

    This library needs to use the global vars:
        * _ManifestParser
        * _Sync
        * mainMenuCtrl
        * scene
    
    FUNCTIONALITIES:
        * init = function()    --> Initialize the player contents
        * Play, Pause, seek and Synchronization services
        * Add and remove media content

************************************************************************************/

VideoController = function() {

	var listOfVideoContents = [];
    var listOfAudioContents = [];
    var ft = true;

    var playEvent = new Event('playevent');
    var pauseEvent = new Event('pauseevent');
    var seekEvent = new Event('seekevent');

    //document.addEventListener('playevent', function (e) { console.error('playevent run') }, false);
    //document.addEventListener('pauseevent', function (e) { console.error('pauseevent run') }, false);

//************************************************************************************
// Private Functions
//************************************************************************************

	function getMediaType(url)
    {
        return url.split('.').pop();
    }

    function syncVideos()
    {
    	var mainVideoTime = listOfVideoContents[0].vid.currentTime;
    	listOfVideoContents.forEach( function( elem ) { elem.vid.currentTime = mainVideoTime } ); 
        listOfAudioContents.forEach( function( elem ) { elem.currentTime = mainVideoTime } ); 
    }

    function syncAllVideos()
    {
        //var mainVideoTime = listOfVideoContents[0].vid.currentTime;
        listOfVideoContents.forEach( function( elem, i ) { if ( i > 0 ) elem.vid.currentTime = listOfVideoContents[0].vid.currentTime } ); 
        //listOfAudioContents.forEach( function( elem ) { elem.currentTime = listOfVideoContents[0].vid.currentTime } ); 
    }

    function setBitrateLimitationsFor(player)
    {
    	/*if ( window.screen.width * window.devicePixelRatio <= 1920 ) 
        {
            player.setMaxAllowedBitrateFor( 'video', 13000 );
        }
        else if ( window.screen.width * window.devicePixelRatio <= 2300 ) 
        {
            player.setMaxAllowedBitrateFor( 'video', 15000 );
        }*/
    }

    function createDashVO(id, vid, url, autoplay)
    {
    	var player = dashjs.MediaPlayer().create();
        player.initialize( vid, url, autoplay );


        if ( navigator.userAgent.toLowerCase().indexOf("android") > -1 ) setBitrateLimitationsFor( player );

        //player.getDebug().setLogToBrowserConsole( false );
        player.updateSettings({
            'debug': {
                'logLevel': dashjs.Debug.LOG_LEVEL_INFO
                },
			'abr': {
				'ABRStrategy' : 'abrPada', 
				'priority' : 1,
				'useBufferOccupancyABR' : true
			}
            }
        );
		
		
		console.log('DASH Configs:'+JSON.stringify(player.getSettings()));
		
        player.attachTTMLRenderingDiv( vid );
        
        var objVideo = { id: id, vid: vid, dash: player };
        listOfVideoContents.push( objVideo );
    }

    function createHLSVO(id, vid, url)
    {
    	if ( Hls.isSupported() ) 
        {
            var hls = new Hls();
            hls.loadSource( url );
            hls.attachMedia( vid );
            hls.on( Hls.Events.MANIFEST_PARSED, function() { vid.play() } );
            var objVideo = { id: id, vid: vid };
        }
        else
        {
            vid.src = url;

            if ( vid.canPlayType( 'application/vnd.apple.mpegurl' ) )  
            {
            	vid.addEventListener( 'loadedmetadata', function() { vid.play() } );
            }
            var objVideo = { id: id, vid: vid };
        }
        
        listOfVideoContents.push( objVideo );
    }

    function getAdaptationSets()
    {
        return new Promise((resolve) => {

            listOfVideoContents[0].dash.on( dashjs.MediaPlayer.events.PLAYBACK_STARTED, function() {

                if ( ft ) 
                {
                    ft = false;
                    _ManifestParser.init( listOfVideoContents[0].dash.getDashAdapter().geti2catMPD() );
                }

                resolve( 'ok' );
            });   
        });
    }

    function changeAllCurrentTime(value)
    {
        listOfVideoContents.forEach( function( elem ) { elem.vid.currentTime += value; } ); 
        listOfAudioContents.forEach( function( elem ) { elem.currentTime += value; } );
    }

    function changeAllPlaybackRate(value)
    {
        if ( value < 0.5 ) value = 0.5;

        listOfVideoContents.forEach( function( elem ) { elem.vid.playbackRate = value; } ); 
        listOfAudioContents.forEach( function( elem ) { elem.playbackRate  = value; } );
    }

    function syncAll(dif)
    {  
        dif = parseInt( dif*100 )/100;

        globalDiff = dif;  

        //console.log(dif) 

        if ( _isHMD ) 
        {
            if ( dif > -0.2 && dif < 0.2 ) {} 

            else if ( dif < -1 || dif > 1 ) 
            {
                changeAllCurrentTime( -dif );
            } 
            else
            {
                changeAllPlaybackRate( 1 - dif );
                setTimeout( () => { changeAllPlaybackRate( 1 ) }, 900);
            }
        } 
        else 
        {
            if ( dif > -0.05 && dif < 0.05 ) {} 

            else if ( dif < -1 || dif > 1 ) 
            {
                changeAllCurrentTime( -dif );
            } 
            else
            {
                changeAllPlaybackRate( 1 - dif );
                setTimeout( () => { changeAllPlaybackRate( 1 ) }, 900);
            }
        }
    }

//************************************************************************************
// Public Functions
//************************************************************************************

	this.getVideObject = function(id, url) 
    {
        var vid = document.createElement( "video" );     
        vid.muted = true;
        vid.crossOrigin = "anonymous";
        vid.autoplay = listOfVideoContents[0] && listOfVideoContents[0].vid.paused ? false : true;
        vid.preload = "auto"; 
        vid.loop = true;


        var type = getMediaType( url );

        if ( type == 'mpd' )
        {   
            createDashVO( id, vid, url, vid.autoplay );
        }
        else if ( type == 'm3u8' )
        {
            createHLSVO( id, vid, url );          
        }
        else
        {
            vid.src = url;
            var objVideo = { id: id, vid: vid };
            listOfVideoContents.push( objVideo );
        }

        return vid;
    };

    this.getListOfVideoContents = function()
    {
        return listOfVideoContents;
    };

    this.removeContentById = function(id)
    {
        for ( var i = 0, len = listOfVideoContents.length; i < len; i++ )
        {
            if ( listOfVideoContents[i].id == id )
            {
                listOfVideoContents.splice( i, 1 );
                break;
            }
        }
    };

    this.getPlayoutTime = function(secs) 
    {
        var hr  = Math.floor( secs/3600 );
        var min = Math.floor( ( secs - ( hr*3600 ) )/60 );
        var sec = Math.floor( secs - ( hr*3600 ) -  ( min*60 ) );

        if ( min < 10 ) min = "0" + min;
        if ( sec < 10 ) sec  = "0" + sec;
        return min + ':' + sec;
    };

    this.playAll = function()
    {
        if (document.dispatchEvent(playEvent)){ //Custom code

        	listOfVideoContents.forEach( function( elem ) { 
                if (elem.vid.paused) {
                    elem.vid.play().then( _ => {  syncVideos() }); 
                }
            }); 
            listOfAudioContents.forEach( function( elem ) { 
                if (elem.paused) {
                    elem.play().then( _ => {  syncVideos() }); 
                }
            }); 
        }
    };

/**
 * { function_description }
 *
 * @param      {<type>}  index         The index
 * @param      {<type>}  source        The source
 * @param      {<type>}  videoElement  The video element
 */
     this.play = function(index, source, videoElement){
        let video = listOfVideoContents[index].vid;
        video.currentTime = listOfVideoContents[0].vid.currentTime;
        video.load();

        fetch(source)
            .then(response =>{ 
                return video.play();
            })
            .then(_ => {
                // Video playback started ;)
                console.log(`Playing ${listOfVideoContents[index].id} video`);
                videoElement.visible = true;
                if ( listOfVideoContents[0].vid.paused ) video.pause();
            })
            .catch(e => {
                // Video playback failed ;(
                console.error(e);
                videoElement.visible = true;
                video.pause();
            });
    };


    this.pauseAll = function()
    {
        if (document.dispatchEvent(pauseEvent)){ //Custom code

        	listOfVideoContents.forEach( function( elem ) { elem.vid.pause(); } ); 
            listOfAudioContents.forEach( function( elem ) { elem.pause(); } );
        }
    };

    this.seekAll = function(time)
    {
        if (document.dispatchEvent(seekEvent)){ //Custom code

            _Sync.vc( 'play', (listOfVideoContents[0].vid.currentTime + time) * 1000000000 )
            changeAllCurrentTime( time );
        }
    };   

    this.speedAll = function(speed)
    {
        changeAllPlaybackRate( speed );
    };   

    this.isPausedById = function(id)
    {
        return listOfVideoContents[id].vid.paused;
    };

    this.getMediaTime = function()
    {
        return listOfVideoContents[0].vid.currentTime;
    };

    this.addAudioContent = function(audio)
    {
        listOfAudioContents.push( audio );
        syncVideos();
    };

    this.removeAudioContent = function(audio)
    {
        for ( var i = 0, len = listOfAudioContents.length; i < len; i++ )
        {
            if ( listOfAudioContents[i] == audio )
            {
                listOfAudioContents.splice( i, 1 );
                break;
            }
        }
    };

    var periodCount = 0;
    var ending = false;

    /**
     * Initialize the library
    */
    this.init = function()
    {
        listOfVideoContents[0].dash.on( dashjs.MediaPlayer.events.PERIOD_SWITCH_STARTED, function() 
        {
            if (periodCount > 0) _ManifestParser.updateSignerVideo(periodCount);
            periodCount += 1;
        });

        getAdaptationSets().then(( str ) => { 

            var firtsIteration = true;
            listOfVideoContents[0].vid.ontimeupdate = function()
            {
                // Video ending controller function
                if (listOfVideoContents[0].vid.currentTime >= listOfVideoContents[0].vid.duration - 0.5 && !ending ) 
                {
                    ending = true;
                    showEndingOptions();
                }

                // Update ST by time.
                if (imsc1doc) {
                    subController.updateISD(listOfVideoContents[0].vid.currentTime);
                }

                if ( _AudioManager.getADEnabled() ) checkExtraADListByTime( listOfVideoContents[0].vid.currentTime );

                if( scene.getObjectByName('trad-main-menu') && scene.getObjectByName('trad-main-menu').visible )
                {
                    mainMenuCtrl.updatePlayProgressBar();  
                    mainMenuCtrl.updatePlayOutTime();   
                }
                if ( Math.trunc(listOfVideoContents[0].vid.currentTime)%10 == 0 && firtsIteration ) 
                {
                    if ( localStorage.ImAc_roomID != undefined && localStorage.ImAc_roomID != "undefined" ) _Sync.init( "195.81.194.222", localStorage.ImAc_roomID );
                    else syncAllVideos();
                    firtsIteration = false;
                }
                if ( listOfVideoContents.length > 1 )
                {
                    var dif = listOfVideoContents[0].vid.currentTime - listOfVideoContents[1].vid.currentTime
                    if ( Math.abs(dif) > 1 ) {
                        syncAllVideos();
                    } 
                }
                //else if ( Math.trunc(listOfVideoContents[0].vid.currentTime)%10 != 0 ) firtsIteration = true;
            }; 
            listOfVideoContents[0].vid.onpause = function() {
                VideoController.pauseAll()
            }
        });
    };

    this.getSync = function()
    {
        listOfVideoContents.forEach( function( elem, i ) { console.log( elem.vid.currentTime + ' id: ' + i ) } ); 
        listOfAudioContents.forEach( function( elem, i ) { console.log( elem.currentTime + ' aid: ' + i ) } );
    }

    this.syncAllContents = function(speed, dif)
    {
        if ( speed == 1 )
        {
            if ( listOfVideoContents[0].vid.paused ) this.playAll();
            else syncAll( dif );
        }
        else if ( !listOfVideoContents[0].vid.paused ) this.pauseAll();
    }

    this.getMediaDuration = function()
    {
        return listOfVideoContents[0].vid.duration;
    };

}


var isSeeking = false;

 

function addVideoEventListeners() {

    var video = VideoController.getListOfVideoContents()[0].vid;

    video.addEventListener('seeking', function() {

        //log('video seeking');

        isSeeking = true;

    });

    video.addEventListener('seeked', function() {

        //log('video seeked');

        isSeeking = false;

    });

}
