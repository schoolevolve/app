<?php 
	require_once '../common/core/connector.php';
	require_once '../libraries/google-api-php-client-2.1.3/vendor/autoload.php';
	//require_once '../libraries/moonclerk-php-master/vendor/autoload.php';
	require_once '../common/core/mail.php';
	require_once __DIR__ .'/config.php';
	//use JobBrander\Moonclerk\Client as MoonclerkClient;
	
	session_start();
	
	$fun = $_POST['fun'];
	
	switch($fun){
		case 'login': echo json_encode(login());
		break;
		case 'loginStudent': echo json_encode(loginStudent());
		break;
		case 'tryCode': echo json_encode(tryCode());
		break;
		case 'clearStudent': echo json_encode(clearStudent());
		break;
		case 'createStudent': echo json_encode(createStudent());
		break;
		case 'checkRegistered': echo json_encode(checkRegistered());
		break;
		case 'logout': echo json_encode(logout());
		break;
		default: {
			header("HTTP/1.0 404 Not Found");
			die('"'.$fun.'" method not found');
		}
	}
	
	function clearStudent(){
		if(isset($_COOKIE['student_id']) && isset($_COOKIE['student_hash'])){ 
			$mysqli = getDBConnection();
			$query = 'DELETE FROM students WHERE student_id = "'.$_COOKIE['student_id'].'" AND student_hash = "'.$_COOKIE['student_hash'].'"';
			querySilent($mysqli, $query);
		}
		
		setcookie("student_id", "", time() - 3600*24*30*12);
		setcookie("student_hash", "", time() - 3600*24*30*12);
		unset($_COOKIE['student_id']);
		unset($_COOKIE['student_hash']);
	}
	
	function loginStudent(){
		$mysqli = getDBConnection();
		
		$_SESSION['studentId'] = -1;
		$_SESSION['studentTeacher'] = -1;
		if(isset($_COOKIE['student_id']) && isset($_COOKIE['student_hash'])){   
			$query = 'SELECT * FROM students WHERE student_id = "'.intval($_COOKIE['student_id']).'" AND
			student_hash = "'.mysqli_real_escape_string($mysqli, $_COOKIE['student_hash']).'" LIMIT 1';
			$result = queryObject($mysqli, $query);
			if($result){
				$_SESSION['studentId'] = $result['student_id'];
				$_SESSION['studentTeacher'] = $result['student_teacher'];
			}
			else{
				setcookie("student_id", "", time() - 3600*24*30*12);
				setcookie("student_hash", "", time() - 3600*24*30*12);
			}
		}
		return array('studentId' => $_SESSION['studentId'], 'studentTeacher' => $_SESSION['studentTeacher']);
	}
	
	function createStudent(){
		$mysqli = getDBConnection();
		if(isset($_COOKIE['student_id']) && isset($_COOKIE['student_hash'])){   
			$query = 'SELECT * FROM students WHERE student_id = "'.intval($_COOKIE['student_id']).'" AND
			student_hash = "'.mysqli_real_escape_string($mysqli, $_COOKIE['student_hash']).'" LIMIT 1';
			$result = queryObject($mysqli, $query);
			if($result){
				return;
			}
		}
		$teacherLabel = mysqli_real_escape_string($mysqli, $_POST['teacherLabel']);
		
		$cookie_hash = md5(generateCode(10));
		$query = 'INSERT INTO students (student_hash, student_teacher) VALUES("'.$cookie_hash.'","'.$teacherLabel.'")';
		querySilent($mysqli, $query);
		
		setcookie("student_id", mysqli_insert_id($mysqli), time()+60*60*24*30*12);
		setcookie("student_hash", $cookie_hash, time()+60*60*24*30*12);
	}
	
	function tryCode(){
		$mysqli = getDBConnection();
		$code = mysqli_real_escape_string($mysqli, $_POST['code']);
		
		$query = 'SELECT teacher_id FROM teachers WHERE CONCAT(teacher_label, teacher_id) = "'.$code.'"';
		$result = queryObject($mysqli, $query);
		if($result) return 1;
		else return -1;
	}
	
	function verifyToken($id_token){		
		$client = new Google_Client(['client_id' => $CLIENT_ID]);
		$payload = $client->verifyIdToken($id_token);
		if ($payload) {
			$teacherId = $payload['sub'];
			return $teacherId;
		} 
		else {
			return -1;
		}
	}
	
	function checkRegistered(){
		$mysqli = getDBConnection();
		$email = mysqli_real_escape_string($mysqli, $_POST['email']);
		
		$query = 'SELECT COUNT(*) AS amount FROM teachers WHERE teacher_email = "'.$email.'"';
		return queryValue($mysqli, $query, 'amount');	
	}
	
	function login(){
		$mysqli = getDBConnection();
		
		$authorised = false;
		if(isset($_COOKIE['teacher_id']) && isset($_COOKIE['teacher_hash'])){   
			$query = 'SELECT teacher_id, teacher_hash, teacher_tutorial   
			FROM teachers WHERE teacher_id = "'.mysqli_real_escape_string($mysqli, $_COOKIE['teacher_id']).'" 
			AND teacher_hash = "'.mysqli_real_escape_string($mysqli, $_COOKIE['teacher_hash']).'" LIMIT 1';
			$result = queryObject($mysqli, $query);
			if($result){
				$authorised = true;
				$_SESSION['teacherId'] = $result['teacher_id'];
				//if($result['paid']==0 && $result['customer_id']!=0) $_SESSION['paid'] = checkCustomer($result['customer_id']);
				//else $_SESSION['paid'] = $result['paid'];
				$tutorial = $result['teacher_tutorial'];
			}
			else{
				setcookie("teacher_id", "", time() - 3600*24*30*12);
				setcookie("teacher_hash", "", time() - 3600*24*30*12);
			}
		}
		
		if(!$authorised){
			$teacherToken = $_POST['teacherToken'];
			if($teacherToken=='0') return array('teacher_id' => -1);
			
			$googleId = verifyToken($teacherToken);
			if($googleId==-1) return array('teacher_id' => -1);
			$googleId = trim($googleId);
			
			$query = 'SELECT teacher_id, teacher_tutorial FROM teachers WHERE google_id = "'.$googleId.'"';
			$result = queryObject($mysqli, $query);
			if($result){
				$teacherId = $result['teacher_id'];
				$cookie_hash = md5(generateCode(10));
				setcookie("teacher_id", $teacherId, time()+60*60*24*30);
				setcookie("teacher_hash", $cookie_hash, time()+60*60*24*30);
				$query = 'UPDATE teachers SET teacher_hash = "'.$cookie_hash.'" WHERE teacher_id = '.$teacherId;
				querySilent($mysqli, $query);
				$_SESSION['teacherId'] = $teacherId;
				//if($result['paid']==0 && $result['customer_id']!=0) $_SESSION['paid'] = checkCustomer($result['customer_id']);
				//else $_SESSION['paid'] = $result['paid'];
				$tutorial = $result['teacher_tutorial'];
			}
			else{
				$cookie_hash = md5(generateCode(10));
				setcookie("teacher_hash", $cookie_hash, time()+60*60*24*30);
				
				$json = file_get_contents('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='.$teacherToken);
				$obj = json_decode($json);
				$email = $obj->email;
				$firstName = $obj->given_name;
				$lastName = $obj->family_name;
				
				$query = 'INSERT INTO teachers (google_id, teacher_hash, teacher_email, teacher_tutorial, paid_until) 
				VALUES ("'.$googleId.'","'.$cookie_hash.'", "'.$email.'", 1, DATE_ADD(CURDATE(), INTERVAL 3 WEEK))';
				querySilent($mysqli, $query);
				$_SESSION['teacherId'] = mysqli_insert_id($mysqli);
				//$_SESSION['paid'] = 1;
				setcookie("teacher_id", $_SESSION['teacherId'], time()+60*60*24*30);
				
				if($_SESSION['teacherId']>100) $label = generateCode(1);
				elseif($_SESSION['teacherId']>10) $label = generateCode(2);
				else $label = generateCode(3);
				
				$shortURL = '';//shortenURL('https://app.schoolevolve.com/student/#!/teacher?teacherId='.$label.$_SESSION['teacherId']);	
				$query = 'UPDATE teachers SET short_url = "'.$shortURL.'", teacher_label = "'.$label.'" WHERE teacher_id = '.$_SESSION['teacherId'];
				querySilent($mysqli, $query);
				
				$query = 'INSERT INTO settings (teacher_id) VALUES ('.$_SESSION['teacherId'].')';
				querySilent($mysqli, $query);
				
				for($i=1;$i<=8;$i++){
					switch($i){
						case 1: $end = 'st';
						break;
						case 2: $end = 'nd';
						break;
						case 3: $end = 'rd';
						break;
						default: $end = 'th';
						break;
					}
					$query = 'INSERT INTO classes (class_label, class_name, teacher_id) VALUES 
					("'.generateCode(4).'", "'.$i.$end.' Period", '.$_SESSION['teacherId'].')';
					querySilent($mysqli, $query);
					$classId = mysqli_insert_id($mysqli);
					
					if($i==1){
						insertResponses($mysqli, $classId, RESPONSES_TUTORIAL_1_PERIOD);
					}
					/*elseif($i==2){						
						insertResponses($mysqli, $classId, RESPONSES_TUTORIAL_2_PERIOD);
					}
					elseif ($i==3){
						insertResponses($mysqli, $classId, RESPONSES_TUTORIAL_3_PERIOD);
					}
					elseif($i==4){														
						insertResponses($mysqli, $classId, RESPONSES_TUTORIAL_4_PERIOD);
					}*/
					
					$query = 'INSERT INTO class_prompt (class_id, prompt_id) VALUES ';
					for($d=0;$d<count(DEFAULT_PROMPTS);$d++){
						$query .= ('('.$classId.', '.DEFAULT_PROMPTS[$d].')');
						if($d!=count(DEFAULT_PROMPTS)-1) $query .= ',';
					}
					querySilent($mysqli, $query);
				}				
				$tutorial = 1;
				
				/*sendMail($email, 'Trial activated: School Evolve Teacher App', 'Congratulations!<br><br>
				You have successfully signed up for a free trial subscription.<br>Go to app.schoolevolve.com to try it out!<br>
				Best regards,<br>The School Evolve Team');*/
				
				subscribeTeacher($email, $firstName, $lastName);
			}
		}
		
		$result = array('teacher_id' => $_SESSION['teacherId'], 'tutorial' => $tutorial/*, 'paid' => $_SESSION['paid']*/);
		return $result;
	}
	
	function logout(){
		setcookie("teacher_id", "", time() - 3600*24*30*12);
		setcookie("teacher_hash", "", time() - 3600*24*30*12);
		unset($_COOKIE['teacher_id']);
		unset($_COOKIE['teacher_hash']);
		
		unset($_SESSION['teacherId']);
		session_destroy();
	}
	
	function shortenURL($url){
		$jsonData = array(
		"longUrl" => $url,
		);
		
		$context = stream_context_create(array(
		'http' => array(
		'method' => 'POST',
		'header' => "Content-Type: application/json\r\n",
		'content' => json_encode($jsonData)
		)
		));
		
		$response = file_get_contents('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDS8inWJ3oQ5sSBSKqVFtYShj9AMldZ3V0', FALSE, $context);
		$responseData = json_decode($response, TRUE);
		
		return $responseData['id'];
	}
	
	/*function checkCustomer($customerId){
		$mysqli = getDBConnection();
		
		$api_key = '6f886e480f2881a43e0984d7887ceb49';	
		$client = new MoonclerkClient($api_key);		
		$customer = $client ->getCustomer($customerId);
		
		$customer = $customer->customer;
		$email = $customer->email;
		
		$date = date("Y-m-d", strtotime($customer->subscription->current_period_end));
		if($date>=date("Y-m-d")){
			$query = 'UPDATE teachers SET paid_until = IF(paid_until>DATE("'.$date.'"), paid_until, DATE("'.$date.'")), 
			customer_id = '.$customerId.' WHERE teacher_email = "'.$email.'"';
			querySilent($mysqli, $query);
			return 1;
		}
		else return 0;
	}*/
		
	//subscribeTeacher('ilya.chernoskulov@gmail.com', 'Ilya', 'Chernoskulov');
	function subscribeTeacher($email, $firstName, $lastName){
		$data = [
		'email'     => $email,
		'status'    => 'subscribed',
		'firstname' => $firstName,
		'lastname'  => $lastName
		];
		
		syncMailchimp($data);
	}
	
	function syncMailchimp($data) {
		$apiKey = '8c3727ecdf518e8fce8053bbb4a1af23-us16';
		$listId = 'b8b18438df';
		
		$memberId = md5(strtolower($data['email']));
		$dataCenter = substr($apiKey,strpos($apiKey,'-')+1);
		$url = 'https://' . $dataCenter . '.api.mailchimp.com/3.0/lists/' . $listId . '/members/' . $memberId;
		
		$json = json_encode([
		'email_address' => $data['email'],
		'status'        => $data['status'], // "subscribed","unsubscribed","cleaned","pending"
		'merge_fields'  => [
		'FNAME'     => $data['firstname'],
		'LNAME'     => $data['lastname']
		]
		]);
		
		$ch = curl_init($url);
		
		curl_setopt($ch, CURLOPT_USERPWD, 'user:' . $apiKey);
		curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 10);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $json);                                                                                                                 
		
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		
		return $httpCode;
	}
	
	function insertResponses($mysqli, $classId, $responses){
		for($o=count($responses)-1,$timer=0;$o>=0;$o--){
			$query = 'INSERT INTO class_credentials (class_id, credentials, student_firstName, student_lastName, student_id) 
			VALUES ('.$classId.',"'.$responses[$o]['firstName'][0].$responses[$o]['lastName'][0].'",
			"'.$responses[$o]['firstName'].'","'.$responses[$o]['lastName'].'",0)';
			querySilent($mysqli, $query);
			$credentialsId = mysqli_insert_id($mysqli);
			
			for($j=count($responses[$o]['responses'])-1;$j>=0;$j--,$timer+=2){
				$query = 'INSERT INTO responses (response_date, prompt_id, credentials_id, response_text) VALUES 
				(DATE_ADD(NOW(), INTERVAL '.$timer.' SECOND), '.$responses[$o]['responses'][$j]['prompt'].', 
				'.$credentialsId.', "'.$responses[$o]['responses'][$j]['body'].'")';
				querySilent($mysqli, $query);
			}
		}	
	}
?>
