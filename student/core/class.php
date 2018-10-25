<?php 
	require_once '../../common/core/connector.php';
		
	session_start();
	
	$fun = $_POST['fun'];
			
	switch($fun){
		case 'loadClassInfo': echo json_encode(loadClassInfo());
		break;
		case 'loadPrompts': echo json_encode(loadPrompts());
		break;
		case 'loadCredentials': echo json_encode(loadCredentials());
		break;
		case 'registerToClass': echo json_encode(registerToClass());
		break;
		case 'submitResponse': echo json_encode(submitResponse());
		break;
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
				
	function loadClassInfo(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'SELECT c.class_id, c.class_name  
		FROM classes c INNER JOIN teachers t ON t.teacher_id = c.teacher_id 
		WHERE CONCAT(c.class_label, c.class_id) = "'.$classId.'"';
		return queryObject($mysqli, $query);
	}
	
	function loadPrompts(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'SELECT p.prompt_id, p.prompt_body, p.prompt_body_student, p.category_id FROM class_prompt cp 
		INNER JOIN prompts p ON p.prompt_id = cp.prompt_id 
		WHERE cp.class_id = "'.$classId.'"';
		return queryObjectArray($mysqli, $query);
	}
	
	function registerToClass(){
		if(!$_SESSION['studentId']) loadCredentials();
	
		$mysqli = getDBConnection();
		$cred = mysqli_real_escape_string($mysqli, $_POST['cred']);
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		$firstName = mysqli_real_escape_string($mysqli, $_POST['firstName']);
		$lastName = mysqli_real_escape_string($mysqli, $_POST['lastName']);
		
		$query = 'SELECT COUNT(credentials) AS credNumber FROM class_credentials WHERE credentials = "'.$cred.'" AND class_id = '.$classId;
		if(queryValue($mysqli, $query, 'credNumber')>0) return -1;
		
		$query = 'SELECT COUNT(credentials) AS credNumber FROM class_credentials WHERE class_id = '.$classId;
		if(queryValue($mysqli, $query, 'credNumber')>=60) return -2;
		
		$query = 'INSERT INTO class_credentials (class_id, student_id, credentials, student_firstName, student_lastName) 
		VALUES('.$classId.','.$_SESSION['studentId'].',"'.$cred.'","'.$firstName.'","'.$lastName.'")';
		querySilent($mysqli, $query);
		
		//$query = 'UPDATE ';
		
		return mysqli_insert_id($mysqli);
	}
	
	function submitResponse(){
		if(!$_SESSION['studentId']) return -1;
		
		$mysqli = getDBConnection();
		$cred = mysqli_real_escape_string($mysqli, $_POST['cred']);
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		$promptId = mysqli_real_escape_string($mysqli, $_POST['promptId']);
		$feedback = mysqli_real_escape_string($mysqli, $_POST['feedback']);
        $timestamp = mysqli_real_escape_string($mysqli, $_POST['timestamp']);
				
		//echo $credId.'!';
		//echo $_SESSION['userId'].'!';
		$query = 'SELECT credentials_id FROM class_credentials 
		WHERE credentials = "'.$cred.'" AND class_id = '.$classId;
		$credId = queryValue($mysqli, $query, 'credentials_id');
		if(!$credId) return -2;
		
		$query = 'INSERT INTO responses (response_date, prompt_id, credentials_id, response_text) 
		VALUES(FROM_UNIXTIME('.$timestamp.'/1000), '.$promptId.','.$credId.',"'.$feedback.'")';
		querySilent($mysqli, $query);
		
		//$query = 'UPDATE ';
		
		return 1;
	}
	
	function loadCredentials(){
		$mysqli = getDBConnection();
		
		if(isset($_COOKIE['student_id']) && isset($_COOKIE['student_hash'])){   
			$query = 'SELECT student_id, student_hash FROM students WHERE student_id = "'.mysqli_real_escape_string($mysqli, $_COOKIE['student_id']).'" 
			AND student_hash = "'.mysqli_real_escape_string($mysqli, $_COOKIE['student_hash']).'" LIMIT 1';
			$result = queryObject($mysqli, $query);
			if($result){
				$_SESSION['studentId'] = $result['student_id'];
				$query = 'SELECT class_id, credentials_id, credentials FROM class_credentials WHERE student_id = '.$_SESSION['studentId'];
				return queryObjectArray($mysqli, $query);
			}
			else{
				setcookie("student_id", "", time() - 3600*24*30*12);
				setcookie("student_hash", "", time() - 3600*24*30*12);
				
				$_SESSION['studentId'] = saveStudent();
				return array();
			}
		}
		else{
			$_SESSION['studentId'] = saveStudent();
			return array();
		}
				
		//return $userId;
	}
	
	function saveStudent(){
		$mysqli = getDBConnection();
		
		$cookie_hash = md5(generateCode(10));
		
		$query = 'INSERT INTO students (student_hash) VALUES ("'.$cookie_hash.'")';
		querySilent($mysqli, $query);
		$userId = mysqli_insert_id($mysqli);
		
		setcookie("student_id", $userId, time()+60*60*24*30);
		setcookie("student_hash", $cookie_hash, time()+60*60*24*30);
		return $userId;
	}
?>
