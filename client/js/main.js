/**
 * mx main app script
 * 
 * @version 1.13
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
                        function(data, status) {
                            data = JSON.parse(data);
                            if (data.status == 200) {
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
                            r = JSON.parse(r);
                            if (r.status == 200) {
                                mx.CACHE = r.data;
                                mx.saveStorageCache();
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
                            mx.stopLoader();
                        }, true);
            }
        }
    };

    mx.scorecardEditHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && /^btn-click-/.test(e.target.id)) {
            var index = parseInt(e.target.id.substr(10));
            var btn = $(e.target);
            if(index >= 0 && mx.CACHE.scorecard[index].pp == null && btn.cls("btn-primary", "has")){
                btn.cls("btn-primary", "remove");
                btn.cls("btn-default", "add");
                btn.cls("disabled", "add");
                mx.SE_CHANGES = true;
                mx.styleSeBtnSave(mx.SE_CHANGES);
                mx.SE_CLICK_ORDER++;
                mx.CACHE.scorecard[index].pp = mx.SE_CLICK_ORDER;
            }
            return;
        } else if (e.target.nodeName == "BUTTON" && /^btn-se-(back|corr|save)$/.test(e.target.id)) {
            switch(e.target.id){
                case "btn-se-back":
                    break;
                case "btn-se-corr":
                    break;
                case "btn-se-save":
                    mx.saveStorageCache();
                    mx.SE_CHANGES = false;
                    mx.styleSeBtnSave(mx.SE_CHANGES);
                    break;
            }
            return;
        }
    };
    
    mx.scorecardUploadHandler = function(e) {
        return;
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
                }, true);
    };
    
    mx.scorecardEditLoader = function() {
        $("#cont-se-title").html(" ");
        $("#cont-se-clicker").html(" ");
        if(mx.CACHE == null){
            mx.setAlert("alert-danger", "Empty local cache.");
            return;
        }else{
            $("#cont-se-title").html(mx.CACHE.name + " (" + mx.CACHE.station + ")");
            mx.drawClickTable();
            mx.styleSeBtnSave(mx.SE_CHANGES);
        }
    };
    
    mx.scorecardUploadLoader = function() {
        return;
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
    mx.restoreClickOrder = function(){
        mx.SE_CLICK_ORDER = mx.getLastClickOrder();
    };
    
    mx.getLastClickOrder = function() {
        var max = 0;
        for(var i = 0; i<mx.CACHE.scorecard.length; i++){
            if(mx.CACHE.scorecard[i].pp > max){
                max = mx.CACHE.scorecard[i].pp;
            }
        }
        return max;
    }
    
    mx.styleSeBtnSave = function(isEnabled) {
        if (isEnabled) {
            $("#btn-se-save").cls("disabled", "remove");
        } else {
            $("#btn-se-save").cls("disabled", "remove");
            $("#btn-se-save").cls("disabled", "add");
        }
    };
    
    mx.drawClickTable = function(){
        var table = document.createElement("TABLE");
        table.id = "clickTable";
        table.style.width = "100%";

        var index = 0;
        var cols = 5;
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
    };

    mx.btnMenuHide = function() {
        $("#navbar").hide();
        $("#navbar").css("visibility", "hidden");
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