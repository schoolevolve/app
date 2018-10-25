<?php
	require_once __DIR__ . '/../connector.php';
	require_once __DIR__ . '/../mail.php';
	require_once __DIR__ . '/../../../libraries/fpdf/fpdf.php';
	
	$mysqli = getDBConnection();
	
	sendEmails($mysqli);
		
	function sendEmails($mysqli){
		$query = 'SELECT * FROM settings s INNER JOIN teachers t ON s.teacher_id = t.teacher_id 
		WHERE send_reports = 1 AND send_reports_time = 2 AND ((send_reports_type = 0) 
		OR (send_reports_type = 1 AND WEEKDAY(CURDATE())=0) 
		OR (send_reports_type = 2 AND DAYOFMONTH(CURDATE())=1))';
		$teachers = queryObjectArray($mysqli, $query);
		
		foreach($teachers as $teacher){
			$query = 'SELECT response_date, c.class_name, p.prompt_body, CONCAT(cc.credentials, " ", cc.student_firstName, " ", student_lastName), response_text 
			FROM responses r INNER JOIN class_credentials cc ON r.credentials_id = cc.credentials_id
			INNER JOIN classes c ON c.class_id = cc.class_id INNER JOIN prompts p ON r.prompt_id = p.prompt_id 
			WHERE c.teacher_id = '.$teacher['teacher_id'];
			
			switch($teacher['send_reports_type']){
				case '0': $query.= ' AND DATEDIFF(CURDATE(), r.response_date)=1';
				$since = date('m/d', strtotime('-1 day'));
				break;
				case '1': $query.= ' AND r.response_date>=DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND r.response_date<CURDATE()';
				$since = date('m/d', strtotime('-1 week'));
				break;
				case '2': $query.= ' AND r.response_date>=date_format(curdate() - interval 1 month,"%Y-%m-01 00:00:00") AND r.response_date<CURDATE()';
				$since = date('m/d', strtotime('-1 month'));
				break;
			}
			
			$responses = queryArray($mysqli, $query);
			
			date_default_timezone_set ('America/Detroit');
			if(count($responses)) {
				createReport($responses, $teacher['teacher_title'].' '.$teacher['teacher_lastName'], $teacher['teacher_id']);
				$subject = 'Notification: '.count($responses).' unread student responses since '.$since.' at '.date('H:i');
				
				sendResponsesMail($teacher['teacher_id'], $teacher['teacher_email'], $subject);
			}
		}
		
		$query = 'UPDATE settings SET last_report = CURDATE() WHERE send_reports = 1 AND ((send_reports_type = 0) 
		OR (send_reports_type = 1 AND WEEKDAY(CURDATE())=0) 
		OR (send_reports_type = 2 AND DAYOFMONTH(CURDATE())=1))';
		querySilent($mysqli, $query);
	};
	
	function createReport($responses, $teacherName, $teacherId){		
		$pdf = new FPDF();
		
		$pdf->AddFont('Roboto','','Roboto-Regular.php');
		$pdf->AddFont('Roboto','B','Roboto-Bold.php');
		
		$pdf->AliasNbPages();
		$pdf->AddPage();
		
		$pdf->Image( __DIR__ . '/../../../images/SchoolEvolve.png',10,6,60);
		
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
		
		$pdf->Output('F', __DIR__ . '/../reports/'.$teacherId.'.pdf');
		
		createCSVReport($responses, $teacherId);
	}
	
	function createCSVReport($responses, $teacherId){
		file_put_contents(__DIR__ . '/../reports/'.$teacherId.'.csv','Date,Class,Prompt,Student,Response'."\r\n");
		foreach($responses as $row){
			file_put_contents(__DIR__ . '/../reports/'.$teacherId.'.csv', $row[0].','.$row[1].','.$row[2].','.$row[3].','.$row[4]."\r\n", FILE_APPEND);
		}
	}
	
	function sendResponsesMail($teacherId, $email, $subject){
		$message = 'Go to app.schoolevolve.com to see the new responses';
		
		$cur_date = date('m/d H:i');
		$attachements = array(array(__DIR__ . '/../reports/'.$teacherId.'.pdf', 'Report '.$cur_date.'.pdf'),array(__DIR__ . '/../reports/'.$teacherId.'.csv', 'Report '.$cur_date.'.csv'));
		sendMail($email, $subject, $message, $attachements);
	}
	
?>