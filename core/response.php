<?php 
	require_once '../common/core/connector.php';
	
	session_start();
	
	$fun = $_POST['fun'];
	if(!$_SESSION['teacherId']){
		header("HTTP/1.0 404 Not Found");
		die("Authorization required");
	}
	
	switch($fun){
		case 'loadResponses': echo json_encode(loadResponses());
		break;
		case 'pinResponse': echo json_encode(pinResponse());
		break;
		case 'updateResponsesClass': echo json_encode(updateResponsesClass());
		break;
		case 'updateResponsesStudent': echo json_encode(updateResponsesStudent());
		break;
		
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
	
	function loadResponses(){
		$mysqli = getDBConnection();
		
		$query = 'SELECT r.*, cc.*, p.prompt_id, p.category_id 
		FROM responses r
		INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id 
		INNER JOIN classes c ON c.class_id = cc.class_id 
		LEFT JOIN prompts p ON r.prompt_id = p.prompt_id 
		INNER JOIN teachers t ON c.teacher_id = t.teacher_id 
		WHERE c.teacher_id = '.$_SESSION['teacherId'];
		return queryObjectArray($mysqli, $query);
	}
	
	function pinResponse(){
		$mysqli = getDBConnection();
		$responseId = mysqli_real_escape_string($mysqli, $_POST['responseId']);
		$responsePinned = mysqli_real_escape_string($mysqli, $_POST['responsePinned']);
		$responseWasted = mysqli_real_escape_string($mysqli, $_POST['responseWasted']);
		$credentialsId = mysqli_real_escape_string($mysqli, $_POST['credentialsId']);
		
		$query = 'UPDATE responses r INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id 
		INNER JOIN classes c ON c.class_id = cc.class_id
		SET response_pinned = '.$responsePinned.', response_wasted = IF('.$responsePinned.'=0, 1, response_wasted) 
			WHERE response_id = '.$responseId.' AND teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
		
		if($responsePinned=='0' && $responseWasted=='0'){
			$query = 'UPDATE class_credentials cc INNER JOIN classes c ON c.class_id = cc.class_id
			SET called_on = called_on+1 WHERE credentials_id = '.$credentialsId.' AND teacher_id = '.$_SESSION['teacherId'];
			querySilent($mysqli, $query);
		}
	}
	
	function updateResponsesClass(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'UPDATE responses r INNER JOIN class_credentials cc ON cc.credentials_id = r.credentials_id
		INNER JOIN classes c ON cc.class_id = c.class_id 
		SET r.response_new = 0 WHERE c.class_id = '.$classId.' AND c.teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
	}
	
	function updateResponsesStudent(){
	$mysqli = getDBConnection();
	$credId = mysqli_real_escape_string($mysqli, $_POST['credId']);
	
	$query = 'UPDATE responses r INNER JOIN class_credentials cc ON cc.credentials_id = r.credentials_id
	INNER JOIN classes c ON cc.class_id = c.class_id 
	SET r.response_new = 0 WHERE r.credentials_id = '.$credId.' AND c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	?>
		