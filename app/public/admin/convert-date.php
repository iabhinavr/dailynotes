<?php
echo date_default_timezone_get();
$date = new DateTime('2024-08-25 22:11:20.000', new DateTimeZone('UTC'));
echo $date->format('Y-m-d H:i:sP') . "\n";

$date->setTimezone(new DateTimeZone('Asia/Kolkata'));
echo $date->format('Y-m-d H:i:sP') . "\n";