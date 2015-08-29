//var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: 'AKIAI5RDIV3V3KRDJRRA', secretAccessKey: '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' });
//AWS.config.region = 'us-east-1';

var theirBucket = new AWS.S3({ apiVersion: '2006-03-01', params: { Bucket: 'craftsy-yak' } });
var myBucket = new AWS.S3({ apiVersion: '2006-03-01', params: { Bucket: 'craftsy-troncoso' } });

//theirBucket.getObject({Key: 'metrics.json', Bucket: 'craftsy-yak'}, function(err,data){
//    "use strict";
//    console.log('ERR: %o | D: %o', err, data);
//});
//$http.jsonp('https://s3.amazonaws.com/craftsy-yak/metrics.json')
//    .success(function(d, r){
//        "use strict";
//        console.log('D: %o | R: %o', d,r);
//    });
//$.ajax('https://s3.amazonaws.com/craftsy-yak/metrics.json').done(function(d,r){
//    "use strict";
//    console.log('D: %o | R: %o', d,r);
//});
angular.module('appCraftsy', []).controller('CraftsyCtrl', ['$http', '$scope', function($http, $scope){
  "use strict";
  $scope.replicationLagHosts = [];
  $scope.ingestRateHosts = [];
  $scope.failedSendsHosts = [];

  $scope.replicationLagMin = 200;
  $scope.ingestRateMax = 100;
  $scope.failedSendsMin = 20;

  $scope.pullData = function(){
    console.log('!!!');
    var url = '/metrics.json';
    var success = function(d, r){
      "use strict";

      $.each(d, function(i,e){
        if(e.metric == "replication_lag" && parseFloat(e.value) > $scope.replicationLagMin)
        {
          console.log(e);
          $scope.replicationLagHosts.push(e);
        }
        else if(e.metric == "ingest_rate_ms" && parseFloat(e.value) < $scope.ingestRateMax)
        {
          $scope.ingestRateHosts.push(e);
        }
        else if(e.metric == "failed_sends" && parseFloat(e.value) > $scope.failedSendsMin)
        {
          $scope.failedSendsHosts.push(e);
        }
      });
    };
    var error = function(a,b,c){
      console.log('A: %o | B: %o | C: %o', a,b,c);
    };

    $http.get(url)
        .success(success)
        .error(function(err){
            console.log('E: %o', err);
        });
  }
}]);