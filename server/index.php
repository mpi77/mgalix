<?php
/**
 * Index page.
 *
 * @version 1.6
 * @author MPI
 * */

/* init session */
session_start();
initSession();

header("Content-Type: application/json; charset=utf-8");

$validationTable = array (
                "action" => "/^(getEvent|updateEvent|getEventList|login)$/i",
                "eid" => "/^[0-9]{1,3}$/i",
                "username" => "/^[a-zA-Z0-9,\.-]{5,50}$/i",
                "password" => "/^[a-zA-Z0-9,\.-]{5,50}$/i" 
);

// response object
$r = setResponse(503);

if ($_SESSION["mgalix"]["user"]["auth"] === true || ($_SESSION["mgalix"]["user"]["auth"] === false && $_GET["action"] == "login")) {
    if (isset($_GET["action"]) && preg_match($validationTable["action"], $_GET["action"]) === 1) {
        switch ($_GET["action"]) {
            case "getEvent" :
                if (isset($_GET["eid"]) && preg_match($validationTable["eid"], $_GET["eid"]) === 1) {
                    $file = sprintf("data/%d.json", $_GET["eid"]);
                    if (is_file($file) && ($fdata = json_decode(file_get_contents($file), true)) && ($station = getUserEventStation($_GET["eid"], $_SESSION["mgalix"]["user"]["uid"]))) {
                        $fdata["station"] = $station;
                        $fdata["ts-srv-tx"] = date("Y-m-d H:i:s");
                        $r = setResponse(200, $fdata);
                    } else {
                        $r = setResponse(404);
                    }
                } else {
                    $r = setResponse(404);
                }
                break;
            case "updateEvent" :
                // TODO
                $r = setResponse(200);
                break;
            case "getEventList" :
                $files = findAllFiles("data", array (
                                ".",
                                ".." 
                ));
                $fdata = array ();
                foreach ($files as $file) {
                    if (is_file($file) && ($fx = json_decode(file_get_contents($file), true))) {
                        if (!is_null(getUserEventStation($fx["id"], $_SESSION["mgalix"]["user"]["uid"]))) {
                            $fdata[] = array (
                                            "id" => $fx["id"],
                                            "name" => $fx["name"],
                                            "ts-start" => $fx["ts-start"],
                                            "ts-end" => $fx["ts-end"] 
                            );
                        }
                    }
                }
                $r = setResponse(200, $fdata);
                break;
            case "login" :
                if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["username"]) && isset($_POST["password"]) && preg_match($validationTable["username"], $_POST["username"]) === 1 && preg_match($validationTable["password"], $_POST["password"]) === 1) {
                    if (authenticate($_POST["username"], $_POST["password"]) === true) {
                        $r = setResponse(200);
                    } else {
                        $_SESSION["mgalix"]["user"]["auth"] = false;
                        $r = setResponse(401);
                    }
                } else {
                    $r = setResponse(($_SESSION["mgalix"]["user"]["auth"] ? 200 : 401));
                }
                break;
            default :
                $r = setResponse(400);
        }
    } else {
        $r = setResponse(400);
    }
} else {
    $r = setResponse(401);
}

echo json_encode($r);
exit();

/**
 * Tool functions
 */
function authenticate($username, $password) {
    $users = array (
                    array (
                                    "uid" => 77,
                                    "username" => "martin",
                                    "password" => "hello" 
                    ),
                    array (
                                    "uid" => 8,
                                    "username" => "katka",
                                    "password" => "kitty" 
                    ) 
    );
    foreach ($users as $v) {
        if ($v["username"] == $username && $v["password"] == $password) {
            $_SESSION["mgalix"]["user"]["uid"] = $v["uid"];
            $_SESSION["mgalix"]["user"]["auth"] = true;
            return true;
        }
    }
    return false;
}

function getUserEventStation($event, $uid) {
    $stations = array (
                    1 => array (
                                    77 => 4,
                                    8 => 5 
                    ),
                    2 => array (
                                    77 => 1 
                    ) 
    );
    return $stations[$event][$uid];
}

function setResponse($code, $data = null) {
    return array (
                    "status" => $code,
                    "data" => $data 
    );
}

function initSession() {
    if (!isset($_SESSION["mgalix"]["user"])) {
        $_SESSION["mgalix"]["user"]["uid"] = null;
        $_SESSION["mgalix"]["user"]["auth"] = false;
    }
}

function findAllFiles($dir, $exclude) {
    $root = scandir($dir);
    $result = array ();
    foreach ($root as $value) {
        if (in_array($value, $exclude)) {
            continue;
        }
        if (is_file("$dir/$value")) {
            $result[] = "$dir/$value";
            continue;
        }
        foreach (findAllFiles("$dir/$value", $exclude) as $value) {
            $result[] = $value;
        }
    }
    return $result;
}

?>