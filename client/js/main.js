/*
 * mx main app script
 * 
 * @version 1.31
 * @author MPI
 */

(function() {
    var mx = mx || {};

    mx.PAGE = "index";
    mx.RPAGE = "";
    mx.LOGIN = false;
    mx.CACHE = null;
    mx.SPINNER = null;
    mx.SE_CLICK_ORDER = 0;
    mx.SE_CHANGES = false;

    mx.init = function() {
        $("body").on("click", function(e) {
            // handle btn-menu click
            if (e.target.nodeName == "BUTTON" && e.target.id == "btn-menu") {
                mx.btnMenuHandler();
                return;
            }

            // handle navbar click
            if (e.target.nodeName == "A" && /^nv-/.test(e.target.id)) {
                mx.PAGE = e.target.id.substr(3);
                mx.PAGE = mx.PAGE == "home" ? "index" : mx.PAGE;
                mx.navbarHandler(mx.PAGE);
                return;
            }
            
            // handle alert close click
            if (e.target.nodeName == "DIV" && /^alert/.test(e.target.className)) {
                $(e.target).hide();
                return;
            }

            // handle clicks on pg-* containers
            switch (mx.PAGE) {
                case "index":
                    mx.indexHandler(e);
                    break;
                case "login":
                    mx.loginHandler(e);
                    break;
                case "events":
                    mx.eventsHandler(e);
                    break;
                case "scorecard-edit":
                    mx.scorecardEditHandler(e);
                    break;
                case "scorecard-history":
                    mx.scorecardHistoryHandler(e);
                    break;
                case "scorecard-upload":
                    mx.scorecardUploadHandler(e);
                    break;
                case "cache-clear":
                    mx.cacheClearHandler(e);
                    break;
                default:
                    return;
            }
            
            // close menu
            if ($("#navbar").css("display") == "block") {
                mx.btnMenuHide();
            }
        });

        $("body").on("keyup", function(e) {
            // handle login-form change
            if (e.target.nodeName == "INPUT" 
                && (e.target.id == "username" || e.target.id == "password")) {
                mx.validateLoginInput();
                return;
            }
        });
        
        mx.restoreStorageCache();
        mx.restoreClickOrder();
        mx.loadPage(mx.PAGE);
    };
    
    /* 
     * Navbar menu handlers 
     * 
     * */
    mx.navbarHandler = function(page) {
        mx.loadPage(page);
        mx.btnMenuHide();
    };

    mx.btnMenuHandler = function() {
        var navbar = $("#navbar");
        if (navbar.css("display") == "" || navbar.css("display") == "none") {
            mx.btnMenuShow();
        } else {
            mx.btnMenuHide();
        }
    };

    /* 
     * Page handlers 
     * 
     * */
    mx.indexHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && e.target.id == "btn-i-reop") {
            mx.PAGE = "scorecard-edit";
            mx.loadPage(mx.PAGE);
            return;
        } else if(e.target.nodeName == "BUTTON" && e.target.id == "btn-i-down"){
            mx.PAGE = "events";
            mx.loadPage(mx.PAGE);
            return;
        }
    };

    mx.loginHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && e.target.id == "btn-login") {
            if (mx.validateLoginInput()) {
                mx.startLoader();
                var username = $("#username"), password = $("#password");
                $({
                    username : username.val(),
                    password : password.val()
                }).ajax(
                        "../server/?action=login",
                        "POST",
                        function(r, status) {
                            if(status == 200){
                                r = JSON.parse(r);
                                if (r.status == 200) {
                                    mx.LOGIN = true;
                                    mx.PAGE = mx.RPAGE != "" ? mx.RPAGE : "index";
                                    mx.RPAGE = "";
                                    mx.loadPage(mx.PAGE);
                                } else {
                                    mx.LOGIN = false;
                                    mx.styleLoginInput(false,
                                            username[0].parentNode);
                                    mx.styleLoginInput(false,
                                            password[0].parentNode);
                                }
                            }else{
                                mx.setAlert("alert-danger", "Connection failed.");
                            }
                            mx.stopLoader();
                        }, true);
            }
        }
    };

    mx.eventsHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && e.target.id == "btn-download") {
            var select = $("#sel-events")[0];
            var selectedId = parseInt(select[select.selectedIndex].value);
            if(selectedId > 0){
                mx.startLoader();
                $({eid:selectedId}).ajax(
                        "../server/?action=getEvent",
                        "GET",
                        function(r, status) {
                            if(status == 200){
                                var ts = mx.getNowTimestamp();
                                r = JSON.parse(r);
                                if (r.status == 200) {
                                    mx.CACHE = r.data;
                                    mx.CACHE["ts-cli-rx"] = ts;
                                    mx.saveStorageCache();
                                    mx.SE_CHANGES = false;
                                    mx.SE_CLICK_ORDER = 0;
                                    mx.PAGE = "scorecard-edit";
                                    mx.loadPage(mx.PAGE);
                                    mx.setAlert("alert-success", "Event saved to local.");
                                } else if (r.status == 401) {
                                    mx.RPAGE = "events";
                                    mx.PAGE = "login";
                                    mx.loadPage(mx.PAGE);
                                } else {
                                    mx.setAlert("alert-danger", "Connection failed.");
                                }
                            } else{
                                mx.setAlert("alert-danger", "Connection failed.");
                            }
                            mx.stopLoader();
                        }, true);
            }
        }
    };

    mx.scorecardEditHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && /^btn-click-/.test(e.target.id)) {
            var index = parseInt(e.target.id.substr(10));
            if(index >=0 && index < mx.CACHE.scorecard.length){
                var btn = $(e.target);
                if(mx.CACHE.scorecard[index].pp == null && btn.cls("btn-primary", "has")){
                    mx.SE_CLICK_ORDER++;
                    mx.CACHE.scorecard[index].pp = mx.SE_CLICK_ORDER;
                    mx.CACHE.scorecard[index].pt = mx.getNowTimestamp();
                    mx.SE_CHANGES = true;
                    mx.styleSeBtnSave(mx.SE_CHANGES);
                    mx.styleSeBtnBack((mx.SE_CLICK_ORDER > 0));
                    mx.styleSeBtnRst((mx.SE_CLICK_ORDER > 0));
                    mx.styleClickTableBtn("#btn-click-" + index, ["btn-default", "disabled"]);
                } else if(mx.CACHE.scorecard[index].pp != null && btn.cls("btn-success", "has")){
                    var tmp = mx.CACHE.scorecard[index].pp;
                    mx.CACHE.scorecard[index].pp = null;
                    mx.CACHE.scorecard[index].pt = null;
                    mx.recalcClickOrder(tmp);
                    mx.SE_CLICK_ORDER--;
                    mx.SE_CHANGES = true;
                    mx.styleSeBtnSave(mx.SE_CHANGES);
                    mx.styleSeBtnBack((mx.SE_CLICK_ORDER > 0));
                    mx.styleSeBtnRst((mx.SE_CLICK_ORDER > 0));
                    mx.syncCacheClickTableBtns();
                }
            }
            return;
        } else if (e.target.nodeName == "BUTTON" && /^btn-se-(back|rst|save)$/.test(e.target.id)) {
            switch(e.target.id){
                case "btn-se-back":
                    var index = mx.getClickOrderCachePosition(mx.SE_CLICK_ORDER);
                    if(index >=0 && index < mx.CACHE.scorecard.length){
                        mx.CACHE.scorecard[index].pp = null;
                        mx.CACHE.scorecard[index].pt = null;
                        mx.SE_CLICK_ORDER--;
                        mx.SE_CHANGES = true;
                        mx.styleSeBtnSave(mx.SE_CHANGES);
                        mx.styleSeBtnBack((mx.SE_CLICK_ORDER > 0));
                        mx.styleSeBtnRst((mx.SE_CLICK_ORDER > 0));
                        mx.syncCacheClickTableBtns();
                    }
                    break;
                case "btn-se-rst":
                    mx.enableResetBtns(true);
                    mx.styleSeBtnBack(false);
                    mx.styleSeBtnRst(false);
                    mx.styleSeBtnSave(false);
                    break;
                case "btn-se-save":
                    mx.saveStorageCache();
                    mx.SE_CHANGES = false;
                    mx.styleSeBtnSave(mx.SE_CHANGES);
                    mx.styleSeBtnBack((mx.SE_CLICK_ORDER > 0));
                    mx.styleSeBtnRst((mx.SE_CLICK_ORDER > 0));
                    break;
            }
            return;
        }
    };
    
    mx.scorecardHistoryHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && /^btn-sh-back$/.test(e.target.id)) {
            mx.PAGE = "scorecard-edit";
            mx.loadPage(mx.PAGE);
        }
    };
    
    mx.scorecardUploadHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && /^btn-su-(save|up|reop)$/.test(e.target.id)) {
            switch(e.target.id){
                case "btn-su-save":
                    mx.saveStorageCache();
                    mx.SE_CHANGES = false;
                    mx.PAGE = "scorecard-upload";
                    mx.loadPage(mx.PAGE);
                    break;
                case "btn-su-up":
                    if(mx.SE_CHANGES == false){
                        mx.restoreStorageCache();
                        mx.getLocation();
                    }
                    break;
                case "btn-su-reop":
                    mx.PAGE = "scorecard-edit";
                    mx.loadPage(mx.PAGE);
                    break;
            }
            return;
        }
    };
    
    mx.cacheClearHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && e.target.id == "btn-cc-confirm") {
            mx.clearStorageCache();
            mx.CACHE = null;
            mx.PAGE = "cache-clear";
            mx.loadPage(mx.PAGE);
            mx.setAlert("alert-success", "Local cache was cleared.");
            return;
        }else if (e.target.nodeName == "BUTTON" && (e.target.id == "btn-cc-home" || e.target.id == "btn-cc-index")) {
            mx.PAGE = "index";
            mx.loadPage(mx.PAGE);
            return;
        }
    };
    
    /* 
     * Page loaders 
     * 
     * */
    mx.loadPage = function(page) {
        $("div[id^=pg-]").cls("hide", "remove");
        $("div[id^=pg-]").cls("hide", "add");
        $("#pg-" + page).cls("hide", "remove");
        if(page != "login"){
            $("#navbar li").cls("active", "remove");
            ($("#nv-"+page))[0].parentNode.className = "active";
        }
        mx.stopLoader();
        
        // onload page handler
        switch (page) {
            case "index":
                mx.indexLoader();
                break;
            case "login":
                mx.loginLoader();
                break;
            case "events":
                mx.eventsLoader();
                break;
            case "scorecard-edit":
                mx.scorecardEditLoader();
                break;
            case "scorecard-history":
                mx.scorecardHistoryLoader();
                break;
            case "scorecard-upload":
                mx.scorecardUploadLoader();
                break;
            case "cache-clear":
                mx.cacheClearLoader();
                break;
        }
    };
    
    mx.indexLoader = function() {
        if(mx.CACHE != null){
            $("#cont-i-reopen").show();
            $("#cont-i-download").hide();
            $("#sp-i-reop-etitle").html(mx.CACHE.name + " (" + mx.CACHE.station + ")");
        } else{
            $("#cont-i-reopen").hide();
            $("#cont-i-download").show();
        }
    };
    
    mx.loginLoader = function() {
        $("#username").val("");
        $("#password").val("");
        mx.validateLoginInput();
        return;
    };
    
    mx.eventsLoader = function() {
        $("#sel-events").html("<option value=\"0\">none</option>");
        $().ajax(
                "../server/?action=getEventList",
                "GET",
                function(r, status) {
                    if(status == 200){
                        r = JSON.parse(r);
                        if (r.status == 200) {
                            var s = "";
                            for (var i = 0; i < r.data.length; i++) {
                                s += "<option value=" + r.data[i].id + ">" + r.data[i].name + "</option>";
                            }
                            s += "<option value=\"0\">none</option>";
                            $("#sel-events").html(s);
                            mx.btnDisable(false, "#btn-download");
                        } else if (r.status == 401) {
                            mx.RPAGE = "events";
                            mx.PAGE = "login";
                            mx.loadPage(mx.PAGE);
                        } else {
                            mx.setAlert("alert-danger", "Connection failed.");
                        }
                    } else{
                        mx.setAlert("alert-danger", "Connection failed.");
                    }
                }, true);
    };
    
    mx.scorecardEditLoader = function() {
        $("#cont-se-title").html(" ");
        $("#cont-se-clicker").html(" ");
        if(mx.CACHE == null){
            mx.setAlert("alert-danger", "Empty local cache.");
            mx.SE_CHANGES = false;
            mx.SE_CLICK_ORDER = 0;
        }else{
            $("#cont-se-title").html(mx.CACHE.name + " (" + mx.CACHE.station + ")");
            var now = mx.getDateFromTimestamp(mx.getNowTimestamp()).getTime(),
                start = mx.getDateFromTimestamp(mx.CACHE["ts-ev-start"]).getTime(),
                end = mx.getDateFromTimestamp(mx.CACHE["ts-ev-end"]).getTime(),
                srvTx = mx.getDateFromTimestamp(mx.CACHE["ts-srv-tx"]).getTime(),
                cliRx = mx.getDateFromTimestamp(mx.CACHE["ts-cli-rx"]).getTime(),
                delay = cliRx - srvTx;
            start += delay;
            end += delay;
            if(now >= start && now <= end){
                mx.drawClickTable();
            } else{
                mx.setAlert("alert-danger", "Event is time blocked.");
                $("#cont-se-clicker").html("<div id=\"se-time-restriction\">"
                        + "<p>You can edit this event in time range</p>" 
                        + "<p class=\"p-se-date\">" + mx.CACHE["ts-ev-start"] + "</p>"
                        + "<p class=\"p-se-date\">" + mx.CACHE["ts-ev-end"] + "</p>"
                        + "</div>");
                mx.SE_CHANGES = false;
                mx.SE_CLICK_ORDER = 0;
            }
        }
        mx.styleSeBtnSave(mx.SE_CHANGES);
        mx.styleSeBtnBack((mx.SE_CLICK_ORDER > 0));
        mx.styleSeBtnRst((mx.SE_CLICK_ORDER > 0));
    };
    
    mx.scorecardHistoryLoader = function() {
        $("#cont-sh-order").html(" ");
        if(mx.CACHE == null){
            mx.setAlert("alert-danger", "Empty local cache.");
            return;
        }else{
            var sc = mx.CACHE.scorecard.slice(0), 
                end = 0;
            sc.sort(function(a,b){
                return b.pp - a.pp;
            });
            for(var i = 0; i < sc.length; i++){
                if(sc[i].pp != null){
                    end++;
                } else{
                    break;
                }
            }
            sc = sc.slice(0,end);
            mx.drawHistoryTable(sc);
        }
    };
    
    mx.scorecardUploadLoader = function() {
        if(mx.CACHE == null){
            $("#cont-su-upload").hide();
            $("#cont-su-save").hide();
            mx.setAlert("alert-danger", "Empty local cache.");
        }else{
            if(mx.SE_CHANGES){
                $("#cont-su-save").show();
                $("#cont-su-upload").hide();
            }else{
                $("#cont-su-save").hide();
                $("#cont-su-upload").show();
            }
        }
    };
    
    mx.cacheClearLoader = function() {
        if(mx.CACHE != null){
            $("#cont-cc-nemtpy").show();
            $("#cont-cc-emtpy").hide();
        } else{
            $("#cont-cc-nemtpy").hide();
            $("#cont-cc-emtpy").show();
        }
    };
    
    /* 
     * Tools
     * 
     *  */
    mx.getViewport = function() {
        var e = window, a = "inner";
        if (!("innerWidth" in window )) {
            a = "client";
            e = document.documentElement || document.body;
        }
        return {width : e[a+"Width"], height : e[a+"Height"]};
    }
    
    mx.getDateFromTimestamp = function(ts){
        var n = ts.match(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2})\:(\d{2})\:(\d{2})$/);
        var r = new Date();
        r.setUTCFullYear(n[1]);
        r.setUTCMonth(n[2]-1);
        r.setUTCDate(n[3]);
        r.setUTCHours(n[4],n[5],n[6],0);
        return r;
    };
    
    mx.drawHistoryTable = function(data){
        var table = document.createElement("TABLE"),
            thead = document.createElement("THEAD"),
            tbody = document.createElement("TBODY");
        table.id = "historyTable";
        table.className = "table";

        var tr = document.createElement("TR"),
            th_s = document.createElement("TH"),
            th_t = document.createElement("TH");
        th_s.innerHTML = "Num.";
        th_t.innerHTML = "Time";
        tr.appendChild(th_s);
        tr.appendChild(th_t);
        thead.appendChild(tr);
        
        for (var i = 0; i < data.length; i++) {
            var tr = document.createElement("TR"),
                td_s = document.createElement("TD"),
                td_t = document.createElement("TD"),
                cont_s = document.createTextNode(data[i].sn),
                cont_t = document.createTextNode(data[i].pt);
            td_s.className = "col-0";
            td_t.className = "col-1";
            td_s.appendChild(cont_s);
            td_t.appendChild(cont_t);
            tr.appendChild(td_s);
            tr.appendChild(td_t);
            tbody.appendChild(tr);
        }
        table.appendChild(thead);
        table.appendChild(tbody);
        document.getElementById("cont-sh-order").appendChild(table);
    };
    
    mx.uploadCacheString = function(){
        var cacheString = mx.getStorageCacheString();
        if(cacheString !== false){
            $({
                data : cacheString
            }).ajax(
                    "../server/?action=updateEvent",
                    "POST",
                    function(r, status) {
                        if(status == 200){
                            r = JSON.parse(r);
                            if (r.status == 200) {
                                mx.CACHE = null;
                                mx.clearStorageCache();
                                mx.SE_CHANGES = false;
                                mx.SE_CLICK_ORDER = 0;
                                mx.PAGE = "index";
                                mx.loadPage(mx.PAGE);
                                mx.setAlert("alert-success", "Event uploaded to server.");
                            } else if (r.status == 401) {
                                mx.RPAGE = "scorecard-upload";
                                mx.PAGE = "login";
                                mx.loadPage(mx.PAGE);
                            } else {
                                mx.setAlert("alert-danger", "Connection failed.");
                            }
                        }else{
                            mx.setAlert("alert-danger", "Connection failed.");
                        }
                        mx.stopLoader();
                    }, true);
        }
    };
    
    mx.getLocation = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(mx.saveLocation, mx.errorLocation);
        } else {
            mx.setAlert("alert-danger", "Geolocation is not supported.");
        }
    };
    
    mx.saveLocation = function(position) {
        mx.CACHE.gps.lat = position.coords.latitude;
        mx.CACHE.gps.lng = position.coords.longitude;
        mx.CACHE.gps.alt = position.coords.altitude;
        mx.CACHE.gps.ts = position.timestamp;
        mx.saveStorageCache();
        mx.uploadCacheString();
    };
    
    mx.errorLocation = function(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                mx.setAlert("alert-danger", "User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                mx.setAlert("alert-danger", "Location information is unavailable.");
                break;
            case error.TIMEOUT:
                mx.setAlert("alert-danger", "The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                mx.setAlert("alert-danger", "An unknown error occurred.");
                break;
        }
    };
    
    mx.getNowTimestamp = function(){
        var ts = new Date();
        ts = ts.toISOString();
        ts = ts.substr(0,10)+" "+ts.substr(11,8);
        return ts;
    };
    
    mx.getClickOrderCachePosition = function(orderValue){
        if(mx.CACHE.scorecard != null){
            for (var i = 0; i < mx.CACHE.scorecard.length; i++) {
                if(mx.CACHE.scorecard[i].pp == orderValue){
                    return i;
                }
            }
            return -1;
        }
    };
    
    mx.styleSeBtnBack = function(isEnabled) {
        if (isEnabled) {
            $("#btn-se-back").cls("disabled", "remove");
        } else {
            $("#btn-se-back").cls("disabled", "remove");
            $("#btn-se-back").cls("disabled", "add");
        }
    };
    
    mx.styleSeBtnRst = function(isEnabled) {
        if (isEnabled) {
            $("#btn-se-rst").cls("disabled", "remove");
        } else {
            $("#btn-se-rst").cls("disabled", "remove");
            $("#btn-se-rst").cls("disabled", "add");
        }
    };
    
    mx.recalcClickOrder = function (excludedValue) {
        if(mx.CACHE.scorecard != null){
            for (var i = 0; i < mx.CACHE.scorecard.length; i++) {
                if(mx.CACHE.scorecard[i].pp > excludedValue){
                    mx.CACHE.scorecard[i].pp--;
                }
           }
        }
    }
    
    mx.enableResetBtns = function(enabled) {
        for (var i = 0; i < mx.CACHE.scorecard.length; i++) {
            if(enabled){
                if (mx.CACHE.scorecard[i].pp != null) {
                    mx.styleClickTableBtn("#btn-click-" + i, ["btn-success"]);
                } else {
                    mx.styleClickTableBtn("#btn-click-" + i, ["btn-default", "disabled"]);
                }
            } else {
                if (mx.CACHE.scorecard[i].pp != null) {
                    mx.styleClickTableBtn("#btn-click-" + i, ["btn-default", "disabled"]);
                } else {
                    mx.styleClickTableBtn("#btn-click-" + i, ["btn-primary"]);
                }
            }
        }
    }
    
    mx.syncCacheClickTableBtns = function () {
        if(mx.CACHE.scorecard != null){
            for (var i = 0; i < mx.CACHE.scorecard.length; i++) {
                var enabled = (mx.CACHE.scorecard[i].pp == null);
                mx.styleClickTableBtn("#btn-click-" + i, [(enabled ? "" : "disabled"), (enabled ? "btn-primary" : "btn-default")]);
           }
        }
    }
    
    mx.styleClickTableBtn = function(selector, addClass){
        var btn = $(selector);
        btn.cls("btn-default", "remove");
        btn.cls("btn-primary", "remove");
        btn.cls("btn-success", "remove");
        btn.cls("disabled", "remove");
        
        for(var i = 0; i < addClass.length; i++){
            btn.cls(addClass[i], "add");
        }
    }
    
    mx.restoreClickOrder = function(){
        mx.SE_CLICK_ORDER = mx.getLastClickOrder();
    };
    
    mx.getLastClickOrder = function() {
        var max = 0;
        if(mx.CACHE != null){
            for(var i = 0; i<mx.CACHE.scorecard.length; i++){
                if(mx.CACHE.scorecard[i].pp > max){
                    max = mx.CACHE.scorecard[i].pp;
                }
            }
        }
        return max;
    }
    
    mx.styleSeBtnSave = function(isEnabled) {
        if (isEnabled) {
            $("#btn-se-save").cls("disabled", "remove");
            $("#btn-se-save").cls("btn-default", "remove");
            $("#btn-se-save").cls("btn-danger", "add");
        } else {
            $("#btn-se-save").cls("disabled", "remove");
            $("#btn-se-save").cls("btn-danger", "remove");
            $("#btn-se-save").cls("disabled", "add");
            $("#btn-se-save").cls("btn-default", "add");
        }
    };
    
    mx.drawClickTable = function(){
        var table = document.createElement("TABLE");
        table.id = "clickTable";
        table.style.width = "100%";
        
        var index = 0;
        var cols = 5 * Math.floor(($("#cont-se-clicker"))[0].clientWidth/300);
        cols = (cols <= 0) ? 5 : cols;
        var rows = Math.ceil(mx.CACHE.scorecard.length / cols);
        for (var i = 0; i < rows; i++) {
            var tr = document.createElement("TR");
            for (var j = 0; j < cols; j++, index++) {
                var td = document.createElement("TD");
                td.style.padding = "5px";
                if (mx.CACHE.scorecard[index]) {
                    var btnDisabled = (mx.CACHE.scorecard[index].pp == null) ? "" : "disabled";
                    var btnClass = (mx.CACHE.scorecard[index].pp == null) ? "btn-primary" : "btn-default";
                    var content = document.createTextNode(mx.CACHE.scorecard[index].sn);
                    var btn = document.createElement("BUTTON");
                    btn.id = "btn-click-" + index;
                    btn.className = "btn btn-lg " + btnClass + " " + btnDisabled;
                    btn.style.width = "100%";
                    btn.appendChild(content);
                    td.appendChild(btn);
                } 
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        document.getElementById("cont-se-clicker").appendChild(table);
    };
    
    mx.setAlert = function(className, message){
        var alertbox = $("#alert-box");
        alertbox.cls("alert-success", "remove");
        alertbox.cls("alert-info", "remove");
        alertbox.cls("alert-warning", "remove");
        alertbox.cls("alert-danger", "remove");
        alertbox.cls(className, "add");
        alertbox.html(message);
        alertbox.show();
        window.setTimeout(function(){
            alertbox.hide();
        }, 3000);
    };
    
    mx.getStorageCacheString = function(){
        if (typeof(Storage) != "undefined") {
            return localStorage.getItem("mxCache");
        } else {
            mx.setAlert("alert-danger", "Storage cache not supported.");
        }
        return false;
    };
    
    mx.saveStorageCache = function(){
        if (typeof(Storage) != "undefined") {
            localStorage.setItem("mxCache", JSON.stringify(mx.CACHE));
        } else {
            mx.setAlert("alert-danger", "Storage cache not supported.");
        }
    };
    
    mx.restoreStorageCache = function(){
        if (typeof(Storage) != "undefined") {
            mx.CACHE = JSON.parse(localStorage.getItem("mxCache"));
        } else {
            mx.setAlert("alert-danger", "Storage cache not supported.");
        }
    };
    
    mx.clearStorageCache = function(){
        if (typeof(Storage) != "undefined") {
            localStorage.setItem("mxCache", null);
        } else {
            mx.setAlert("alert-danger", "Storage cache not supported.");
        }
    };
    
    mx.isStorageCacheEmpty = function(){
        if (typeof(Storage) != "undefined" && localStorage.getItem("mxCache") != null) {
            return false;
        } else{
            return true;
        }
    };
    
    mx.startLoader = function(){
        var loader = $("#loader");
        if(mx.SPINNER == null){
            var opts = { 
                    lines: 13,
                    length: 0,
                    width: 10,
                    radius: 30,
                    corners: 1,
                    rotate:0,
                    direction: 1,
                    color: "#000",
                    speed: 1,
                    trail: 60,
                    shadow: false,
                    hwaccel: false,
                    className: "spinner",
                    zIndex: 2e9,
                    top: "50%",
                    left: "50%"
            };
            mx.SPINNER = new Spinner(opts).spin(loader[0]);
        }
        loader.show();
    };
    
    mx.stopLoader = function(){
        var loader = $("#loader");
        loader.hide();
        loader.html(" ");
        mx.SPINNER = null;
    };

    mx.btnMenuShow = function() {
        $("#navbar").show();
        $("#navbar").css("visibility", "visible");
        $("#btn-menu").css("background-color", "#333");
    };

    mx.btnMenuHide = function() {
        $("#navbar").hide();
        $("#navbar").css("visibility", "hidden");
        $("#btn-menu").css("background-color", "inherit");
    };
    
    mx.btnDisable = function(isDisabled, selector){
        if(isDisabled){
            $(selector).cls("disabled", "remove");
            $(selector).cls("disabled", "add");
        } else{
            $(selector).cls("disabled", "remove");
        }
    };

    mx.styleLoginInput = function(isSuccess, parent) {
        if (isSuccess) {
            $(parent).cls("has-success", "remove");
            $(parent).cls("has-error", "remove");
            $(parent).cls("has-success", "add");
        } else {
            $(parent).cls("has-success", "remove");
            $(parent).cls("has-error", "remove");
            $(parent).cls("has-error", "add");
        }
    };

    mx.validateLoginInput = function() {
        var username = $("#username"), password = $("#password"), t = false;
        if (username.val() != "undefined"
                && /^[a-zA-Z0-9,\.-]{5,50}$/.test(username.val())) {
            mx.styleLoginInput(true, username[0].parentNode);
            t = true;
        } else {
            mx.styleLoginInput(false, username[0].parentNode);
            t = false
        }

        if (password.val() != "undefined"
                && /^[a-zA-Z0-9,\.-]{5,50}$/.test(password.val())) {
            mx.styleLoginInput(true, password[0].parentNode);
            t = true;
        } else {
            mx.styleLoginInput(false, password[0].parentNode);
            t = false
        }

        if(t){
            mx.btnDisable(false, "#btn-login");
        } else{
            mx.btnDisable(true, "#btn-login");
        }
        
        return t;
    };
    
    /*
     * Run mx
     * 
     * */
    mx.init();
}());