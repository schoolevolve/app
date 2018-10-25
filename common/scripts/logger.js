'use strict';
var loggingModule = angular.module('teachersApp');

loggingModule.factory(
    "traceService",
    function () {
        return ({
            print: printStackTrace
        });
    }
);

loggingModule.provider(
    "$exceptionHandler", {
        $get: function (exceptionLoggingService) {
            return (exceptionLoggingService);
        }
    }
);

loggingModule.factory(
    "exceptionLoggingService", ["$log", "$window", "traceService", "baseURL",
    function ($log, $window, traceService, baseURL) {
            function error(exception, cause) {

                // preserve the default behaviour which will log the error
                // to the console, and allow the application to continue running.
                $log.error.apply($log, arguments);

                // now try to log the error to the server side.
                try {
                    var errorMessage = exception.toString();

                    // use our traceService to generate a stack trace
                    var stackTrace = traceService.print({
                        e: exception
                    });

                    // use AJAX (in this example jQuery) and NOT
                    // an angular service such as $http
                    $.ajax({
                        type: "POST",
                        url: baseURL+"/common/core/logger.php",
                        //contentType: "application/json",
                        data: {
                            //url: $window.location.href,
                            "message": errorMessage,
                            //type: "exception",
                            "stackTrace": stackTrace,
                            "cause": (cause || ""),
                            "fun": "logClientError"
                        }
                    });
                } catch (loggingError) {
                    $log.warn("Error server-side logging failed");
                    $log.log(loggingError);
                }
            }
            return (error);
    }]
);
