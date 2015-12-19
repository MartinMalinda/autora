import Ember from 'ember';

export function notificationText(params) {
  var recordCount = params[0];
  if(recordCount > 1) {
  	return `and ${recordCount - 1} others`;
  }

}

export default Ember.Helper.helper(notificationText);
