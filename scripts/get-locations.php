<?php 

  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");

  $conn = new mysqli('localhost', 'administator', '123456', 'locations');
  if ($conn->connect_errno) {
    $response = sprintf('{"error": "%s"}', $conn->connect_errno);
  } else {
    $sql = 'SELECT * FROM location';
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
      $response['response'] = 'true';
      $response['locations'] = [];      
      while ($row = $result->fetch_assoc()) {
        array_push($response['locations'], $row);
      }
      $response = json_encode($response);
    } else {
      $response = sprintf('{"error": "No hay localidades en la base de datos, agregue algunas."}');
    }
    $conn->close();
  }
  echo($response);

?>
