
$(function(){
	function getStyle(obj,attr){
	  return obj.currentStyle? obj.currentStyle[attr]:getComputedStyle(obj,false)[attr];
	}
	var outer = document.getElementById("outer");
	var inner = document.getElementById("inner");
	var lis = inner.getElementsByTagName("li");
	var innerHd = 0;
	for (var i=0; i<lis.length; i++) {
		innerHd += lis[i].offsetHeight;
	}
	inner.style.height = innerHd + "px";
	
	var startY = 0;
	var alls = 0;
	var moveTop = 0;
	var iSpeedY = 0;
	var prevY = 0;
	var timer = null;
	var resetStartY = true;
	var maxDistance = parseInt(outer.offsetHeight - innerHd); // 滑动的最大距离
	
	inner.addEventListener("touchstart",start,false);
	function start(e){
	  var e = e || window.event;
	  e.preventDefault();
	  
	  var touchs = e.touches[0];
	  resetStartY = true;
	  startY = touchs.pageY;
	  prevY = touchs.pageY;
	  alls = inner.offsetTop;
	  	  
	  inner.addEventListener("touchmove",move,false);
      inner.addEventListener("touchend",end,false);
	}
	
	function move(e){
		var e = e || window.event;
		e.preventDefault();
		var touchs = e.changedTouches[0];
		
		if (e.touches.length > 1 || e.scale && e.scale !== 1) return; // 当屏幕有多个touch或者页面被缩放过，就不执行move操作
		
		iSpeedY = touchs.pageY - prevY; // 获取出手一瞬间的速度
		prevX = touchs.pageY; // 当前的始终覆盖上一个
    	moveTop = touchs.pageY-startY;
    	
    	
		if (inner.offsetTop >= 0) {
			if (resetStartY) {
	          startY=touchs.pageY;
	          resetStartY = false;
		   }
            $(inner).addClass('translateZ'); // 启动硬件加速
            var topNum = (touchs.pageY - startY)/3;
            console.log("topNum: "+ topNum);
            inner.style.top = topNum + "px";
            $(".top_title").html("松手即可刷新");
        } else if (inner.offsetTop <= maxDistance) {
        	if (resetStartY) {
	          startY=touchs.pageY;
	          resetStartY=false;
	        }      
	        var midNum= (touchs.pageY - startY)/3 + (maxDistance);  
	        inner.style.top = midNum+ 'px';
       } else {
       		var botNum = touchs.pageY - startY + alls;
       		inner.style.top = botNum + 'px';
       }
	}
	
	function end(e){
		var e = e || window.event;
		e.preventDefault();
		var touchs = e.changedTouches[0];
		var minDis = touchs.pageY - startY; // 最小移动距离
		console.log(minDis)
	    function sliderMove(){
	    	if (inner.offsetTop > 0 && inner.offsetTop < 30) {
	    		$(inner).stop(true).animate({top:0},300);
	    	}
    		if (inner.offsetTop >= 0){
    			$(".top_title").html("正在刷新");
    			$(inner).stop(true).animate({top:30},1000,function(){
    				inner.classList.remove('translateZ'); // 移除硬件加速
    				$(this).css("top",0);
    			})
    		}
    		
    		if (inner.offsetTop < maxDistance) {
    			$(".bottom_title").html("正在加载");
    			$(inner).stop(true).animate({top:maxDistance-30+'px'},1000,function(){
    				inner.classList.remove('translateZ');
    				$(this).css("top",maxDistance);
    			})
    		}
	    }
	    if (Math.abs(minDis) > 5) {
    		sliderMove();
    	}
	}
})
