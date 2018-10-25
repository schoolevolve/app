<?php
	require_once __DIR__ . '/../../local/local_connect.php';
	
	function getDBConnection(){
		return getLocalConnection();
	}
	
	function queryObjectArray($mysqli, $query){
		$result =  mysqli_query($mysqli, $query);
		if(!$result) {
			header("HTTP/1.0 404 Not Found");
			echo mysqli_error($mysqli);
			echo 'QUERY: "'.$query.'"';
			die();
		}
		
		if(!is_object($result)) return $result;
		
		$response = array();
		$i=0;
		while ($row = $result->fetch_assoc()) {
			$response[$i] = $row;
			$i++;
		}
		return $response;
		}
		
	function queryArray($mysqli, $query){
		$result =  mysqli_query($mysqli, $query);
		if(!$result) {
			header("HTTP/1.0 404 Not Found");
			echo mysqli_error($mysqli);
			echo 'QUERY: "'.$query.'"';
			die();
		}
		
		if(!is_object($result)) return $result;
		
		$response = array();
		$i=0;
		while ($row = $result->fetch_array(MYSQLI_NUM)) {
			$response[$i] = $row;
			$i++;
		}
		return $response;
		}
	
	function querySimpleArray($mysqli, $query, $field){
		$result =  mysqli_query($mysqli, $query);
		if(!$result) {
			header("HTTP/1.0 404 Not Found");
			echo mysqli_error($mysqli);
			echo 'QUERY: "'.$query.'"';
			die();
		}
		
		if(!is_object($result)) return $result;
		
		$response = array();
		$i=0;
		while ($row = $result->fetch_assoc()) {
			$response[$i] = $row[$field];
			$i++;
		}
		return $response;
	}
	
	function queryObject($mysqli, $query){
		$result =  mysqli_query($mysqli, $query);
		if(!$result) {
			header("HTTP/1.0 404 Not Found");
			echo mysqli_error($mysqli);
			echo 'QUERY: "'.$query.'"';
			die();
		}
		
		if(!is_object($result)) return $result;
		
		return $result->fetch_assoc();
	}
	
	function queryValue($mysqli, $query, $field){
		$result =  mysqli_query($mysqli, $query);
		if(!$result) {
			header("HTTP/1.0 404 Not Found");
			echo mysqli_error($mysqli);
			echo 'QUERY: "'.$query.'"';
			die();
		}
		
		if(!is_object($result)) return $result;
		$row = $result->fetch_assoc();
		
		return $row[$field];
	}
	
	function querySilent($mysqli, $query){
		$result =  mysqli_query($mysqli, $query);
		if(!$result) {
			header("HTTP/1.0 404 Not Found");
			echo mysqli_error($mysqli);
			echo 'QUERY: "'.$query.'"';
			die();
		}
		return;
	}
	
	function generateCode($length=6) {
		$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPRQSTUVWXYZ0123456789";
		$code = "";
		$clen = strlen($chars) - 1;  
		while (strlen($code) < $length) {
			$code .= $chars[mt_rand(0,$clen)];  
		}
		return $code;
	}
?>