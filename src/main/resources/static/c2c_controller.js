/*
 * Copyright 2018-2019 JPMorgan Chase
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var appToken;

//ID of pod/company - comes back from 'hello'
var companyId;

//Kicks off app authentication flow at server.  Passes pod ID which came from 'hello' call previously.
//Returns Symphony token.
function authenticate(response) {

	console.log('Response authenticate: ', response);
	companyId = ''+ response.pod;

	// /authenticate returns app token in body (only)
	return ajax.call('/authenticate', companyId, 'POST', 'text/text')
	.then(function(data)
			{
		appToken = data;
		return Q({appId: appId, tokenA: data});
			}.bind(this));
}

//Sends the application token (and the symphony token) back to the server for validation.  In this implementation,
//we are passing back both tokens so that back end can remain stateless. If a sticky session had been established,
//only the app token would be required since the Symphony token could have been stored in the session on the server.
function validate(response)
{
	var request = {
			companyId : companyId,
			symphonyToken : response.tokenS,
			appToken : appToken
	};

	return ajax.call('/validate-tokens', request, 'POST', 'application/json')
	.then(function(data)
			{
		console.log("Response validate: ", data);
			}.bind(this)); 
}

//Every Enterprise should implement below method based on their INTRENAL TELEPHONY APIs 
function makeCall(userPhoneNo, contactPhoneNo)
{	
	var callData = {fromNumber:userPhoneNo, toNumber: contactPhoneNo };
	
	 ajax.call('/makeCall', callData , 'POST', 'application/json')
		.then(function(data)	{
			console.log(data);
 	 });
}

var uiService;
var userService;
var userPhone;  //Logged in user phone number 
var jwt;


//This method will be called when the app loands once to get the logged in user details 
//and register the "Call Work" button in profile/hover card 
function login()
{
	if (userService) {
		userService.getJwt()
		.then(function(response)
				{
			jwt = response;
			var request =
			{
					jwt : jwt,
					companyId : companyId   // Must pass pod/company ID so that signature can be verified using certificate from pod
			};

			return ajax.call('/login-with-jwt', request, 'POST', 'application/json')
			.then(function(data)
					{
				console.log("Response login: ", data);
				userPhone  = data.workphone;
				
				//uiService to register the "Call Work" button once the user have the phone number. 
				uiService.registerExtension("profile", "hello-profile", "click2call:controller", { group: 'buttons', label: "Call Work"});
				return data;
					}.bind(this));

				});
			console.log("jwt: ", jwt);
	}

	return Q.reject(new Error("Could not login"));

}

function register(appData) {
	return SYMPHONY.application.register(appData, ['ui', 'modules', 'applications-nav', 'extended-user-info','entity'], ['click2call:controller'])
	.then(validate)
	.then(function(response) {

		uiService = SYMPHONY.services.subscribe('ui');
		userService = SYMPHONY.services.subscribe('extended-user-info');
		entityService = SYMPHONY.services.subscribe("entity");
		
		//Called once to authenticate and get user jwt with details.
		login();

		// Implement some methods on our local service. These will be invoked by user actions.
		controllerService.implement({
			
			trigger: function(uiClass, id, payload, data) {
				if (uiClass == "profile") {
					//Get the work phone from the payload
					var contactwphone = payload.user.phone;
					console.log('profile was clicked on ' + "::" + contactwphone);
					//Make the cll with the user and contact numbers
					makeCall(userPhone, contactwphone);
				}
					
			},
			filter: function (type, id, data) {
				//Display Call button in profile or hover card ONLY if both phone numbers are available
				return !!(userPhone && data.user && data.user.phone && data.user.phone != userPhone );
			}
		
		});
	})
}

var controllerService = SYMPHONY.services.register('click2call:controller');


//All Symphony services are namespaced with SYMPHONY
SYMPHONY.remote.hello()
.then(authenticate)
.then(register)
.fail(function(e) {
	console.log(e.stack);
});

