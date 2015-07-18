import Ember from 'ember';
import config from '../../config/environment';


export default Ember.Controller.extend({
	email: '',
	password: '',
	password2: '',
	name: '',
	alert: '',
	isLoading: false,

	isReadyToSend: Ember.computed('name','password', function(){
		var name = this.get('name');
		var isNOTEmpty = name !== '';
		var isAlphanumeric = /^[\w]+$/i.test(name);

		var password = this.get('password');
		var isPasswordLongEnough = password.length > 3;

		if(!isAlphanumeric) this.set('alert', {type: 'danger', message: 'Username can contain letters and numbers only!'});
		if(!isPasswordLongEnough) this.set('alert', {type: 'danger', message: 'Password is too short. Make it at least 4 characters!'});
		if(!isNOTEmpty) this.set('alert', {type: 'danger', message: 'Username can\'t be empty!'});

		//Basicly checking only name here, password and email is checked on the server by firebase
		return isNOTEmpty && isAlphanumeric && isPasswordLongEnough;
	}),

	actions: {
		sendSignUpForm: function(){
			if(this.get('isReadyToSend')){

				var self = this;
				var ref = new Firebase(config.firebase);
				self.set('isLoading', true);

				var email = this.get('email');
				var password = this.get('password');

				ref.createUser({
				  email    : email,
				  password : password
				}, function(error, userData) {
				  if (error) {
					self.set('isLoading', false);
				    console.log("Error creating user:", error);
				    self.set('alert', {
				    	type: 'danger',
				    	message: error
				    });
				  } else {

				    var newUserData = self.getProperties('email', 'password', 'name');
				    newUserData.id = userData.uid;
				    self.store.createRecord('user',newUserData).save().then(function(){
					    // self.transitionToRoute('index');

					    self.setProperties({
					    	name: '',
					    	password: '',
					    	email: '',
					    	alert: {
					    		type: 'success',
					    		message: 'Your account has been created successfuly.'
					    	}
					    });

					    //Lets login the user after sign up
					    self.get('session').authenticate('authenticator:firebase', {
			                'email': email,
			                'password': password
			            }).then(function(){
			            	// self.set('isLoading')
			            });



				    });
				    // store.createRecord({});
				  }
				});
			}
		},

		transitionBack: function(){
            window.history.back();
        }
	}
});
