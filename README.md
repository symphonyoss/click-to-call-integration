# Click to call Integration

[![FINOS - Archived](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-archived.svg)](https://finosfoundation.atlassian.net/wiki/display/FINOS/Archived)

The Symphony Click to Call (C2C) Feature will add the 'Call' button integration feature from the user hover card in Symphony to trigger 'click to call'. This feature can be used to integrate with Enterprise telephony APIs.

## Contribute

This project was initiated at [J.P. Morgan](https://www.jpmorgan.com/). 
Contributions are accepted via GitHub pull requests. All contributors must be covered by contributor license agreements to comply with the Code Contribution Process.

## Requirements

*   Java 8+
*   Maven 3.0+
*   Pod at least at 1.45
*   A certificate for your extension app (with the Subject common name matching app ID) with signing cert uploaded to the pod [More Info](https://extension-api.symphony.com/docs/application-authentication)
*   Keystore with private cert for your app (configure location in application.yaml)
*   **app-auth-example** project from Symphony Foundation [Click Here](https://github.com/symphonyoss/app-auth-example) 
	
	
## Integration Steps

Follow these steps to integrate the click to call feature:

*   Download the **app-auth-example** spring boot project and go over its **READ ME** doc to deploy and start the application. 
*   Copy the file **c2c_controller.js** and **index_c2c.html** src/main/resources/static from this project to **app-auth-example/src/main/resources/static/** in **app-auth-example** 
*   Update the java classes below in **app-auth-example** to return logged in user Work Phone number.
	
#### LoginResponse.java

        //Add new property to return logged in user phone
		private String workphone;


#### AuthenticationService.java

		//Modify the method **getUserFromJwt** to return user map as below
		public Map getUserFromJwt(String jwt, String companyId)
		return userMap;
		
		//Comment the below line of code
		//return (String) userMap.get("username");


#### AuthenticationController.java

		@RequestMapping(method = POST, path = "/login-with-jwt")
		public ResponseEntity<LoginResponse> login(@RequestBody JwtLoginRequest request)
		--Set the user wrokphone from jwt token in the login response object
		response.setWorkphone((String)userMap.get("workPhone"));
		

*	Implement the **makeCall(userPhone, contactPhone)** javascript method in **c2c_controller.js** to invoke ajax call to your **Enterprise Telephony API**

#### c2c_controller.js
		
		//MUST Implement this method to invoke your Enterprise Telephony APIs
		function makeCall(userPhone, contactPhone)
		{	
			 var callData = {fromNumber:userPhone, toNumber: concatcPhone };	
			 
			 //Calling Enterprise Telephony API example below
			 ajax.call('/makeCall', callData , 'POST', 'application/json')
				.then(function(data)	{
					console.log(data);
			 });
		}


## Additional Best Practices

Please find the following best-practices when implementing the API:

*	Adding authentication to REST Services in Spring BOOT.
*	Logging usage data.
*	Based on the server load have multiple server instances of the application.
