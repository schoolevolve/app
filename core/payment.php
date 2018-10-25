<?php 
	require_once '../libraries/moonclerk-php-master/vendor/autoload.php';
	require_once '../common/core/mail.php';
	use JobBrander\Moonclerk\Client as MoonclerkClient;
	
	require_once '../common/core/connector.php';
	
	$fun = $_POST['fun'];
	
	//checkCustomer();
	
	switch($fun){
		case 'checkPayment': echo json_encode(checkPayment());
		break;
		case 'checkCustomer': echo json_encode(checkCustomer());
		break;
		default: {
		header("HTTP/1.0 404 Not Found");
		die('"'.$fun.'" method not found');
		}
	}
	
	function checkPayment(){
		$mysqli = getDBConnection();
		$paymentId = mysqli_real_escape_string($mysqli, $_POST['paymentId']);	
		
		$api_key = '6f886e480f2881a43e0984d7887ceb49';	
		$client = new MoonclerkClient($api_key);		
		$payment = $client ->getPayment($paymentId);
		
		$payment = $payment->payment;
		$email = $payment->email;
				
		if($payment->status == 'successful'){
			$date = date('Y-m-d', strtotime(date("Y-m-d", strtotime($payment->date)) . " +4 month"));
			$query = 'UPDATE teachers SET paid_until = IF(paid_until>DATE("'.$date.'"), paid_until, DATE("'.$date.'")), is_trial = 0 WHERE teacher_email = "'.$email.'"';
			querySilent($mysqli, $query);
						
			$query = 'INSERT IGNORE INTO payments (payment_id, teacher_email) VALUES ('.$paymentId.', "'.$email.'")';
			querySilent($mysqli, $query);
			
			sendMail($email, 'School Evolve Subscription Purchased', 'Hello from School Evolve!<br><br>
			You have successfully purchased a subscription to the School Evolve Teacher App.<br>
			Go to app.schoolevolve.com to access our services.<br><br>
			Sincerely,<br>
			The School Evolve Team<br><br>
			If this purchase was made in error, please contact support@schoolevolve.com immediately.');
			
			return 1;
		}
		
		return -1;
	}
	
	function checkCustomer(){
		$mysqli = getDBConnection();
		$customerId = mysqli_real_escape_string($mysqli, $_POST['customerId']);	
				
		$api_key = '6f886e480f2881a43e0984d7887ceb49';	
		$client = new MoonclerkClient($api_key);		
		$customer = $client ->getCustomer($customerId);
		
		$customer = $customer->customer;
		$email = $customer->email;
				
		$date = date("Y-m-d", strtotime($customer->subscription->current_period_end));
		$query = 'UPDATE teachers SET paid_until = IF(paid_until>DATE("'.$date.'"), paid_until, DATE("'.$date.'")), is_trial = 0,
		customer_id = '.$customerId.' WHERE teacher_email = "'.$email.'"';
		querySilent($mysqli, $query);
		
		sendMail($email, 'School Evolve Subscription Purchased', 'Hello from School Evolve!<br><br>
			You have successfully purchased a subscription to the School Evolve Teacher App.<br>
			Go to app.schoolevolve.com to access our services.<br><br>
			Sincerely,<br>
			The School Evolve Team<br><br>
			If this purchase was made in error, please contact support@schoolevolve.com immediately.');
		
		return 1;
	}
	
	/*function sendEmail($to, $subject, $message){
		$email = new PHPMailer();
		$email->From      = 'support@app.schoolevolve.com';
		$email->FromName  = 'School Evolve';
		$email->Subject   = $subject;
		$email->Body      = $message;
		$email->AddAddress($to);
		
		return $email->Send();
	}*/
?>