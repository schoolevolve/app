<?php 
	require_once '../common/core/connector.php';
		
	session_start();
	
	$fun = $_POST['fun'];
	if(!$_SESSION['teacherId']){
		header("HTTP/1.0 404 Not Found");
		die("Authorization required");
	}
	
	switch($fun){
		case 'loadPrompts': echo json_encode(loadPrompts());
		break;
		case 'loadCategories': echo json_encode(loadCategories());
		break;
		case 'addNewPrompt': echo json_encode(addNewPrompt());
		break;
		case 'updatePromptBody': echo json_encode(updatePromptBody());
		break;
		case 'removePrompt': echo json_encode(removePrompt());
		break;
		
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
		
	function loadCategories(){
		$mysqli = getDBConnection();
				
		$query = 'SELECT * FROM prompt_categories';
		return queryObjectArray($mysqli, $query);
	}
	
	function loadPrompts(){
		$mysqli = getDBConnection();
				
		$query = 'SELECT * FROM prompts WHERE teacher_id = 0 OR teacher_id = '.$_SESSION['teacherId'];
		return queryObjectArray($mysqli, $query);
	}
	
	function removePrompt(){
		$mysqli = getDBConnection();
		$promptId = mysqli_real_escape_string($mysqli, $_POST['promptId']);
				
		$query = 'DELETE FROM prompts WHERE prompt_id = '.$promptId.' AND teacher_id = '.$_SESSION['teacherId'];
		return querySilent($mysqli, $query);
	}
	
	function addNewPrompt(){
		$mysqli = getDBConnection();
		$promptBody = mysqli_real_escape_string($mysqli, $_POST['promptBody']);
		$promptBodyTeacher = mysqli_real_escape_string($mysqli, $_POST['promptBodyTeacher']);
		$promptBodyStudent = mysqli_real_escape_string($mysqli, $_POST['promptBodyStudent']);
		
		$query = 'INSERT INTO prompts (prompt_body, prompt_body_teacher, prompt_body_student, teacher_id) 
		VALUES ("'.$promptBody.'","'.$promptBodyTeacher.'","'.$promptBodyStudent.'",'.$_SESSION['teacherId'].')';
		querySilent($mysqli, $query);
		return mysqli_insert_id($mysqli);
	}
	
	function updatePromptBody(){
		$mysqli = getDBConnection();
		
		$promptId = mysqli_real_escape_string($mysqli, $_POST['promptId']);
		$promptBody = mysqli_real_escape_string($mysqli, $_POST['promptBody']);
		$promptBodyTeacher = mysqli_real_escape_string($mysqli, $_POST['promptBodyTeacher']);
		$promptBodyStudent = mysqli_real_escape_string($mysqli, $_POST['promptBodyStudent']);
				
		$query = 'UPDATE prompts SET prompt_body = "'.$promptBody.'", prompt_body_teacher = "'.$promptBodyTeacher.'", 
		prompt_body_student = "'.$promptBodyStudent.'"  
		WHERE prompt_id = '.$promptId.' AND teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
	}
?>
