<?php
header("Content-Type: text/plain");

$servername = "localhost";
$username = "root"; // Replace with your actual MySQL username
$password = ""; // Replace with your actual MySQL password
$dbname = "tetris_scores";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $highscore = isset($_POST['highscore']) ? (int)$_POST['highscore'] : 0;

    if ($name && $highscore > 0) {
        $stmt = $conn->prepare("INSERT INTO tetris (name, highscore) VALUES (?, ?)");
        $stmt->bind_param("si", $name, $highscore);

        if ($stmt->execute()) {
            echo "High score saved successfully!";
        } else {
            echo "Error saving high score: " . $stmt->error;
        }

        $stmt->close();
    } else {
        echo "Invalid input. Please provide both name and high score.";
    }
} else {
    echo "Invalid request method.";
}

$conn->close();
?>
