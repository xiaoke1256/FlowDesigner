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
	//在业务对象的上方增加一个控制点。(控制点以图形的中心为准)
	var x = this.view.x +Math.floor((this.view.width)/2);
	var y = this.view.y-30+16/2;// 16/2是鼠标图形的一半。
	controlPoint = new ControlPoint(x,y);
	controlPoint.parent = this;//父对象就是其业务对象。
	controlPoint.parentType = 'result';
	this.view.controlPoint = controlPoint;
};
Oper.prototype = new BussinessObj();

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
 * 图形绘制器
 * @returns
 */
function FlRenderer(canvasId){
	
	//绘图过程中要使用到的图片
	var actImg = new Image();
	actImg.src='imgs/design/anyone.gif';
	var operImg = new Image();
	operImg.src='imgs/design/Blue Ball16.png';
	var mouseImg = new Image();
	mouseImg.src='imgs/design/mouse_add.png';
	
	/**
	 * 模型
	 */
	var flowModle = {
		  activities:[],
		  operations:[]
	};
	
	/*
	 * 选中的对象 
	 */
	var selected = [];
	var redMarked = null;//标红的对象
	 
	var c = null;//画布元素.
	
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
		console.log('obj instanceof BussinessObj:'+obj instanceof BussinessObj);
		console.log('obj instanceof ControlPoint:'+obj instanceof ControlPoint);
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
			}
		}
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
				obj.parent.model.activityId = target.model.activityId;
				obj.parent.view.controlPoint = null;
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
	    	controlPoint = flowModle.operations[i].view.controlPoint;
	    	if(!controlPoint)
	    		continue;
    	    console.log("controlPoint.x:"+controlPoint.x+" controlPoint.y:"+controlPoint.y );
    	    if(controlPoint.x-16/2<x && x<controlPoint.x+16/2 
        			&& controlPoint.y-16/2<y && y<controlPoint.y+16/2){
    	    	return controlPoint;
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
		for(var i in flowModle.activities){
			drawBizObj(cxt,flowModle.activities[i]);
		}
		for(var i in flowModle.operations){
			drawBizObj(cxt,flowModle.operations[i]);
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
	 * 绘制一个业务对象
	 */
	function drawBizObj(cxt,obj){
		if(obj instanceof Act){
			drawActivity(cxt,obj);
		}else if(obj instanceof Oper){
			drawOperation(cxt,obj);
		}
	}
	
	/**
	 * 绘制一个活动
	 */
	function drawActivity(cxt,act){
		console.log("act.model:"+act.model);
		//绘制活动的名称
		if(act.model.displayName){
			cxt.font = "bold 14px songti";
			var textLeft = act.view.x+(act.view.width-act.model.displayName.length*14)/2
			cxt.fillText(act.model.displayName,textLeft,act.view.y-8);
		}
		cxt.drawImage(actImg,act.view.x,act.view.y);
	}
	/**
	 * 绘制一个结果线
	 */
	function drawOperation(cxt,oper){
		 var view = oper.view;
		 cxt.drawImage(operImg,oper.view.x,oper.view.y);
		 //如果关联了一个活动
		 console.log("oper.model.activityId:"+oper.model.activityId);
		 if(oper.model.activityId){
			 console.log("oper.model.activityId:"+oper.model.activityId);
			 //do nothing.
		 }else if(oper.view.controlPoint){//存在控制点
			 //在控制点处绘制一个鼠标。
			 var mouseLeft = oper.view.controlPoint.x - 16/2;
			 var mouseTop = oper.view.controlPoint.y - 16/2;
			 cxt.drawImage(mouseImg,mouseLeft,mouseTop);
		 }
		 cxt.font = "12px songti";
		 var textLeft = oper.view.x+Math.floor((oper.view.width-oper.model.displayName.length*12)/2);
	     cxt.fillText(oper.model.displayName,textLeft,oper.view.y+oper.view.height+12);
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
			for(var i in modelJson.activities){
				var act = modelJson.activities[i];
				flowModle.activities.push(new Act(act));
				console.log('加载了一个Act');
			}
			for(var i in modelJson.operations){
				var oper = modelJson.operations[i];
				flowModle.operations.push(new Oper(oper));
			}
			//加载完后渲染一下,放到另外一个线程去渲染，以保证图像已加载完成。
			//drawAll(cxt)
			setTimeout(function(){console.log('开始绘图');drawAll(cxt);},0);
		},
		/**向模型中增加一个Act*/
		addAct:function(actJson){
			flowModle.activities.push(new Act(actJson));
			drawAll(cxt);
		},
		/**向模型中增加一个Oper*/
		addOper:function(operJson){
			flowModle.operations.push(new Oper(operJson));
			drawAll(cxt);
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



function resetControlPoint(obj){
	if(obj instanceof Oper){
		var x = obj.view.x +Math.floor((obj.view.width)/2);
		var y = obj.view.y-30+16/2;// 16/2是鼠标图形的一半。
		controlPoint = new ControlPoint(x,y);
		controlPoint.parent = obj;//父对象就是其业务对象。
		controlPoint.parentType = 'result';
		obj.view.controlPoint = controlPoint;
	}
	
}

