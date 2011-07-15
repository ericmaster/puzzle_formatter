var puzzles = new Object();
var countdown;
var isIphone;
var isIpad;
var isAndroid;
var dragging = false;
var deltaX = 0;
var deltaY = 0;
var timeoutInterval = 1000;
var yNew;
var steps = 30;
var animation;
var animating =false;

// checks if the puzzle can be solved (pure math ...)
var checkOrder = function(id, board) {
  var xdiv = puzzles[id].xdiv;
  var ydiv = puzzles[id].ydiv;
  var product = 1;
  for(var i = 1; i <= (xdiv*ydiv-1); i++) {
    for(var j = (i+1); j <= (xdiv*ydiv); j++) {
      product *= ((board[i-1] - board[j-1]) / (i-j));
    }
  }
  return Math.round(product) == 1;
};

/** Shuffle image pieces **/
shuffle = function(id, v){
    /*for(var j, x, i = v.length-1; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    if(checkOrder(id, v) == false){
      v = shuffle(id, v);
    }
    return v;*/
    var i = 0;
    var xdiv = puzzles[id].xdiv;
    var ydiv = puzzles[id].ydiv;
    var rounds = 6;
    while(i < xdiv*ydiv*rounds){
      var xPos = puzzles[id].emptyPiece % xdiv;
      var yPos = Math.floor(puzzles[id].emptyPiece / xdiv);
      position = parseInt(Math.random() * 4);
      //move left
      if(position == 0){
        var xNew = xPos-1;
        if(xNew >= 0){
          newPos = puzzles[id].emptyPiece - 1;
          puzzles[id].board[puzzles[id].emptyPiece] = puzzles[id].board[newPos];
          puzzles[id].board[newPos] = -1;
          puzzles[id].emptyPiece = newPos;
          i++;
        }
      //move up
      }else if(position == 1){
        yNew = yPos-1;
        if(yNew >= 0){
          newPos = puzzles[id].emptyPiece - xdiv;
          puzzles[id].board[puzzles[id].emptyPiece] = puzzles[id].board[newPos];
          puzzles[id].board[newPos] = -1;
          puzzles[id].emptyPiece = newPos;
          i++;
        }
      //move right
      }else if(position == 2){
        var xNew = xPos+1;
        if(xNew < xdiv){
          newPos = puzzles[id].emptyPiece + 1;
          puzzles[id].board[puzzles[id].emptyPiece] = puzzles[id].board[newPos];
          puzzles[id].board[newPos] = -1;
          puzzles[id].emptyPiece = newPos;
          i++;
        }
      //move down
      }else if(position == 3){
        var yNew = yPos+1;
        if(yNew <ydiv){
          newPos = puzzles[id].emptyPiece + xdiv;
          puzzles[id].board[puzzles[id].emptyPiece] = puzzles[id].board[newPos];
          puzzles[id].board[newPos] = -1;
          puzzles[id].emptyPiece = newPos;
          i++;
        }
      }
      if(i == xdiv*ydiv*rounds){
        if(puzzles[id].emptyPiece != xdiv*ydiv-1){
          i--;
        }else{
          for(var j = 0; j < puzzles[id].board.length; j++){
            if(puzzles[id].board[j] == j){
              i--;
              break;
            }
          }
        }
      }
    }
};

/** Initialize a puzzle **/
function initPuzzle(id, imgSrc, imgWidth, imgHeight, xdiv, ydiv, counterStart, level){
  jQuery('#dialog').dialog({
		autoOpen: false,
		show: "blind",
		hide: "explode",
		width: 575,
		height: 415,
		position: ['center','top']
	});
	puzzles[id] = new Object();
	//image
	img = new Image();
	img.src = imgSrc;
	puzzles[id].img = img;
	//puzzle status variables
	puzzles[id].playing = false;
	puzzles[id].counterStart = counterStart;
	puzzles[id].counter = counterStart;
	puzzles[id].level = level;
	//puzzle specific properties
	puzzles[id].imgWidth = imgWidth;
	puzzles[id].imgHeight = imgHeight;
	puzzles[id].xdiv = xdiv;
	puzzles[id].ydiv = ydiv;
	puzzles[id].pieceWidth = imgWidth/xdiv;
	puzzles[id].pieceHeight = imgHeight/ydiv;
	//building the board
	var board = new Array(xdiv*ydiv);
	for(var i=0; i < xdiv*ydiv; i++){
		board[i] = i;
	}
	//puzzles[id].emptyPiece = xdiv*ydiv -1;
	//board[puzzles[id].emptyPiece] = -1;
	puzzles[id].board = board; 	
	isIPhone = (new RegExp( "iPhone", "i" )).test(navigator.userAgent);
  isIPad = (new RegExp( "iPad", "i" )).test(navigator.userAgent);
  isAndroid = (new RegExp( "Android", "i" )).test(navigator.userAgent);
	//alert(isIPhone);
	
	var canvas = document.getElementById(id);
	if(canvas != null){
		draw(id);
	}
}

function counter_display(counter){
	var minutes = Math.floor(counter/60);
	if(minutes < 10){
		minutes = '0' + minutes;
	}
	var seconds = Math.floor(counter%60);
	if(seconds < 10){
		seconds = '0' + seconds;
	}
	return minutes + ':' + seconds;
	
}

function timeout_trigger(id) {
	var counter = puzzles[id].counter;
	if(counter > 0) {
		counter--;
		jQuery('#timeout_counter').html(counter_display(counter));
    if(counter < 10){
      jQuery('#timeout_counter').toggleClass('red');
    }
		if(counter > 0) {
        countdown = setTimeout(function(){timeout_trigger(id)}, timeoutInterval);
    }else{
			clearTimeout(countdown);
      puzzles[id].playing = false;
			var lostMsg = jQuery('#lost-message').html();
			jQuery('#dialog .dialog-content-wrapper').html(lostMsg);
			jQuery( "#dialog" ).dialog( "open" );
      jQuery('#start-wrapper a').removeClass('active').html('Start');
      var canvas = document.getElementById(id);
      if(canvas != null){
        if(isIPhone || isIpad){
          canvas.removeEventListener('touchstart',mouseDownHandler, false);
          canvas.removeEventListener('touchmove',moveHandler, false);
          canvas.removeEventListener('touchend',mouseUpHandler, false);
        }else{
          canvas.removeEventListener('mousemove', moveHandler, false);
          canvas.removeEventListener('mousedown', mouseDownHandler, false);
          canvas.removeEventListener('mouseup', mouseUpHandler, false);
          canvas.removeEventListener('mouseout', mouseUpHandler, false);
        }
      }
		}
		puzzles[id].counter = counter;
	}
}

function draw_animate_start(id){
  puzzles[id].step = 0;
  animation = setTimeout(function(){draw_animate(id)}, 300);
  animating = true;
}

function draw_animate(id){
  var canvas = document.getElementById(id);
  
	if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    var imgWidth = puzzles[id].imgWidth;
		var imgHeight = puzzles[id].imgHeight;
		var pieceWidth = puzzles[id].pieceWidth;
		var pieceHeight = puzzles[id].pieceHeight;
    var xdiv = puzzles[id].xdiv;
		var ydiv = puzzles[id].ydiv;
    var img = puzzles[id].img;
    var origx = 0;
    var origy = 0;
    puzzles[id].step = puzzles[id].step+1;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect (0, 0, imgWidth, imgHeight);
    var moveX = 0;
    var moveY = 0;
    for (var posx=0; posx<xdiv; posx++){
      for (var posy=0; posy<ydiv; posy++){
        var index = xdiv*posy + posx;
        if(puzzles[id].board[index] != -1){
          origx = puzzles[id].board[index] % xdiv;
					origy = Math.floor(puzzles[id].board[index] / xdiv);
          moveX = ((posx - origx)*pieceWidth*puzzles[id].step)/steps;
          moveY = ((posy - origy)*pieceHeight*puzzles[id].step)/steps;
          ctx.drawImage(img, 
            pieceWidth*origx, pieceHeight*origy, 
            pieceWidth, pieceHeight, 
            pieceWidth*origx + moveX, pieceHeight*origy + moveY,
            pieceWidth, pieceHeight);
        }
      }
    }
    if(puzzles[id].step < steps){
      animation = setTimeout(function(){draw_animate(id)}, 30);
    }else{
      animating = false;
    }
  }
}

/** Update the canvas image **/
function draw(id){
	var canvas = document.getElementById(id);
	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		var origx = 0;
		var origy = 0;
		var posx = 0;
		var posy = 0;
		var imgWidth = puzzles[id].imgWidth;
		var imgHeight = puzzles[id].imgHeight;
		var pieceWidth = puzzles[id].pieceWidth;
		var pieceHeight = puzzles[id].pieceHeight;
		var xdiv = puzzles[id].xdiv;
		var ydiv = puzzles[id].ydiv;
		var img = puzzles[id].img;
		if(!jQuery('#'+id).hasClass('canvas-loaded')){
			jQuery('#'+id).addClass('canvas-loaded');
			img.onload = function(){
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.fillRect (0, 0, imgWidth, imgHeight);
				//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
				for (var posx=0; posx<xdiv; posx++){
					for (var posy=0; posy<ydiv; posy++){
						var index = xdiv*posy + posx;
						if(puzzles[id].board[index] != -1){
							origx = puzzles[id].board[index] % xdiv;
							origy = Math.floor(puzzles[id].board[index] / xdiv);
							if(dragging && index == currentPos){
								ctx.drawImage(img, 
									pieceWidth*origx, pieceHeight*origy, 
									pieceWidth, pieceHeight, 
									pieceWidth*posx + deltaX, pieceHeight*posy + deltaY, 
									pieceWidth, pieceHeight);
							}else{
								ctx.drawImage(img, 
									pieceWidth*origx, pieceHeight*origy, 
									pieceWidth, pieceHeight, 
									pieceWidth*posx, pieceHeight*posy, 
									pieceWidth, pieceHeight);
							}
						}
					}
				}
			};
		}else{
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillRect (0, 0, imgWidth, imgHeight);
			//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
			for (var posx=0; posx<xdiv; posx++){
				for (var posy=0; posy<ydiv; posy++){
					var index = xdiv*posy + posx;
					if(puzzles[id].board[index] != -1){
						origx = puzzles[id].board[index] % xdiv;
						origy = Math.floor(puzzles[id].board[index] / xdiv);
						if(dragging && index == currentPos){
							ctx.drawImage(img, 
								pieceWidth*origx, pieceHeight*origy, 
								pieceWidth, pieceHeight, 
								pieceWidth*posx + deltaX, pieceHeight*posy + deltaY, 
								pieceWidth, pieceHeight);
						}else{
							ctx.drawImage(img, 
								pieceWidth*origx, pieceHeight*origy, 
								pieceWidth, pieceHeight, 
								pieceWidth*posx, pieceHeight*posy, 
								pieceWidth, pieceHeight);
						}
					}
				}
			}
		}
	}else{
		//alert('Your browser does not support canvas');
	}
}

function mouseDownHandler(e)
{
	var id = e.target.id;
	if(!puzzles[id].playing){
		return;
	}
	var pieceWidth = puzzles[id].pieceWidth;
	var pieceHeight = puzzles[id].pieceHeight;
	var xdiv = puzzles[id].xdiv;
	var ydiv = puzzles[id].ydiv;
	if(isIPhone || isIPad || isAndroid){
		var x = e.targetTouches[0].pageX - e.target.offsetLeft;
		var y = e.targetTouches[0].pageY - e.target.offsetTop;
	}else{
		var x = e.pageX - e.target.offsetLeft;
		var y = e.pageY - e.target.offsetTop;
	}
	var currentPosx = Math.floor(x/pieceWidth);
	var currentPosy = Math.floor(y/pieceHeight);
	currentPos = xdiv*currentPosy + currentPosx;
	if((currentPos-1) >= 0 && puzzles[id].board[currentPos-1] == -1){
		move = 'left';
		dragging = true;
	}
	if((currentPos+1) < xdiv*ydiv && puzzles[id].board[currentPos+1] == -1){
		move = 'right';
		dragging = true;
	}
	if((currentPos-xdiv) >= 0 && puzzles[id].board[currentPos-xdiv] == -1){
		move = 'up';
		dragging = true;
	}
	if((currentPos+xdiv) < xdiv*ydiv && puzzles[id].board[currentPos+xdiv] == -1){
		move = 'down';
		dragging = true;
	}
	lastX = x;
	lastY = y;
}

function mouseUpHandler(e)
{
	var id = e.target.id;
	if(!puzzles[id].playing){
		return;
	}
	var pieceWidth = puzzles[id].pieceWidth;
	var pieceHeight = puzzles[id].pieceHeight;
	var xdiv = puzzles[id].xdiv;
	var ydiv = puzzles[id].ydiv;
	dragging = false;
	lastX = -1;
	lastY = -1;
	if(Math.abs(deltaX) > pieceWidth/2 || Math.abs(deltaY) > pieceHeight/2){
		puzzles[id].board[puzzles[id].emptyPiece] = puzzles[id].board[currentPos];
		puzzles[id].board[currentPos] = -1;
		puzzles[id].emptyPiece = currentPos;
		//check if win
		var win = true;
		for(var i=0; i < xdiv*ydiv -1; i++){
			if(puzzles[id].board[i] != i){
				win = false;
				break
			}
		}
		if(win){
      clearTimeout(countdown);
      puzzles[id].board[puzzles[id].emptyPiece] = puzzles[id].emptyPiece;
			puzzles[id].playing = false;
			jQuery.ajax({
			  url: "/puzzle/update-level",
			  context: document.body,
        dataType: 'json',
			  success: function(data){
          if(puzzles[id].level != 0){
            jQuery('.text-win p.msg-score').html('Score: ' + data.score);
          }
          var wonMsg = jQuery('#won-message').html();
          jQuery('#dialog .dialog-content-wrapper').html(wonMsg);
          jQuery( "#dialog" ).dialog( "open" );
			  }
			});
      jQuery('#start-wrapper a').removeClass('active').html('Start');
      var canvas = document.getElementById(id);
      if(canvas != null){
        if(isIPhone || isIpad || isAndroid){
          canvas.removeEventListener('touchstart',mouseDownHandler, false);
          canvas.removeEventListener('touchmove',moveHandler, false);
          canvas.removeEventListener('touchend',mouseUpHandler, false);
        }else{
          canvas.removeEventListener('mousemove', moveHandler, false);
          canvas.removeEventListener('mousedown', mouseDownHandler, false);
          canvas.removeEventListener('mouseup', mouseUpHandler, false);
          canvas.removeEventListener('mouseout', mouseUpHandler, false);
        }
      }
		}
	}
	deltaX = 0;
	deltaY = 0;
	draw(id);
}

function moveHandler(e) {
	var id = e.target.id;
	if(!puzzles[id].playing){
		return;
	}
	var pieceWidth = puzzles[id].pieceWidth;
	var pieceHeight = puzzles[id].pieceHeight;
	if (dragging) {
		if(isIPhone || isIPad || isAndroid){
			var x = e.targetTouches[0].pageX - e.target.offsetLeft;
			var y = e.targetTouches[0].pageY - e.target.offsetTop;
			/*alert(x);
			alert(y);*/
		}else{
			var x = e.pageX - e.target.offsetLeft;
			var y = e.pageY - e.target.offsetTop;
		}
		if(move == 'left'){
			deltaX = x - lastX;
			if(deltaX > 0){
				deltaX = 0;
			}
			if(deltaX < -pieceWidth){
				deltaX = -pieceWidth;
			}
		}
		if(move == 'right'){
			deltaX = x - lastX;
			if(deltaX < 0){
				deltaX = 0;
			}
			if(deltaX > pieceWidth){
				deltaX = pieceWidth;
			}
		}
		if(move == 'up'){
			deltaY = y - lastY;
			if(deltaY > 0){
				deltaY = 0;
			}
			if(deltaY < -pieceHeight){
				deltaY = -pieceHeight;
			}
		}
		if(move == 'down'){
			deltaY = y - lastY;
			if(deltaY < 0){
				deltaY = 0;
			}
			if(deltaY > pieceHeight){
				deltaY = pieceHeight;
			}
		}

		//currentDragObject.position.x += deltaX;
		//currentDragObject.position.y += deltaY;

		draw(id);
	}
}

jQuery(document).ready(function() {
	
	jQuery('#start-wrapper a').click(function(e){
    e.preventDefault();
    if(!animating){
      id = jQuery(this).attr('href');
      var xdiv = puzzles[id].xdiv;
      var ydiv = puzzles[id].ydiv;		
      var canvas = document.getElementById(id);
      if(canvas != null){
        puzzles[id].counter = puzzles[id].counterStart;
        jQuery('#timeout_counter').html(counter_display(puzzles[id].counter));
        clearTimeout(countdown);
        countdown = setTimeout(function(){timeout_trigger(id)}, timeoutInterval);
        puzzles[id].emptyPiece = xdiv*ydiv -1
        if(isIPhone || isIPad || isAndroid){
          document.body.addEventListener('touchmove',function(event){
            event.preventDefault();
          },false);
          canvas.addEventListener('touchstart',mouseDownHandler, false);
          canvas.addEventListener('touchmove',moveHandler, false);
          canvas.addEventListener('touchend',mouseUpHandler, false);
        }else{
          canvas.onmousemove = moveHandler;
          canvas.onmousedown = mouseDownHandler;
          canvas.onmouseup = mouseUpHandler;
          canvas.onmouseout = mouseUpHandler;
        }
        var board = puzzles[id].board;
        for(var i=0; i < xdiv*ydiv; i++){
          board[i] = i;
        }
        puzzles[id].emptyPiece = xdiv*ydiv -1;
        board[puzzles[id].emptyPiece] = -1;
        shuffle(id, board);
        puzzles[id].board = board;
        //draw(id);
        draw_animate_start(id);
        puzzles[id].playing = true;
        jQuery.ajax({
          url: "/puzzle/game-start/"+puzzles[id].level,
          context: document.body,
          success: function(){
          //do something here
          }
        });
        jQuery(this).addClass('active').html('Restart');
      }
    }
	});
});