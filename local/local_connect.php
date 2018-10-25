<?php
	function getLocalConnection(){
		$mysqli = mysqli_connect('127.0.0.1','root','mysql', 'teachers');
		mysqli_query($mysqli, "SET NAMES utf8");
		date_default_timezone_set('Asia/Yekaterinburg');
		return $mysqli;
	}
?>
