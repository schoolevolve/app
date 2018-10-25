<?php 
	require_once '../common/core/connector.php';
		
	session_start();
	
	$fun = $_POST['fun'];
	if(!$_SESSION['teacherId']){
		header("HTTP/1.0 404 Not Found");
		die("Authorization required");
	}
	
	switch($fun){
		case 'loadClassInfo': echo json_encode(loadClassInfo());
		break;
		case 'loadStudentInfo': echo json_encode(loadStudentInfo());
		break;
		case 'updateClassName': echo json_encode(updateClassName());
		break;
		case 'loadClassPrompts': echo json_encode(loadClassPrompts());
		break;
		case 'loadRegisteredStudents': echo json_encode(loadRegisteredStudents());
		break;
		case 'removeStudent': echo json_encode(removeStudent());
		break;
		case 'addPromptToClass': echo json_encode(addPromptToClass());
		break;
		
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
		
	function loadClassInfo(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'SELECT * FROM classes WHERE class_id = '.$classId.' AND teacher_id = '.$_SESSION['teacherId'];
		return queryObject($mysqli, $query);
	}
	
	function loadStudentInfo(){
		$mysqli = getDBConnection();
		$studentId = mysqli_real_escape_string($mysqli, $_POST['studentId']);
		
		$query = 'SELECT * FROM class_credentials cc INNER JOIN classes c ON c.class_id = cc.class_id
		WHERE cc.credentials_id = '.$studentId.' AND c.teacher_id = '.$_SESSION['teacherId'];
		return queryObject($mysqli, $query);
	}
	
	function removeStudent(){
		$mysqli = getDBConnection();
		$credId = mysqli_real_escape_string($mysqli, $_POST['credId']);
		
		$query = 'DELETE r.* FROM responses r INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id
		INNER JOIN classes c ON c.class_id = cc.class_id WHERE r.credentials_id = '.$credId.' AND teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
		
		$query = 'DELETE cc.* FROM class_credentials cc INNER JOIN classes c ON c.class_id = cc.class_id
		WHERE credentials_id = '.$credId.' AND teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
	}
	
	function loadRegisteredStudents(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'SELECT credentials_id, credentials, student_firstName, student_lastName, called_on FROM class_credentials cc INNER JOIN classes c ON c.class_id = cc.class_id
		WHERE c.class_id = '.$classId.' AND teacher_id = '.$_SESSION['teacherId'].' LIMIT 60';
		return queryObjectArray($mysqli, $query);
	}
	
	function updateClassName(){
		$mysqli = getDBConnection();
		
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		$className = mysqli_real_escape_string($mysqli, $_POST['className']);
				
		$query = 'UPDATE classes SET class_name = "'.$className.'" WHERE class_id = '.$classId.' AND teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
	}
	
	function loadClassPrompts(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'SELECT p.prompt_id, p.prompt_body, p.category_id FROM class_prompt cp INNER JOIN prompts p ON p.prompt_id = cp.prompt_id WHERE class_id = '.$classId;
		return queryObjectArray($mysqli, $query);
	}
	
	function addPromptToClass(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		$promptId = mysqli_real_escape_string($mysqli, $_POST['promptId']);
		$add = $_POST['add'];
		
		if($add == '1'){
			$query = 'INSERT IGNORE INTO class_prompt (class_id, prompt_id) VALUES('.$classId.','.$promptId.')';
		}
		else{
			$query = 'DELETE FROM class_prompt WHERE class_id = '.$classId.' AND prompt_id = '.$promptId;
		}
		
		querySilent($mysqli, $query);
	}
?>
