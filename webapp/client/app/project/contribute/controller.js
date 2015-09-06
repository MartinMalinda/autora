import Ember from 'ember';

export default Ember.Controller.extend({
	project: Ember.inject.controller('project'),
	filteredProjects: Ember.computed.filterBy('model', 'open', true)
});
