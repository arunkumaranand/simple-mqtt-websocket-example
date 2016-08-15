            var mqtt;
            var reconnectTimeout = 2000;
            var chart;
            var data;

            var options = {
                width: 500
                , height: 300
                , redFrom: 90
                , redTo: 100
                , yellowFrom: 75
                , yellowTo: 90
                , minorTicks: 5
            };


            function MQTTconnect() {
                if (typeof path == "undefined") {
                    path = '/mqtt';
                }
                mqtt = new Paho.MQTT.Client(
                    host
                    , port
                    , path
                    , "web_" + parseInt(Math.random() * 100, 10)
                );
                var options = {
                    timeout: 3
                    , useSSL: useTLS
                    , cleanSession: cleansession
                    , onSuccess: onConnect
                    , onFailure: function (message) {
                        $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
                        setTimeout(MQTTconnect, reconnectTimeout);
                    }
                };

                mqtt.onConnectionLost = onConnectionLost;
                mqtt.onMessageArrived = onMessageArrived;

                if (username != null) {
                    options.userName = username;
                    options.password = password;
                }
                console.log("Host=" + host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
                mqtt.connect(options);
                showMeter();
            }

            function showMeter() {
                google.charts.load('current', {
                    'packages': ['gauge']
                });
                google.charts.setOnLoadCallback(initChart);

                function initChart() {
                    data = google.visualization.arrayToDataTable([
                        ['Label', 'Value']
                        , ['Temperature', 80]
                    , ]);

                    chart = new google.visualization.Gauge(document.getElementById('chart_div'));
                    chart.draw(data, options);
                }

            }
			
			function updateMeter(meterVal) {
				data.setValue(0, 1, Number(meterVal));
				chart.draw(data, options);
			}

            function onConnect() {
                $('#status').val('Connected to ' + host + ':' + port + path);
                // Connection succeeded; subscribe to our topic
                mqtt.subscribe(topic, {
                    qos: 0
                });
                $('#topic').val(topic);
            }

            function onConnectionLost(response) {
                setTimeout(MQTTconnect, reconnectTimeout);
                $('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");

            };

            function onMessageArrived(message) {

                var topic = message.destinationName;
                var payload = message.payloadString;

                $('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
                if (data && topic === 'meter') {
					updateMeter(payload);
                }
            };


            $(document).ready(function () {
                MQTTconnect();
            });