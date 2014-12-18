<?php
/**
 * Generate example data.
 *
 * @version 1.3
 * @author MPI
 * */
header("Content-Type: text/html; charset=utf-8");

$r1 = array (
                "id" => 1,
                "name" => "Wolf pit 2015",
                "station" => null,
                "ts-start" => "2015-07-07 10:00:00",
                "ts-end" => "2015-07-07 13:00:00",
                "gps" => array (
                                "lat" => null,
                                "lng" => null,
                                "alt" => null,
                                "ts" => null 
                ),
                "scorecard" => array (
                                array (
                                                "sn" => 1,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 2,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 3,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 4,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 5,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 6,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 7,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 8,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 9,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 10,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 11,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 12,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 13,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 14,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 15,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 16,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 17,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 18,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 19,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 20,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 21,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 22,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 23,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 24,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 25,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 26,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 27,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 28,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 29,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 30,
                                                "pp" => null 
                                ) 
                ) 
);

$r2 = array (
                "id" => 2,
                "name" => "Falcon eye 2015",
                "station" => null,
                "ts-start" => "2015-09-07 10:00:00",
                "ts-end" => "2015-09-07 13:00:00",
                "gps" => array (
                                "lat" => null,
                                "lng" => null,
                                "alt" => null,
                                "ts" => null 
                ),
                "scorecard" => array (
                                array (
                                                "sn" => 1,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 2,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 3,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 4,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 5,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 6,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 7,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 8,
                                                "pp" => null 
                                ),
                                array (
                                                "sn" => 9,
                                                "pp" => null 
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