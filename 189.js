// ==UserScript==
// @name         免登录下载天翼云盘分享文件
// @namespace    https://github.com/Aruelius/Cloud189_Greasyfork
// @namespace    https://greasyfork.org/en/scripts/401709
// @version      0.5
// @description  可以让你不登录天翼云盘也可以下载分享的文件，当分享的内容为目录时，需要单独点击文件下载，当分享的内容为单个文件时，直接点击下载按钮
// @author       Aruelius
// @include      https://cloud.189.cn/t/*
// @match        https://cloud.189.cn/t/*
// @grant        none
// ==/UserScript==
window.onload = function(){
(function() {
    'use strict';
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    };
    async function main(ms) {
        while(true){
            if(document.cookie.indexOf("COOKIE_LOGIN_USE") != -1){
                break;
            };
            if (!document.getElementsByClassName("file-info")[0].innerText.split("\n")[3]){
                let saveAs = document.getElementsByClassName("btn btn-save-as")[0].innerText;
                let title = document.getElementsByClassName("file-info")[0].innerText.split("\n")[0].split(" ")[0];
                console.log(title);
                if(saveAs == "转存当前目录"){
                    let cookie_name = "shareId_"+_shareId;
                    let passcode = get_code(cookie_name);
                    await get_download_url(passcode);
                    break;
                }
                else if(saveAs == "转存到云盘"){
                    document.getElementsByClassName("btn btn-download")[0].target = "_blank";
                    document.getElementsByClassName("btn btn-download")[0].href = downloadUrl;
                    document.getElementsByClassName("btn btn-download")[0].className = "btn btn-download download";
                    break;
                };
            };
            await sleep(ms);
        }
    };
    function get_code(cookie_name) {
        let ck = document.cookie.split(';');
        for(let i=0; i<ck.length; i++){
            let cookie = ck[i].trim();
            if(cookie.indexOf(cookie_name)==0){
                return cookie.split('=')[1];
            }
        };
    };
    async function set_url(fileBox){
        while (true) {
            for (let i=0; i<document.getElementsByClassName("file-name").length; i++) {
                let fileName = document.getElementsByClassName("file-name")[i].innerText;
                if (fileName && !document.getElementsByClassName("file-icon mfile-icons-folder")[i]) {
                    document.getElementsByClassName("file-name")[i].href = fileBox[fileName];
                    document.getElementsByClassName("open-link")[i].href = fileBox[fileName];
                    for (let i=0; i<document.getElementsByClassName("play").length; i++) {
                        document.getElementsByClassName("play")[i].href = fileBox[fileName];
                    }
                }
            };
            await sleep(1000);
        };
    };
    var fileBox = {};
    async function get_folder (fileId) {
        (async ()=>{
            var url = "https://cloud.189.cn/v2/listShareDir.action?fileId=" + fileId +"&shareId=" + _shareId + "&accessCode=undefined&verifyCode=" + _verifyCode + "&orderBy=1&order=ASC&pageNum=1&pageSize=60";
            let res = await (await fetch(url, {method: "GET"})).json();
            for (let _ in res.data) {
                var item = res.data[_];
                if (item.isFolder) {
                    await get_folder(item.fileId);
                }
                else {
                    fileBox[item.fileName] = item.downloadUrl;
                };
            };
        })();
    };
    async function get_download_url(passcode){
        let url = "https://cloud.189.cn/v2/listShareDir.action?shareId="+_shareId+"&accessCode="+passcode+"&verifyCode="+_verifyCode+"&orderBy=1&order=ASC&pageNum=1&pageSize=60";
        (async ()=>{
            let data = await (await fetch(url, {method: "GET"})).json();
            for(let i in data.data){
                var item = data.data[i];
                if (item.isFolder) {
                    await get_folder(item.fileId);
                }
                else {
                    fileBox[item.fileName] = item.downloadUrl;
                };
            };
            console.log(fileBox);
            await set_url(fileBox);
        })();
    };
    main(1000);
})();};