$(document).ready(function () {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();

    function IndexViewModel() {
        let self = this;
        let minutesRemaining = 0;
        let secondsRemaining = 0;
        let timer = 0;
        let currenTimerType = null;

        // Beign show variables
        self.showFocus = ko.observable(true);
        self.showContinue = ko.observable(false);
        self.showPause = ko.observable(false);
        self.showResume = ko.observable(false);
        self.showStop = ko.observable(false);
        self.showFocusBar = ko.observable(false);
        // End show variables

        self.timeDisplay = ko.observable();

        self.sequenceConfiguration = ko.observableArray([]);

        self.sequenceConfiguration.push({ position: 0, name: "Pomodoro", active: true });
        self.sequenceConfiguration.push({ position: 1, name: "Short break", active: false });
        self.sequenceConfiguration.push({ position: 2, name: "Pomodoro", active: false });
        self.sequenceConfiguration.push({ position: 3, name: "Short break", active: false });
        self.sequenceConfiguration.push({ position: 4, name: "Pomodoro", active: false });
        self.sequenceConfiguration.push({ position: 5, name: "Short break", active: false });
        self.sequenceConfiguration.push({ position: 6, name: "Pomodoro", active: false });        
        self.sequenceConfiguration.push({ position: 7, name: "Long break", active: false });

        self.currentSequence = ko.observable(0);

        self.focusOn = ko.observable(false);

        let currentSetting = null;

        let configurationSet = localStorage.getItem("configurationSet");

        let darkModeSet = JSON.parse(localStorage.getItem("darkModeOn"));

        configurationSet != null ? configurationSet = configurationSet === "true" : null;

        let today = new Date();

        if (configurationSet == null || !configurationSet) {
            localStorage.setItem("configurationSet", true);
            localStorage.setItem("darkModeOn", false);

            localStorage.setItem("lastVisit", JSON.stringify({
                date: today
            }));

            localStorage.setItem("totalFocus", 0);
            localStorage.setItem("totalPomodoro", 0);
            localStorage.setItem("totalShort", 0);
            localStorage.setItem("totalLong", 0);

            localStorage.setItem("pomodoroSetting", JSON.stringify({
                minutes: 25,
                seconds: 0,
                timerType: "Pt"
            }));

            localStorage.setItem("shrotBreakSetting", JSON.stringify({
                minutes: 5,
                seconds: 0,
                timerType: "Sb"
            }));

            localStorage.setItem("longBreakSetting", JSON.stringify({
                minutes: 10,
                seconds: 0,
                timerType: "Lb"
            }));
        }

        // Beign total variables                
        var last = JSON.parse(localStorage.getItem("lastVisit"));
        last = new Date(last.date);

        if (darkModeSet) {
            $('head').append('<link rel="stylesheet" href="Style/theme-dark.css" type="text/css" />');            
        }
        else {
            $('head').find('link[href="Style/theme-dark.css"]').remove();            
        }

        if (today.getDate() > last.getDate()) {
            console.log("Reset stats!");
            localStorage.setItem("lastVisit", JSON.stringify({
                date: today
            }));
            localStorage.setItem("totalFocus", 0);
            localStorage.setItem("totalPomodoro", 0);
            localStorage.setItem("totalShort", 0);
            localStorage.setItem("totalLong", 0);
        }

        self.totalFocus = ko.observable(JSON.parse(localStorage.getItem("totalFocus")));
        self.totalPomodoro = ko.observable(JSON.parse(localStorage.getItem("totalPomodoro")));
        self.totalShort = ko.observable(JSON.parse(localStorage.getItem("totalShort")));
        self.totalLong = ko.observable(JSON.parse(localStorage.getItem("totalLong")));
        // End total variables

        let pomodoroSetting = JSON.parse(localStorage.getItem("pomodoroSetting"));

        let shrotBreakSetting = JSON.parse(localStorage.getItem("shrotBreakSetting"));

        let longBreakSetting = JSON.parse(localStorage.getItem("longBreakSetting"));

        let timerInterval = null;

        let totalSeconds = 0;

        let startTime = function (timerSetting, startFresh) {
            if (startFresh) {
                totalSeconds = timerSetting.minutes * 60;
                totalSeconds += timerSetting.seconds;
            }

            timerInterval = setInterval(function () {
                minutes = parseInt(totalSeconds / 60, 10);
                seconds = parseInt(totalSeconds % 60, 10);

                if (!--totalSeconds < 0) {
                    seconds--;
                }
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                self.timeDisplay(minutes + ":" + seconds);

                let total = 0;

                if (totalSeconds < 0) {
                    switch (timerSetting.timerType) {
                        case "Pt":
                            self.notifyMe("Pomodoro end!");
                            clearInterval(timerInterval);
                            total = self.totalPomodoro();
                            total++;
                            self.totalPomodoro(total);
                            localStorage.setItem("totalPomodoro", self.totalPomodoro());
                            self.clearChart();
                            self.drawChart();
                            if (self.focusOn()) {
                                self.nextSequence();
                            } else {
                                let quickBtn = $('#pomodoroBtn');
                                quickBtn.removeClass("btn-success");
                                quickBtn.addClass("btn-default");
                                self.showPause(false);
                                self.stop(false);
                            }
                            break;
                        case "Sb":
                            self.notifyMe("Short break end!");
                            clearInterval(timerInterval);
                            total = self.totalShort();
                            total++;
                            self.totalShort(total);
                            localStorage.setItem("totalShort", self.totalShort());
                            self.clearChart();
                            self.drawChart();
                            if (self.focusOn()) {
                                self.nextSequence();
                            } else {
                                let quickBtn = $('#shortBtn');
                                quickBtn.removeClass("btn-success");
                                quickBtn.addClass("btn-default");
                                self.showPause(false);
                                self.stop(false);
                            }
                            break;
                        case "Lb":
                            self.notifyMe("Long break end!");
                            clearInterval(timerInterval);
                            total = self.totalLong();
                            total++;
                            self.totalLong(total);
                            localStorage.setItem("totalLong", self.totalLong());
                            self.clearChart();
                            self.drawChart();
                            if (self.focusOn()) {
                                self.nextSequence();
                            } else {
                                let quickBtn = $('#longBtn');
                                quickBtn.removeClass("btn-success");
                                quickBtn.addClass("btn-default");
                                self.showPause(false);
                                self.stop(false);
                            }
                            break;
                    }
                }
            }, 1000);
        };

        self.startFocus = function () {
            self.showFocusBar(true);
            self.showFocus(false);
            self.showPause(true);
            self.showStop(true);
            self.focusOn(true);
            clearInterval(timerInterval);
            currentSetting = pomodoroSetting;
            self.displayTimer(pomodoroSetting);
            startTime(pomodoroSetting, true);
        }

        self.displayTimer = function (timerSetting) {
            let minutes = timerSetting.minutes < 10 ? "0" + timerSetting.minutes : timerSetting.minutes;
            let seconds = timerSetting.seconds < 10 ? "0" + timerSetting.seconds : timerSetting.seconds;

            self.timeDisplay(minutes + ":" + seconds);
        }

        self.displayTimer(pomodoroSetting);

        self.continueFocus = function () {
            self.showContinue(false);
            clearInterval(timerInterval);
            self.getCurrentTimer();
            self.displayTimer(currentSetting);
            startTime(currentSetting, true);
        }

        self.getCurrentTimer = function () {
            let currentSequence = self.sequenceConfiguration()[self.currentSequence()];
            switch (currentSequence.name) {
                case "Pomodoro":
                    currentSetting = pomodoroSetting;
                    break;
                case "Short break":
                    currentSetting = shrotBreakSetting;
                    break;
                case "Long break":
                    currentSetting = longBreakSetting;
                    break;
            }
        }

        self.nextSequence = function () {
            self.showContinue(true);
            let currentSequence = $('#sequence' + self.currentSequence());
            currentSequence.removeClass("btn-success");
            currentSequence.addClass("btn-default");

            self.currentSequence(self.currentSequence() + 1);
            currentSequence = $('#sequence' + self.currentSequence());
            if (currentSequence.length) {
                currentSequence.removeClass("btn-default");
                currentSequence.addClass("btn-success");
            } else {
                let total = self.totalFocus();
                total++;
                self.totalFocus(total);
                localStorage.setItem("totalFocus", self.totalFocus());
                self.clearChart();
                self.drawChart();
                self.currentSequence(0);
                currentSequence = $('#sequence' + self.currentSequence());
                currentSequence.removeClass("btn-default");
                currentSequence.addClass("btn-success");
            }
        };

        self.startPomodoro = function () {
            let quickBtn = $('#pomodoroBtn');
            quickBtn.removeClass("btn-default");
            quickBtn.addClass("btn-success");
            self.showFocus(false);
            self.showStop(true);
            self.showPause(true);
            if (self.focusOn())
                self.cancelFocus();
            clearInterval(timerInterval);
            self.displayTimer(pomodoroSetting);
            currentSetting = pomodoroSetting;
            startTime(pomodoroSetting, true);
        }

        self.startShortBreak = function () {
            let quickBtn = $('#shortBtn');
            quickBtn.removeClass("btn-default");
            quickBtn.addClass("btn-success");
            self.showFocus(false);
            self.showStop(true);
            self.showPause(true);
            if (self.focusOn())
                self.cancelFocus();
            clearInterval(timerInterval);
            self.displayTimer(shrotBreakSetting);
            currentSetting = shrotBreakSetting;
            startTime(shrotBreakSetting, true);
        }

        self.startLongBreak = function () {
            let quickBtn = $('#longBtn');
            quickBtn.removeClass("btn-default");
            quickBtn.addClass("btn-success");
            self.showFocus(false);
            self.showStop(true);
            self.showPause(true);
            if (self.focusOn())
                self.cancelFocus();
            clearInterval(timerInterval);
            self.displayTimer(longBreakSetting);
            currentSetting = longBreakSetting;
            startTime(longBreakSetting, true);
        }

        self.pause = function () {
            self.showPause(false);
            clearInterval(timerInterval);
            self.showResume(true);
        }

        self.resume = function () {
            self.showPause(true);
            self.showResume(false);
            clearInterval(timerInterval);
            startTime(currentSetting, false);
        }

        self.stop = function () {
            self.showResume(false);
            self.showFocusBar(false);
            self.showFocus(true);
            self.showContinue(false);
            self.showStop(false);
            self.showPause(false);
            clearInterval(timerInterval);

            let quickBtn = $('#pomodoroBtn');
            quickBtn.removeClass("btn-success");
            quickBtn.addClass("btn-default");
            quickBtn = $('#shortBtn');
            quickBtn.removeClass("btn-success");
            quickBtn.addClass("btn-default");
            quickBtn = $('#longBtn');
            quickBtn.removeClass("btn-success");
            quickBtn.addClass("btn-default");

            self.displayTimer(pomodoroSetting);
            currentSetting = longBreakSetting;
            self.cancelFocus();
        }

        self.cancelFocus = function () {
            self.focusOn(false);

            let currentSequence = $('#sequence' + self.currentSequence());
            currentSequence.removeClass("btn-success");
            currentSequence.addClass("btn-default");

            self.currentSequence(0);
            currentSequence = $('#sequence' + self.currentSequence());
            currentSequence.removeClass("btn-default");
            currentSequence.addClass("btn-success");
        };

        self.clearChart = function () {
            google.charts.load('current', { 'packages': ['corechart'] });
            google.charts.setOnLoadCallback(clear);

            function clear() {
                let chart = new google.visualization.ColumnChart(document.getElementById('piechart'));
                chart.clearChart();
            }
        }

        self.drawChart = function () {

            google.charts.load('current', { 'packages': ['corechart'] });
            google.charts.setOnLoadCallback(draw);

            function draw() {
                let data = google.visualization.arrayToDataTable([
                    ['Element', 'Total', { role: 'style' }],
                    ['Focus', self.totalFocus(), '#e21414'],
                    ['Pomodoro', self.totalPomodoro(), '#0a14d3'],
                    ['Short', self.totalShort(), '#14e2d8'],
                    ['Long', self.totalLong(), '#14e2d8'],
                ]);

                let options = {
                    legend: { position: 'none' }
                };

                let chart = new google.visualization.ColumnChart(document.getElementById('piechart'));

                chart.draw(data, options);
            }
        };

        self.drawChart();

        self.notifyMe = function (message) {
            if (Notification.permission !== "granted")
                Notification.requestPermission();
            else {
                var notification = new Notification('Pomodoro timer', {
                    icon: 'https://banner2.kisspng.com/20180529/lcw/kisspng-alarm-clocks-stopwatch-timer-clock-vector-5b0d73ecde80d0.0695532415276083009114.jpg',
                    body: message,
                    requireInteraction: true
                });

                notification.onclick = function () {
                    window.focus();
                };

            }

        }
    }
    let indexModel = new IndexViewModel();

    ko.applyBindings(indexModel, document.getElementById('indexDiv'));
});