/**
 * 本js文件定义了，鼠标拖动的控制器。
 * 包含两个控制器，一个是默认的，一个是调整坐标系时用的。
 * 本js程序依赖于以下程序：
 * jQuery.js
 */

/**
 * 默认的鼠标拖动控制器
 */
var getDefaultDragCtrl = function(renderCtx){
	
	var flRender = renderCtx;
	
	/**结束鼠标拖动事件*/
	function _onEndDrag(obj){
		//如果拖动的是控制点的话需要处理
		if(obj instanceof ControlPoint){
			var redMarked = flRender.getRedMarked();
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
	}
	
	/**业务对象被拖动事件*/
	function _onBusinessObjDrag(bizObj,beforePos,afterPos){
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
	function _onControlPointDrag(controlPoint,beforePos,afterPos){
		var flowModle = flRender.getFlowModle();
		controlPoint.x = controlPoint.x + afterPos.x-beforePos.x;
		controlPoint.y = controlPoint.y + afterPos.y-beforePos.y;
		//标红
		for(var i in flowModle.activities){
			var act = flowModle.activities[i];
			var view = act.view;
			if(view.x < afterPos.x && afterPos.x < view.x + view.width 
					&& view.y < afterPos.y && afterPos.y < view.y + view.height ){
				console.log('actact');
				flRender.setRedMarked(act);
				return;
			}
		}
		for(var i in flowModle.operations){
			var oper = flowModle.operations[i];
			var view = oper.view;
			if(view.x < afterPos.x && afterPos.x < view.x + view.width 
					&& view.y < afterPos.y && afterPos.y < view.y + view.height ){
				console.log('actact');
				flRender.setRedMarked(oper);
				return;
			}
		}
		//没有拖动到任何对象内则取消标红
		flRender.setRedMarked(null);
	}
	
	return {
		/**开始拖动事件*/
		onStartDrag:function (obj){
			//do nothing.
		},
		/**结束拖动鼠标事件*/
		onEndDrag:function(obj){
			_onEndDrag(obj);
		},
		/**拖动事件*/
		onDrag:function(obj,beforePos,afterPos){
			if(!obj)
				return;
			if(obj instanceof BussinessObj){
				_onBusinessObjDrag(obj,beforePos,afterPos);
			}else if(obj instanceof ControlPoint){
				_onControlPointDrag(obj,beforePos,afterPos);
			}
		},
		/**右击事件*/
		rightClick:function(obj){
			//先把业务对象选中
			flRender.resetSelected(obj);
			//然后将右键菜单显示出来
			//将右键菜单挪到鼠标所在的位置
			var x = event.pageX;
		    var y = event.pageY;
		    var rightMenuDiv = null;
		    if(obj instanceof Act){
		    	rightMenuDiv = $('#rightMenuForAct');
		    }else if(obj instanceof Oper){
		    	rightMenuDiv = $('#rightMenuForOper');
		    }else if(obj instanceof Subsequent){
		    	rightMenuDiv = $('#rightMenuForSubseq');
		    }else{
		    	return;
		    }
		    rightMenuDiv.css("left",x);
		    rightMenuDiv.css("top",y);
		    rightMenuDiv.show();
		}
	}
};

/**
 * 把控制点调整到默认位置。
 * @param obj 业务对象
 * @param thisControlPoint 本控制点。
 * @returns
 */
function resetControlPoint(obj,thisControlPoint){
	if(!thisControlPoint && obj.view.controlPoint || thisControlPoint && thisControlPoint===obj.view.controlPoint){
		var controlPoint = obj.view.controlPoint;
		var x = obj.view.x +Math.floor((obj.view.width)/2);
		var y = obj.view.y-30+Math.floor(icons['mouse'].height/2);// 鼠标图形的一半。
		controlPoint.x = x;
		controlPoint.y = y;
	}
	if(!thisControlPoint && obj.view.controlPoint1 || thisControlPoint && thisControlPoint===obj.view.controlPoint1){
		var controlPoint = obj.view.controlPoint1;
		var x = obj.view.x +Math.floor((obj.view.width)/2);
		var y = obj.view.y+30+Math.floor(icons['mouse'].height/2);// 鼠标图形的一半。
		controlPoint.x = x;
		controlPoint.y = y;
	}
}

/**
 * 鼠标拖动控制器，用来调整坐标系
 */
var getMovimgDragCtrl = function(renderCtx){
	var flRender = renderCtx;
	function _onDrag(obj,beforePos,afterPos,beforeAbsPos,afterAbsPos){
		renderCtx.moveOriginPoint(afterAbsPos.x-beforeAbsPos.x,afterAbsPos.y-beforeAbsPos.y);
	}
	return {
		/**开始拖动事件*/
		onStartDrag:function (obj){
			//do nothing.
		},
		/**结束拖动鼠标事件*/
		onEndDrag:function(obj){
			//do nothing.
		},
		/**拖动事件*/
		onDrag:function(obj,beforePos,afterPos,beforeAbsPos,afterAbsPos){
			_onDrag(obj,beforePos,afterPos,beforeAbsPos,afterAbsPos)
		},
		/**右击事件*/
		rightClick:function(obj){
			//do nothing.
		}
	};
}