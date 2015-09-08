<?php 

  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");
  $conn = new mysqli('localhost', 'administator', '123456', 'locations');
  if ($conn->connect_errno) {
    $response = sprintf('{"error": "%s"}', $conn->connect_errno);
  } else {
    if ($stmt = $conn->prepare('INSERT INTO location (place, country, region, address, latitude, longitud, id) VALUES(?,?,?,?,?,?,NULL)')) {
      $stmt->bind_param("ssssdd", $_POST['place'], $_POST['country'], 
                                  $_POST['region'], $_POST['address'],
                                  $_POST['lat'], $_POST['lng']);
      $stmt->execute();
      $stmt->close();
      $response = '{"response": "true"}';
    } else {
      $response = sprintf('{"error":"%s"}', $conn->error);
    }
    $conn->close();
  }
  echo($response);

?>