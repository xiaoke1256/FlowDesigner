/**
 * 流程图编辑器
 * 本js程序依赖于jQuery.
 */
/*
 * 定义业务对象
 */
/**
 * 基类的构造函数
 * @param obj
 * @returns
 */
var BussinessObj = function(obj){
	this.model={};
	if(obj && obj instanceof Object){
		this.model=obj.model;
		console.log("obj.model.displayName:"+obj.model.displayName);
	}
	this.view={};
	if(obj && obj instanceof Object){
		this.view=obj.view;
	}
}

/**
 * 子类，Activity
 */
var Act = function(obj){
	BussinessObj.call(this,obj);
};
Act.prototype = new BussinessObj();

/**
 * 子类，操作选项
 */
var Oper = function(obj){
	BussinessObj.call(this,obj);
	//在业务对象的上方（30个像素处）增加一个控制点。(控制点以图形的中心为准)
	var x = this.view.x +Math.floor((icons['oper'].width)/2);
	var heightOfMouse = icons['mouse'].height;//鼠标图形的高度
	var y = this.view.y-30+Math.floor(heightOfMouse/2);// 鼠标图形高度的一半。
	var controlPoint = new ControlPoint(x,y);
	controlPoint.parent = this;//父对象就是其业务对象。
	controlPoint.parentType = 'result';
	this.view.controlPoint = controlPoint;
};
Oper.prototype = new BussinessObj();

/**
 * 子类，后续线
 */
var Subsequent = function(obj){
	BussinessObj.call(this,obj);
	//有两个控制点，一个是controlPoint，一个是controlPoint1
	//在业务对象的上方（30个像素处）增加一个控制点。(控制点以图形的中心为准)
	var x = this.view.x +Math.floor((icons['subseq'].width)/2);
	var heightOfMouse = icons['mouse'].height;//鼠标图形的高度
	var y = this.view.y-30+Math.floor(heightOfMouse/2);// 鼠标图形高度的一半。
	var controlPoint = new ControlPoint(x,y);
	controlPoint.parent = this;//父对象就是其业务对象。
	controlPoint.parentType = 'result';
	this.view.controlPoint=controlPoint;
	//在业务对象的下方（30个像素处）增加一个控制点。
	var x = this.view.x +Math.floor((icons['subseq'].width)/2);
	var y = this.view.y+30+Math.floor(heightOfMouse/2);// 鼠标图形高度的一半。
	var controlPoint = new ControlPoint(x,y);
	controlPoint.parent = this;//父对象就是其业务对象。
	controlPoint.parentType = 'result';
	this.view.controlPoint1=controlPoint;
}
Subsequent.prototype = new BussinessObj();

/**
 * 一个点
 */
var Point = function(x,y){
	this.x = 0;
	this.y = 0;
	if(x)
		this.x=x;
	if(y)
		this.y=y;
}
/**
 * 控制点（业务对象上可以被鼠标拖动的点）
 */
var ControlPoint = function(x,y){
	Point.call(this,x,y);
}
ControlPoint.prototype = new Point();

/**
 * 绘图过程中要使用到的图片(图标)
 */
var icons = (function(){
	//活动图片.
	var actImg = new Image();
	actImg.src='imgs/design/anyone.gif';
	actImg.width = 28;//这里未必是图片真实的宽度，因图片上有可能有空白的边。
	actImg.height = 36;//这里未必是图片真实的高度，因图片上有可能有空白的边。
	//图片结果图片
	var operImg = new Image();
	operImg.src='imgs/design/Blue Ball16.png';
	operImg.width = 16;
	operImg.height = 16;
	//控制点图片
	var mouseImg = new Image();
	mouseImg.src='imgs/design/mouse_add.png';
	mouseImg.width = 16;
	mouseImg.height = 16;
	//后续线图片（没有图片，是直接在画布上画的圆圈）
	var subseqImg = new Image();
	subseqImg.width = 16;
	subseqImg.height = 16;
	return {
		"act":actImg,
		"oper":operImg,
		"mouse":mouseImg,
		"subseq":subseqImg
	}
	
	
})();

/**
 * 图形绘制器
 * @returns
 */
function FlRenderer(canvasId){
	
	/**
	 * 模型
	 */
	var flowModle = {
		  activities:[],/*活动*/
		  operations:[],/*操作结果*/
		  subsequents:[] /*操作结果*/
	};
	
	/*
	 * 选中的对象 
	 */
	var selected = [];
	var redMarked = null;//标红的对象
	 
	var c = null;//画布元素.
	
	var maxDisplayindex = 0 ;//displayindex从0开始编号
	
	c = document.getElementById(canvasId);
	cxt = c.getContext("2d"); 
	//init();
	drawAll(cxt);
	
	var isMouseDown = false;//鼠标左键是否按下
	
	//监听事件onclick
	$(c).click(function(){
		//获取鼠标的坐标（相对于画布的位置）。
		var x = event.pageX-this.offsetLeft;
        var y = event.pageY-this.offsetTop;
        //console.log("x:"+x+" y:"+y );
        //看看鼠标落在哪个对象上。
        selected = [];
        var obj = selectObj(x,y);
        if(obj && obj instanceof BussinessObj){
        	selected.push(obj);
        }
        drawAll(cxt);
        
	});
	
	//监听鼠标移动事件
	$(c).mousemove(function(){
		if(!isMouseDown)
			return;
		//获取鼠标的坐标（相对于画布的位置）。
		var x = event.pageX-this.offsetLeft;
        var y = event.pageY-this.offsetTop;
        console.log("x:"+x+" y:"+y );
        if(preDragPos==null){
        	preDragPos = {x:x,y:y};
        }
        thisDragePos = {x:x,y:y}
        if(dragedObj){
        	onDrag(dragedObj,preDragPos,thisDragePos);
        	drawAll(cxt);
        }
        preDragPos = thisDragePos;
	});
	
	var dragedObj = null;//被拖动的对象
	var preDragPos = null;//上次拖动的坐标

	//监听鼠标左键按下事件
	$(c).mousedown(function(){
		if(event.button == 0){//为0表示左键
			isMouseDown = true;
			//获取鼠标的当前位置
			var cursorPos = getCursorPos(event,c);
		    //看看有没有controlPoint被选中
			var obj = selectObj(cursorPos.x,cursorPos.y);
			if(obj){
				console.log("onStartDrag obj:"+obj);
				dragedObj = obj;
				preDragPos = getCursorPos(event,c);
				onStartDrag(obj);
			}
		}
	});
	//监听鼠标左键释放事件
	$(c).mouseup(function(){
		if(event.button == 0){
		    isMouseDown = false;
		    //有可能是拖动结束
		    if(preDragPos!=null){
		    	//拖动结束
		    	onEndDrag(dragedObj);
		    	preDragPos = null;
		    	dragedObj = null;
		    }
		    redMarked = null;
		}
	});
	
	/**拖动事件*/
	function onDrag(obj,beforePos,afterPos){
		if(obj instanceof BussinessObj){
			onBusinessObjDrag(obj,beforePos,afterPos);
		}else if(obj instanceof ControlPoint){
			onControlPointDrag(obj,beforePos,afterPos);
		}
	}
	/**业务对象被拖动事件*/
	function onBusinessObjDrag(bizObj,beforePos,afterPos){
		bizObj.view.x=bizObj.view.x+afterPos.x-beforePos.x;
		bizObj.view.y=bizObj.view.y+afterPos.y-beforePos.y;
		if(bizObj.view.controlPoint){
			bizObj.view.controlPoint.x = bizObj.view.controlPoint.x+afterPos.x-beforePos.x;
			bizObj.view.controlPoint.y = bizObj.view.controlPoint.y+afterPos.y-beforePos.y;
		}
		if(bizObj.view.controlPoint1){
			bizObj.view.controlPoint1.x = bizObj.view.controlPoint1.x+afterPos.x-beforePos.x;
			bizObj.view.controlPoint1.y = bizObj.view.controlPoint1.y+afterPos.y-beforePos.y;
		}
	}
	/**控制点被拖动事件*/
	function onControlPointDrag(controlPoint,beforePos,afterPos){
		controlPoint.x = controlPoint.x + afterPos.x-beforePos.x;
		controlPoint.y = controlPoint.y + afterPos.y-beforePos.y;
		//标红
		for(var i in flowModle.activities){
			var act = flowModle.activities[i];
			var view = act.view;
			if(view.x < afterPos.x && afterPos.x < view.x + view.width 
					&& view.y < afterPos.y && afterPos.y < view.y + view.height ){
				console.log('actact');
				redMarked = act;
				return;
			}
		}
		for(var i in flowModle.operations){
			var oper = flowModle.operations[i];
			var view = oper.view;
			if(view.x < afterPos.x && afterPos.x < view.x + view.width 
					&& view.y < afterPos.y && afterPos.y < view.y + view.height ){
				console.log('actact');
				redMarked = oper;
				return;
			}
		}
		//没有拖动到任何对象内则取消标红
		redMarked = null;
	}
	
	/**
	 * 鼠标开始拖动事件
	 */
	function onStartDrag(obj){
		//do nothing.
	}
	/**控制点拖动结束事件*/
	function onEndDrag(obj){
		//如果拖动的是控制点的话需要处理
		if(obj instanceof ControlPoint){
			//看是否拖动到了某个对象内
			if(!redMarked){
				resetControlPoint(obj.parent);
				return;
			}
			if(obj.parent instanceof Oper){
				var target = redMarked;
				if(!target.model.activityId){
					showErrMsg('请先填写“活动代码”。');
					resetControlPoint(obj.parent);
				    return;
				}
				obj.parent.model.activityId = target.model.activityId;
			    obj.parent.view.controlPoint = null;
			}
			if(obj.parent instanceof Subsequent){
				var target = redMarked;
				if (target instanceof Act){
					if(!target.model.activityId){
						showErrMsg('请先填写“活动代码”。');
						resetControlPoint(obj.parent,obj);
					    return;
					}
					if(obj.parent.model.activityId){
						showErrMsg('后续线应当一头连接活动，一头连接结果。');
						resetControlPoint(obj.parent,obj);
					    return;
					}
					obj.parent.model.activityId = target.model.activityId;
					if(obj.parent.view.controlPoint===obj){
						obj.parent.view.controlPoint = null;
					}else if(obj.parent.view.controlPoint1===obj){
						obj.parent.view.controlPoint1 = null;
					}
				}
				if (target instanceof Oper){
					if(!target.model.operationId){
						showErrMsg('请先填写“结果代码”。');
						resetControlPoint(obj.parent,obj);
					    return;
					}
					if(obj.parent.model.operationId){
						showErrMsg('后续线应当一头连接活动，一头连接结果。');
						resetControlPoint(obj.parent,obj);
					    return;
					}
					obj.parent.model.operationId = target.model.operationId;
					if(obj.parent.view.controlPoint===obj){
						obj.parent.view.controlPoint = null;
					}else if(obj.parent.view.controlPoint1===obj){
						obj.parent.view.controlPoint1 = null;
					}
				}
			}
			
		}
		
	};
	
	/**
	 * 根据鼠标所选中的位置，判断哪个控件被选中了。
	 */
	function selectObj(x,y){
		for(var i in flowModle.activities){
        	view = flowModle.activities[i].view;
        	console.log("view.x:"+view.x+" view.y:"+view.y + "   x:"+x+" y:"+y );
        	if(view.x<x && x<view.x+view.width 
        			&& view.y<y && y<view.y+view.height){
        		console.log("selected!"+selected.length);
        		return flowModle.activities[i];
        	}
        }
        for(var i in flowModle.subsequents){
        	view = flowModle.subsequents[i].view;
        	console.log("view.x:"+view.x+" view.y:"+view.y );
        	if(view.x<x && x<view.x+view.width 
        			&& view.y<y && y<view.y+view.height){
        		console.log("selected!"+selected.length);
        		return flowModle.subsequents[i];
        	}
        }
        for(var i in flowModle.operations){
        	view = flowModle.operations[i].view;
        	console.log("view.x:"+view.x+" view.y:"+view.y );
        	if(view.x<x && x<view.x+view.width 
        			&& view.y<y && y<view.y+view.height){
        		console.log("selected!"+selected.length);
        		return flowModle.operations[i];
        	}
        }
        //看看有没有controlPoint被选中
	    for(var i in flowModle.operations){
	    	var controlPoint = flowModle.operations[i].view.controlPoint;
	    	if(!controlPoint)
	    		continue;
    	    console.log("controlPoint.x:"+controlPoint.x+" controlPoint.y:"+controlPoint.y );
    	    var halfWidth = Math.floor(icons['mouse'].width/2);//控制点宽度的一半
    	    var halfHeight = Math.floor(icons['mouse'].height/2);//控制点高度的一半
    	    if(controlPoint.x-halfWidth<x && x<controlPoint.x+halfWidth
        			&& controlPoint.y-halfHeight<y && y<controlPoint.y+halfHeight){
    	    	return controlPoint;
    	    }
	    }
	    for(var i in flowModle.subsequents){
	    	var controlPoint = flowModle.subsequents[i].view.controlPoint;
	    	if (controlPoint){
		    	console.log("controlPoint.x:"+controlPoint.x+" controlPoint.y:"+controlPoint.y );
		    	var halfWidth = Math.floor(icons['mouse'].width/2);//控制点宽度的一半
	    	    var halfHeight = Math.floor(icons['mouse'].height/2);//控制点高度的一半
	    	    if(controlPoint.x-halfWidth<x && x<controlPoint.x+halfWidth
	        			&& controlPoint.y-halfHeight<y && y<controlPoint.y+halfHeight){
	    	    	return controlPoint;
	    	    }
	    	}
    	    var controlPoint = flowModle.subsequents[i].view.controlPoint1;
    	    if (controlPoint){
		    	console.log("controlPoint.x:"+controlPoint.x+" controlPoint.y:"+controlPoint.y );
		    	var halfWidth = Math.floor(icons['mouse'].width/2);//控制点宽度的一半
	    	    var halfHeight = Math.floor(icons['mouse'].height/2);//控制点高度的一半
	    	    if(controlPoint.x-halfWidth<x && x<controlPoint.x+halfWidth
	        			&& controlPoint.y-halfHeight<y && y<controlPoint.y+halfHeight){
	    	    	return controlPoint;
	    	    }
    	    }
	    }
	    return null;
	}
	
	/**
	 * 从流程模型中按activityId选择一个活动。
	 */
	function selectActByActId(activityId){
		for(var i in flowModle.activities){
			if(flowModle.activities[i].model.activityId == activityId){
				return flowModle.activities[i];
			}
		}
		return null;
	}
	/**
	 * 从流程模型中按operationId选择一个结果。
	 */
	function selectOperByOperId(operationId){
		for(var i in flowModle.operations){
			if(flowModle.operations[i].model.operationId == operationId){
				return flowModle.operations[i];
			}
		}
		return null;
	}
	
	/**绘制整个图像*/
	function drawAll(cxt){
		cxt.clearRect(0,0,c.width,c.height); 
		console.log("flowModle.activities:"+flowModle.activities);
		for(var i in flowModle.activities){
			drawBizLine(cxt,flowModle.activities[i]);
		}
		for(var i in flowModle.operations){
			drawBizLine(cxt,flowModle.operations[i]);
		}
		for(var i in flowModle.subsequents){
			drawBizLine(cxt,flowModle.subsequents[i]);
		}
		for(var i in flowModle.activities){
			drawBizObj(cxt,flowModle.activities[i]);
		}
		for(var i in flowModle.operations){
			drawBizObj(cxt,flowModle.operations[i]);
		}
		for(var i in flowModle.subsequents){
			drawBizObj(cxt,flowModle.subsequents[i]);
		}
		drawSelect(cxt);
		drawReadMarked(cxt);
	}
	
	/**
	 * 绘制业务对象中的线条
	 */
	function drawBizLine(cxt,obj){
		if(obj instanceof Act){
			drawActivityLine(cxt,obj);
		}else if(obj instanceof Oper){
			drawOperationLine(cxt,obj);
		}else if(obj instanceof Subsequent){
			drawSubsequentLine(cxt,obj);
		}
	}
	
	/**
	 * 绘制一个活动的线条
	 */
	function drawActivityLine(cxt,act){
		//do nothing.
	}
	
	/**
	 * 绘制结果线中的线条
	 */
	function drawOperationLine(cxt,oper){
		var view = oper.view;
		if(oper.model.activityId){//如果关联了一个活动
			console.log("oper.model.activityId:"+oper.model.activityId);
			//查找对应的活动
			var act = selectActByActId(oper.model.activityId);
			//绘制从结果到活动的线条。
			if(act){
			    //act.view
				cxt.beginPath();
				cxt.lineWidth=2;
				cxt.strokeStyle='#48f';
				cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
				cxt.lineTo(act.view.x+act.view.width/2,act.view.y+act.view.height/2);
				cxt.stroke();
			}
		}else if(oper.view.controlPoint){//存在控制点
			 //绘制连线到控制点
			 cxt.beginPath();
			 cxt.lineWidth=2;
			 cxt.strokeStyle='#48f';
			 cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
			 cxt.lineTo(oper.view.controlPoint.x,oper.view.controlPoint.y);
			 cxt.stroke();
		}
	}
	/**
	 * 绘制结果线中的线条
	 */
	function drawSubsequentLine(cxt,subseq){
		var view = subseq.view;
		if(subseq.model.activityId){//如果关联了一个活动
			console.log("subseq.model.activityId:"+subseq.model.activityId);
			//查找对应的活动
			var act = selectActByActId(subseq.model.activityId);
			//绘制从圆圈到活动的线条。
			if(act){
			    //act.view
				cxt.beginPath();
				cxt.lineWidth=0.5;
				cxt.strokeStyle='black';
				cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
				cxt.lineTo(act.view.x+act.view.width/2,act.view.y+act.view.height/2);
				cxt.stroke();
			}
		}
		if(subseq.model.operationId){//如果关联了一个结果
			console.log("subseq.model.activityId:"+subseq.model.operationId);
			//查找对应的结果
			var oper = selectOperByOperId(subseq.model.operationId);
			//绘制从圆圈到活动的结果。
			if(oper){
			    //act.view
				cxt.beginPath();
				cxt.lineWidth=0.5;
				cxt.strokeStyle='black';
				cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
				cxt.lineTo(oper.view.x+oper.view.width/2,oper.view.y+oper.view.height/2);
				cxt.stroke();
			}
			
		}
		if(subseq.view.controlPoint){//存在控制点
			var controlPoint = subseq.view.controlPoint;
			//绘制连线到控制点
			cxt.beginPath();
			cxt.lineWidth=0.5;
			cxt.strokeStyle='black';
			cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
			cxt.lineTo(controlPoint.x,controlPoint.y);
			cxt.stroke();
		}
		if(subseq.view.controlPoint1){//存在控制点
			var controlPoint = subseq.view.controlPoint1;
			//绘制连线到控制点
			cxt.beginPath();
			cxt.lineWidth=0.5;
			cxt.strokeStyle='black';
			cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
			cxt.lineTo(controlPoint.x,controlPoint.y);
			cxt.stroke();
		}
	}
	
	/**
	 * 绘制一个业务对象
	 */
	function drawBizObj(cxt,obj){
		if(obj instanceof Act){
			drawActivity(cxt,obj);
		}else if(obj instanceof Oper){
			drawOperation(cxt,obj);
		}else if(obj instanceof Subsequent){
			drawSubsequent(cxt,obj);
		}
	}
	
	/**
	 * 绘制一个活动
	 */
	function drawActivity(cxt,act){
		console.log("act.model:"+act.model);
		//绘制活动的名称
		console.log("act.model.displayName:"+act.model.displayName);
		if(act.model.displayName){
			cxt.fillStyle = 'black';
			cxt.font = "bold 14px songti";
			var textLeft = act.view.x+(act.view.width-act.model.displayName.length*14)/2  //14是字体的宽度。
			cxt.fillText(act.model.displayName,textLeft,act.view.y-8);//文字写在图像上方8个像素点处。
		}
		cxt.drawImage(icons['act'],act.view.x,act.view.y);
	}
	/**
	 * 绘制一个结果线
	 */
	function drawOperation(cxt,oper){
		 var view = oper.view;
		 cxt.drawImage(icons['oper'],oper.view.x,oper.view.y);
		 //如果关联了一个活动
		 console.log("oper.model.activityId:"+oper.model.activityId);
		 if(oper.model.activityId){
			 console.log("oper.model.activityId:"+oper.model.activityId);
			 //do nothing.
		 }else if(oper.view.controlPoint){//存在控制点
			 //在控制点处绘制一个鼠标。
			 var mouseLeft = oper.view.controlPoint.x - Math.floor(icons['mouse'].width/2);
			 var mouseTop = oper.view.controlPoint.y - Math.floor(icons['mouse'].height/2);
			 cxt.drawImage(icons['mouse'],mouseLeft,mouseTop);
		 }
		 cxt.fillStyle = 'black';
		 cxt.font = "12px songti";
		 var textLeft = oper.view.x+Math.floor((oper.view.width-oper.model.displayName.length*12)/2); //12是字体的宽度
	     cxt.fillText(oper.model.displayName,textLeft,oper.view.y+oper.view.height+12);//12是字体的高度
	 }
	/**
	 * 绘制一个后续线.
	 */
	function drawSubsequent(ctx,subseq){
		//后续线的中心点上绘制一个圆圈
		//先计算圆形的中心
		var x = subseq.view.x + Math.floor(subseq.view.width/2);
		var y = subseq.view.y + Math.floor(subseq.view.height/2);
		//半径是宽度的1/4
		var r = Math.floor(subseq.view.width/4);
		console.log('arc: x:'+x+" y:"+y+ " r:"+r);
		//开始绘制
		ctx.beginPath();
	    //设置弧线的颜色为灰色
		ctx.lineWidth="0.5";
	    ctx.strokeStyle = "black";
		ctx.arc(x, y, r, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.stroke();
		//绘制控制点
		var controlPoint = subseq.view.controlPoint;
		if(controlPoint){
			 var mouseLeft = controlPoint.x - Math.floor(icons['mouse'].width/2);
			 var mouseTop = controlPoint.y - Math.floor(icons['mouse'].height/2);
			 cxt.drawImage(icons['mouse'],mouseLeft,mouseTop);
		}
		var controlPoint = subseq.view.controlPoint1;
		if(controlPoint){
			 var mouseLeft = controlPoint.x - Math.floor(icons['mouse'].width/2);
			 var mouseTop = controlPoint.y - Math.floor(icons['mouse'].height/2);
			 cxt.drawImage(icons['mouse'],mouseLeft,mouseTop);
		}
	}
	/**
	 * 绘制选中的元素
	 */
	function drawSelect(ctx){
		for(var i in selected){
			var view = selected[i].view;
			console.log("draw selected.");
			ctx.beginPath();
			ctx.lineWidth="1";
			ctx.strokeStyle="green";
			ctx.rect(view.x,view.y,view.width,view.height);
			ctx.stroke();
		}
	}

	function drawReadMarked(ctx){
		if(redMarked){
			var view = redMarked.view;
			console.log("draw red mark.");
			ctx.beginPath();
			ctx.lineWidth="1";
			ctx.strokeStyle="red";
			ctx.rect(view.x,view.y,view.width,view.height);
			ctx.stroke();
		}
	}
	
	//暴露出去一个对象
	return {
		/**加载一个模型*/
		loadModel:function(modelJson){
			//先清空模型
			flowModle.activities = [];
			flowModle.operations = [];
			flowModle.subsequents = [];
			for(var i in modelJson.activities){
				var act = new Act(modelJson.activities[i]);
				if(act.view.displayindex){
					maxDisplayindex = Math.max(maxDisplayindex,act.view.displayindex);
				}else{
					act.view.displayindex = ++maxDisplayindex;
				}
				//设置宽度和高度.
				act.view.width = icons['act'].width;
				act.view.height = icons['act'].height;
				flowModle.activities.push(act);
				console.log('加载了一个Act');
			}
			for(var i in modelJson.operations){
				var oper = new Oper(modelJson.operations[i]);
				if(oper.view.displayindex){
					maxDisplayindex = Math.max(maxDisplayindex,oper.view.displayindex);
				}else{
					oper.view.displayindex = ++maxDisplayindex;
				}
				//设置宽度和高度.
				oper.view.width = icons['oper'].width;
				oper.view.height = icons['oper'].height;
				flowModle.operations.push(oper);
			}
			for(var i in modelJson.subsequents){
				var subseq = new Subsequent(modelJson.subsequents[i]);
				if(subseq.view.displayindex){
					maxDisplayindex = Math.max(maxDisplayindex,oper.view.displayindex);
				}else{
					subseq.view.displayindex = ++maxDisplayindex;
				}
				//设置宽度和高度.
				subseq.view.width = icons['subseq'].width;
				subseq.view.height = icons['subseq'].height;
				flowModle.subsequents.push(subseq);
			}
			//加载完后渲染一下。放到另外一个线程去渲染，以保证图像已加载完成。
			setTimeout(function(){console.log('开始绘图');drawAll(cxt);},0);
		},
		/**向模型中增加一个Act*/
		addAct:function(actJson){
			var act = new Act(actJson);
			act.view.displayindex=++maxDisplayindex;
			//设置宽度和高度.
			act.view.width = icons['act'].width;
			act.view.height = icons['act'].height;
			flowModle.activities.push(act);
			drawAll(cxt);
		},
		/**向模型中增加一个Oper*/
		addOper:function(operJson){
			var oper = new Oper(operJson);
			oper.view.displayindex=++maxDisplayindex;
			//设置宽度和高度.
			oper.view.width = icons['oper'].width;
			oper.view.height = icons['oper'].height;
			flowModle.operations.push(oper);
			drawAll(cxt);
		},
		addSubseq:function(subseqJson){
			var subseq = new Subsequent(subseqJson);
			//设置宽度和高度.
			subseq.view.width = icons['subseq'].width;
			subseq.view.height = icons['subseq'].height;
			flowModle.subsequents.push(subseq);
			drawAll(cxt);
		},
		/**获取画布中心点的坐标*/
		getCenter:function(){
			var cwidth = $(c).attr('width').replace('px','');
			var cheight = $(c).attr('height').replace('px','');
			var x = Math.floor((cwidth)/2);
			var y = Math.floor((cheight)/2);
			return {x:x,y:y};
		}
	};
}

/**
 * 获取鼠标的位置
 * @param event 事件
 * @param canvase 元素
 * @returns {x:x,y:y}
 */
function getCursorPos(event,c){
	var x = event.pageX-c.offsetLeft;
    var y = event.pageY-c.offsetTop;
    return {x:x,y:y};
}

/**
 * 把控制点调整到默认位置。
 * @param obj 业务对象
 * @param thisControlPoint 本控制点。
 * @returns
 */
function resetControlPoint(obj,thisControlPoint){
	if(!thisControlPoint && obj.view.controlPoint || thisControlPoint===obj.view.controlPoint){
		var controlPoint = obj.view.controlPoint;
		var x = obj.view.x +Math.floor((obj.view.width)/2);
		var y = obj.view.y-30+Math.floor(icons['mouse'].height/2);// 鼠标图形的一半。
		controlPoint.x = x;
		controlPoint.y = y;
	}
	if(!thisControlPoint && obj.view.controlPoint1 || thisControlPoint===obj.view.controlPoint1){
		var controlPoint = obj.view.controlPoint1;
		var x = obj.view.x +Math.floor((obj.view.width)/2);
		var y = obj.view.y+30+Math.floor(icons['mouse'].height/2);// 鼠标图形的一半。
		controlPoint.x = x;
		controlPoint.y = y;
	}
}

/**
 * 显示错误信息给用户
 * 如果不满意显示效果可以另写一个函数把它覆盖掉。
 * @returns
 */
function showErrMsg(msg){
	alert(msg);
}
