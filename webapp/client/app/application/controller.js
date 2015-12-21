import Ember from 'ember';

const {inject, computed} = Ember;

export default Ember.Controller.extend({
	session: inject.service('session'),
	subscription: inject.service('subscription'),
	project: inject.controller('project'),
	isInProjectRoute: computed('currentRouteName', function(){
		return this.get('currentRouteName').substring(0, 7) === 'project';
	}), 
	showNotifications: false,

	actions: {
		toggleCreate(){
			this.toggleProperty('project.create');
		}
	}
});
