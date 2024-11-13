<?php
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tetris_scores";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// Fetch top 5 players
$sql = "SELECT name, highscore FROM tetris ORDER BY highscore DESC LIMIT 5";
$result = $conn->query($sql);

$highScores = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $highScores[] = $row;
    }
}
echo json_encode($highScores);
$conn->close();
?>
