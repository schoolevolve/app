<?php 
	require_once '../common/core/connector.php';
	require_once '../common/core/mail.php';
	require_once '../libraries/fpdf/fpdf.php';
	require_once __DIR__ .'/config.php';
	
	session_start();
	
	$fun = $_POST['fun'];
	if(!$_SESSION['teacherId']){
		header("HTTP/1.0 404 Not Found");
		die("Authorization required");
	}
	
	switch($fun){
		case 'loadTeacherInfo': echo json_encode(loadTeacherInfo());
		break;
		case 'setTutorial': echo json_encode(setTutorial());
		break;
		case 'updateTeacherInfo': echo json_encode(updateTeacherInfo());
		break;
		case 'loadClasses': echo json_encode(loadClasses());
		break;
		case 'loadPromptsAmount': echo json_encode(loadPromptsAmount());
		break;
		case 'addNewClass': echo json_encode(addNewClass());
		break;
		case 'removeClass': echo json_encode(removeClass());
		break;
		case 'removeClasses': echo json_encode(removeClasses());
		break;
		case 'loadSettings': echo json_encode(loadSettings());
		break;
		case 'updateSettings': echo json_encode(updateSettings());
		break;
		case 'updateNotifications': echo json_encode(updateNotifications());
		break;
		case 'sendReport': echo json_encode(sendReport());
		break;
		case 'removeResponse': echo json_encode(removeResponse());
		break;
		case 'removeResponses': echo json_encode(removeResponses());
		break;
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
	
	function loadTeacherInfo(){
		$mysqli = getDBConnection();
		
		$query = 'SELECT teacher_id, teacher_title, teacher_firstName, teacher_lastName, paid_until, paid_until<CURDATE() AS unavailable, is_trial,
		teacher_label, short_url 
		FROM teachers WHERE teacher_id = '.$_SESSION['teacherId'];
		return queryObject($mysqli, $query);
	}
	
	function updateTeacherInfo(){
		$mysqli = getDBConnection();
		
		$title = mysqli_real_escape_string($mysqli, $_POST['teacher_title']);
		$firstName = mysqli_real_escape_string($mysqli, $_POST['teacher_firstName']);
		$lastName = mysqli_real_escape_string($mysqli, $_POST['teacher_lastName']);
		
		$query = 'UPDATE teachers SET teacher_title = "'.$title.'", 
		teacher_firstName = "'.$firstName.'", teacher_lastName = "'.$lastName.'" WHERE teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
		return $query;
	}
	
	function loadClasses(){
		$mysqli = getDBConnection();
		
		$query = 'SELECT * FROM classes WHERE teacher_id = '.$_SESSION['teacherId'];
		return queryObjectArray($mysqli, $query);
	}
	
	function loadPromptsAmount(){
		$mysqli = getDBConnection();
		
		$query = 'SELECT cp.class_id, COUNT(prompt_id) AS prompts_amount FROM class_prompt cp INNER JOIN classes c ON c.class_id = cp.class_id
		WHERE c.teacher_id = '.$_SESSION['teacherId'].' GROUP BY cp.class_id';
		return queryObjectArray($mysqli, $query);
	}
	
	function setTutorial(){
		$mysqli = getDBConnection();
		$showTutorial = mysqli_real_escape_string($mysqli, $_POST['showTutorial']);
		
		$query = 'UPDATE teachers SET teacher_tutorial = '.$showTutorial.' WHERE teacher_id = '.$_SESSION['teacherId'];
		return querySilent($mysqli, $query);
	}
	
	function addNewClass(){
		$mysqli = getDBConnection();
		$className = mysqli_real_escape_string($mysqli, $_POST['className']);
		
		$query = 'INSERT INTO classes (class_label, class_name, teacher_id) VALUES ("'.generateCode(4).'", "'.$className.'",'.$_SESSION['teacherId'].')';
		querySilent($mysqli, $query);
        $classId = mysqli_insert_id($mysqli);
        
        $query = 'INSERT INTO class_prompt (class_id, prompt_id) VALUES ';
		for($d=0;$d<count(DEFAULT_PROMPTS);$d++){
			$query .= ('('.$classId.', '.DEFAULT_PROMPTS[$d].')');
			if($d!=count(DEFAULT_PROMPTS)-1) $query .= ',';
		}
		querySilent($mysqli, $query);
		
		return $classId;
	}
	
	function removeClass(){
		$mysqli = getDBConnection();
		$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
		
		$query = 'DELETE cp.* FROM class_prompt cp INNER JOIN classes c ON cp.class_id = c.class_id
		WHERE c.class_id = '.$classId.' AND c.teacher_id = '.$_SESSION['teacherId'];
		querySilent($mysqli, $query);
		
		$query = 'DELETE r.* FROM responses r INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id 
	INNER JOIN classes c ON cc.class_id = c.class_id WHERE c.class_id = '.$classId.' AND c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	
	$query = 'DELETE cc.* FROM class_credentials cc INNER JOIN classes c ON cc.class_id = c.class_id 
	WHERE c.class_id = '.$classId.' AND c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	
	$query = 'DELETE FROM classes WHERE class_id = '.$classId.' AND teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	function removeClasses(){
	$mysqli = getDBConnection();
	
	$query = 'DELETE cp.* FROM class_prompt cp INNER JOIN classes c ON cp.class_id = c.class_id
	WHERE c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	
	$query = 'DELETE r.* FROM responses r INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id 
	INNER JOIN classes c ON cc.class_id = c.class_id WHERE c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	
	$query = 'DELETE cc.* FROM class_credentials cc INNER JOIN classes c ON cc.class_id = c.class_id 
	WHERE c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	
	$query = 'DELETE FROM classes WHERE teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	function loadSettings(){
	$mysqli = getDBConnection();
	
	$query = 'SELECT * FROM settings WHERE teacher_id = '.$_SESSION['teacherId'];
	return queryObject($mysqli, $query);
	}
	
	function updateSettings(){
	$mysqli = getDBConnection();
	$removeResponses = mysqli_real_escape_string($mysqli, $_POST['removeResponses']);
	$removeCategory = mysqli_real_escape_string($mysqli, $_POST['removeCategory']);
	$removeAfter = mysqli_real_escape_string($mysqli, $_POST['removeAfter']);
	$keepPin = mysqli_real_escape_string($mysqli, $_POST['keepPin']);
	
	$query = 'UPDATE settings SET remove_responses = '.$removeResponses.', category_id = '.$removeCategory.', remove_after = '.$removeAfter.',
	keep_pin = '.$keepPin.' WHERE teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	function updateNotifications(){
	$mysqli = getDBConnection();
	$sendReports = mysqli_real_escape_string($mysqli, $_POST['sendReports']);
	$sendReportsType = mysqli_real_escape_string($mysqli, $_POST['sendReportsType']);
	$sendReportsTime = mysqli_real_escape_string($mysqli, $_POST['sendReportsTime']);
	
	$query = 'UPDATE settings SET send_reports = '.$sendReports.', send_reports_type = '.$sendReportsType.',
	send_reports_time = '.$sendReportsTime.' WHERE teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	function removeResponse(){
	$mysqli = getDBConnection();
	$responseId = mysqli_real_escape_string($mysqli, $_POST['responseId']);
	
	$query = 'DELETE r.* FROM responses r INNER JOIN class_credentials cc ON cc.credentials_id = r.credentials_id 
	INNER JOIN classes c ON cc.class_id = c.class_id WHERE r.response_id = '.$responseId.' AND c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	function removeResponses(){
	$mysqli = getDBConnection();
	$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
	
	$query = 'DELETE r.* FROM responses r INNER JOIN class_credentials cc ON cc.credentials_id = r.credentials_id 
	INNER JOIN classes c ON cc.class_id = c.class_id WHERE cc.class_id = '.$classId.' AND c.teacher_id = '.$_SESSION['teacherId'];
	querySilent($mysqli, $query);
	}
	
	function sendReport($mysqli){
	$mysqli = getDBConnection();
	$classId = mysqli_real_escape_string($mysqli, $_POST['classId']);
	
	$query = 'SELECT teacher_id, teacher_title, teacher_firstName, teacher_lastName, teacher_email FROM teachers WHERE teacher_id = '.$_SESSION['teacherId'];
	$teacher = queryObject($mysqli, $query);
	
	$query = 'SELECT response_date, c.class_name, p.prompt_body, CONCAT(cc.credentials, " ", cc.student_firstName, " ", student_lastName), response_text 
	FROM responses r INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id
	INNER JOIN classes c ON c.class_id = cc.class_id INNER JOIN prompts p ON r.prompt_id = p.prompt_id 
	WHERE c.class_id = '.$classId.' AND c.teacher_id = '.$_SESSION['teacherId'];
	
	$responses = queryArray($mysqli, $query);
	if(count($responses)) {
	createReport($responses, $teacher['teacher_title'].' '.$teacher['teacher_lastName'], $teacher['teacher_id']);
	$subject = 'Class report';
	sendResponsesMail($teacher['teacher_id'], $teacher['teacher_email'], $subject);
	}
	};
	
	function createReport($responses, $teacherName, $teacherId){		
	$pdf = new FPDF();
	
	$pdf->AddFont('Roboto','','Roboto-Regular.php');
	$pdf->AddFont('Roboto','B','Roboto-Bold.php');
	
	$pdf->AliasNbPages();
	$pdf->AddPage();
	
	$pdf->Image('../images/SchoolEvolve.png',10,6,60);
	
	$pdf->SetFont('Roboto','',26);
	$pdf->Cell(0,20,'School Evolve, LLC',0,0,'R');
	$pdf->Ln(20);
	
	$pdf->SetFont('Roboto','',12);
	$pdf->Cell(0,10,'345 West Hancock Ave, Athens, GA',0,1,'R');
	$pdf->Cell(0,10,'www.schoolevolve.com',0,1,'R');
	$pdf->Cell(0,10,'(706) 940-3985',0,0,'R');
	$pdf->Ln(20);
	
	$pdf->SetFont('Roboto','',16);
	$pdf->Cell(0,10,'Report generated for '.$teacherName.' on '.date('Y/m/d H:i'));
	$pdf->Ln(20);
	
	$pdf->SetFont('Roboto','',12);
	foreach($responses as $row){
	$pdf->Cell(0,6,$row[1].': '.substr($row[2],0,40).' ('.date('m/d H:i',strtotime($row[0])).')');
	$pdf->Ln();
	
	$pdf->MultiCell(0,6,$row[3].': "'.$row[4].'"');
	$pdf->Ln();
	}
	
	$pdf->Output('F', 'reports/'.$teacherId.'.pdf');	
	
	createCSVReport($responses, $teacherId);
	}
	
	function createCSVReport($responses, $teacherId){
	file_put_contents('reports/'.$teacherId.'.csv','Date,Class,Prompt,Student,Response'."\r\n");
	foreach($responses as $row){
	file_put_contents('reports/'.$teacherId.'.csv', $row[0].','.$row[1].','.$row[2].','.$row[3].','.$row[4]."\r\n", FILE_APPEND);
	}
	}
	
	function sendResponsesMail($teacherId, $email, $subject){
	$message = 'Go to app.schoolevolve.com to see the new responses';
	
	$cur_date = date('m/d H:i');
	$attachements = array(array('reports/'.$teacherId.'.pdf', 'Report '.$cur_date.'.pdf'),array('reports/'.$teacherId.'.csv', 'Report '.$cur_date.'.csv'));
	sendMail($email, $subject, $message, $attachements);
	
	//send($email, $subject, $message, $teacherId);
	}
	
	/*function send($to, $subject, $message, $teacherId){
	$email = new PHPMailer();
	$email->From      = 'reports@app.schoolevolve.com';
	$email->FromName  = 'School Evolve';
	$email->Subject   = $subject;
	$email->Body      = $message;
	$email->AddAddress($to);
	
	$cur_date = date('m/d H:i');
	
	$pdf_to_attach = 'reports/'.$teacherId.'.pdf';
	$email->AddAttachment( $pdf_to_attach , 'Report '.$cur_date.'.pdf' );
	
	$csv_to_attach = 'reports/'.$teacherId.'.csv';
	$email->AddAttachment( $csv_to_attach , 'Report '.$cur_date.'.csv' );
	
	return $email->Send();
	}*/
	?>
