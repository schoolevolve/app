<?php
	session_start();
	
	$fun = $_POST['fun'];
		
	switch($fun){
		case 'logServerError': echo json_encode(logServerError());
		break;
		case 'logClientError': echo json_encode(logClientError());
		break;
		
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
		
	function logServerError(){
		$error = $_POST['error'];
		$user = ($_SESSION['teacherId'])?'teacher - '.$_SESSION['teacherId']:'student - '.$_SESSION['studentId'];
		file_put_contents('server_errors.log',date('Y-m-d H:i:s').' - '.$error.' ('.$user.')'."\r\n",FILE_APPEND);
	}
	
	function logClientError(){
		$message = $_POST['message'];
		$stackTrace = $_POST['stackTrace'];
		
		if($stackTrace){
			$stack = '';
			foreach($stackTrace as $item){
				$stack.=($item."\r\n");
			}
		}
		$cause = $_POST['cause'];
		$user = ($_SESSION['teacherId'])?'teacher - '.$_SESSION['teacherId']:'student - '.$_SESSION['studentId'];
		file_put_contents('client_errors.log',date('Y-m-d H:i:s').' - '.$message.' ('.$user.')'."\r\n".$stack.$cause."\r\n",FILE_APPEND);
	}
?>
