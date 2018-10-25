<?php 
	require_once '../../common/core/connector.php';
	
	session_start();
	
	$fun = $_POST['fun'];
	
	switch($fun){
		case 'logout': echo json_encode(logout());
		break;
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
	
	function logout(){
		if(isset($_COOKIE['student_id']) && isset($_COOKIE['student_hash'])){ 
			$mysqli = getDBConnection();
			$query = 'DELETE FROM students WHERE student_id = "'.$_COOKIE['student_id'].'" AND student_hash = "'.$_COOKIE['student_hash'].'"';
			querySilent($mysqli, $query);
		}
		
		setcookie("student_id", "", time() - 3600*24*30*12);
		setcookie("student_hash", "", time() - 3600*24*30*12);
		unset($_COOKIE['student_id']);
		unset($_COOKIE['student_hash']);
		
		unset($_SESSION['studentId']);
		session_destroy();
	}
?>
