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
      return Logs.find({}, { sort: {timestamp: -1}, limit: 10 * Meteor.settings.public.sites.length });
    }
    , status: function(log){
      return log.success === true ? "UP" : "DOWN";
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish('logs', function(){
    return Logs.find({}, { sort: {timestamp: -1}, limit: 10 * Meteor.settings.public.sites.length })
  });

  function ping(){
    var sites = Meteor.settings.public.sites;
    _.each(sites, function(site){
      HTTP.get(site.url, function(err, result){
        Logs.insert({
          site: site
          , timestamp: new Date()
          , error: result.statusCode
          , success: !err
        });
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
