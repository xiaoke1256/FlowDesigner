/**
 * 把流程模型转成xml的js.
 */
function flModelToXml(flModel){
	var xmlDOM = createXMLDOM();
    if (xmlDOM) {
    	//创建根节点
        var rootNode = xmlDOM.createElement('esflow');
        xmlDOM.appendChild(rootNode);
        
        var flowInfoModel = flModel.flowInfo.model;
        //创建流程节点
        var flowNode = xmlDOM.createElement('flow');
        for(var prop in flowInfoModel){
        	flowNode.setAttribute(prop,flowInfoModel[prop]);
        }
        rootNode.appendChild(flowNode);
        
        //创建活动节点
        var actsNode = xmlDOM.createElement('activities');
        flowNode.appendChild(actsNode);
        
        bizObjsToXmlNode(xmlDOM,flModel.activities,'actibity',actsNode);
        
        //创建结果节点
        var opersNode = xmlDOM.createElement('operations');
        flowNode.appendChild(opersNode);
        
        bizObjsToXmlNode(xmlDOM,flModel.operations,'operation',opersNode);
        
        //创建后续节点
        var subseqsNode = xmlDOM.createElement('subsequents');
        flowNode.appendChild(subseqsNode);
        
        bizObjsToXmlNode(xmlDOM,flModel.subsequents,'subsequent',subseqsNode)
        
        return xmlFormat(parserXMLToString(xmlDOM));
    }
}

/**
 * 把一批业务对象转成xml节点
 * @returns
 */
function bizObjsToXmlNode(xmlDOM,bizes,tagName,parentNode){
	for(var i in bizes){
    	var biz = bizes[i];
    	var bizNode = xmlDOM.createElement(tagName);
    	var modelNode = xmlDOM.createElement('model');
    	var viewNode = xmlDOM.createElement('view');
    	for(var prop in biz.model){
    		propNode = xmlDOM.createElement(prop);
    		textNode = xmlDOM.createTextNode(biz.model[prop]);
    		propNode.appendChild(textNode);
    		modelNode.appendChild(propNode);
    	}
    	for(var prop in biz.view){
    		propNode = xmlDOM.createElement(prop);
    		textNode = xmlDOM.createTextNode(biz.view[prop]);
    		propNode.appendChild(textNode);
    		viewNode.appendChild(propNode);
    	}
    	bizNode.appendChild(modelNode);
    	bizNode.appendChild(viewNode);
    	parentNode.appendChild(bizNode);
    }
}

/**
 * 创建 XMLDOM
 * @returns xmlDOM
 */
function createXMLDOM() {
    var xmlDOM;
    if (window.ActiveXObject) {
        xmlDOM = new ActiveXObject('Microsoft.XMLDOM');
    } else if (document.implementation
            && document.implementation.createDocument) {
        xmlDOM = document.implementation.createDocument('', '', null);
    } else {
        alert('您的浏览器不支持文档对象XMLDOM');
        return;
    }
    return xmlDOM;
}

/**
 * 把XMLDOM解析成字符串
 * @param xmlDOM
 * @returns
 */
function parserXMLToString(xmlDOM) {
    if (window.ActiveXObject) {
        return xmlDOM.xml;
    } else if (document.implementation
            && document.implementation.createDocument) {
        return new XMLSerializer().serializeToString(xmlDOM);
    }
}

/**
 * 把xml格式化一下
 * @param xml
 * @returns
 */
function xmlFormat(xml){
	if(!xml){
		return xml;
	}
	xml = $.trim(xml);
	var prefix = '';
	if(xml.indexOf('<?xml')!=0){
		prefix = '<?xml version="1.0" encoding="UTF-8"?>\n\n';
	}
	var sp = 0;//缩进
	var preTagName = ''; //上次循环处理的TagName
	var preStartTagFlage = false;//true为 <tag> false 为 </tag>,null为 <tag/>. 
	var index = xml.indexOf('<',0);
	while(index>=0){
		//console.log(index+"  char At(index+1):"+xml.charAt(index+1));
		var tagEndIndex = xml.indexOf('>',index+1);
		//console.log("end Tag index:"+tagEndIndex);
		var tagName = xml.substring(index+1,tagEndIndex);
		//console.log("tagName:"+tagName);
		var startTagFlage = false;
		if(tagName.charAt(0)=='/'){
			//需要出栈
			console.log("出栈.");
			startTagFlage = false;
			tagName = tagName.substring(1); 
		}else if(tagName.charAt(tagName.length-1)=='/'){
			//不出栈也不入栈
			console.log("不出栈也不入栈.");
			startTagFlage = null;
			tagName = tagName.substring(0,tagName.length-1); 
		}else{
			console.log("入栈.");
			//需要入栈
			startTagFlage = true;
		}
		console.log("tagName:"+tagName);
		if(startTagFlage==null){
			//要换行，
			//sp+=2;
		}else if(!startTagFlage ){
			sp -= 2;
			//上次为入栈且处理的标签是一样的。
			if(preStartTagFlage && preTagName == tagName){
				//不用换行处理
				index = xml.indexOf('<',index+1);
				continue;
			}
			
		}else if(startTagFlage){
			//不处理后续再处理。
		}
		//在index位置插入一个换行符和若干个空格
		//console.log("sp:"+sp);
		var spaces = '';
		for(var i=0;i<sp;i++){
			spaces += ' ';
		}
		xml = xml.substring(0,index)+'\n'+spaces+xml.substring(index);
		if(startTagFlage){
			sp += 2;
		}
		//console.log('xml:'+xml);
		//if(index<=2500)
		//	break;
		preTagName = tagName;
		preStartTagFlage = startTagFlage;
		index += ((sp>0?sp:0)+1);
		index = xml.indexOf('<',index+1);
	}
	
	return prefix+xml;
}

