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
	}
	this.view={};
	if(obj && obj instanceof Object){
		this.view=obj.view;
	}
}

/**
 * 子类，Activity
 */
var Act = function(){};
Act.prototype = new BussinessObj();

/**
 * 子类，操作选项
 */
var Oper = function(){};
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
var ControlPoint = function(){}
ControlPoint.prototype = new Point();


//绘图过程中要使用到的图片
var actImg = new Image();
actImg.src='imgs/design/anyone.gif';
var operImg = new Image();
operImg.src='imgs/design/Blue Ball16.png';
var mouseImg = new Image();
mouseImg.src='imgs/design/mouse_add.png';

//用来测试的模型
var testModel = {activities:
	  [
			{model:{
				activityId:'0000',
				activityName:'任务分配',
				activityType:'01',
				displayName:'任务分配'
			  },
			  view:{
				displayindex:168,
				height:36,
				width:28,
				x:349,
				y:28
			  }
			},
		  ],
		  operations:[]
	};

$(function(){
	
	/**
	 * 模型
	 */
	var flowModle = {
		  activities:[],
		  operations:[]
	};
	
	/*
	 * 选中的对象 ，其每个元素如下：{type:'act',obj:act}，其中 type的取值是 'act'、'result'代表“活动”，“结果”等，act 是活动本身的对象.包括model和view两部分
	 */
	var selected = [];
	var redMarked = null;//标红的对象
	var dragingControlPoint = null;//正在拖动的控制点
	 
	var c = null;//画布元素.
	
	c = document.getElementById("designer");
	cxt = c.getContext("2d"); 
	//init();
	drawAll(cxt);
	
	var isMouseDown = false;//鼠标左键是否按下
	
	//监听事件onclick
	$(c).click(function(){
		//获取鼠标的坐标（相对于画布的位置）。
		var x = event.pageX-this.offsetLeft;
        var y = event.pageY-this.offsetTop;
        console.log("x:"+x+" y:"+y );
        //遍历模型中的对象看鼠标落在哪个对象上。
        selected = [];
        for(var i in flowModle.activities){
        	view = flowModle.activities[i].view;
        	console.log("view.x:"+view.x+" view.y:"+view.y );
        	if(view.x<x && x<view.x+view.width 
        			&& view.y<y && y<view.y+view.height){
        		console.log("selected!"+selected.length);
        		selected.push({type:'act',obj:flowModle.activities[i]});
        		console.log("selected.length:"+selected.length);
        	}
        }
        for(var i in flowModle.operations){
        	view = flowModle.operations[i].view;
        	console.log("view.x:"+view.x+" view.y:"+view.y );
        	if(view.x<x && x<view.x+view.width 
        			&& view.y<y && y<view.y+view.height){
        		console.log("selected!"+selected.length);
        		selected.push({type:'result',obj:flowModle.operations[i]});
        		console.log("selected.length:"+selected.length);
        	}
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
        if(dragedObj==null)
        	//看selected中哪个正在被拖动
        	for(var i in selected){
            	var view = selected[i].obj.view;
            	if(view.x<x && x<view.x+view.width 
            			&& view.y<y && y<view.y+view.height){
            		dragedObj = selected[i].obj;
            	}
        	}
        }
        thisDragePos = {x:x,y:y}
        if(dragedObj!=null){
        	onDrag(dragedObj,preDragPos,thisDragePos);
        	drawAll(cxt);
        }
        //控制点被拖动
        if(dragingControlPoint!=null){
        	onControlPointDrag(dragingControlPoint,preDragPos,thisDragePos);
        	drawAll(cxt);
        }
        preDragPos = thisDragePos;
	});
	
	var dragedObj = null;//被拖动的对象
	var preDragPos = null;//上次拖动的坐标
	//拖动事件
	onDrag = function(obj,beforePos,afterPos){
		console.log("HAhahah");
		obj.view.x=obj.view.x+afterPos.x-beforePos.x;
		obj.view.y=obj.view.y+afterPos.y-beforePos.y;
		if(obj.view.controlPoint){
			obj.view.controlPoint.x = obj.view.controlPoint.x+afterPos.x-beforePos.x;
			obj.view.controlPoint.y = obj.view.controlPoint.y+afterPos.y-beforePos.y;
		}
	}
	//控制点被拖动事件
	onControlPointDrag = function(controlPoint,beforePos,afterPos){
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
	
	//监听鼠标左键按下事件
	$(c).mousedown(function(){
		if(event.button == 0){//为0表示左键
			isMouseDown = true;
			//获取鼠标的当前位置
			var cursorPos = getCursorPos(event);
		    //看看有没有controlPoint被选中
			var obj = selectObj(cursorPos.x,cursorPos.y);
			if(obj){
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
	
	/**
	 * 鼠标开始拖动事件
	 */
	function onStartDrag(obj){
		dragedObj = obj;
		preDragPos = getCursorPos(event);
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
        	console.log("view.x:"+view.x+" view.y:"+view.y );
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
    	    //获取鼠标的当前位置
    	    var x = event.pageX-this.offsetLeft;
            var y = event.pageY-this.offsetTop;
    	    if(controlPoint.x-16/2<x && x<controlPoint.x+16/2 
        			&& controlPoint.y-16/2<y && y<controlPoint.y+16/2){
    	    	return controlPoint;
    	    }
	    }
	}
});
/*
function init(){
	actImg = document.getElementById("tool1");
	operImg = 
}
*/
/**
 * 获取鼠标的位置
 * @param event 事件
 * @returns {x:x,y:y}
 */
function getCursorPos(event){
	var x = event.pageX-this.offsetLeft;
    var y = event.pageY-this.offsetTop;
    return {x:x,y:y};
}

function drawAll(cxt){
	cxt.clearRect(0,0,c.width,c.height); 
	for(var i in flowModle.activities){
		drawActivity(cxt,flowModle.activities[i]);
	}
	for(var i in flowModle.operations){
		drawOperation(cxt,flowModle.operations[i]);
	}
	drawSelect(cxt);
	drawReadMarked(cxt);
}
/**
 * 绘制一个活动
 */
function drawActivity(cxt,act){
	//绘制活动的名称
	cxt.font = "bold 14px songti";
	var textLeft = act.view.x+(act.view.width-act.model.displayName.length*14)/2
	cxt.fillText(act.model.displayName,textLeft,act.view.y-8);
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
		 //TODO 查找对应的活动
		 var act = selectActByActId(oper.model.activityId);
		 //TODO 绘制从结果到活动的线条。
		 if(act!=null){
			 //act.view
			 cxt.beginPath();
			 cxt.lineWidth=2;
			 cxt.strokeStyle='#48f';
			 cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
			 cxt.lineTo(act.view.x+act.view.width/2,act.view.y+act.view.height/2);
			 cxt.stroke();
		 }
	 }else if(oper.view.controlPoint){//存在控制点
		 //在控制点处绘制一个鼠标。
		 var mouseLeft = oper.view.controlPoint.x - 16/2;
		 var mouseTop = oper.view.controlPoint.y - 16/2;
		 cxt.drawImage(mouseImg,mouseLeft,mouseTop);
		 //绘制连线
		 cxt.beginPath();
		 cxt.lineWidth=2;
		 cxt.strokeStyle='#48f';
		 cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
		 cxt.lineTo(oper.view.controlPoint.x,oper.view.controlPoint.y);
		 cxt.stroke();
	 }else{
		 //在上方(30px处)绘制一个鼠标
		 var mouseLeft = oper.view.x +Math.floor((oper.view.width-16)/2);
		 cxt.drawImage(mouseImg,mouseLeft,oper.view.y-30);
		 //绘制连线
		 cxt.beginPath();
		 cxt.lineWidth=2;
		 cxt.strokeStyle='#48f';
		 cxt.moveTo(view.x+view.width/2,view.y+view.height/2);
		 cxt.lineTo(view.x+view.width/2,view.y+view.height/2-30);
		 cxt.stroke();
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
		var view = selected[i].obj.view;
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

function resetControlPoint(obj){
	if(obj instanceof Oper){
		var left = obj.view.x +Math.floor((obj.view.width)/2);
		controlPoint = {x:left,y:obj.view.y-30+16/2};// 16/2是鼠标图形的一半。
		controlPoint.parent = obj;//父对象就是其业务对象。
		controlPoint.parentType = 'result';
		obj.view.controlPoint = controlPoint;
	}
	
}

function selectActByActId(activityId){
	for(var i in flowModle.activities){
		if(flowModle.activities[i].model.activityId == activityId){
			return flowModle.activities[i];
		}
	}
	return null;
}