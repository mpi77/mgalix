/**
 * mx main app script
 * 
 * @version 1.5
 * @author MPI
 */

(function() {
    var mx = mx || {};

    mx.PAGE = "index";
    mx.LOGIN = false;

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
                case "scorecard":
                    mx.scorecardHandler(e);
                    break;
            }

        });

        $("body").on("change", function(e) {
            // handle login-form change
            if (e.target.nodeName == "INPUT"
                && (e.target.id == "username" || e.target.id == "password")) {
                mx.validateLoginInput();
                return;
            }
        });
    };

    /*
     * var opts = { lines: 13, // The number of lines to draw length: 0, // The
     * length of each line width: 10, // The line thickness radius: 30, // The
     * radius of the inner circle corners: 1, // Corner roundness (0..1) rotate:
     * 0, // The rotation offset direction: 1, // 1: clockwise, -1:
     * counterclockwise color: '#000', // #rgb or #rrggbb or array of colors
     * speed: 1, // Rounds per second trail: 60, // Afterglow percentage shadow:
     * false, // Whether to render a shadow hwaccel: false, // Whether to use
     * hardware acceleration className: 'spinner', // The CSS class to assign to
     * the spinner zIndex: 2e9, // The z-index (defaults to 2000000000) top:
     * '50%', // Top position relative to parent left: '50%' // Left position
     * relative to parent }; var target = document.getElementById('pg-index');
     * var spinner = new Spinner(opts).spin(target);
     */

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

    mx.indexHandler = function(e) {
        return;
    };

    mx.loginHandler = function(e) {
        if (e.target.nodeName == "BUTTON" && e.target.id == "btn-login") {
            if (mx.validateLoginInput()) {
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
                                mx.PAGE = "index";
                                mx.loadPage(mx.PAGE);
                            } else {
                                mx.LOGIN = false;
                                mx.styleLoginInput(false,
                                        username[0].parentNode);
                                mx.styleLoginInput(false,
                                        password[0].parentNode);
                            }
                        }, true);
            }
        }
    };

    mx.eventsHandler = function(e) {
        return;
    };

    mx.scorecardHandler = function(e) {
        return;
    };

    mx.loadPage = function(page) {
        $("div[id^=pg-]").cls("hide", "remove");
        $("div[id^=pg-]").cls("hide", "add");
        $("#pg-" + page).cls("hide", "remove");

        // onload page handler
        switch (page) {
            case "index":
                break;
            case "login":
                break;
            case "events":
                $("#pg-events")[0].innerHTML = "";
                $().ajax(
                        "../server/?action=getEventList",
                        "GET",
                        function(r, status) {
                            r = JSON.parse(r);
                            if (r.status == 200) {
                                var s = "<select class=\"form-control\">";
                                for (var i = 0; i < r.data.length; i++) {
                                    s += "<option>" + r.data[i].name
                                            + "</option>";
                                }
                                s += "</select>";
                                $("#pg-events").html(s, "append");
                            } else if (r.status == 401) {
                                mx.PAGE = "login";
                                mx.loadPage(mx.PAGE);
                            } else {
                                alert("error");
                            }
                        }, true);
                break;
            case "scorecard":
                break;
        }
    };

    mx.btnMenuShow = function() {
        $("#navbar").show();
        $("#navbar").css("visibility", "visible");
    };

    mx.btnMenuHide = function() {
        $("#navbar").hide();
        $("#navbar").css("visibility", "hidden");
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

        return t;
    };

    mx.init();
}());