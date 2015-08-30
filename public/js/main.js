//var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: 'AKIAI5RDIV3V3KRDJRRA', secretAccessKey: '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' });
//AWS.config.region = 'us-east-1';

//var theirBucket = new AWS.S3({ apiVersion: '2006-03-01', params: { Bucket: 'craftsy-yak' } });
var s3 = new AWS.S3({ apiVersion: '2006-03-01', accessKeyId: 'AKIAI5RDIV3V3KRDJRRA', secretAccessKey: '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' });

angular.module('appCraftsy', [])
  .controller('CraftsyCtrl', ['$http', '$scope', function($http, $scope){
    "use strict";

    $scope.rawData = [];

    $scope.replicationLagHosts = [];
    $scope.ingestRateHosts = [];
    $scope.failedSendsHosts = [];

    $scope.replicationLagMin = 200;
    $scope.ingestRateMax = 100;
    $scope.failedSendsMin = 20;

    $scope.message = "Click [Upload] to send this report to s3";


    $scope.pullData = function(){
      var url = '/metrics.json';
      var success = function(d, r){
        "use strict";
        if($scope.rawData.length == 0)$scope.rawData = d;
        $scope.replicationLagHosts = [];
        $scope.ingestRateHosts = [];
        $scope.failedSendsHosts = [];

        $.each($scope.rawData, function(i,e){
          if(e.metric == "replication_lag" && parseFloat(e.value) > $scope.replicationLagMin)
          {
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

      if($scope.rawData.length == 0)
      {
        $http.get(url)
          .success(success)
          .error(error);
      }
      else
      {
        success($scope.rawData);
      }
    };
    $scope.upload = function(){
      //$scope.message = "aslkdhaslkdhj";
      //return false;
      var compileData = function(){
        var stream = "Host,ID,Metric:Value,Timestamp\rReplication Lag > " + $scope.replicationLagMin + "\r";
        $.each($scope.replicationLagHosts, function(i,e){
          stream += [e.host, e.id, e.metric + ": " + e.value, e.timestamp].join(",") + "\r";
        });

        stream += "Ingest Rate < " + $scope.ingestRateMax + "ms\r";
        $.each($scope.ingestRateHosts, function(i,e){
          stream += [e.host, e.id, e.metric + ": " + e.value, e.timestamp].join(",") + "\r";
        });

        stream += "Failed Send Count > " + $scope.failedSendsMin + "\r";
        $.each($scope.failedSendsHosts, function(i,e){
          stream += [e.host, e.id, e.metric + ": " + e.value, e.timestamp].join(",") + "\r";
        });

        //$scope.message = "ZZZZZZZ";


        return stream;
      };
      //var setMessage = function(message){
      //  $scope.message = message;
      //};
      var filename = 'metrics-' + Date.now() + '.csv';
      var params = {
        Bucket: 'craftsy-troncoso',
        Key: filename,
        Body: compileData(),
        ACL: 'public-read'
        //accessKeyId: 'AKIAI5RDIV3V3KRDJRRA',
        //secretAccessKey: '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'
      };
      var realScope = $scope;
      s3.putObject(params, function(err, data) {
        //realScope.message = 'PUT!!';

        if(err)
        {
          console.log('ERRORE: %o', err);
          $scope.message = 'There was an error ;(';
          return;
        }
        console.log('NO ERROR!');
        // These strangely don't work
        //$scope.message = "dsadasdad";
        //$scope.message = "csv Is available for 24 hours";

        //setMessage("csv Is available for 24 hours");
      });
      // I realize this is not the right way to do it, but $scope.message doesn't work in the putObject callback
      $scope.message = "https://craftsy-troncoso.s3.amazonaws.com/" + filename + " Is available for 24 hours";

    };


    $scope.$watchGroup(['replicationLagMin', 'ingestRateMax', 'failedSendsMin'], $scope.pullData)

  }]);