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
	var sp = 2;//缩进
	var index = xml.indexOf('<',1);
	while(index>0){
		console.log(index+"  char At(index+1):"+xml.charAt(index+1));
		if(xml.charAt(index+1)=='/'){
			sp -= 2;
			if(xml.charAt(index-1)!='>'){
				//不用换行处理
				index = xml.indexOf('<',index+1);
				continue;
			}
		}else{
			sp += 2;
		}
		//在index位置插入一个换行符和若干个空格
		var spaces = '';
		for(var i=0;i<sp;i++){
			spaces += ' ';
		}
		xml = xml.substr(0,index)+'\n'+spaces+xml.substr(index);
		console.log('xml:'+xml);
		index += (sp+1);
		index = xml.indexOf('<',index+1);
	}
	
	return prefix+xml;
}

