// ==UserScript==
// @name         免登录下载天翼云盘分享文件
// @namespace    https://github.com/Aruelius/Cloud189_Greasyfork/
// @version      0.3
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
            let saveAs = document.getElementsByClassName("btn btn-save-as")[0].innerText;
            if (!document.getElementsByClassName("file-info")[0].innerText.split("\n")[3]){
                let title = document.getElementsByClassName("file-info")[0].innerText.split("\n")[0].split(" ")[0];
                console.log(title);
                if(saveAs == "转存当前目录"){
                    let cookie_name = "shareId_"+_shareId;
                    let passcode = get_code(cookie_name);
                    get_download_url(passcode);
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
        }
    };
    function get_download_url(passcode){
        let urlArray = new Array();
        let url = "https://cloud.189.cn/v2/listShareDir.action?shareId="+_shareId+"&accessCode="+passcode+"&verifyCode="+_verifyCode+"&orderBy=1&order=ASC&pageNum=1&pageSize=60";
        fetch(url, {
            method: "GET"
        })
        .then(response => response.json())
        .then(data => {
            for(let i in data.data){
                let download_url = "https:"+data.data[i].downloadUrl;
                urlArray[i] = download_url;
                    console.log(download_url);
                    document.getElementsByClassName("file-icon")[i].onclick=function(){
                        window.open(download_url);
                    };
            };
            return urlArray;
        });
    };
    main(1000);
})();};