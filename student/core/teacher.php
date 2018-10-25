<?php 
	require_once '../../common/core/connector.php';
		
	session_start();
	
	$fun = $_POST['fun'];
		
	switch($fun){
		case 'loadClasses': echo json_encode(loadClasses());
		break;
		case 'loadTeacherInfo': echo json_encode(loadTeacherInfo());
		break;
		case 'loadRemovalPolicy': echo json_encode(loadRemovalPolicy());
		break;
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
				
	function loadClasses(){
		$mysqli = getDBConnection();
		$teacherId = mysqli_real_escape_string($mysqli, $_POST['teacherId']);
		
		$query = 'SELECT * FROM classes c INNER JOIN teachers t ON t.teacher_id = c.teacher_id WHERE CONCAT(teacher_label, t.teacher_id) = "'.$teacherId.'"';
		return queryObjectArray($mysqli, $query);
	}
	
	function loadTeacherInfo(){
		$mysqli = getDBConnection();
		$teacherId = mysqli_real_escape_string($mysqli, $_POST['teacherId']);
		
		$query = 'SELECT teacher_id, teacher_title, teacher_firstName, teacher_lastName  
		FROM teachers WHERE CONCAT(teacher_label, teacher_id) = "'.$teacherId.'"';
		return queryObject($mysqli, $query);
	}
	
	function loadRemovalPolicy(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'SELECT remove_responses, category_id, remove_after FROM settings s INNER JOIN classes c ON c.teacher_id = s.teacher_id
		WHERE c.class_id = '.$classId;
		//echo $query;
		return queryObject($mysqli, $query);
	}
?>
