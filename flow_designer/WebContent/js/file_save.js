/**
 * 本函数用于向本地导出文件。
 * @param content 文件内容
 * @param type 文件类型，取值类似"text/plain;charset=utf-8"
 * @param fileName 文件名
 * @returns
 */
function saveFile(content, type, fileName) {
    var blob;
    if (typeof window.Blob == "function") {
        blob = new Blob([content], {type: type});
    } else {
        var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(content);
        blob = bb.getBlob(type);
    }
    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    if ('download' in anchor) {
        anchor.style.visibility = "hidden";
        anchor.href = bloburl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(anchor.href);
    } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fileName);
    } else {
        location.href = bloburl;
    }
}