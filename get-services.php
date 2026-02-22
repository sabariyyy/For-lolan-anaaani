<?php
header("Content-Type: application/json");

$api_key = "8ff2e98cd22e9906a5f7d597f814a8475bdab586";

$postData = [
    "key" => $api_key,
    "action" => "services"
];

$ch = curl_init("https://themainsmmprovider.com/api/v2");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));

$response = curl_exec($ch);
curl_close($ch);

echo $response;
