Logs = new Meteor.Collection('logs');

if (Meteor.isClient) {
  Meteor.subscribe('logs');

  Template.SiteList.helpers({
    sites: function () {
      return Meteor.settings.public.sites;
    }
  });

  Template.Log.helpers({
    logs: function () {
      return Logs.find({}, { sort: {timestamp: -1}});
    }
    , status: function(log){
      return log.success === true ? "UP" : "DOWN";
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish('logs', function(){
    return Logs.find({}, { sort: {timestamp: -1}, limit: 50 }})
  });

  Meteor.publish('logs/all', function(){
    return Logs.find({}, { sort: {timestamp: -1}, limit: 50 }})
  });

  function ping(){
    var sites = Meteor.settings.public.sites;
    _.each(sites, function(site){
      console.log('ping site', site.url);
      HTTP.get(site.url, function(err, result){
        var logId = Logs.insert({
          site: site
          , timestamp: new Date()
          , error: err ? result.statusCode : null
          , success: !err
        });
        console.log('logId', logId);
      });
    });
  }

  Meteor.setTimeout(function(){
    ping();
  }, 1000 * 60 * 30); // 30 minute pings

  Meteor.startup(function(){
    ping();
  });
}
