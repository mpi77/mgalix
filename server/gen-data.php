<?php
/**
 * Generate example data.
 *
 * @version 1.4
 * @author MPI
 * */
header("Content-Type: text/html; charset=utf-8");

$r1 = array (
                "id" => 1,
                "name" => "Wolf pit 2015",
                "station" => null,
                "ts-ev-start" => "2015-07-07 10:00:00",
                "ts-ev-end" => "2015-07-07 13:00:00",
                "ts-srv-tx" => null,
                "ts-cli-rx" => null,
                "gps" => array (
                                "lat" => null,
                                "lng" => null,
                                "alt" => null,
                                "ts" => null 
                ),
                "scorecard" => array (
                                array (
                                                "sn" => 1,
                                                "pp" => null,
                                                "pt" => null 
                                ),
                                array (
                                                "sn" => 2,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 3,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 4,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 5,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 6,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 7,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 8,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 9,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 10,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 11,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 12,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 13,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 14,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 15,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 16,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 17,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 18,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 19,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 20,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 21,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 22,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 23,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 24,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 25,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 26,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 27,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 28,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 29,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 30,
                                                "pp" => null,
                                                "pt" => null
                                ) 
                ) 
);

$r2 = array (
                "id" => 2,
                "name" => "Falcon eye 2015",
                "station" => null,
                "ts-ev-start" => "2015-09-07 10:00:00",
                "ts-ev-end" => "2015-09-07 13:00:00",
                "ts-srv-tx" => null,
                "ts-cli-rx" => null,
                "gps" => array (
                                "lat" => null,
                                "lng" => null,
                                "alt" => null,
                                "ts" => null 
                ),
                "scorecard" => array (
                                array (
                                                "sn" => 1,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 2,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 3,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 4,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 5,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 6,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 7,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 8,
                                                "pp" => null,
                                                "pt" => null
                                ),
                                array (
                                                "sn" => 9,
                                                "pp" => null,
                                                "pt" => null
                                ) 
                ) 
);

echo "Generating demo data<br />";
if (file_put_contents("data/1.json", json_encode($r1))) {
    echo "data1.....ok<br />";
} else {
    echo "data1.....fail<br />";
}
if (file_put_contents("data/2.json", json_encode($r2))) {
    echo "data2.....ok<br />";
} else {
    echo "data2.....fail<br />";
}
?>