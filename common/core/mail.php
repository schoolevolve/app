<?php	
	require_once __DIR__ . '/../../libraries/phpmailer/class.phpmailer.php';
	
	function sendMail($to, $subject, $message, $attachements){
		$mail = new PHPMailer();
		$mail->SMTPDebug  = 2;                     // enables SMTP debug information (for testing)
		$mail->SMTPAuth   = true;                  // enable SMTP authentication
		$mail->SMTPSecure = "tls";                 
		$mail->Host       = "smtp.gmail.com";      // SMTP server
		$mail->Port       = 587;                   // SMTP port
		$mail->Username   = "Pierre@schoolevolve.com";  // username
		$mail->Password   = "blackM@mba1983";            // password
		
		$mail->SetFrom('admin@schoolevolve.com', 'School Evolve');
		$mail->Subject    = $subject;
		$mail->MsgHTML($message);
		
		if($attachements) {
			for($i=0;$i<count($attachements);$i++){
				$mail->AddAttachment($attachements[$i][0] , $attachements[$i][1]);
			}
		}
		
		$mail->AddAddress($to);
		return $mail->Send();
	}
?>