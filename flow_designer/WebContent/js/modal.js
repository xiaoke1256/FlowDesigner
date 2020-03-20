/**
 * 用jQuery实现一个模态对话框
 */
(function($){
	$.extend({
		modal:function(html){
			//获取窗口的大小
			var width = $(window).width();
			var height = $(window).height();
			//滚动条的宽度
			var scrollWidth = getScrollWidth();
			console.log("scrollWidth:"+scrollWidth);
			//先创建一个蒙板，蒙住整个页面。
			var mask = $('<div style="filter:alpha(Opacity=50);-moz-opacity:0.5;opacity:0.5;position:absolute;left:0;top:0;z-index:999" ></div>');
			mask.width(width);
			mask.height(height);
			mask.css('background','#999');
			$('body').append(mask);
			//窗口大小变更，蒙板尺寸要跟着变
			var hasYScoll = hasYScrollbar(mask[0]);//是否存在纵向的滚动条。
			var hasXScoll = hasXScrollbar(mask[0])
			var resizeEve = $(window).resize(function(){
				var nWidth = $(window).width();
				var nHeight = $(window).height();
				var newHasYScoll = hasYScrollbar(mask[0]);
				var newHasXScoll = hasXScrollbar(mask[0]);
				//console.log("newHasYScoll:"+newHasYScoll+"   hasYScoll:"+hasYScoll);
				if(!hasYScoll && newHasYScoll){//原先没的 后来有了
					console.log("纵向滚动条原先没的 后来有了");
					nWidth += scrollWidth;
					hasYScoll = false;//修正后应当没有滚动条了
				}else{
					hasYScoll = newHasYScoll;
				}
				if(!hasXScoll && newHasXScoll){//原先没的 后来有了
					console.log("横向滚动条原先没的 后来有了");
					nHeight += scrollWidth;
					hasXScoll = false;//修正后应当没有滚动条了
				}else{
					hasXScoll = newHasXScoll;
				}
				console.log("最终蒙版的高度："+nHeight);
				mask.width(nWidth);
				mask.height(nHeight);
				
			});
			//滚动条滚动了，蒙版位置要跟着变。
			$(document).scroll(function() {
		        var scroH = $(document).scrollTop();//滚动的高度
			});
			//窗口大小变更，窗口的位置也要跟着变。
			//滚动条滚动了,窗口的位置也要跟着变。
			
			//返回模态窗口对象
			return {
				/*关闭模态对话框*/
				closed:function(){
					
				}
			};
		}
	});
	
})(jQuery);

/**
 * 是否有纵向的滚动条
 * @returns
 */
function hasYScrollbar(mask) {
	var height = 0;
	if(mask){
		height = mask.scrollHeight;
	}
	height = Math.max(height,document.body.scrollHeight);
	//console.log("scrollHeight:"+mask.scrollHeight+ "  innerHeight:"+(window.innerHeight || document.documentElement.clientHeight) )
    return height > document.documentElement.clientHeight;
}
/**
 * 是否有横向的滚动条
 * @returns
 */
function hasXScrollbar(mask) {
	var width = 0;
	if(mask){
		width = $(mask).outerWidth(true);
	}
	width = Math.max(width,document.body.scrollWidth);
	console.log("width:"+width+" clientWidth: "+document.documentElement.clientWidth);
	return width > document.documentElement.clientWidth;
}

/**
 * 获取滚动条的宽度
 * @returns
 */
function getScrollWidth() {
    var noScroll, scroll, oDiv = document.createElement("DIV");
    oDiv.style.cssText = "position:absolute;top:-1000px;width:100px;height:100px; overflow:hidden;";
    noScroll = document.body.appendChild(oDiv).clientWidth;
    oDiv.style.overflowY = "scroll";
    scroll = oDiv.clientWidth;
    document.body.removeChild(oDiv);
    return noScroll-scroll;
}


