/**
 * 把xml的内容转成Doc对象
 * @returns
 */
function loadXML(xmlString){
	 var  xmlDoc = null ;
     // 判断浏览器的类型 
     // 支持IE浏览器  
     if ( ! window.DOMParser  &&  window.ActiveXObject){    // window.DOMParser 判断是否是非ie浏览器 
         var  xmlDomVersions  =  [ ' MSXML.2.DOMDocument.6.0 ' , ' MSXML.2.DOMDocument.3.0 ' , ' Microsoft.XMLDOM ' ];
         for ( var  i = 0 ;i < xmlDomVersions.length;i ++ ){
             try {
                xmlDoc  =   new  ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async  =   false ;
                xmlDoc.loadXML(xmlString);  // loadXML方法载入xml字符串 
                 break ;
            } catch (e){
            }
        }
    }
     // 支持Mozilla浏览器 
     else   if (window.DOMParser  &&  document.implementation  &&  document.implementation.createDocument){
         try {
             /*  DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
             * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
             * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
             * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
              */ 
            domParser  =   new   DOMParser();
            xmlDoc  =  domParser.parseFromString(xmlString,  'text/xml' );
        } catch (e){
        	console.error(e);
        	throw e;
        }
    }
     else {
         return   null ;
    }

     return  xmlDoc;
}

/**把xml文档转成一个对象*/
function xmlDocToObj(xmlDoc){
	var flowModle = {
		flowInfo:{model:{},view:{}},
		activities:[],/*活动*/
		operations:[],/*操作结果*/
		subsequents:[] /*操作结果*/
	};
	var flowInfoModel = flowModle.flowInfo.model;
	var flowNode = xmlDoc.getElementsByTagName("flow")[0];
	console.log("flowNode.attributes:"+flowNode.attributes);
	var flowId = flowNode.getAttribute("flowId");
	var version = flowNode.getAttribute("version");
	var flowName = flowNode.getAttribute("flowName");
	var displayName = flowNode.getAttribute("displayName");
	var description = flowNode.getAttribute("description");
	flowInfoModel.flowId = flowId;
	flowInfoModel.version = version;
	flowInfoModel.flowName = flowName;
	flowInfoModel.displayName = displayName;
	flowInfoModel.description = description;
	
	var nodes = flowNode.getElementsByTagName("activities");
	if(!nodes || nodes.length==0){
		throw "xml 解析异常，未找到 activities 节点。";
	}
	var actsNode = nodes[0];
	var actNodes = actsNode.getElementsByTagName("activity");
	for(var i in actNodes){
		var actNode = actNodes[i];
		
		if(typeof(actNode.getElementsByTagName)!='function' ){
			console.log("getElementsByTagName is not a function! "+typeof(actNode.getElementsByTagName));
		}
		var childNodes = actNode.children;
		if(!childNodes){
			//console.log("childNodes 居然为空！！");
			continue;
		}
		var modelNode =childNodes[0];
		var viewNode =childNodes[1];
		if(modelNode.nodeName!='model'){
			throw "xml 解析异常，activity 下未找到 model 节点。";
		}
		if(viewNode.nodeName!='view'){
			throw "xml 解析异常，activity 下未找到 view 节点。";
		}
		var model = {};
		var view = {};
		var propNodes = modelNode.children;
		for(var j in propNodes){
			if(!propNodes[j].nodeName)
				continue;
			model[propNodes[j].nodeName]=propNodes[j].textContent ;
			//console.log("针对字段“"+propNodes[j].nodeName+"”设置了值“"+propNodes[j].textContent +"”");
		}
		var propNodes = viewNode.children;
		for(var j in propNodes){
			if(!propNodes[j].nodeName)
				continue;
			view[propNodes[j].nodeName]=parseInt(propNodes[j].textContent) ;
			//console.log("针对字段“"+propNodes[j].nodeName+"”设置了值“"+parseInt(propNodes[j].textContent) +"”");
		}
		flowModle.activities.push({model:model,view:view});
	}
	return flowModle;
}