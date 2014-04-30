Logs = new Meteor.Collection('logs');

if (Meteor.isClient) {
  Template.SiteList.helpers({
    sites: function () {
      return Meteor.settings.public.sites;
    }
  });

  Template.Log.helpers({
    logs: function () {
      return Logs.find({}, { sort: {createdAt: -1}, limit: 10 * Meteor.settings.public.sites.length });
    }
  });
}

if (Meteor.isServer) {
  Meteor.setTimeout(function(){
    var sites = Meteor.settings.public.sites;
    _.each(sites, function(site){
      var result = HTTP.get(site.url);
      Logs.insert({
        site: site
        , timestamp: new Date()
      })
    });
    HTTP.get()
  }, 1000 * 60 * 30); // 30 minute pings
}
