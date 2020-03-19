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
        
        bizObjsToXmlNode(flModel.activities,'actibity',actsNode);
        
        //创建结果节点
        var opersNode = xmlDOM.createElement('operations');
        flowNode.appendChild(opersNode);
        
        bizObjsToXmlNode(flModel.operations,'operation',opersNode);
        
        //创建后续节点
        var subseqsNode = xmlDOM.createElement('subsequents');
        flowNode.appendChild(subseqsNode);
        
        bizObjsToXmlNode(flModel.subsequents,'subsequent',subseqsNode)
        
        //创建结果节点.
        
        return parserXMLToString(xmlDOM);
    }
}

/**
 * 把一批业务对象转成xml节点
 * @returns
 */
function bizObjsToXmlNode(bizes,tagName,parentNode){
	for(var i in bizes){
    	var biz = bizes[i];
    	var bizNode = xmlDOM.createElement(tagName);
    	var modelNode = xmlDOM.createElement('model');
    	var viewNode = xmlDOM.createElement('view');
    	for(var prop in act.model){
    		propNode = xmlDOM.createElement(prop);
    		textNode = xmlDOM.createTextNode(act.model[prop]);
    		propNode.appendChild(textNode);
    		modelNode.appendChild(propNode);
    	}
    	for(var prop in act.view){
    		propNode = xmlDOM.createElement(prop);
    		textNode = xmlDOM.createTextNode(act.view[prop]);
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

