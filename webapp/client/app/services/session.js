import Ember from 'ember';
import SessionService from 'ember-simple-auth/services/session';

const {computed, isEmpty, inject} = Ember;

export default SessionService.extend({


	injectedStore: inject.service('store'),
	subscriptionSorting: ['lastChildModelCreatedAt:desc'],
	sortedSubscriptions: computed.sort('subscriptions','subscriptionSorting'),

	user: computed('data.authenticated.auth.uid', function(){
		var uid = this.get('data.authenticated.auth.uid');
		if (!isEmpty(uid)) {

			var store = this.get('injectedStore');
			return store.find('user', uid);
		}
	}),

	unseenSubscriptions: computed('subscriptions','subscriptions.@each.lastChildModelCreatedAt','subscriptions.@each.cachedLastChildModelCreatedAt', function(){

		var subscriptions = this.get('subscriptions').toArray();
		let filterPromise = Ember.RSVP.filter(subscriptions, subscription => {
				var type = subscription.get('type');
				if(type){
				return subscription.get(type).then(() => {
					// return  (subscription.get('notification') != subscription.get('cachedNotification'));
					return  (subscription.get('lastChildModelCreatedAt') > subscription.get('cachedLastChildModelCreatedAt'));
				});
				}
		});

		return DS.PromiseArray.create({
			promise: filterPromise
		});
	}),

	subscriptions: computed('user.subscriptions.[]', function(){
		var subscriptions = this.get('user.subscriptions');
		if(!subscriptions){
			subscriptions = [];
		}

		return subscriptions;
	}),

	findSubscriptionByModel(model, type){
		return this.get('subscriptions').findBy(type + '.id', model.get('id'));
	},

	addSubscription(record, type, project){

		var store = this.get('injectedStore');

		var subscriptionData = {
			type: type,
			user: this.get('user'),
		};
		record = store.peekRecord(type, record.get('id'));
		subscriptionData[type] = record;

		if(type !== 'project'){
			subscriptionData.project = project;
		}

		if(type !== 'entry'){
			console.log(record);
			console.log(type);
			let alreadyHasThisSubscription = this.findSubscriptionByModel(record, type);
			if(alreadyHasThisSubscription) return true;
		}

		var user = this.get('user');
		subscriptionData.user = user;
		var subscription = store.createRecord('subscription', subscriptionData);
		subscription.save().then(() => {
			store.peekRecord('user', user.get('id')).save();
		});
	},

	deleteSubscriptionForModel(type,model){
		var store = this.get('injectedStore');
		this.get('subscriptions').then(subscriptions => {
			this.findSubscriptionByModel(model, type).destroyRecord();
		});


	}
});
