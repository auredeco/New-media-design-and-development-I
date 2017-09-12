var user = {
    init: function(connString) {
		this._connString = connString;// Save connection string in local variable
		this._jaywalker = JayWalker;
		//user object
        this._users = [];
		this._user = {
			"loginStatus": false
		}

		// Get the stored data. If not present store the value of the _user in the localstorage
		if(Utils.store(this._connString) != null) {
			this._users = Utils.store(this._connString);
		} else {
			Utils.store(this._connString, this._users);
		}
		this.checkLoginID();
	},
	
	registerNewUser: function(){
				var firstName = document.getElementsByName("firstName")[0].value,
				 	lastName = document.getElementsByName("lastName")[0].value,
					nationality = document.getElementById("nationality").value,
					gender = document.getElementsByName("gender")[0].value,
					dayOfBirth = document.getElementsByName("day")[0].value,
					monthOfBirth = document.getElementsByName("month")[0].value,
					yearOfBirth = document.getElementsByName("year")[0].value,
					emailadress = document.getElementsByName("emailadress")[0].value,
					username = document.getElementsByName("username")[0].value,
					password = document.getElementsByName("password1")[0].value;
					
			
				var newUser = {
					"firstName" : firstName,
					"lastName" : lastName,
					"nationality" : nationality,
					"gender" : gender,
					"dayOfBirth" : dayOfBirth,
					"monthOfBirth" : monthOfBirth,
					"yearOfBirth" : yearOfBirth,
					"emailadress" : emailadress,
					"username" : username,
					"password" : password,
                    "bookmarks": [],
					"loginStatus" : false
				};
				user._users.push(newUser);
				user.save();
				this._jaywalker.setActivePage('login')
	},
	
	//Set login status function
	setLoginStatus: function(status){
		var loginStatus = status; //store the status into a local variable
		//if not logged in
		if(!loginStatus || loginStatus == null){
			this._user.loginStatus = true; // set the status to logged in
			this.save(); // store into local storage
		} else {
			this._user.loginStatus = false; // set the status to not logged in
			this.save(); // store into the local storage
		}
		console.log("is logged in: " + this._user.loginStatus); // debug purposes
	},
	
	checkLoginID: function(){
		var aanmeldButton = document.querySelector('#aanmeldButton'); //get the button
			//add a click listener to it
			aanmeldButton.addEventListener('click', function(e){
				e.preventDefault();
				var userNameInput = document.querySelector("#userName").value; //username input field
				var passwordInput = document.querySelector("#password").value; //password input field
				var correctLogin = false, i = 0;//login variable and increment variable
				//check if username and password match eachother
				while(correctLogin == false){
					if(userNameInput === user._users[i].username && passwordInput === user._users[i].password){
						user._user = user._users[i];
						user.setLoginStatus(user._user.loginStatus); //set the login status
						user.updateUIWhenLoggedIn(user._users[i].loginStatus); //update UI
						//console.log(user._user);
                        user.editUserPage();
						correctLogin == true;
						break;
					}
					i++;
				}
		});
		
		
		var logOutButton = document.querySelectorAll(".logOut"); //get the logout buttons
		var button = null; //temp variable
		//loop through the logout buttons
		for(var i=0; i<logOutButton.length; i++){
			button = logOutButton[i]; //add a button into a variable
			//add an eventlistener to it
			button.addEventListener('click', function(){
				user.setLoginStatus(user._user.loginStatus); //set the login status
				user.updateUIWhenLoggedIn(user._user.loginStatus); //update UI
			});
		}
		user.save(); //save into the local storage
	},
	
	updateUIWhenLoggedIn: function(status){
		var navbar = document.querySelector('.header-wrapper'); // get the nav into a local variable
		var loginStatus = status; // get the status and store it into a local variable
		//if the user is not logged in
		if(!loginStatus || loginStatus == null || loginStatus == undefined ){
			navbar.style.display = 'none'; //hide the navigation
			//this._jaywalker.setActivePage('login');
		} else {
			navbar.style.display= 'block'; //show the navigation
			this._jaywalker.setActivePage('start');
		}
	},
    
    editUserPage: function(){
       if(user._user.loginStatus == true){
           var userInfoLabels = document.querySelectorAll("#user_Page p");
           userInfoLabels[0].textContent = "First name: " + this._user.firstName;
           userInfoLabels[1].textContent = "Last name: " + this._user.lastName;
           userInfoLabels[2].textContent = "Country: " + this._user.nationality;
           userInfoLabels[3].textContent = "Gender: " + this._user.gender;
           userInfoLabels[4].textContent = "Birthday: " + this._user.dayOfBirth + " " + this._user.monthOfBirth + " " + this._user.yearOfBirth;  
           userInfoLabels[5].textContent = "E-mailadress: " + this._user.emailadress;  
           userInfoLabels[6].textContent = "Username: " + this._user.username;      
       }
    },
	
	//Save to the local storage
	save: function() {
		Utils.store(this._connString, this._users);
	},
}